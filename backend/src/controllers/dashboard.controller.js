import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Playlist } from "../models/playlist.model.js"

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

const getVideoAnalytics = asyncHandler(async (req, res) => {
    // const { videoId } = req.params

    // if (!videoId) {
    //     throw new ApiError(403, "VideoId is required")
    // }

    const video = await Video.aggregate([
        {
            $match: {
                owner: req.user._id
            }
        },
        {
            $lookup: {
                from: "views",
                localField: "_id",
                foreignField: "videoId",
                as: "views"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments"
            }
        }
    ])

    if (!video) {
        throw new ApiError(500, "Failed to fetch Video Analytics")
    }

    return res.json(
        new ApiResponse(200, video, "successfully fetched videos analytics")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { videoId } = req.params
    console.log(videoId)
    if (!videoId) {
        throw new ApiError(403, "VideoId is required")
    }

    await Video.findOneAndDelete({
        _id: videoId, owner: req.user._id
    })

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )

})

const getPlaylistAnalytics = asyncHandler(async (req, res) => {

    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: req.user._id,
                isPrivate: false
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $lookup: {
                            from: "views",
                            localField: "_id",
                            foreignField: "videoId",
                            as: "views",
                            pipeline: [{ $project: { _id: 1 } }]
                        }
                    },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes",
                            pipeline: [{ $project: { _id: 1 } }]
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                totalViews: {
                    $sum: {
                        $map: {
                            input: "$videos",
                            in: { $size: "$$this.views" }
                        }
                    }
                },
                totalLikes: {
                    $sum: {
                        $map: {
                            input: "$videos",
                            in: { $size: "$$this.likes" }
                        }
                    }
                },
                lastVideo: {
                    $arrayElemAt: ["$videos", -1],
                },
                totalVideos: {
                    $size: "$videos"
                },
                totalDuration: {
                    $sum: {
                        $map: {
                            input: "$videos",
                            in:  "$$this.duration"
                        }
                    }
                }
            }
        },
        {
            $project: {
                totalViews: 1,
                totalLikes: 1,
                totalVideos: 1,
                totalDuration: 1,
                "lastVideo._id": 1,
                "lastVideo.thumbnailUrl": 1,
                "lastVideo.thumbnail": 1,
            }
        }
    ])

    return res.json(
        new ApiResponse(200, playlist, "playlist analytics fetched successfully")
    )
})

const getVideoByIdStudio = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(401, "VideoId is required")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "playlists",
                localField: "_id",
                foreignField:"videos",
                as: "playlists",
                pipeline: [
                    {
                        $match:{
                            owner: req.user._id,
                            isPrivate: false
                        }
                    }
                ]
            }
        }
    ])


    if (!video[0]) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    )
})

//last video performance, which includes views,likes, average-view-duration, comments, 
//channel analytics, subscribers, views, watch-time, 
//video details:  analytics, details, {views, watch-time}, comments

export {
    getChannelStats,
    getChannelVideos,
    getVideoAnalytics,
    deleteVideo,
    getPlaylistAnalytics,
    getVideoByIdStudio
}