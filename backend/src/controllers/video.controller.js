import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary, uploadVideoOnCloudinary } from "../utils/cloudinary.js"
import { channel } from "diagnostics_channel"

const getAllHomeVideos = asyncHandler(async (req, res) => {

    const page = 1;
    const limitNumber = 10;

    const videos = await Video.aggregate([
        {
            $limit: limitNumber
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        }, 
    ])

    if (!(videos.length > 0)) {
        throw new ApiError(401, "Videos not found")
    }

    return res.status(200).json(
        new ApiResponse(200, videos, "All Videos fetched successfully")
    )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "asc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if (!userId.trim()) {
        throw new ApiError(401, "UserId is required")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(401, "User not found")
    }

    const limitNumber = parseInt(limit)
    const pageNumber = parseInt(page)

    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
                ...(query && { "title": { $regex: "^" + query, $options: "i" } })
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
        {
            $skip: (pageNumber - 1) * limitNumber
        },
        {
            $limit: limitNumber
        }
    ])

    if (!(video.length > 0)) {
        throw new ApiError(401, "Videos not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "All Videos of Users fetched successfully")
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    
    const { title, description } = req.body

    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(401, "All fields are required")
    }
    const videoLocalPath = req.files?.videoFile[0]?.path
    console.log(videoLocalPath)
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    console.log(thumbnailLocalPath)

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(401, "All Video files are required")
    }

    const videoCloud = await uploadVideoOnCloudinary(videoLocalPath);
    const thumbnailCloud = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoCloud) {
        throw new ApiError(500, "Failed to upload video file")
    }
    if (!thumbnailCloud) {
        throw new ApiError(500, "Failed to upload thumbnail")
    }

    const videoPublished = await Video.create({
        title,
        description,
        videoFileUrl: videoCloud.eager[0].secure_url || videoCloud.playback_url,
        thumbnailUrl: thumbnailCloud.secure_url,
        videoFile: videoCloud.public_id,
        thumbnail: thumbnailCloud.public_id,
        owner: req.user._id,
        duration: videoCloud.duration,
    })

    if (!videoPublished) {
        throw new ApiError(500, "Failed to publish video")
    }

    return res.status(200).json(
        new ApiResponse(200, videoPublished, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(401, "VideoId is required")
    }

    // const video = await Video.findById(videoId)
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "like",
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "channel"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$channel"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [req.user?._id, "$channel.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    }, 
                    {
                        $project: {
                            subscribersCount: 1,
                            isSubscribed: 1,
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                        }
                    }
                ]
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
                }
            }
        },
        {
            $project: {
                like: 0,
                owner: 0,
            }
        },
    ])

    if (!video[0]) {
        throw new ApiError(404, "Video not found")
    }


    return res.status(200).json(
        new ApiResponse(200, video[0], "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(401, "VideoId is required")
    }

    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(401, "All fields are required")
    }

    const thumbnailLocalPath = req.file?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(401, "thumbnail file is required")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(500, "Failed to update thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: { title, description, thumbnail: thumbnail.secure_url }
        },
        { new: true }
    )


    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Successfully updated video")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId) {
        throw new ApiError(401, "VideoId is required")
    }
    const video = await Video.findById(videoId);
    if (video) {
        await Video.findByIdAndDelete(
            videoId
        )
        await deleteFromCloudinary(video.videoFile)
    }
    res.status(200).json(
        new ApiResponse(200, {}, "Deleted the video successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId.trim()) {
        throw new ApiError(401, "VideoId is required")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        [
            {
                $set: {
                    isPublished: {
                        $not: "$isPublished"
                    }
                }
            }
        ]
        , { new: true })

    return res.status(200).json(
        new ApiResponse(200, video, "toggle published status successfully")
    )
})

export {
    getAllHomeVideos,
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}