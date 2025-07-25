class ApiResponse {

    constructor(statusCode, data, message = "success", errors=[]) {
        this.data = data
        this.statusCode = statusCode
        this.message = message
        this.success = statusCode < 400
        if (statusCode>=400 && errors?.length) {
            this.errors = errors
        }
    }
}

export { ApiResponse }