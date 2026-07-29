import User from "../../models/user.js";
import HackathonJudge from "../../models/HackathonJudge.js";
import Hackathon from "../../models/Hackathon.js";
import bcrypt from "bcrypt";

export const getAvailableJudges = async (req, res) => {
  try {
    const judges = await User.find({ role: { $in: ["judge", "organizer", "admin"] } })
      .select("firstName lastName email username role profilePicture")
      .sort({ firstName: 1 });

    return res.status(200).json({
      success: true,
      data: judges,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available judges",
      error: error.message,
    });
  }
};

export const getAssignedJudges = async (req, res) => {
  try {
    const { id } = req.params;

    const assignments = await HackathonJudge.find({ hackathon: id, status: { $ne: "removed" } })
      .populate("judge", "firstName lastName email username role profilePicture")
      .populate("assignedBy", "firstName lastName email");

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned judges",
      error: error.message,
    });
  }
};

export const assignJudgeToHackathon = async (req, res) => {
  try {
    const { id } = req.params;
    const { judgeId, email } = req.body;

    if (!judgeId && (!email || !email.trim())) {
      return res.status(400).json({ success: false, message: "Judge ID or Email address is required" });
    }

    let judgeUser = null;

    if (email && email.trim()) {
      const targetEmail = email.toLowerCase().trim();
      judgeUser = await User.findOne({ email: targetEmail });

      if (!judgeUser) {
        // Automatically register new user as judge if account does not exist yet
        const hashedPassword = await bcrypt.hash("Judge@12345", 10);
        const namePart = targetEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        const uniqueUsername = `${namePart}_judge_${Date.now().toString().slice(-4)}`;

        judgeUser = await User.create({
          firstName: namePart,
          lastName: "Judge",
          email: targetEmail,
          username: uniqueUsername,
          password: hashedPassword,
          role: "judge",
        });
      } else if (judgeUser.role === "participant") {
        // Upgrade role to judge
        judgeUser.role = "judge";
        await judgeUser.save();
      }
    } else if (judgeId) {
      judgeUser = await User.findById(judgeId);
    }

    if (!judgeUser) {
      return res.status(404).json({ success: false, message: "Judge user not found" });
    }

    const existing = await HackathonJudge.findOne({ hackathon: id, judge: judgeUser._id });
    if (existing) {
      if (existing.status === "removed") {
        existing.status = "assigned";
        existing.assignedBy = req.user.id;
        await existing.save();
      } else {
        return res.status(400).json({ success: false, message: "Judge is already assigned to this hackathon" });
      }
    } else {
      await HackathonJudge.create({
        hackathon: id,
        judge: judgeUser._id,
        assignedBy: req.user.id,
        status: "assigned",
      });
    }

    const updatedAssignments = await HackathonJudge.find({ hackathon: id, status: { $ne: "removed" } })
      .populate("judge", "firstName lastName email username role profilePicture");

    return res.status(201).json({
      success: true,
      message: `Judge ${judgeUser.email} assigned successfully`,
      data: updatedAssignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to assign judge",
      error: error.message,
    });
  }
};

export const removeJudgeFromHackathon = async (req, res) => {
  try {
    const { id, judgeId } = req.params;

    const assignment = await HackathonJudge.findOne({ hackathon: id, judge: judgeId });
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Judge assignment not found" });
    }

    assignment.status = "removed";
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Judge removed from hackathon",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove judge",
      error: error.message,
    });
  }
};
