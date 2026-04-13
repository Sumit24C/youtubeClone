import { useState } from "react";
import { isCancel } from "axios";
import { useAxiosPrivate } from "./useAxiosPrivate";

function usePlaylist({
    name,
    description,
    videoId,
}: {
    name: string;
    description: string;
    videoId: string;
}) {
    const [playlistLoading, setPlaylistLoading] = useState<boolean>(false);
    const [playlist, setPlaylist] = useState<any>(null);

    const axiosPrivate = useAxiosPrivate();

    const createPlaylist = async (
        name: string,
        description: string
    ): Promise<void> => {
        setPlaylistLoading(true);

        try {
            const response = await axiosPrivate.post(`/playlist`, {
                name,
                description,
                videoId,
            });

            setPlaylist(response.data.data);
        } catch (error: any) {
            setPlaylistLoading(false);

            if (isCancel(error)) {
                console.error("usePlaylistAxios :: error :: ", error);
            } else {
                console.error("usePlaylist :: error :: ", error);
            }
        } finally {
            setPlaylistLoading(false);
        }
    };

    return { playlistLoading, playlist, createPlaylist };
}

export { usePlaylist };