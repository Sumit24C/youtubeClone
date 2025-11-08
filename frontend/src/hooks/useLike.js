import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { isCancel } from 'axios';
import { useAxiosPrivate } from './useAxiosPrivate';

function useLike(
    isLiked,
    likesCount,
    isDisliked = false,
    type,
    id = "",
) {
    const { id: videoId } = useParams();
    const [likeLoading, setLikeLoading] = useState(false);
    const [liked, setLiked] = useState(isLiked);
    const [countOfLikes, setCountOfLikes] = useState(likesCount);
    const axiosPrivate = useAxiosPrivate();
    let endPoint;

    if (id) {
        endPoint = `/likes/toggle/${type[0]}/${id}`
    } else {
        endPoint = `/likes/toggle/${type[0]}/${videoId}`
    }

    const handleLike = async () => {
        setLikeLoading(true);
        try {
            const response = await axiosPrivate.post(endPoint);

            const likedRes = response.data.data.isLiked
            setLiked(likedRes);

            if (likedRes) {
                setCountOfLikes(prev => prev + 1)
            } else {
                setCountOfLikes(prev => prev - 1)
            }

        } catch (error) {
            setLikeLoading(false);
            if (isCancel(error)) {
                console.error("likedAxios :: error :: ", error)
            } else {
                console.error("liked :: error :: ", error)
            }
        } finally {
            setLikeLoading(false)
        }
    }

    return { likeLoading, liked, countOfLikes, handleLike }
}

export { useLike };
