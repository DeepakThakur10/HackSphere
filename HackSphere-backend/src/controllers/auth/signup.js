import User from "../../models/user.js";
import HackathonJudge from "../../models/HackathonJudge.js";
import JudgeInvitation from "../../models/JudgeInvitation.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            username,
            email,
            password,
            inviteToken,
            role,
        } = req.body;

        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All Fields Required"
            });
        }

        const emailUser = await User.findOne({ email: email.toLowerCase().trim() });
        const usernameUser = await User.findOne({ username: username.trim() });

        if (emailUser) {
            return res.status(400).json({
                success: false,
                message: "Email ID Already Exists"
            });
        }

        if (usernameUser) {
            return res.status(400).json({
                success: false,
                message: "Username Already Exists"
            });
        }

        let userRole = role && ["participant", "organizer", "judge"].includes(role) ? role : "participant";
        let invitation = null;

        if (inviteToken) {
            invitation = await JudgeInvitation.findOne({ token: inviteToken, status: "pending" });
            if (invitation) {
                userRole = "judge";
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: userRole,
        });

        if (invitation) {
            await HackathonJudge.create({
                hackathon: invitation.hackathon,
                judge: newUser._id,
                assignedBy: invitation.invitedBy,
                status: "assigned",
            });

            invitation.status = "accepted";
            await invitation.save();
        }

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        const tokenPayload = {
            id: newUser._id,
            role: newUser.role,
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || "JWT_SECRET",
            { expiresIn: "7d" }
        );

        return res.status(201).json({
            success: true,
            message: invitation
                ? "Judge account registered successfully! You are assigned to the hackathon."
                : "User registered successfully",
            token,
            data: userWithoutPassword,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};