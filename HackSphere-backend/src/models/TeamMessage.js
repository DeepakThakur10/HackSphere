import { Schema, model } from "mongoose";

const teamMessageSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

teamMessageSchema.index({ team: 1, createdAt: 1 });

const TeamMessage = model("TeamMessage", teamMessageSchema);

export default TeamMessage;
