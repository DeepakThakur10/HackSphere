import { Schema, model } from "mongoose";

const replySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const discussionSchema = new Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "technical", "rules", "announcement"],
      default: "general",
    },
    replies: [replySchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isSolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

discussionSchema.index({ hackathon: 1, createdAt: -1 });

const Discussion = model("Discussion", discussionSchema);

export default Discussion;
