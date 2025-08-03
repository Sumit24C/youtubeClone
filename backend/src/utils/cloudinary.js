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

const uploadVideoOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            eager: [{
                streaming_profile: 'auto',
                format: "m3u8",
            }],
            eager_async:true,
            eager_notification_url: "https://mysite.example.com/notify_endpoint", 
        })
        console.log("response: ", response)
        // const hlsUrl = response.eager[0];
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log("error: ",error)
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (public_id) => {
    try {
        const res = await cloudinary.uploader.destroy(public_id, { invalidate: true })
        return res
    } catch (error) {
        throw new ApiError(401, "Error while deleting the image")
    }
}

export { uploadOnCloudinary , deleteFromCloudinary, uploadVideoOnCloudinary}