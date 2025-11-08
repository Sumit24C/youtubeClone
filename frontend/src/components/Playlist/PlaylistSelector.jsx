import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Checkbox,
    Divider,
    Paper
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate.js";
import extractErrorMsg from "../../utils/extractErrorMsg.js";
import { useSnackbar } from "notistack";

function PlaylistSelector({ playlist, videoId }) {

    const [selectedPlaylist, setSelectedPlaylist] = useState([])
    const axiosPrivate = useAxiosPrivate();

    const [errMsg, setErrMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const initiallySelectedId = playlist
            .filter((pl) => pl.videos.includes(videoId))
            .map((pl) => pl._id);
        setSelectedPlaylist(initiallySelectedId);
    }, [playlist, videoId])

    const handleToggle = (p_id) => {
        setSelectedPlaylist(prev =>
            prev.includes(p_id) ?
                prev.filter(p => p !== p_id)
                : [...prev, p_id]
        )
    }

    const toggleVideo = async (pId) => {
        setLoading(true);
        setErrMsg("");
        try {
            const response = await axiosPrivate.patch(
                `/playlist/toggle/${videoId}/${pId}`,
                {},
            );
            console.log(response.data.data)
            enqueueSnackbar(response.data.message)
            handleToggle(pId)
        } catch (error) {
            if (isCancel(error)) {
                console.error("selectedPlaylistAxios :: error :: ", error);
            } else {
                const errorMessage = extractErrorMsg(error);
                setErrMsg(errorMessage);
                enqueueSnackbar(extractErrorMsg(error))
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Paper
                elevation={2}
                sx={{
                    width: "100%",
                    maxHeight: 250,
                    overflowY: "auto",
                    bgcolor: "#000000ff",
                    borderRadius: 1,
                    my: 1,
                    px: 1,
                    py: 0.5
                }}
            >
                {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}
                <List sx={{ width: "100%", overflowY: true, maxHeight: 300, hidden: true }}>
                    {playlist.map((pl) => (
                        <React.Fragment key={pl._id}>
                            <ListItem disablePadding>
                                <ListItemButton disabled={loading} onClick={() => toggleVideo(pl._id)}>
                                    <Checkbox
                                        edge="start"
                                        checked={selectedPlaylist.includes(pl._id)}
                                        tabIndex={-1}
                                        disableRipple
                                    />
                                    <ListItemText id={pl._id} primary={pl.name} />
                                </ListItemButton>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
            </Paper>
        </>
    );
}

export default PlaylistSelector