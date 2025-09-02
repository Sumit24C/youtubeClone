import React, { useEffect, useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, Dialog, DialogContent, Snackbar, CircularProgress } from '@mui/material';
import PlaylistForm from '../../components/Playlist/PlaylistForm'
import { isCancel } from 'axios';
import { extractErrorMsg } from '../../utils';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';

function PlaylistMenu({ playlist, setPlaylist, setPlaylistInfo }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const controllerRef = useRef(null);
    const axiosPrivate = useAxiosPrivate();
    const open = Boolean(anchorEl);
    const { enqueueSnackbar } = useSnackbar();
    const { userData } = useSelector((state) => state.auth);
    const handleMenuOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleDialogOpen = (dialog) => {
        handleMenuClose();
        setDialogOpen(dialog);
    };

    const handleDialogClose = () => setDialogOpen(null);

    const deletePlaylist = async () => {
        if (playlist.owner !== userData._id) return

        setLoading(true);
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();

        try {
            const response = await axiosPrivate.delete(`/playlist/${playlist._id}`, {
                signal: controllerRef.current.signal,
            });
            console.log(response.data.message);
            enqueueSnackbar(response.data.message);
            setPlaylistInfo((prev) => prev.filter((p) => p._id !== playlist._id));
            handleMenuClose();
        } catch (error) {
            if (!isCancel(error)) {
                setErrMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
            handleMenuClose();
        }
    };

    return (
        <Box>
            <IconButton onClick={handleMenuOpen} size="small">
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {userData._id === playlist.owner ? [
                    <MenuItem
                        key="edit"
                        onClick={() => handleDialogOpen("edit")}
                    >
                        Edit
                    </MenuItem>,
                    <MenuItem key="delete" onClick={deletePlaylist}>
                        {loading ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CircularProgress size={18} thickness={4} />
                            </Box>
                        ) : "delete"}
                    </MenuItem>
                ] : [
                    <MenuItem key="save">Save playlist</MenuItem>,
                    <MenuItem key="watch later">Watch later</MenuItem>,
                    <MenuItem key="report">Report</MenuItem>
                ]}
            </Menu>

            <Dialog open={Boolean(dialogOpen)} onClose={handleDialogClose} disableRestoreFocus>
                <DialogContent sx={{ p: 0 }}>
                    {dialogOpen === 'edit' && playlist && (
                        <PlaylistForm
                            prev={playlist}
                            setPlaylist={setPlaylist}
                            handleDialogClose={handleDialogClose}
                            loading={loading}
                            setLoading={setLoading}
                            setErrMsg={setErrMsg}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default PlaylistMenu;
