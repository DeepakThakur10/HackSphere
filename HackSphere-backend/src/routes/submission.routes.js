import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createOrUpdateSubmission,
  getParticipantSubmission,
  getSubmissionById,
} from "../controllers/submission/submissionController.js";

const router = Router();

router.post("/", authMiddleware, createOrUpdateSubmission);
router.get("/mine/:hackathonId", authMiddleware, getParticipantSubmission);
router.get("/:id", authMiddleware, getSubmissionById);

export default router;
