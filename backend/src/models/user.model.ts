import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { accessTokenExpiry, refreshTokenExpiry } from "../constants.js";

export interface UserDocument {
    username: string;
    email: string;
    fullName: string;
    description?: string;
    avatar?: string;
    coverImage?: string;

    watchHistory: Types.ObjectId[];
    watchLater: Types.ObjectId[];

    isHistory: boolean;

    password?: string;
    refreshToken?: string;

    likedVideos?: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;

    isPasswordCorrect: (password: string) => Promise<boolean>;
    generateAccessToken: () => string;
    generateRefreshToken: () => string;
}

const userSchema = new Schema<UserDocument>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
        },
        avatar: {
            type: String,
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        watchLater: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        isHistory: {
            type: Boolean,
            default: true,
        },
        password: {
            type: String,
            required: false,
        },
        refreshToken: {
            type: String,
        },
        likedVideos: {
            type: Schema.Types.ObjectId,
            ref: "playlists",
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.password) return next();
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: accessTokenExpiry,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: refreshTokenExpiry,
        }
    );
};

export const User = mongoose.model<UserDocument>("User", userSchema);
