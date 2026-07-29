import Hackathon from "../../models/Hackathon.js";
import AuditLog from "../../models/AuditLog.js";

export const getAllHackathonsAdmin = async (req, res) => {
  try {
    const hackathons = await Hackathon.find()
      .populate("createdBy", "firstName lastName email username role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: hackathons,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform hackathons",
      error: error.message,
    });
  }
};

export const adminOverrideHackathonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    const previousStatus = hackathon.status;
    hackathon.status = status;
    await hackathon.save();

    await AuditLog.create({
      user: req.user.id,
      action: "HACKATHON_STATUS_OVERRIDDEN",
      entityType: "Hackathon",
      entityId: hackathon._id,
      metadata: { hackathonTitle: hackathon.title, previousStatus, newStatus: status },
    });

    return res.status(200).json({
      success: true,
      message: `Hackathon status overridden to '${status}'`,
      data: hackathon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to override hackathon status",
      error: error.message,
    });
  }
};

export const adminDeleteHackathon = async (req, res) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findByIdAndDelete(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    await AuditLog.create({
      user: req.user.id,
      action: "HACKATHON_DELETED_BY_ADMIN",
      entityType: "Hackathon",
      entityId: id,
      metadata: { hackathonTitle: hackathon.title },
    });

    return res.status(200).json({
      success: true,
      message: "Hackathon deleted by administrator",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete hackathon",
      error: error.message,
    });
  }
};
