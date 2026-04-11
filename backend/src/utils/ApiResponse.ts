class ApiResponse<T> {
    public statusCode: number;
    public data: T | null;
    public message: string;
    public success: boolean;
    public errors?: unknown[];

    constructor(
        statusCode: number,
        data: T | null,
        message: string = "success",
        errors: unknown[] = []
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;

        if (statusCode >= 400 && errors.length) {
            this.errors = errors;
        }
    }

    static success<T>(data: T, message = "success") {
        return new ApiResponse<T>(200, data, message);
    }

    static error(message = "error", statusCode = 500) {
        return new ApiResponse<null>(statusCode, null, message);
    }
}

export { ApiResponse };
