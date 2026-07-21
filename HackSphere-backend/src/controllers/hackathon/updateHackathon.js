import mongoose from "mongoose";
import Hackathon from "../../models/Hackathon.js";

export const updateHackathon = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Hackathon ID",
            });
        }

        const hackathon = await Hackathon.findById(id);

        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: "Hackathon not found",
            });
        }

        if (
            req.user.role !== "admin" &&
            hackathon.createdBy.toString() !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this hackathon",
            });
        }

        const updatedHackathon = await Hackathon.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        ).populate("createdBy", "firstName lastName email");

        return res.status(200).json({
            success: true,
            message: "Hackathon updated successfully",
            data: updatedHackathon,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
