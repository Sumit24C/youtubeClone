import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { isCancel } from "axios";
import extractErrorMsg from "../../utils/extractErrorMsg.js";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate.js";
import PlaylistSelector from "./PlaylistSelector.jsx";
import PlaylistForm from "./PlaylistForm.jsx";

function CreatePlaylist({ videoId, handleDialogClose, edit = false }) {
    const axiosPrivate = useAxiosPrivate();
    const [showForm, setShowForm] = useState(false);
    const [playlist, setPlaylist] = useState([]);
    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        let url = `/playlist/current-user/t`
        if (edit) url = `/playlist/current-user/public`
            ;(async () => {
                try {
                    const response = await axiosPrivate.get(url);
                    setPlaylist(response.data.data || []);
                } catch (error) {
                    if (!isCancel(error)) console.error(error);
                } finally {
                    setLoading(false);
                }
            })();

    }, []);

    return (
        <>
            <Box sx={{ p: 2, minWidth: 280, maxWidth: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#151515ff' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {showForm ? "Create New Playlist" : "Your Playlists"}
                </Typography>

                {/* Error Message */}
                {errMsg && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errMsg}
                    </Alert>
                )}

                {/* Show playlists */}
                {!showForm && (
                    <>
                        {loading ? (
                            <CircularProgress />
                        ) : playlist.length > 0 ? (
                            <PlaylistSelector playlist={playlist} videoId={videoId} />
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
        </>

    );
}

export default CreatePlaylist;
