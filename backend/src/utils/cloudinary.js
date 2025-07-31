import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })
        console.log("response: ", response)
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("error: ",error)
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (imageURL) => {
    try {
        const public_id = imageURL.split('/upload/')[1]
            .split('/')
            .slice(1)
            .join('/')
            .replace(/\.[^/.]+$/, "")
        const res = await cloudinary.uploader.destroy(public_id, { invalidate: true })
        return res
    } catch (error) {
        throw new ApiError(401, "Error while deleting the image")
    }
}

export { uploadOnCloudinary , deleteFromCloudinary}