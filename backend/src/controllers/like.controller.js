import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!videoId) {
        throw new ApiError(401, "VideoId is required")
    }
    const isLiked = await Like.findOne({ video: videoId, likedBy: req.user._id })

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, "Unliked video successfully")
        )
    }

    const likeVideo = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    if (!likeVideo) {
        throw new ApiError(500, "Failed to like video")
    }

    return res.status(200).json(
        new ApiResponse(200, { isLiked: true }, "Liked video successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(401, "CommentId is required")
    }
    const isLiked = await Like.findOne({ comment: commentId, likedBy: req.user._id })

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, "Unliked comment successfully")
        )
    }

    const likeComment = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    if (!likeComment) {
        throw new ApiError(500, "Failed to like comment")
    }

    return res.status(200).json(
        new ApiResponse(200, { isLiked: true }, "Liked comment successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!tweetId) {
        throw new ApiError(401, "TweetId is required")
    }
    const isLiked = await Like.findOne({ tweet: tweetId, likedBy: req.user._id })

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        return res.status(200).json(
            new ApiResponse(200, { isLiked: false }, "Unliked tweet successfully")
        )
    }

    const likeTweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (!likeTweet) {
        throw new ApiError(500, "Failed to like tweet")
    }

    return res.status(200).json(
        new ApiResponse(200, { isLiked: true }, "Liked tweet successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const response = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                video: { $exists: true }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "channel",
                            pipeline: [
                                { $project: { _id: 0, username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "views",
                            localField: "_id",
                            foreignField: "videoId",
                            pipeline: [
                                { $match: { isCompleted: true } }
                            ],
                            as: "views",
                        }
                    },
                    {
                        $addFields: {
                            views: {
                                $size: "$views"
                            },
                        }
                    },
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                video: 1
            }
        }
    ])

    if (!response) {
        throw new ApiError(404, "No liked videos");
    }

    return res.status(200).json(
        new ApiResponse(200, response, "Successfully fetched liked videos")
    )
})

const getLikeCountByVideoId = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "VideoId is required");
    }

    const likeCount = await Like.find({ video: videoId, likedBy: req.user._id })
    if (!likeCount) {
        throw new ApiError(404, "Liked Not found for this video")
    }

    const totalLikeCount = likeCount?.length || 0

    return res.status(200).json(new ApiResponse(200, { totalLikeCount }, "Successfully fetched video liked count"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getLikeCountByVideoId,
}