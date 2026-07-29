import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles, isOrganizerOfHackathon } from "../middleware/role.middleware.js";
import { createHackathon } from "../controllers/hackathon/createHackathon.js";
import { getHackathons } from "../controllers/hackathon/getHackathons.js";
import { getHackathonById } from "../controllers/hackathon/getHackathonById.js";
import { updateHackathon } from "../controllers/hackathon/updateHackathon.js";
import { deleteHackathon } from "../controllers/hackathon/deleteHackathon.js";
import { getOrganizerHackathons } from "../controllers/hackathon/getOrganizerHackathons.js";
import { getOrganizerMetrics } from "../controllers/hackathon/organizerDashboardController.js";
import { updateHackathonStatus } from "../controllers/hackathon/updateHackathonStatus.js";
import { getHackathonLeaderboard, getHackathonWinners } from "../controllers/leaderboard/leaderboardController.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("organizer", "admin"),
    createHackathon
);

router.get("/", getHackathons);

router.get(
    "/mine",
    authMiddleware,
    authorizeRoles("organizer", "admin"),
    getOrganizerHackathons
);

router.get(
    "/organizer/metrics",
    authMiddleware,
    authorizeRoles("organizer", "admin"),
    getOrganizerMetrics
);

router.get("/:id", getHackathonById);

router.get("/:id/leaderboard", getHackathonLeaderboard);
router.get("/:id/winners", getHackathonWinners);

router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("organizer", "admin"),
    isOrganizerOfHackathon,
    updateHackathon
);

router.patch(
    "/:id/status",
    authMiddleware,
    authorizeRoles("organizer", "admin"),
    isOrganizerOfHackathon,
    updateHackathonStatus
);

router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("organizer", "admin"),
    isOrganizerOfHackathon,
    deleteHackathon
);

export default router;