import mongoose from "mongoose";

const adoptionSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        petName: {
            type: String,
            required: true,
        },

        petType: {
            type: String,
            required: true,
        },

        age: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        images: [
            {
                type: String,
            },
        ],

        location: {
            type: String,
            required: true,
        },

        contactInfo: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "available",
                "pending",
                "adopted",
            ],
            default: "available",
        },

        adoptionRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Adoption",
    adoptionSchema
);