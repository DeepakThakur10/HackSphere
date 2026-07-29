import { Schema, model } from "mongoose";

const judgeInvitationSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        hackathon: {
            type: Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "expired"],
            default: "pending",
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

judgeInvitationSchema.index({ email: 1, hackathon: 1 });

const JudgeInvitation = model("JudgeInvitation", judgeInvitationSchema);

export default JudgeInvitation;
