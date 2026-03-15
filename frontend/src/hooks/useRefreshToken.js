import refreshApi from '../api/api.js'
import { useDispatch, useSelector } from 'react-redux'

const useRefreshToken = () => {
    const dispatch = useDispatch()

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