import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, Dialog, DialogContent } from '@mui/material';
import CreatePlaylist from "../Playlist/CreatePlaylist";
import PlaylistForm from '../Playlist/PlaylistForm';

function MenuButton({ type, videoId, playlist, setPlaylist }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");

    const open = Boolean(anchorEl);

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

    const cardMenuOption = [
        { text: "Save to Playlist", dialog: "playlist" },
        { text: "Save to Watch Later" },
        { text: "Share" },
        { text: "Not Interested" },
        { text: "Download" },
    ];

    const playlistMenuOption = [
        { text: "Edit", dialog: "edit" },
        { text: "Delete" },
    ];

    const menuOptions = type === "playlist" ? playlistMenuOption : cardMenuOption;

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
                {menuOptions.map((option) => (
                    <MenuItem
                        key={option.text}
                        onClick={() => option.dialog && handleDialogOpen(option.dialog)}
                    >
                        {option.text}
                    </MenuItem>
                ))}
            </Menu>

            <Dialog open={Boolean(dialogOpen)} onClose={handleDialogClose} disableRestoreFocus>
                <DialogContent sx={{ p: 0 }}>
                    {dialogOpen === 'edit' && playlist ? (
                        <PlaylistForm
                            prev={playlist}
                            setPlaylist={setPlaylist}
                            handleDialogClose={handleDialogClose}
                            loading={loading}
                            setLoading={setLoading}
                            setErrMsg={setErrMsg}
                        />
                    ) : dialogOpen === 'playlist' ? (
                        <CreatePlaylist videoId={videoId} handleDialogClose={handleDialogClose} />
                    ) : null}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default MenuButton;
