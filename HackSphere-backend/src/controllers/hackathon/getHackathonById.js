import mongoose from "mongoose";
import Hackathon from "../../models/Hackathon.js";

export const getHackathonById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Hackathon ID",
            });
        }
        const hackathon = await Hackathon.findById(id).populate("createdBy", "firstName lastName email");
        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: "Hackathon not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Hackathon fetched successfully",
            data: hackathon,
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};