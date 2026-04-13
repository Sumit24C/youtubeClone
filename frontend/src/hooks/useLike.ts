import { useParams } from "react-router-dom";
import { useState } from "react";
import { isCancel } from "axios";
import { useAxiosPrivate } from "./useAxiosPrivate";

function useLike(
    isLiked: boolean,
    likesCount: number,
    isDisliked: boolean = false,
    type: string,
    id: string = ""
) {
    const { id: videoId } = useParams<{ id: string }>();

    const [likeLoading, setLikeLoading] = useState<boolean>(false);
    const [liked, setLiked] = useState<boolean>(isLiked);
    const [countOfLikes, setCountOfLikes] = useState<number>(likesCount);

    const axiosPrivate = useAxiosPrivate();

    let endPoint: string;

    if (id) {
        endPoint = `/likes/toggle/${type[0]}/${id}`;
    } else {
        endPoint = `/likes/toggle/${type[0]}/${videoId}`;
    }

    const handleLike = async (): Promise<void> => {
        setLikeLoading(true);

        try {
            const response = await axiosPrivate.post(endPoint);

            const likedRes: boolean = response.data.data.isLiked;

            setLiked(likedRes);

            if (likedRes) {
                setCountOfLikes((prev) => prev + 1);
            } else {
                setCountOfLikes((prev) => prev - 1);
            }
        } catch (error: any) {
            setLikeLoading(false);

            if (isCancel(error)) {
                console.error("likedAxios :: error :: ", error);
            } else {
                console.error("liked :: error :: ", error);
            }
        } finally {
            setLikeLoading(false);
        }
    };

    return { likeLoading, liked, countOfLikes, handleLike };
}

export { useLike };