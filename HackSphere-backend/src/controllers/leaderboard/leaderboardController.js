import Hackathon from "../../models/Hackathon.js";
import { calculateLeaderboard, getWinnersSummary } from "../../services/leaderboard.service.js";

export const getHackathonLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: "Hackathon not found" });
    }

    const isPublic =
      hackathon.status === "completed" ||
      hackathon.status === "published" ||
      hackathon.status === "archived";

    const isOrganizerOrAdmin =
      req.user &&
      (req.user.role === "admin" || hackathon.createdBy.toString() === req.user.id.toString());

    if (!isPublic && !isOrganizerOrAdmin) {
      return res.status(200).json({
        success: true,
        isPublic: false,
        message: "Leaderboard rankings will be available once evaluations are complete.",
        data: [],
      });
    }

    const result = await calculateLeaderboard(id);

    return res.status(200).json({
      success: true,
      isPublic: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate leaderboard",
      error: error.message,
    });
  }
};

export const getHackathonWinners = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getWinnersSummary(id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch winners summary",
      error: error.message,
    });
  }
};
