import { Schema, model } from "mongoose";

const hackathonJudgeSchema = new Schema(
    {
        hackathon: {
            type: Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        judge: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["assigned", "active", "removed"],
            default: "assigned",
        },
    },
    {
        timestamps: true,
    }
);

hackathonJudgeSchema.index({ hackathon: 1, judge: 1 }, { unique: true });

const HackathonJudge = model("HackathonJudge", hackathonJudgeSchema);

export default HackathonJudge;
