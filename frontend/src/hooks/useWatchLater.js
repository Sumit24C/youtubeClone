import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { isCancel } from 'axios';
import { useAxiosPrivate } from './useAxiosPrivate';

function useToggle(
    videoId,
) {
    const { id } = useParams();
    const [watchLaterLoading, setwatchLaterLoading] = useState(false);
    const [watchLater, setWatchLater] = useState(isLiked);
    const axiosPrivate = useAxiosPrivate();

    const endPoint = `/likes/toggle/${type[0]}/${videoId}`

    const handleLike = async () => {
        setwatchLaterLoading(true);
        try {
            const response = await axiosPrivate.patch(`/users//watch-later/v/toggle/${videoId}`);

            const watchLaterRes = response.data.data.isWatchLater
            setWatchLater(watchLaterRes);

        } catch (error) {
            setwatchLaterLoading(false);
            if (isCancel(error)) {
                console.error("watchLaterAxios :: error :: ", error)
            } else {
                console.error("watchLater :: error :: ", error)
            }
        } finally {
            setwatchLaterLoading(false)
        }
    }

    return { watchLaterLoading, watchLater, handleWatchLater }
}

export { useToggle };
