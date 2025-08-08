import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { isCancel } from 'axios';
import { useAxiosPrivate } from './useAxiosPrivate';

function usePlaylist({ name, description, videoId }) {
    const [playlistLoading, setPlaylistLoading] = useState(false);
    const [playlist, setPlaylist] = useState(null);
    const axiosPrivate = useAxiosPrivate();
    const controller = useRef(null);

    const createPlaylist = async (name, description) => {
        setPlaylistLoading(true);
        try {
            controller.current = new AbortController();
            const response = await axiosPrivate.post(`/playlist`, {
                name, description, videoId
            }, {
                signal: controller.current.signal
            });

            console.log(response.data.data);
            setPlaylist(response.data.data);
        } catch (error) {
            setPlaylistLoading(false);
            if (isCancel(error)) {
                console.error("usePlaylistAxios :: error :: ", error)
            } else {
                console.error("usePlaylist :: error :: ", error)
            }
        } finally {
            setPlaylistLoading(false);
        }
    }

    useEffect(() => {
        return () => {
            if (controller.current) controller.current.abort();
        }
    }, [])

    return { playlistLoading, playlist, createPlaylist }
}

export { usePlaylist };
