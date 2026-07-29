import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles, isOrganizerOfHackathon } from "../middleware/role.middleware.js";
import {
  assignJudgeToHackathon,
  getAssignedJudges,
  getAvailableJudges,
  removeJudgeFromHackathon,
} from "../controllers/judge/judgeController.js";

const router = Router();

router.get("/", authMiddleware, authorizeRoles("organizer", "admin"), getAvailableJudges);

router.get("/hackathon/:id", authMiddleware, getAssignedJudges);

router.post(
  "/hackathon/:id",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  isOrganizerOfHackathon,
  assignJudgeToHackathon
);

router.delete(
  "/hackathon/:id/:judgeId",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  isOrganizerOfHackathon,
  removeJudgeFromHackathon
);

export default router;
