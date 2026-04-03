import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { cursor, limit = 7 } = req.query;

    if (!videoId) {
        throw new ApiError(401, "videoId is required");
    }

    const limitNumber = parseInt(limit);

    const matchStage = {
        video: new mongoose.Types.ObjectId(videoId)
    };

    if (cursor) {
        matchStage.createdAt = { $lt: new Date(cursor) };
    }   

    const comments = await Comment.aggregate([
        { $match: matchStage },

        { $sort: { createdAt: -1 } },

        { $limit: limitNumber },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "like"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$like" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$like.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$owner" },
        { $project: { like: 0 } }
    ]);

    const nextCursor =
        comments.length > 0 ? comments[comments.length - 1].createdAt : "";

    return res.status(200).json(
        new ApiResponse(
            200,
            { comments, nextCursor },
            "Video comments fetched successfully"
        )
    );
});

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

    await comment.populate("owner", "username avatar")

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
    const { content } = req.body

    if (!content) {
        throw new ApiError(401, "Comtent is required")
    }

    if (!commentId) {
        throw new ApiError(401, "ComtentId is required")
    }
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        { $set: { content } },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or you are not the owner");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(401, "ComtentId is required")
    }

    await Comment.findOneAndDelete({
        _id: commentId, owner: req.user._id
    })

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