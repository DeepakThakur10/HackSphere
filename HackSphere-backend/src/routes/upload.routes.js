import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { uploadImage } from "../controllers/upload/uploadImage.js";


const router = Router();

router.post("/image", authMiddleware, upload.single("image"), uploadImage);

export default router;