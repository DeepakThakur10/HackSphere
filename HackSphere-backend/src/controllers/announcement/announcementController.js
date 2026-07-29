import Announcement from "../../models/Announcement.js";
import Hackathon from "../../models/Hackathon.js";

// Active SSE client connections keyed by hackathonId
const clients = new Map();

export const createAnnouncement = async (req, res) => {
  try {
    const { hackathonId, title, content, priority } = req.body;

    if (!hackathonId || !title || !content) {
      return res.status(400).json({ success: false, message: "Hackathon ID, title, and content are required" });
    }

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    if (hackathon.createdBy.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only host organizers can post announcements" });
    }

    const announcement = await Announcement.create({
      hackathon: hackathonId,
      createdBy: req.user.id,
      title: title.trim(),
      content: content.trim(),
      priority: priority || "info",
    });

    const populated = await Announcement.findById(announcement._id).populate("createdBy", "firstName lastName email role");

    // Broadcast SSE to active listeners for this hackathon
    const hackathonClients = clients.get(hackathonId.toString()) || [];
    hackathonClients.forEach((clientRes) => {
      clientRes.write(`data: ${JSON.stringify(populated)}\n\n`);
    });

    return res.status(201).json({
      success: true,
      message: "Announcement broadcasted successfully",
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create announcement", error: error.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const announcements = await Announcement.find({ hackathon: hackathonId })
      .populate("createdBy", "firstName lastName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch announcements", error: error.message });
  }
};

export const streamAnnouncements = (req, res) => {
  const { hackathonId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  if (!clients.has(hackathonId)) {
    clients.set(hackathonId, []);
  }
  clients.get(hackathonId).push(res);

  req.on("close", () => {
    const remaining = (clients.get(hackathonId) || []).filter((client) => client !== res);
    clients.set(hackathonId, remaining);
  });
};
