import { Router } from "express";
import { signup, login } from "../controllers/auth/index.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";



const router = Router();

router.post("/signup", signup);

router.post('/login', login);
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Welcome to Profile"
    });
});

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