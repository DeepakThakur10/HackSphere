import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  createAnnouncement,
  getAnnouncements,
  streamAnnouncements,
} from "../controllers/announcement/announcementController.js";

const router = Router();

router.get("/:hackathonId", getAnnouncements);
router.get("/stream/:hackathonId", streamAnnouncements);
router.post("/", authMiddleware, createAnnouncement);

export default router;
