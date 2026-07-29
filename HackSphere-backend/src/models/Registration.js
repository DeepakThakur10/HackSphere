import { Schema, model } from "mongoose";

const registrationSchema = new Schema(
    {
        hackathon: {
            type: Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        teamName: {
            type: String,
            default: "",
            trim: true,
        },

        teamId: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },

        status: {
            type: String,
            enum: ["registered", "cancelled"],
            default: "registered",
        },
    },
    {
        timestamps: true,
    }
);

registrationSchema.index({ hackathon: 1, user: 1 }, { unique: true });

const Registration = model("Registration", registrationSchema);

export default Registration;