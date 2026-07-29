import User from "../../models/user.js";
import Hackathon from "../../models/Hackathon.js";
import Registration from "../../models/Registration.js";
import Team from "../../models/Team.js";
import Submission from "../../models/Submission.js";
import Review from "../../models/Review.js";
import AuditLog from "../../models/AuditLog.js";

export const getAdminDashboardMetrics = async (req, res) => {
  try {
    const [
      totalUsers,
      participantsCount,
      organizersCount,
      judgesCount,
      adminsCount,
      totalHackathons,
      publishedHackathons,
      ongoingHackathons,
      completedHackathons,
      totalRegistrations,
      totalTeams,
      totalSubmissions,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "participant" }),
      User.countDocuments({ role: "organizer" }),
      User.countDocuments({ role: "judge" }),
      User.countDocuments({ role: "admin" }),
      Hackathon.countDocuments(),
      Hackathon.countDocuments({ status: "published" }),
      Hackathon.countDocuments({ status: "ongoing" }),
      Hackathon.countDocuments({ status: "completed" }),
      Registration.countDocuments(),
      Team.countDocuments(),
      Submission.countDocuments(),
      Review.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          participants: participantsCount,
          organizers: organizersCount,
          judges: judgesCount,
          admins: adminsCount,
        },
        hackathons: {
          total: totalHackathons,
          published: publishedHackathons,
          ongoing: ongoingHackathons,
          completed: completedHackathons,
        },
        activity: {
          registrations: totalRegistrations,
          teams: totalTeams,
          submissions: totalSubmissions,
          reviews: totalReviews,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard metrics",
      error: error.message,
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "firstName lastName email username role")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message,
    });
  }
};
