import { useEffect } from "react";
import { axiosPrivate } from "../api/api.js";
import { useRefreshToken } from "./useRefreshToken.js";
import { useSelector } from "react-redux";
import store from '../store/store.js'
const useAxiosPrivate = () => {

    const refresh = useRefreshToken()
    useEffect(() => {
        const requestInterceptor = axiosPrivate.interceptors.request.use(
            (config) => config,
            (error) => {
                return Promise.reject(error)
            }
        )

        const responseInterceptor = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config
                if (error?.response?.status === 403 && !prevRequest.sent) {
                    try {
                        prevRequest.sent = true
                        const newAccessToken = await refresh()
                        return axiosPrivate(prevRequest)
                    } catch (refreshError) {
                        return Promise.reject(refreshError)
                    }
                }
                return Promise.reject(error)
            }
        )

        return () => {
            axiosPrivate.interceptors.response.eject(responseInterceptor)
            axiosPrivate.interceptors.request.eject(requestInterceptor)
        }

    }, [refresh])

    return axiosPrivate
}

export { useAxiosPrivate }