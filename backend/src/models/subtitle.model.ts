import mongoose, { Schema } from "mongoose";

const subtitleSchema = new Schema({
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["processing", "ready", "failed"],
        default: "processing",
    },
    fullText: {
        type: String,
        required: false
    },
    content: {
        type: [
            {
                text: String,
                startTime: Number,
                endTime: Number,
            }
        ],
        default: [],
    },
}, { timestamps: true });

subtitleSchema.index({ video: 1, language: 1 }, { unique: true });
export const Subtitle = mongoose.model('Subtitle', subtitleSchema);