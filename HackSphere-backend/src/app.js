import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/auth.routes.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    })
);
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({
        success: true,
        message: "Server is running successfully"
    })
});

app.use("/api/auth", authRoutes);
app.use("/api/hackathons",hackathonRoutes)
app.use("/api/registrations", registrationRoutes);
app.use("/api/upload", uploadRoutes);

export default app;