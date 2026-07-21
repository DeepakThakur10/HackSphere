import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            unique: true,
            sparse: true,
        },

        profilePicture: {
            type: String,
            default: "",
        },

        bio: {
            type: String,
            default: "",
        },

        collegeOrOrganization: {
            type: String,
            default: "",
        },

        resume: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["admin", "organizer", "participant", "judge"],
            default: "participant",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = model("User", userSchema);

export default User;