import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createTeam,
  deleteTeam,
  getTeamById,
  joinTeam,
  leaveTeam,
  lockTeam,
  transferLeader,
} from "../controllers/team/teamController.js";

import {
  getTeamMessages,
  sendTeamMessage,
} from "../controllers/team/teamChatController.js";

const router = Router();

router.post("/", authMiddleware, createTeam);
router.post("/join", authMiddleware, joinTeam);
router.get("/:id", authMiddleware, getTeamById);
router.post("/:id/leave", authMiddleware, leaveTeam);
router.patch("/:id/transfer-leader", authMiddleware, transferLeader);
router.patch("/:id/lock", authMiddleware, lockTeam);
router.delete("/:id", authMiddleware, deleteTeam);
router.get("/:teamId/messages", authMiddleware, getTeamMessages);
router.post("/:teamId/messages", authMiddleware, sendTeamMessage);

export default router;
