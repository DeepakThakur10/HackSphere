import mongoose from "mongoose";
import Hackathon from "../../models/Hackathon.js";

export const getHackathonById = async (req, res) => {
    try {
        

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};