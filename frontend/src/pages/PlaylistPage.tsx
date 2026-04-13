import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate.js";
import { extractErrorMsg } from "../utils/index.js";
import PlaylistContainer from "../components/Playlist/PlaylistContainer.js";
import type { Playlist } from "../types/playlist.js";

function PlaylistPage() {
    const [playlistInfo, setPlaylistInfo] = useState<Playlist[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchPlaylists = async (): Promise<void> => {
            setLoading(true);

            try {
                const response = await axiosPrivate.get(`/playlist/current-user`);
                setPlaylistInfo(response.data.data);
            } catch (error: unknown) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [axiosPrivate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (errorMsg) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <Typography color="error">{errorMsg}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                p: 2,
                gap: 2,
                minHeight: "300px",
                width: "100%",
            }}
        >
            {playlistInfo.length > 0 ? (
                playlistInfo.map((playlist) => (
                    <PlaylistContainer
                        key={playlist._id}
                        playlist={playlist}
                        setPlaylistInfo={setPlaylistInfo}
                    />
                ))
            ) : (
                <Typography textAlign="center">
                    No playlist available
                </Typography>
            )}
        </Box>
    );
}

export default PlaylistPage;