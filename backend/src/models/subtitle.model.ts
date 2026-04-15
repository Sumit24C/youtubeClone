import mongoose, { Schema } from "mongoose";

const subtitleSchema = new Schema({
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Video"
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: Number,
        required: true,
    },
    endTime: {
        type: Number,
        required: true,
    },
    language: {
        type: String,
        enum: ["en", "hin"],
        default: "en"
    }
}, { timestamps: true });

subtitleSchema.index({ videoId: 1, startTime: 1 });

subtitleSchema.pre("save", function (next) {
    if (this.startTime >= this.endTime) {
        return next(new Error("startTime must be less than endTime"));
    }
    next();
});

export const Subtitle = mongoose.model('Subtitle', subtitleSchema);