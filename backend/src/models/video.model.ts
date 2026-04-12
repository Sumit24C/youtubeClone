import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { Comment } from "./comment.model.js";
import { Like } from "./like.model.js";

const videoSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ["uploading", "processing", "ready", "failed"],
        default: "processing"
    },
    thumbnail: {
        type: String,
        // required: true
    }
}, { timestamps: true });

videoSchema.pre("findOneAndDelete", async function (next) {
    const videoId = this.getQuery()["_id"];
    await Comment.deleteMany({ video: videoId });
    await Like.deleteMany({ video: videoId });
    next();
});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video', videoSchema)