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

        images: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Post", postSchema);