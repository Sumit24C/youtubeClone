import mongoose, { isValidObjectId } from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(401, "ChannelId is required")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id)
        return res.status(200).json(
            new ApiResponse(200, { isSubscribed: false }, "UnSubscribed successfully")
        )
    }

    const newSubscription = await Subscription.create({ subscriber: req.user?._id, channel: channelId })

    if (!newSubscription) {
        throw new ApiError(500, "Failed to subscribe")
    }

    return res.status(200).json(
        new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(401, "channelId is required")
    }
    const channelSubscribers = await Subscription.find({ channel: channelId })

    if (!channelSubscribers) {
        throw new ApiError(401, "channelSubscribers not found")
    }

    return res.status(200).json(
        new ApiResponse(200, channelSubscribers, "Successfully fetched channel Subscribers")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: req.user._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$subscribers" }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            description: 1,
                            subscribersCount: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                channel: 1
            }
        }
    ])

    if (!subscribedChannels) {
        throw new ApiError(401, "subscribedChannels not found")
    }

    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Successfully fetched subscribedChannels")
    )
})

const getSubscribedChannelsVideos = asyncHandler(async (req, res) => {

    const subscribedChannelVideos = await Subscription.aggregate([
        {
            $match: {
                subscriber: req.user._id
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "videos",
                localField: "channel",
                foreignField: "owner",
                as: "videos",
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
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$videos"
        },
        {
            $project: {
                videos: 1
            }
        }
    ])

    if (!subscribedChannelVideos) {
        throw new ApiError(404, "subscribedChannels video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, subscribedChannelVideos, "Successfully fetched subscribedChannels videos")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getSubscribedChannelsVideos,
}