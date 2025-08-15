import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videoId } = req.body
    //TODO: create playlist

    if (!(name && description)) {
        throw new ApiError(401, "All fields are required")
    }

    const playlist = await Playlist.create({
        name, description, videos: [videoId], owner: req.user._id
    });

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!userId.trim()) {
        throw new ApiError(401, "UserId is required")
    }

    const userPlaylists = await Playlist.find({ owner: userId })

    if (!userPlaylists) {
        throw new ApiError(404, "userPlaylist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, userPlaylists, "User playlist fetched successfully")
    )
})

const getCurrentUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    //TODO: get currentUser playlists

    if (!userId) {
        throw new ApiError(401, "UserId is required")
    }

    console.log(userId);
    const userPlaylists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields: {
                videosCount: { $size: "$videos" },
                videos: {
                    $arrayElemAt: ["$videos", -1]
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "lastVideo",
                pipeline: [
                    {
                        $project: {
                            thumbnailUrl: 1,
                            thumbnail: 1,
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$lastVideo",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $project: {
                videos: 0,
            }
        }
    ]);

    if (!userPlaylists) {
        throw new ApiError(404, "userPlaylist not found")
    }

    return res.status(200).json(
        new ApiResponse(200, userPlaylists, "currentUser playlist fetched successfully")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!playlistId.trim()) {
        throw new ApiError(401, "UserId is required")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "playlistVideo",
                pipeline: [
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
                                    }
                                }
                            ]
                        }
                    },
                ]
            }
        },
        {
            $project: {
                videos: 0,
            }
        }
    ])

    if (!playlist) {
        throw new ApiError(500, "Failed to fetch playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist[0], "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    console.log("playlist",playlistId);
    console.log("video",videoId);
    if (!(playlistId && videoId)) {
        throw new ApiError(401, "All fields are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        },
        { new: true }
    )

    if (!playlist) {
        throw new ApiError(500, "Failed to add video to the playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to the playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!(playlistId && videoId)) {
        throw new ApiError(401, "All fields are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    )

    if (!playlist) {
        throw new ApiError(500, "Failed to remove video from the playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from the playlist successfully")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!playlistId) {
        throw new ApiError(401, "PlaylistId is required")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!(name || description)) {
        throw new ApiError(401, "Atleast one field is required")
    }
    const updatedData = {}

    if (typeof (name) === "string" && name.trim()) updatedData.name = name
    if (typeof (description) === "string" && description.trim()) updatedData.description = description

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: updatedData
        }, {
        new: true
    }
    )

    if (!playlist) {
        throw new ApiError(500, "Failed to update playlist")
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Successfully updated playlist")
    )
})

export {
    createPlaylist,
    getCurrentUserPlaylists,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}