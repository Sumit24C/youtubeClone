import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { extractErrorMsg } from "../../utils";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { Box, CircularProgress, Typography } from "@mui/material";
import PlaylistContainer from "../Playlist/PlaylistContainer";
import type { Playlist } from "../../types/playlist";

function ChannelPlaylist() {
    const { id } = useParams<{ id: string }>();

    const [playlistInfo, setPlaylistInfo] = useState<Playlist[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        if (!id) return;

        setLoading(true);

        (async () => {
            try {
                const response = await axiosPrivate.get(
                    `/playlist/user/${id}`
                );

                setPlaylistInfo(response.data.data);
            } catch (error: any) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
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
            {playlistInfo && playlistInfo.length > 0 ? (
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

export default ChannelPlaylist;