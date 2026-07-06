import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        username: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER",
        },

        profile: {
            avatar: {
                type: String,
                default: "",
            },

            bio: {
                type: String,
                default: "",
            },

            location: {
                type: String,
                default: "",
            },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);