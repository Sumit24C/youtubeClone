import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Alert,
    CircularProgress,
} from "@mui/material";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import PlaylistSelector from "./PlaylistSelector";
import PlaylistForm from "./PlaylistForm";
import type { Playlist } from "../../types/playlist";

type Props = {
    videoId?: string;
    handleDialogClose: () => void;
    edit?: boolean;
};

function CreatePlaylist({
    videoId,
    handleDialogClose,
    edit = false,
}: Props) {
    const axiosPrivate = useAxiosPrivate();

    const [showForm, setShowForm] = useState<boolean>(false);
    const [playlist, setPlaylist] = useState<Playlist[]>([]);
    const [errMsg, setErrMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);

        let url = `/playlist/current-user/t`;
        if (edit) url = `/playlist/current-user/public`;

        (async () => {
            try {
                const response = await axiosPrivate.get(url);
                setPlaylist(response.data.data || []);
            } catch (error: any) {
                if (!isCancel(error)) console.error(error);
            } finally {
                setLoading(false);
            }
        })();
    }, [edit]);

    return (
        <Box
            sx={{
                p: 2,
                minWidth: 280,
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "#151515ff",
            }}
        >
            <Typography variant="h6" sx={{ mb: 2 }}>
                {showForm ? "Create New Playlist" : "Your Playlists"}
            </Typography>

            {/* Error */}
            {errMsg && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errMsg}
                </Alert>
            )}

            {/* Playlist list */}
            {!showForm && (
                <>
                    {loading ? (
                        <CircularProgress />
                    ) : playlist.length > 0 ? (
                        <PlaylistSelector
                            playlist={playlist}
                            videoId={videoId}
                        />
                    ) : (
                        <Typography>No playlists found.</Typography>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            variant="contained"
                            onClick={() => setShowForm(true)}
                            disabled={loading}
                        >
                            New Playlist
                        </Button>
                    </Box>
                </>
            )}

            {/* Form */}
            {showForm && (
                <PlaylistForm
                    videoId={videoId}
                    loading={loading}
                    setLoading={setLoading}
                    setErrMsg={setErrMsg}
                    setPlaylist={setPlaylist}
                    setShowForm={setShowForm}
                    handleDialogClose={handleDialogClose}
                />
            )}
        </Box>
    );
}

export default CreatePlaylist;