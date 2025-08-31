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

    const pageNumber = parseInt(page)
    const limitNumber = parseInt(limit)

    const response = await Comment.aggregate([
        {
            $facet: {
                comments: [
                    {
                        $match: {
                            video: new mongoose.Types.ObjectId(videoId)
                        }
                    },
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
                            likesCount: {
                                $size: "$like"
                            },
                            isLiked: {
                                $cond: {
                                    if: { $in: [req.user?._id, "$like.likedBy"] },
                                    then: true,
                                    else: false
                                }
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $skip: (pageNumber - 1) * limitNumber
                    },
                    {
                        $project: {
                            like: 0
                        }
                    }
                ],
                totalCount: [
                    {
                        $count: "count"
                    }
                ]
            },
        },
        {
            $addFields: {
                totalComments: {
                    $arrayElemAt: ["$totalCount.count", 0]
                },
                totalPages: {
                    $ceil: {
                        $divide: [
                            {
                                $arrayElemAt: ["$totalCount.count", 0]
                            },
                            limitNumber
                        ]
                    }
                }
            }
        }
    ])

    const result = response[0]
    if (!(result.comments.length > 0)) {
        throw new ApiError(401, "Video comments not found")
    }

    return res.status(200).json(
        new ApiResponse(200, {
            comments: result.comments,
            totalComments: result.totalComments,
            totalPages: result.totalPages,
            currentPage: result.pageNumber,
        }, "Video comments fetched successfully")
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

    // const resComment = await Comment.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(comment._id)
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "likes",
    //             localField: "_id",
    //             foreignField: "comment",
    //             as: "like"
    //         }
    //     },
    //     {
    //         $addFields: {
    //             likesCount: {
    //                 $size: "$like"
    //             },
    //             isLiked: {
    //                 $cond: {
    //                     if: { $in: [req.user?._id, "$like.likedBy"] },
    //                     then: true,
    //                     else: false
    //                 }
    //             },
    //         },
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "owner",
    //             foreignField: "_id",
    //             as: "owner",
    //             pipeline: [
    //                 {
    //                     $project: {
    //                         username: 1,
    //                         avatar: 1,
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $project: {
    //             like: 0
    //         }
    //     }
    // ])

    // if (!(resComment.length > 0)) {
    //     throw new ApiError(401, "failed to aggregate comment")
    // }


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