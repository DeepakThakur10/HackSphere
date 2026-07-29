import { Schema, model } from "mongoose";

const ALLOWED_TRANSITIONS = {
    created: ["joining"],
    joining: ["locked"],
    locked: ["submitted"],
    submitted: ["completed"],
    completed: [],
};

const teamSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        hackathon: {
            type: Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        leader: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        inviteCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["created", "joining", "locked", "submitted", "completed"],
            default: "created",
        },

        minSize: {
            type: Number,
            default: 1,
            min: 1,
        },

        maxSize: {
            type: Number,
            default: 4,
            min: 1,
        },

        lockedAt: {
            type: Date,
            default: null,
        },

        submittedAt: {
            type: Date,
            default: null,
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

teamSchema.methods.canTransitionTo = function (nextStatus) {
    const current = this.status;
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(nextStatus);
};

teamSchema.index({ hackathon: 1, name: 1 }, { unique: true });

const Team = model("Team", teamSchema);

export default Team;
