import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, Dialog, DialogContent, CircularProgress } from '@mui/material';
import CreatePlaylist from "../Playlist/CreatePlaylist";
import { useLike } from '../../hooks/useLike';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
function MenuButton({ videoId, isLiked = false, setVideos, isWatchLater = false }) {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(null);
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
        { text: "Share" },
        { text: "Download" },
    ];

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
                {cardMenuOption.map((option) => (
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
                    {dialogOpen === 'playlist' && (
                        <CreatePlaylist videoId={videoId} handleDialogClose={handleDialogClose} />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default MenuButton;
