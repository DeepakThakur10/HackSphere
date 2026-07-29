import Discussion from "../../models/Discussion.js";

export const createDiscussion = async (req, res) => {
  try {
    const { hackathonId, title, content, category } = req.body;

    if (!hackathonId || !title || !content) {
      return res.status(400).json({ success: false, message: "Hackathon ID, title, and content are required" });
    }

    const discussion = await Discussion.create({
      hackathon: hackathonId,
      user: req.user.id,
      title: title.trim(),
      content: content.trim(),
      category: category || "general",
    });

    const populated = await Discussion.findById(discussion._id)
      .populate("user", "firstName lastName email role profilePicture");

    return res.status(201).json({ success: true, message: "Discussion posted successfully", data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to post discussion", error: error.message });
  }
};

export const getDiscussions = async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const discussions = await Discussion.find({ hackathon: hackathonId })
      .populate("user", "firstName lastName email role profilePicture")
      .populate("replies.user", "firstName lastName email role profilePicture")
      .sort({ isPinned: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data: discussions });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch discussions", error: error.message });
  }
};

export const replyToDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Reply content is required" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion post not found" });
    }

    discussion.replies.push({
      user: req.user.id,
      content: content.trim(),
    });

    await discussion.save();

    const updated = await Discussion.findById(id)
      .populate("user", "firstName lastName email role profilePicture")
      .populate("replies.user", "firstName lastName email role profilePicture");

    return res.status(200).json({ success: true, message: "Reply added", data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add reply", error: error.message });
  }
};
