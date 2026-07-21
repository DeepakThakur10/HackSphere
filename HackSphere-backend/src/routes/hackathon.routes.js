import { Router} from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { createHackathon } from "../controllers/hackathon/createHackathon.js";
import { getHackathons } from "../controllers/hackathon/getHackathons.js";
import { getHackathonById } from "../controllers/hackathon/getHackathonById.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    authorizeRoles("organizer", "admin"),
    createHackathon
);
router.get("/", getHackathons);

router.get("/:id", getHackathonById);

export default router;