import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
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

export default mongoose.model(
    "Product",
    productSchema
);