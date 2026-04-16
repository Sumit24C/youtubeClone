import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromR2, generatePreSignedUploadUrl } from "services/r2.service.js";
import { transformVideo } from "utils/transformVideo.js";
import { Subtitle } from "models/subtitle.model.js";
import { subtitleQueue } from "queues/video.queue.js";
import { VideoBase } from "types/video.js";

const parseNumberParam = (value: unknown, fallback: number) => {
    if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? fallback : parsed;
    }

    if (typeof value === "number") {
        return value;
    }

    return fallback;
};

const getAllHomeVideos = asyncHandler(async (req, res) => {
    const { page = 1 } = req.query;
    const pageNumber = parseNumberParam(page, 1);
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
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        description: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: "views",
                            localField: "_id",
                            foreignField: "videoId",
                            pipeline: [{ $match: { isCompleted: true } }],
                            as: "views",
                        },
                    },
                    {
                        $addFields: {
                            views: { $size: "$views" },
                        },
                    },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
        {
            $addFields: {
                totalVideos: {
                    $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
                },
                totalPages: {
                    $ceil: {
                        $divide: [
                            {
                                $ifNull: [
                                    { $arrayElemAt: ["$totalCount.count", 0] },
                                    0,
                                ],
                            },
                            limitNumber,
                        ],
                    },
                },
            },
        },
    ]);

    const result = response[0];
    if (!(result.videos.length > 0)) {
        throw new ApiError(404, "Videos not found");
    }

    const formattedVideo = result.videos.map((video: VideoBase) => transformVideo(video));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos: formattedVideo,
                totalVideos: result.totalVideos,
                totalPages: result.totalPages,
                currentPage: pageNumber,
            },
            "All Videos fetched successfully"
        )
    );
});

const getSearchVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 9,
        query,
        sortBy = "createdAt",
        sortType = "desc",
    } = req.query;

    if (!query) {
        throw new ApiError(403, "query is required");
    }

    const limitNumber = parseNumberParam(limit, 9);
    const pageNumber = parseNumberParam(page, 1);

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
                        },
                    },
                ],
            },
        },
        {
            $match: {
                $or: [
                    { "channel.username": { $regex: query, $options: "i" } },
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            },
        },
        {
            $facet: {
                videos: [
                    {
                        $sort: {
                            createdAt: -1,
                        },
                    },
                    {
                        $skip: (pageNumber - 1) * limitNumber,
                    },
                    {
                        $limit: limitNumber,
                    },
                    {
                        $lookup: {
                            from: "views",
                            localField: "_id",
                            foreignField: "videoId",
                            pipeline: [
                                {
                                    $match: { isCompleted: true },
                                },
                            ],
                            as: "views",
                        },
                    },
                    {
                        $addFields: {
                            views: { $size: "$views" },
                        },
                    },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
        {
            $addFields: {
                totalVideos: {
                    $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
                },
            },
        },
    ]);
    const result = response[0];
    const totalPages = Math.ceil(result.totalVideos / limitNumber);

    if (result.videos.length === 0) {
        throw new ApiError(401, "Videos not found");
    }

    const formattedVideo = result.videos.map((video: VideoBase) => transformVideo(video));

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos: formattedVideo,
                totalVideos: result.totalVideos,
                totalPages: totalPages,
                currentPage: pageNumber,
            },
            "Searched Videos fetched successfully"
        )
    );
});

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
            },
        },
        {
            $unwind: "$channel",
        },
        {
            $match: {
                $or: [
                    { "channel.username": { $regex: query, $options: "i" } },
                    { title: { $regex: query, $options: "i" } },
                ],
            },
        },
        {
            $addFields: {
                values: ["$channel.username", "$title", "$description"],
            },
        },
        {
            $project: {
                _id: 0,
                values: 1,
            },
        },
    ]);

    if (response.length === 0) {
        throw new ApiError(404, "No videos similar to query found");
    }

    const search = response.flatMap((r) => r.values).slice(0, 5);
    const uniqueQuery = [...new Set(search)];
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                uniqueQuery,
                "successfully fetched search queries"
            )
        );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(401, "username is required");
    }

    const user = await User.findOne({ username: username }).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: user._id,
            },
        },
        {
            $lookup: {
                from: "views",
                localField: "_id",
                foreignField: "videoId",
                pipeline: [{ $match: { isCompleted: true } }],
                as: "views",
            },
        },
        {
            $addFields: {
                views: { $size: "$views" },
            },
        },
    ]);

    if (videos.length === 0) {
        throw new ApiError(404, "Videos not found");
    }

    const formattedVideos = videos.map((video: VideoBase) => transformVideo(video));

    return res
        .status(200)
        .json(
            new ApiResponse(200, formattedVideos, "Channel Videos fetched successfully")
        );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, filename, contentType } = req.body;

    if (!title || !description || !filename || !contentType) {
        throw new ApiError(403, "All fields are required");
    }

    const publishedVideo = await Video.create({
        title,
        description,
        owner: req.user._id,
        status: "uploading",
    });

    if (!publishedVideo) {
        throw new ApiError(500, "Failed to publish video");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, publishedVideo._id, "Video published successfully")
        );
});

const publishVideoSubtitle = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(403, "videoId is required");
    }

    const { language, key } = req.body;
    if (!language || !key) {
        throw new ApiError(403, "language and key are required");
    }

    const subtitles = await Subtitle.create({
        video: videoId,
        language,
        key,
        status: "processing"
    });

    if (!subtitles) {
        throw new ApiError(500, "Failed to create video subtitle");
    }

    await subtitleQueue.add("process-subtitle", {
        trackId: subtitles._id,
        key
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, subtitles, "Video published successfully")
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "VideoId is required");
    }

    if (
        typeof videoId !== "string" ||
        !mongoose.Types.ObjectId.isValid(videoId)
    ) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "like",
            },
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
                            as: "channel",
                        },
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$channel",
                            },
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            req.user?._id,
                                            "$channel.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            subscribersCount: 1,
                            isSubscribed: 1,
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                            description: 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "views",
                localField: "_id",
                foreignField: "videoId",
                pipeline: [{ $match: { isCompleted: true } }],
                as: "views",
            },
        },
        {
            $addFields: {
                views: {
                    $size: "$views",
                },
                likesCount: {
                    $size: "$like",
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$like.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
                viewsCount: { $size: "$views" },
                // isWatchLater: { $in: [mongoose.Types.ObjectId(videoId), "$user.watchLater"] }
            },
        },
        {
            $project: {
                like: 0,
                owner: 0,
            },
        },
    ]);

    if (!video[0]) {
        throw new ApiError(404, "Video not found");
    }

    const updateWatchHistory = await User.findByIdAndUpdate(
        req.user._id,
        [
            {
                $set: {
                    watchHistory: {
                        $cond: [
                            "$isHistory",
                            { $setUnion: ["$watchHistory", [video[0]._id]] },
                            "$watchHistory",
                        ],
                    },
                },
            },
        ],
        {
            new: true,
        }
    );

    // const isWatchLater = updateWatchHistory.watchLater.some(
    //     id => id.toString() === video[0]._id.toString()
    // );

    if (!updateWatchHistory) {
        throw new ApiError(500, "Failed to update watchHistory");
    }

    const subtitles = await Subtitle.find({ video: video[0]._id }).select("key status language");

    console.log(subtitles);
    const formattedVideo = transformVideo(video[0], subtitles);

    return res
        .status(200)
        .json(new ApiResponse(200, formattedVideo, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "VideoId is required");
    }

    const { title, description, isPublished, thumbnail = "" } = req.body;

    const updatedDetails = {
        ...(title && { title }),
        ...(description && { description }),
        ...(thumbnail && { thumbnail }),
        ...(typeof isPublished === "boolean" && { isPublished }),
    };

    if (Object.keys(updatedDetails).length === 0) {
        throw new ApiError(400, "At least one field is required to update");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this video");
    }

    if (thumbnail) {
        const oldThumbnail = video.thumbnail;
        if (oldThumbnail && !oldThumbnail.includes("default")) {
            await deleteFromR2(oldThumbnail);
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updatedDetails },
        { new: true }
    );

    const formattedVideo = transformVideo(updatedVideo);
    return res.status(200).json(
        new ApiResponse(200, formattedVideo, "Successfully updated video")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(401, "VideoId is required");
    }

    const video = await Video.findById(videoId);
    if (video) {
        await Video.findByIdAndDelete(videoId);
        // await deleteFromCloudinary(video.videoFile);
    }

    res.status(200).json(
        new ApiResponse(200, {}, "Deleted the video successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (typeof videoId !== "string" || !videoId.trim()) {
        throw new ApiError(401, "VideoId is required");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        [
            {
                $set: {
                    isPublished: {
                        $not: "$isPublished",
                    },
                },
            },
        ],
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "toggle published status successfully")
        );
});

export {
    getAllHomeVideos,
    publishAVideo,
    publishVideoSubtitle,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getChannelVideos,
    getSearchVideos,
    getSearchQuery,
};
