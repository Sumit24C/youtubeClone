import { ApiResponse } from "../utils/ApiResponse.js"

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Something went wrong"
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json(new ApiResponse(400, {}, 'File size limit exceeded (max 500MB).', err?.errors || []));
        }
    }
    return res.status(statusCode).json(
        new ApiResponse(statusCode, {}, message, err?.errors || [])
    )
}

export default errorHandler