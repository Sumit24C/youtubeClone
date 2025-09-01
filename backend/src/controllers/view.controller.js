import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { View } from "../models/view.model.js"

const addVideoView = asyncHandler(async function (req, res) {
    const { videoId } = req.params
    const { watchTime, isCompleted } = req.query
    if (!videoId) {
        throw new ApiError(403, "VideoId is required")
    }
    let view = await View.findOne({ videoId: videoId, viewerId: req.user._id })
    if (!view) {
        view = await View.create({
            videoId: videoId,
            viewerId: req.user._id,
            watchTime: watchTime,
            isCompleted: isCompleted
        })

        if (!view) {
            throw new ApiError(500, "Failed to add view")
        }

        return res.json(
            new ApiResponse(200, view, "view added successfully")
        )
    }


    const updateQuery = {
        $inc: { watchTime: watchTime },
    }

    if (!view.isCompleted) {
        updateQuery.$set = { isCompleted: isCompleted };
    }

    const updatedView = await View.findByIdAndUpdate(
        view._id, updateQuery,
        {
            new: true
        }
    )


    if (!updatedView) {
        throw new ApiError(500, "Failed to update view")
    }

    return res.json(
        new ApiResponse(200, updatedView, "view updated successfully")
    )
})

const getVideoView = asyncHandler(async function (req, res) {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(403, "VideoId is required")
    }

    const view = await View.findOne({
        videoId: videoId,
        viewerId: req.user._id,
    })

    if (!view) {
        throw new ApiError(404, "View not found")
    }

    return res.json(
        new ApiResponse(200, view, "view fetched successfully")
    )
})


export {
    addVideoView,
    getVideoView
}