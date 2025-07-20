import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from '../models/tweet.model.js'

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content) {
        throw new ApiError(401, "Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Failed to create a tweet")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet added successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(401, "userId is required")
    }
    const tweet = await Tweet.find({ owner: new mongoose.Types.ObjectId(userId) })

    if (!tweet) {
        throw new ApiError(500, "Failed to fetched user tweet")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body
    if (!content) {
        throw new ApiError(401, "Content is required")
    }
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(401, "userId is required")
    }

    await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: { content: content }
        },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            content,
            "Tweet updated successfully"
        )
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(401, "tweetId is required")
    }

    await Tweet.findByIdAndDelete(
        tweetId,
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}