import Hackathon from "../models/Hackathon.js";
import Team from "../models/Team.js";

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Unauthorized role",
            });
        }
        next();
    };
};

export const isOrganizerOfHackathon = async (req, res, next) => {
    try {
        const hackathonId = req.params.hackathonId || req.params.id || req.body.hackathonId;

        if (!hackathonId) {
            return res.status(400).json({ success: false, message: "Hackathon ID is required" });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ success: false, message: "Hackathon not found" });
        }

        const isOwner = hackathon.createdBy.toString() === req.user.id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You are not the organizer of this hackathon",
            });
        }

        req.hackathon = hackathon;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Authorization verification failed", error: error.message });
    }
};

export const isTeamLeader = async (req, res, next) => {
    try {
        const teamId = req.params.id || req.body.teamId;

        if (!teamId) {
            return res.status(400).json({ success: false, message: "Team ID is required" });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ success: false, message: "Team not found" });
        }

        const isLeader = team.leader.toString() === req.user.id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isLeader && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Only the team captain can perform this action",
            });
        }

        req.team = team;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Team authorization failed", error: error.message });
    }
};
