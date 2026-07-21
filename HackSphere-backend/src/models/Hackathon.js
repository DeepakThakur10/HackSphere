import { Schema, model } from "mongoose";

const hackathonSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        banner: {
            type: String,
            default: "",
        },

        mode: {
            type: String,
            enum: ["online", "offline", "hybrid"],
            required: true,
        },

        location: {
            type: String,
            trim: true,
            default: "",
        },

        isPaid: {
            type: Boolean,
            default: false,
        },

        entryFee: {
            type: Number,
            default: 0,
            min: 0,
        },

        registrationStart: {
            type: Date,
            required: true,
        },

        registrationEnd: {
            type: Date,
            required: true,
        },

        hackathonStart: {
            type: Date,
            required: true,
        },

        hackathonEnd: {
            type: Date,
            required: true,
        },

        teamType: {
            type: String,
            enum: ["individual", "team"],
            required: true,
        },

        minTeamSize: {
            type: Number,
            default: 1,
            min: 1,
        },

        maxTeamSize: {
            type: Number,
            default: 1,
            min: 1,
        },

        maxTeams: {
            type: Number,
            required: true,
            min: 1,
        },

        prizePool: {
            type: Number,
            default: 0,
            min: 0,
        },

        techStack: [
            {
                type: String,
                trim: true,
            },
        ],

        status: {
            type: String,
            enum: [
                "draft",
                "published",
                "registration_closed",
                "ongoing",
                "completed",
                "cancelled",
            ],
            default: "draft",
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Hackathon = model("Hackathon", hackathonSchema);

export default Hackathon;