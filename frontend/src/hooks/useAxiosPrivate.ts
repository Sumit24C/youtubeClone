import { useEffect } from "react";
import api from "../api/api";
import { useRefreshToken } from "./useRefreshToken";
import { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
    sent?: boolean;
};

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response: any) => response,
            async (error: AxiosError) => {
                const prevRequest = error?.config as CustomAxiosRequestConfig;

                if (
                    error?.response?.status === 403 &&
                    prevRequest &&
                    !prevRequest.sent
                ) {
                    try {
                        prevRequest.sent = true;

                        const refreshed = await refresh();

                        if (refreshed) {
                            return api(prevRequest);
                        }
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [refresh]);

    return api;
};

export { useAxiosPrivate };