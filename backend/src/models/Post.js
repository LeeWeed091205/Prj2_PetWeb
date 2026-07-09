import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            enum: ['general', 'experience', 'clinic'],
            default: 'general',
        },

        location: {
            type: String,
        },

        images: [
            {
                type: String,
            },
        ],

        videos: [
            {
                type: String,
            },
        ],

        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Post", postSchema);