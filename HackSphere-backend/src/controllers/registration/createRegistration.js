import mongoose from "mongoose";
import Registration from "../../models/Registration.js";
import Hackathon from "../../models/Hackathon.js";

export const createRegistration = async (req, res) => {
    try {
        const { hackathonId } = req.body;

        if (!hackathonId) {
            return res.status(400).json({
                success: false,
                message: "Hackathon ID is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Hackathon ID",
            });
        }

        const hackathon = await Hackathon.findById(hackathonId);

        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: "Hackathon not found",
            });
        }

        if (hackathon.status !== "published") {
            return res.status(400).json({
                success: false,
                message: "This hackathon is not open for registration",
            });
        }

        const now = new Date();

        if (now < hackathon.registrationStart || now > hackathon.registrationEnd) {
            return res.status(400).json({
                success: false,
                message: "Registration window is closed for this hackathon",
            });
        }

        const existingRegistration = await Registration.findOne({
            hackathon: hackathonId,
            user: req.user.id,
        });

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: "You have already registered for this hackathon",
            });
        }

        const registration = await Registration.create({
            hackathon: hackathonId,
            user: req.user.id,
            team: null,
            status: "approved",
        });

        const populatedRegistration = await Registration.findById(registration._id)
            .populate("hackathon", "title mode registrationStart registrationEnd hackathonStart hackathonEnd status teamType minTeamSize maxTeamSize")
            .populate("user", "firstName lastName email");

        return res.status(201).json({
            success: true,
            message: "Registered for hackathon successfully. You can now create or join a team.",
            data: populatedRegistration,
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "You have already registered for this hackathon",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};