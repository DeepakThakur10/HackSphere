import { Schema, model } from "mongoose";

const submissionSchema = new Schema(
    {
        hackathon: {
            type: Schema.Types.ObjectId,
            ref: "Hackathon",
            required: true,
        },

        team: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        projectName: {
            type: String,
            required: true,
            trim: true,
        },

        problemStatement: {
            type: String,
            required: true,
            trim: true,
        },

        solution: {
            type: String,
            required: true,
            trim: true,
        },

        githubUrl: {
            type: String,
            required: true,
            trim: true,
        },

        demoUrl: {
            type: String,
            trim: true,
            default: "",
        },

        presentationUrl: {
            type: String,
            trim: true,
            default: "",
        },

        videoUrl: {
            type: String,
            trim: true,
            default: "",
        },

        screenshots: [
            {
                type: String,
            },
        ],

        techStack: [
            {
                type: String,
                trim: true,
            },
        ],

        status: {
            type: String,
            enum: ["draft", "submitted", "under_review", "scored", "published"],
            default: "draft",
        },

        submittedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

submissionSchema.index({ hackathon: 1, team: 1 }, { unique: true, sparse: true });
submissionSchema.index({ hackathon: 1, user: 1 }, { unique: true, sparse: true });

const Submission = model("Submission", submissionSchema);

export default Submission;
