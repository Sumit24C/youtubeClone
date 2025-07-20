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
            new ApiResponse(200, {}, "UnSubscribed successfully")
        )
    }

    const newSubscription = await Subscription.create({ subscriber: req.user?._id, channel: channelId })
    if (!newSubscription) {
        throw new ApiError(500, "Failed to subscribe")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Subscribed successfully")
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
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(401, "subscriberId is required")
    }

    const subscribedChannels = await Subscription.find({ subscriber: subscriberId })

    if (!subscribedChannels) {
        throw new ApiError(401, "subscribedChannels not found")
    }

    console.log("sub",subscribedChannels)
    return res.status(200).json(
        new ApiResponse(200, subscribedChannels, "Successfully fetched subscribedChannels")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}