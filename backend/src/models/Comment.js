import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },

        adoptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Adoption",
            default: null,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Comment",
    commentSchema
);