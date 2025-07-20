import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(401, "videoId is required")
    }

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip: (pageNumber - 1) * limitNumber
        },
    ])

    if (!(comments.length > 0)) {
        throw new ApiError(401, "Video comments not found")
    }

    return res.status(200).json(
        new ApiResponse(200, comments, "Video comments fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    const { videoId } = req.params

    if (!content || content.trim() == "") {
        throw new ApiError(401, "content is required")
    }

    if (!videoId) {
        throw new ApiError(401, "videoID is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(500, "Failed to upload comment")
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment uploaded successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params

    const {content} = req.body

    if (!content) {
        throw new ApiError(401, "Comtent is required")
    }
    if (!commentId) {
        throw new ApiError(401, "ComtentId is required")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    )

    if (!comment) {
        throw new ApiError(500, "Failed to update comment")
    }

    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(401, "ComtentId is required")
    }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}