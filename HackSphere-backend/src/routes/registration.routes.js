import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles, isOrganizerOfHackathon } from "../middleware/role.middleware.js";
import { createRegistration, getRegistrations } from "../controllers/registration/index.js";
import {
  approveRegistration,
  getOrganizerRegistrations,
  rejectRegistration,
} from "../controllers/registration/organizerRegistrationController.js";

const router = Router();

router.post("/", authMiddleware, createRegistration);
router.get("/", authMiddleware, getRegistrations);

// Organizer Phase 2A routes
router.get(
  "/organizer/:hackathonId",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  isOrganizerOfHackathon,
  getOrganizerRegistrations
);

router.patch(
  "/:id/approve",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  approveRegistration
);

router.patch(
  "/:id/reject",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  rejectRegistration
);

export default router;