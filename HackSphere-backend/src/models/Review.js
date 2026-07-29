import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
    {
        submission: {
            type: Schema.Types.ObjectId,
            ref: "Submission",
            required: true,
        },

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

        scores: {
            innovation: { type: Number, min: 0, max: 10, default: 0 },
            technicalComplexity: { type: Number, min: 0, max: 10, default: 0 },
            uiUx: { type: Number, min: 0, max: 10, default: 0 },
            functionality: { type: Number, min: 0, max: 10, default: 0 },
            scalability: { type: Number, min: 0, max: 10, default: 0 },
            documentation: { type: Number, min: 0, max: 10, default: 0 },
            presentation: { type: Number, min: 0, max: 10, default: 0 },
        },

        comments: {
            type: String,
            default: "",
            trim: true,
        },

        totalScore: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: ["draft", "submitted"],
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

reviewSchema.index({ submission: 1, judge: 1 }, { unique: true });

const Review = model("Review", reviewSchema);

export default Review;
