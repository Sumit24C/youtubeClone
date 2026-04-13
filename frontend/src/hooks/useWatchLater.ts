import { useState } from "react";
import { isCancel } from "axios";
import { useAxiosPrivate } from "./useAxiosPrivate";

function useToggle(videoId: string) {
    const [watchLaterLoading, setWatchLaterLoading] = useState<boolean>(false);
    const [watchLater, setWatchLater] = useState<boolean>(false);

    const axiosPrivate = useAxiosPrivate();

    const handleWatchLater = async (): Promise<void> => {
        if (!videoId) return;

        setWatchLaterLoading(true);

        try {
            const response = await axiosPrivate.patch(
                `/users/watch-later/v/toggle/${videoId}`
            );

            const watchLaterRes: boolean =
                response.data.data.isWatchLater;

            setWatchLater(watchLaterRes);
        } catch (error: any) {
            setWatchLaterLoading(false);

            if (isCancel(error)) {
                console.error("watchLaterAxios :: error :: ", error);
            } else {
                console.error("watchLater :: error :: ", error);
            }
        } finally {
            setWatchLaterLoading(false);
        }
    };

    return { watchLaterLoading, watchLater, handleWatchLater };
}

export { useToggle };