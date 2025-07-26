import api from '../api/api.js'
import { useDispatch, useSelector } from 'react-redux'

const useRefreshToken = () => {
    const dispatch = useDispatch()

    const refreshToken = async () => {
        try {
            const response = await api.get('/users/refresh-token')
            return true
        } catch (error) {
            console.log("refreshToken :: error :: ", error)
            return null
        }
    }
    return refreshToken;
}

export { useRefreshToken };