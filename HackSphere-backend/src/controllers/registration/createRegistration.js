import mongoose from "mongoose";
import Registration from "../../models/Registration.js";
import Hackathon from "../../models/Hackathon.js";

export const createRegistration = async (req, res) => {
    try {
        const { hackathonId, teamName, memberEmails, paymentProof } = req.body;

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

        // Prevent self-registration: Organizers cannot register for hackathons they hosted
        if (hackathon.createdBy.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: "As the host organizer of this hackathon, you cannot register as a participant in your own event.",
            });
        }

        if (hackathon.status !== "published" && hackathon.status !== "ongoing") {
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

        const isPaid = hackathon.entryFee && Number(hackathon.entryFee) > 0;
        if (isPaid && (!paymentProof || !paymentProof.trim())) {
            return res.status(400).json({
                success: false,
                message: `This is a paid hackathon (${hackathon.entryFee} USD). Payment proof / Transaction receipt is required.`,
            });
        }

        const parsedMemberEmails = Array.isArray(memberEmails)
            ? memberEmails
            : typeof memberEmails === "string"
            ? memberEmails.split(",").map((e) => e.trim()).filter(Boolean)
            : [];

        // Every registration defaults to "pending" so event organizers can review details and approve
        const registration = await Registration.create({
            hackathon: hackathonId,
            user: req.user.id,
            teamName: teamName ? teamName.trim() : "",
            memberEmails: parsedMemberEmails,
            paymentProof: paymentProof ? paymentProof.trim() : "",
            paymentStatus: isPaid ? "pending" : "verified",
            team: null,
            status: "pending",
        });

        const populatedRegistration = await Registration.findById(registration._id)
            .populate("hackathon", "title mode registrationStart registrationEnd hackathonStart hackathonEnd status teamType minTeamSize maxTeamSize entryFee")
            .populate("user", "firstName lastName email");

        return res.status(201).json({
            success: true,
            message: "Registration submitted! Your request is pending organizer approval.",
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