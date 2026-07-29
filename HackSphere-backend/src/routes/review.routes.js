import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createOrUpdateReview,
  getAssignedSubmissionsForJudge,
  getReviewBySubmission,
} from "../controllers/review/reviewController.js";

const router = Router();

router.post("/", authMiddleware, authorizeRoles("judge", "organizer", "admin"), createOrUpdateReview);

router.get("/assigned", authMiddleware, authorizeRoles("judge", "organizer", "admin"), getAssignedSubmissionsForJudge);

router.get("/submission/:submissionId", authMiddleware, authorizeRoles("judge", "organizer", "admin"), getReviewBySubmission);

export default router;
