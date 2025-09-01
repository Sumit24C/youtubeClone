
import mongoose, {Schema} from "mongoose"

const viewSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId, 
        ref: "Video"
    },
    viewerId: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    },
    watchTime: {
        type: Number,
        default: 0 //sec
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    device: {
        type: String,
        default: ""
    }
}, {timestamps: true})

export const View = mongoose.model("View", viewSchema)
