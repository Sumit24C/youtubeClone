import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    
    if (!videoId) {
        throw new ApiError(401, "VideoId is required")
    }
    const isLiked = await Like.findOne({video: videoId})

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        return res.status(200).json(
            new ApiResponse(200, {}, "Unliked video successfully")
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
        new ApiResponse(200, likeVideo, "Liked video successfully")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(401, "CommentId is required")
    }
    const isLiked = await Like.findOne({comment: commentId})

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        return res.status(200).json(
            new ApiResponse(200, {}, "Unliked comment successfully")
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
        new ApiResponse(200, likeComment, "Liked comment successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
     if (!tweetId) {
        throw new ApiError(401, "TweetId is required")
    }
    const isLiked = await Like.findOne({tweet: tweetId})

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id)
        return res.status(200).json(
            new ApiResponse(200, {}, "Unliked tweet successfully")
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
        new ApiResponse(200, likeTweet, "Liked tweet successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                video: {
                    $ne: null
                }
            }
        },
        {
            $project: {
                video: 1, createdAt: 1, updatedAt: 1
            }
        }
    ])

    if (!likedVideos) {
        throw new ApiError(401, "No liked videos")
    }

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Successfully fetched liked videos")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}