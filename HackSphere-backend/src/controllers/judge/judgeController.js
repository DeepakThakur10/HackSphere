import crypto from "crypto";
import User from "../../models/user.js";
import HackathonJudge from "../../models/HackathonJudge.js";
import Hackathon from "../../models/Hackathon.js";
import JudgeInvitation from "../../models/JudgeInvitation.js";
import { sendJudgeAssignmentNotificationEmail, sendJudgeInvitationEmail } from "../../utils/mailer.js";

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

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    if (!judgeId && (!email || !email.trim())) {
      return res.status(400).json({ success: false, message: "Judge ID or Email address is required" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (email && email.trim()) {
      const targetEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: targetEmail });

      if (existingUser) {
        // Upgrade participant role to judge if needed
        if (existingUser.role === "participant") {
          existingUser.role = "judge";
          await existingUser.save();
        }

        const existingAssignment = await HackathonJudge.findOne({ hackathon: id, judge: existingUser._id });
        if (existingAssignment) {
          if (existingAssignment.status === "removed") {
            existingAssignment.status = "assigned";
            existingAssignment.assignedBy = req.user.id;
            await existingAssignment.save();
          } else {
            return res.status(400).json({ success: false, message: "Judge is already assigned to this hackathon" });
          }
        } else {
          await HackathonJudge.create({
            hackathon: id,
            judge: existingUser._id,
            assignedBy: req.user.id,
            status: "assigned",
          });
        }

        // Send email notification to existing user
        const dashboardLink = `${frontendUrl}/judge/dashboard`;
        await sendJudgeAssignmentNotificationEmail({
          toEmail: targetEmail,
          hackathonTitle: hackathon.title,
          dashboardLink,
        });

        const updatedAssignments = await HackathonJudge.find({ hackathon: id, status: { $ne: "removed" } })
          .populate("judge", "firstName lastName email username role profilePicture");

        return res.status(200).json({
          success: true,
          message: `Notification email sent and ${existingUser.email} assigned as Judge successfully!`,
          data: updatedAssignments,
        });
      } else {
        // NO automatic account creation! Send invitation email with token.
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await JudgeInvitation.create({
          email: targetEmail,
          hackathon: id,
          invitedBy: req.user.id,
          token,
          expiresAt,
        });

        const inviteLink = `${frontendUrl}/signup?inviteToken=${token}&role=judge&email=${encodeURIComponent(targetEmail)}`;
        await sendJudgeInvitationEmail({
          toEmail: targetEmail,
          hackathonTitle: hackathon.title,
          inviteLink,
        });

        return res.status(200).json({
          success: true,
          message: `Invitation email sent to ${targetEmail}! When they click the link to register, they will be registered as a Judge and assigned automatically.`,
        });
      }
    } else if (judgeId) {
      const judgeUser = await User.findById(judgeId);
      if (!judgeUser) {
        return res.status(404).json({ success: false, message: "Judge user not found" });
      }

      const existingAssignment = await HackathonJudge.findOne({ hackathon: id, judge: judgeId });
      if (existingAssignment) {
        if (existingAssignment.status === "removed") {
          existingAssignment.status = "assigned";
          existingAssignment.assignedBy = req.user.id;
          await existingAssignment.save();
        } else {
          return res.status(400).json({ success: false, message: "Judge is already assigned to this hackathon" });
        }
      } else {
        await HackathonJudge.create({
          hackathon: id,
          judge: judgeId,
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
    }
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
