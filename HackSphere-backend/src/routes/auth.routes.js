import { Router } from "express";
import { signup, login } from "../controllers/auth/index.js";
import { getProfile, updateProfile } from "../controllers/auth/profile.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";



const router = Router();

router.post("/signup", signup);

router.post('/login', login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.get(
    "/admin",
    authMiddleware,
    authorizeRoles("admin", "organizer"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin",
        });
    }
);

export default router;