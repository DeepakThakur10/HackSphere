import TeamMessage from "../../models/TeamMessage.js";
import Team from "../../models/Team.js";

export const sendTeamMessage = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const isMember = team.members.some((m) => m.toString() === req.user.id.toString()) || team.leader.toString() === req.user.id.toString();
    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only team roster members can participate in team chat" });
    }

    const teamMessage = await TeamMessage.create({
      team: teamId,
      sender: req.user.id,
      message: message.trim(),
    });

    const populated = await TeamMessage.findById(teamMessage._id).populate("sender", "firstName lastName email username profilePicture");

    return res.status(201).json({ success: true, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to send team message", error: error.message });
  }
};

export const getTeamMessages = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const isMember = team.members.some((m) => m.toString() === req.user.id.toString()) || team.leader.toString() === req.user.id.toString();
    if (!isMember && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only team roster members can view team chat" });
    }

    const messages = await TeamMessage.find({ team: teamId })
      .populate("sender", "firstName lastName email username profilePicture")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch team messages", error: error.message });
  }
};
