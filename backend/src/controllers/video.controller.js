import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { uploadOnImageKit } from "../utils/imageKit.js"

const getAllHomeVideos = asyncHandler(async (req, res) => {

    const page = 1;
    const limitNumber = 10;

    const videos = await Video.aggregate([
        {
            $limit: limitNumber
        }
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
    const videoLocalName = req.files?.videoFile[0]?.filename
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    const thumbnailLocalName = req.files?.thumbnail[0]?.filename
    
    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(401, "All Video files are required")
    }

    const videoCloud = await uploadOnCloudinary(videoLocalPath);
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
        videoFile: videoCloud.url,
        thumbnail: thumbnailCloud.url,
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

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
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
            $set: { title, description, thumbnail: thumbnail.url }
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

    await Video.findByIdAndDelete(
        videoId
    )

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