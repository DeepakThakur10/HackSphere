import express from 'express';
import cors from 'cors';
import authRoutes from "./routes/auth.routes.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import teamRoutes from "./routes/team.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import judgeRoutes from "./routes/judge.routes.js";
import reviewRoutes from "./routes/review.routes.js";
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
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/judges", judgeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);

export default app;