export default function extractErrorMsg(error) {
    return error?.response?.data?.message || "Something went wrong"
}