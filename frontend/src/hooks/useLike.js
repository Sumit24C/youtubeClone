import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { isCancel } from 'axios';
import { useAxiosPrivate } from './useAxiosPrivate';

function useLike(isLiked, likesCount, isDisliked = false) {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [liked, setLiked] = useState(isLiked);
    const [countOfLikes, setCountOfLikes] = useState(likesCount);
    const axiosPrivate = useAxiosPrivate();
    const controller = useRef(null);
    controller.current = new AbortController();

    const handleLike = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.post(`/likes/toggle/v/${id}`, {
                signal: controller.current.signal
            });

            const likedRes = response.data.data.isLiked
            setLiked(likedRes);

            if (likedRes) {
                setCountOfLikes(prev => prev + 1)
            } else {
                setCountOfLikes(prev => prev - 1)
            }

        } catch (error) {
            if (isCancel(error)) {
                console.error("likedAxios :: error :: ", error)
            } else {
                console.error("liked :: error :: ", error)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            controller.current.abort();
        }
    }, [])

    return { loading, liked, countOfLikes, handleLike }
}

export { useLike };
