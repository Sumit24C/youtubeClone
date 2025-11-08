import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { User } from '../models/user.model.js'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const OPTIONS = {
    httpOnly: true,
    secure: true,
}

const accessTokenExpiry = parseInt(process.env.ACCESS_TOKEN_EXPIRY)
const refreshTokenExpiry = parseInt(process.env.REFRESH_TOKEN_EXPIRY)

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating access or refresh token')
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body
    if (
        [fullName, email, username, password].some((field) =>
            !field || field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "user with email or username already exist")
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
    })

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(200)
        .cookie("accessToken", accessToken, { ...OPTIONS, maxAge: accessTokenExpiry })
        .cookie("refreshToken", refreshToken, { ...OPTIONS, maxAge: refreshTokenExpiry })
        .json(
            new ApiResponse(200, createdUser, "User is created successfully")
        )

});

const loginUser = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body
    if (!(username || email)) {
        throw new ApiError(401, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, 'User not found')
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if (!isPasswordCorrect) {
        throw new ApiError(401, 'Invalid user credentials')
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...OPTIONS, maxAge: accessTokenExpiry })
        .cookie("refreshToken", refreshToken, { ...OPTIONS, maxAge: refreshTokenExpiry })
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken
                },
                "Successfully logged in")
        )

});

const logoutUser = asyncHandler(async (req, res) => {
    // const user = req.user
    // user.refreshToken = undefined
    // await user.save({validateBeforeSave: false})
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        }, {
        new: true
    })

    res.status(200)
        .clearCookie("accessToken", { ...OPTIONS, maxAge: accessTokenExpiry })
        .clearCookie("refreshToken", { ...OPTIONS, maxAge: refreshTokenExpiry })
        .json(
            new ApiResponse(
                200,
                {},
                "Successfully logout user"
            )
        )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new ApiError(401, "invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = user.refreshToken

    res.status(200)
        .cookie("accessToken", accessToken, { ...OPTIONS, maxAge: accessTokenExpiry })
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Access token refreshed"
            )
        )
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(401, "invalid passowrd")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, {}, "successfully changes password"))
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user
    return res.status(200)
        .json(new ApiResponse(200, user, "current user fetched successfully"))
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(401, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { fullName, email }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200)
        .json(new ApiResponse(200, user, "successfully update user details"))
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(401, "Avatar file is missiing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(401, "Failed to upload Avatar file")
    }
    const avatarURL = req.user?.avatar

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url }
        },
        { new: true }
    )

    if (avatarURL) {
        await deleteFromCloudinary(avatarURL)
    }

    return res.status(200)
        .json(new ApiResponse(200, user, "successfully updated avatar"))
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(401, "CoverImage file is missiing")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage) {
        throw new ApiError(401, "Failed to upload CoverImage file")
    }

    const coverImageURL = req.user?.coverImage

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { coverImage: coverImage.url }
        },
        { new: true }
    )
    if (coverImage) {
        await deleteFromCloudinary(coverImageURL)
    }

    return res.status(200)
        .json(new ApiResponse(200, user, "successfully updated coverImage"))
});

const getUserChannelInfo = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username) {
        throw new ApiError(401, "Channel name is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                },
                videosCount: {
                    $size: "$videos"
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                videosCount: 1
            }
        }
    ])

    return res.status(200)
        .json(new ApiResponse(200, channel[0], "User channel fetched successfully"))

});

const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $sort: { createdAt: -1 }
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
                ]
            }
        },

    ])

    if (!user[0].watchHistory) {
        throw new ApiError(404, "watchHistory not found");
    }

    return res.status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "watchHistory fetched successfully")
        )

});

const removeVideoFromWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(401, "VideoId is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { watchHistory: videoId }
        },
        { new: true }
    );

    if (!user) {
        throw new ApiError(500, "Failed to remove video from WatchHistory");
    }

    return res.json(
        new ApiResponse(200, {}, "Successfully removed video from watch history")
    );
});

const clearWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { watchHistory: [] } },
        {
            new: true
        }
    );
    console.log(user)

    if (!user) {
        throw new ApiError(500, "Failed to clear WatchHistory");
    }

    return res.json(
        new ApiResponse(200, { cleared: true }, "Successfully cleared watch history")
    );
});

const playPauseWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.findByIdAndUpdate(
        req.user._id,
        [
            { $set: { isHistory: { $not: "$isHistory" } } }
        ],
        {
            new: true
        }
    );

    if (!user) {
        throw new ApiError(500, "Failed to play-pause WatchHistory");
    }
    const status = user.isHistory ? "play" : "paused"
    return res.json(
        new ApiResponse(200, { isHistory: user.isHistory }, `Successfully ${status} watch history`)
    );
});

const toggleWatchLater = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "VideoId is required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let message, updatedUser;

    if (user.watchLater.includes(videoId)) {
        updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { watchLater: videoId } },
            { new: true }
        );
        message = "Video removed from Watch Later";
    } else {
        // Add video if not exists
        updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { watchLater: videoId } },
            { new: true }
        );
        message = "Video added to Watch Later";
    }

    return res.status(200).json(
        new ApiResponse(200, updatedUser, message)
    );
});

const getWatchLaterStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "VideoId is required");
    }

    const user = await User.aggregate([
        {
            $match: { _id: req.user?._id }
        },
        {
            $addFields: {
                isWatchLater: {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(videoId), "$watchLater"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                isWatchLater: 1
            }
        }
    ]);

    if (!user) {
        throw new ApiError(500, "Failed to fetch watch later status");
    }
    
    return res.status(200).json(
        new ApiResponse(
            200,
            { isWatchLater: user[0]?.isWatchLater || false },
            "Watch later status fetched successfully"
        )
    );
});

const getWatchLaterVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const response = await User.aggregate([
        {
            $match: {
                _id: req.user._id,
                video: { $exists: true }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchLater",
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
        throw new ApiError(404, "No watch later videos");
    }

    return res.status(200).json(
        new ApiResponse(200, response, "Successfully fetched watch later videos")
    )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelInfo,
    getWatchHistory,
    removeVideoFromWatchHistory,
    clearWatchHistory,
    playPauseWatchHistory,
    toggleWatchLater,

    getWatchLaterVideos
}