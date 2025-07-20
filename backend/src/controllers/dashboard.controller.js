import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: "$views"
                },
            }
        },
        {
            $project: {
                _id: 0,
                totalViews: 1,
                totalVideos: 1,
            }
        }
    ])

    if (!videoStats) {
        throw new ApiError(500, "Failed to fetch videoStats")
    }

    const subscriberStats = await Subscription.find({
        channel: req.user._id
    })

    if (!subscriberStats) {
        throw new ApiError(500, "Failed to fetch subscriberStats")
    }

    const likeStats = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id,
                video: {
                    $ne: null
                }
            }
        },
    ])

    if (!likeStats) {
        throw new ApiError(500, "Failed to fetch likeStats")
    }

    const channelStats = {
        videoStats: videoStats[0],
        totalSubscribers: subscriberStats.length,
        totalLikes: likeStats.length,
    }

    return res.status(200).json(
        new ApiResponse(200, channelStats, "Successfully fetched channel stats")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const video = await Video.find({ owner: req.user._id })
    if (!video) {
        throw new ApiError(500, "Failed to channel videos")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Successfully fetched channel videos")
    )
})

export {
    getChannelStats,
    getChannelVideos
}