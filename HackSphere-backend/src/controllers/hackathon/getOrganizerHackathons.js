import Hackathon from "../../models/Hackathon.js";

export const getOrganizerHackathons = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = req.user.role === "admin" ? {} : { createdBy: req.user.id };

        const total = await Hackathon.countDocuments(filter);

        const hackathons = await Hackathon.find(filter)
            .populate("createdBy", "firstName lastName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            message: "Hackathons fetched successfully",
            count: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
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