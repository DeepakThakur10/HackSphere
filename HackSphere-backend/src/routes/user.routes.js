import { Router } from "express";
import { getOrganizerProfile } from "../controllers/user/userController.js";

const router = Router();

router.get("/organizer/:id", getOrganizerProfile);

export default router;
