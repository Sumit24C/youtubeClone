import { useEffect } from "react";
import axiosPrivate from "../api/api.js";
import { useRefreshToken } from "./useRefreshToken.js";
const useAxiosPrivate = () => {

    const refresh = useRefreshToken()
    useEffect(() => {
        const responseInterceptor = axiosPrivate.interceptors.response.use(
            (response) => response,
            async (error) => {
                const prevRequest = error?.config
                if ((error?.response?.status === 401) && !prevRequest.sent) {
                    try {
                        prevRequest.sent = true
                        console.log("prev req: ",prevRequest.sent)
                        await refresh()
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
        }

    }, [refresh])

    return axiosPrivate
}

export { useAxiosPrivate }