import mongoose, { Schema } from "mongoose";

const chapterSchema = new Schema({
    video: {
        type: mongoose.Types.ObjectId,
        ref: "Video"
    },
    title: {
        type: String,
        required: true,
    },
    startTime: {
        type: Number,
        required: true,
    },
    endTime: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

chapterSchema.index({ videoId: 1, startTime: 1 });

export const Chapter = mongoose.model('Chapter', chapterSchema);