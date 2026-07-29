import { Schema, model } from "mongoose";

const announcementSchema = new Schema(
  {
    hackathon: {
      type: Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    createdBy: {
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
    priority: {
      type: String,
      enum: ["info", "important", "urgent"],
      default: "info",
    },
  },
  { timestamps: true }
);

announcementSchema.index({ hackathon: 1, createdAt: -1 });

const Announcement = model("Announcement", announcementSchema);

export default Announcement;
