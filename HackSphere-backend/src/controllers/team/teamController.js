import Team from "../../models/Team.js";
import {
  createTeamService,
  joinTeamService,
  leaveTeamService,
  lockTeamService,
  transferLeaderService,
} from "../../services/team.service.js";

export const createTeam = async (req, res) => {
  try {
    const { name, hackathonId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    if (!hackathonId) {
      return res.status(400).json({
        success: false,
        message: "Hackathon ID is required",
      });
    }

    const team = await createTeamService({
      name,
      hackathonId,
      userId: req.user.id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "firstName lastName email username profilePicture")
      .populate("members", "firstName lastName email username profilePicture")
      .populate("hackathon", "title mode registrationStart registrationEnd hackathonStart hackathonEnd");

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: populatedTeam,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create team",
    });
  }
};

export const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Invite code is required",
      });
    }

    const team = await joinTeamService({
      inviteCode,
      userId: req.user.id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "firstName lastName email username profilePicture")
      .populate("members", "firstName lastName email username profilePicture")
      .populate("hackathon", "title mode registrationStart registrationEnd hackathonStart hackathonEnd");

    return res.status(200).json({
      success: true,
      message: "Joined team successfully",
      data: populatedTeam,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to join team",
    });
  }
};

export const leaveTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await leaveTeamService({
      teamId: id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: result.message || "Left team successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to leave team",
    });
  }
};

export const transferLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const { newLeaderId } = req.body;

    if (!newLeaderId) {
      return res.status(400).json({
        success: false,
        message: "New leader ID is required",
      });
    }

    const team = await transferLeaderService({
      teamId: id,
      currentLeaderId: req.user.id,
      newLeaderId,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "firstName lastName email username profilePicture")
      .populate("members", "firstName lastName email username profilePicture");

    return res.status(200).json({
      success: true,
      message: "Leadership transferred successfully",
      data: populatedTeam,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to transfer leadership",
    });
  }
};

export const lockTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await lockTeamService({
      teamId: id,
      userId: req.user.id,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate("leader", "firstName lastName email username profilePicture")
      .populate("members", "firstName lastName email username profilePicture");

    return res.status(200).json({
      success: true,
      message: "Team roster locked successfully",
      data: populatedTeam,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to lock team",
    });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate("leader", "firstName lastName email username profilePicture")
      .populate("members", "firstName lastName email username profilePicture")
      .populate("hackathon", "title mode registrationStart registrationEnd hackathonStart hackathonEnd status");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (team.leader.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only team captain can delete the team",
      });
    }

    if (team.status === "submitted" || team.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a team that has submitted project entries",
      });
    }

    await Team.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
