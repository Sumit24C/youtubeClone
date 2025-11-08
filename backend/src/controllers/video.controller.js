import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary, uploadVideoOnCloudinary } from "../utils/cloudinary.js"

const getAllHomeVideos = asyncHandler(async (req, res) => {
    const { page = 1 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = 9;

    const response = await Video.aggregate([
        {
            $facet: {
                videos: [
                    { $sort: { createdAt: -1 } },
                    { $skip: (pageNumber - 1) * limitNumber },
                    { $limit: limitNumber },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "channel",
                            pipeline: [
                                { $project: { username: 1, avatar: 1, description: 1 } }
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
                            as: "views"
                        }
                    },
                    {
                        $addFields: {
                            views: { $size: "$views" }
                        }
                    }
                ],
                totalCount: [{ $count: "count" }]
            }
        },
        {
            $addFields: {
                totalVideos: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
                totalPages: {
                    $ceil: {
                        $divide: [
                            { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
                            limitNumber
                        ]
                    }
                }
            }
        }
    ]);

    const result = response[0];
    if (!(result.videos.length > 0)) {
        throw new ApiError(404, "Videos not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            videos: result.videos,
            totalVideos: result.totalVideos,
            totalPages: result.totalPages,
            currentPage: pageNumber
        }, "All Videos fetched successfully")
    );
});

const getSearchVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 9, query, sortBy = "createdAt", sortType = "desc" } = req.query
    //TODO: get all videos based on query, sort, pagination

    if (!query) {
        throw new ApiError(403, "query is required");
    }

    const limitNumber = parseInt(limit)
    const pageNumber = parseInt(page)

    const response = await Video.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            description: 1,
                        }
                    }
                ]
            }
        },
        {
            $match: {
                $or: [
                    { "channel.username": { $regex: query, $options: "i" } },
                    { "title": { $regex: query, $options: "i" } },
                    { "description": { $regex: query, $options: "i" } },
                ]
            }
        },
        {
            $facet: {
                videos: [
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },
                    {
                        $skip: (pageNumber - 1) * limitNumber
                    },
                    {
                        $limit: limitNumber
                    },
                    {
                        $lookup: {
                            from: "views",
                            localField: "_id",
                            foreignField: "videoId",
                            pipeline: [
                                {
                                    $match: { isCompleted: true }
                                }
                            ],
                            as: "views",
                        }
                    },
                    {
                        $addFields: {
                            views: { $size: "$views" }
                        }
                    }
                ],
                totalCount: [{ $count: "count" }]
            }
        },
        {
            $addFields: {
                totalVideos: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
            }
        }
    ])
    const result = response[0];
    const totalPages = Math.ceil(result.totalVideos / limitNumber);

    if (result.videos.length === 0) {
        throw new ApiError(401, "Videos not found")
    }

    return res.status(200).json(
        new ApiResponse(200, {
            videos: result.videos,
            totalVideos: result.totalVideos,
            totalPages: totalPages,
            currentPage: pageNumber
        }, "Searched Videos fetched successfully")
    )

})

const getSearchQuery = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) {
        throw new ApiError(403, "query is required");
    }

    const response = await Video.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channel",
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $match: {
                $or: [
                    { "channel.username": { $regex: query, $options: "i" } },
                    { "title": { $regex: query, $options: "i" } },
                ]
            }
        },
        {
            $addFields: {
                values: [
                    "$channel.username",
                    "$title",
                    "$description"
                ]
            }
        },
        {
            $project: {
                _id: 0,
                values: 1
            }
        }
    ])

    if (response.length === 0) {
        throw new ApiError(404, "No videos similar to query found");
    }

    const search = response.flatMap((r) => r.values).slice(0, 5);
    const uniqueQuery = [...new Set(search)];
    return res.status(200).json(
        new ApiResponse(200, uniqueQuery
            , "successfully fetched search queries")
    )
});

const getChannelVideo = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(401, "username is required");
    }

    const user = await User.findOne({ username: username }).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const video = await Video.aggregate([
        {
            $match: {
                owner: user._id
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
                as: "views"
            }
        },
        {
            $addFields: {
                views: { $size: "$views" }
            }
        }
    ]);

    if (!video) {
        throw new ApiError(404, "Videos not found");
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Channel Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video

    const { title, description } = req.body

    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(403, "All fields are required")
    }
    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(401, "All files are required")
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
                            description: 1,
                        }
                    },
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
                viewsCount: { $size: "$views" },
                // isWatchLater: { $in: [mongoose.Types.ObjectId(videoId), "$user.watchLater"] }
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

    const updateWatchHistory = await User.findByIdAndUpdate(
        req.user._id,
        [{
            $set: {
                watchHistory: {
                    $cond: [
                        "$isHistory",
                        { $setUnion: ["$watchHistory", [video[0]._id]] },
                        "$watchHistory"
                    ]
                }
            }
        }],
        {
            new: true
        }
    )

    // const isWatchLater = updateWatchHistory.watchLater.some(
    //     id => id.toString() === video[0]._id.toString()
    // );

    if (!updateWatchHistory) {
        throw new ApiError(500, "Failed to update watchHistory")
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

    const { title, description, isPublished } = req.body

    if (!title || !description || isPublished === undefined) {
        throw new ApiError(401, "All fields are required")
    }

    const thumbnailLocalPath = req.file?.path
    let thumbnail;
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            throw new ApiError(500, "Failed to update thumbnail")
        }
    }

    const updatedDetails = {
        title: title,
        description: description,
        isPublished: isPublished,
    }
    if (thumbnail) {
        updatedDetails.thumbnail = thumbnail.secure_url
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updatedDetails
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
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getChannelVideo,
    getSearchVideos,
    getSearchQuery
}