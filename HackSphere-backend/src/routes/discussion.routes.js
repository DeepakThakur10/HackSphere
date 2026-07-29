import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createDiscussion,
  getDiscussions,
  replyToDiscussion,
} from "../controllers/discussion/discussionController.js";

const router = Router();

router.get("/:hackathonId", getDiscussions);
router.post("/", authMiddleware, createDiscussion);
router.post("/:id/reply", authMiddleware, replyToDiscussion);

export default router;
