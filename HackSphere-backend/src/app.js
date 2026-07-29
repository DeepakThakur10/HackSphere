import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/auth.routes.js";
import hackathonRoutes from "./routes/hackathon.routes.js";

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

export default app;