import Hackathon from "../../models/Hackathon.js";

export const getHackathons = async (req, res) => {
    try {

        const hackathons = await Hackathon.find({
            status: "published",
        }).populate("createdBy", "firstName lastName email").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Hackathons fetched successfully",
            count: hackathons.length,
            data: hackathons,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};