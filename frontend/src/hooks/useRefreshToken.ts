import refreshApi from '../api/api.js'

const useRefreshToken = () => {
    const refreshToken = async () => {
        try {
            await refreshApi.get('/users/refresh-token')
            return true
        } catch (error) {
            console.error("refreshToken :: error :: ", error)
            return null
        }
    }
    return refreshToken;
}

export { useRefreshToken };