import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";

const getVideoComments = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const { cursor, limit } = req.query;

    if (!videoId) {
        throw new ApiError(401, "videoId is required");
    }

    if (typeof videoId !== "string" || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const limitNumber = Math.min(parseInt(typeof limit === "string" ? limit : "7"), 50);

    const matchStage: {
        video: mongoose.Types.ObjectId;
        createdAt?: { $lt: Date };
    } = {
        video: new mongoose.Types.ObjectId(videoId),
    };

    if (typeof cursor === "string") {
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
                as: "like",
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$like" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$like.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { username: 1, avatar: 1 } }],
            },
        },
        { $unwind: "$owner" },
        { $project: { like: 0 } },
    ]);

    const nextCursor =
        comments.length > 0 ? comments[comments.length - 1].createdAt : "";

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { comments, nextCursor },
                "Video comments fetched successfully"
            )
        );
});

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;

    if (!content || content.trim() == "") {
        throw new ApiError(401, "content is required");
    }

    if (!videoId) {
        throw new ApiError(401, "videoID is required");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id,
    });

    await comment.populate("owner", "username avatar");

    if (!comment) {
        throw new ApiError(500, "Failed to upload comment");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment uploaded successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw new ApiError(401, "Comtent is required");
    }

    if (!commentId) {
        throw new ApiError(401, "ComtentId is required");
    }
    
    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user?._id },
        { $set: { content } },
        { new: true }
    );

    if (!updatedComment) {
        throw new ApiError(404, "Comment not found or you are not the owner");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(401, "ComtentId is required");
    }

    await Comment.findOneAndDelete({
        _id: commentId,
        owner: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
