import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            required: true,
            trim: true,
        },

        entityType: {
            type: String,
            required: true,
            enum: ["User", "Hackathon", "Team", "Registration", "Submission", "Review", "System"],
        },

        entityId: {
            type: Schema.Types.ObjectId,
            default: null,
        },

        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = model("AuditLog", auditLogSchema);

export default AuditLog;
