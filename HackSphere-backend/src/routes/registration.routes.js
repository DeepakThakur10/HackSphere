import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createRegistration, getRegistrations } from "../controllers/registration/index.js";


const router = Router();

router.post("/", authMiddleware, createRegistration);

router.get("/", authMiddleware, getRegistrations);

export default router;