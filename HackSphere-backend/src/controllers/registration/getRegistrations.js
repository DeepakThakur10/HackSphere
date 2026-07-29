import Registration from "../../models/Registration.js";

export const getRegistrations = async (req, res) => {
    try {

        const registrations = await Registration.find({
            user: req.user.id,
        })
            .populate("hackathon", "title mode teamType registrationStart registrationEnd hackathonStart hackathonEnd status banner")
            .populate("user", "firstName lastName email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Registrations fetched successfully",
            data: registrations,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};