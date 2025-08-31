import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, Dialog, DialogContent, CircularProgress } from '@mui/material';
import CreatePlaylist from "../Playlist/CreatePlaylist";
import { useLike } from '../../hooks/useLike';
function MenuButton({ videoId, isLiked, setVideos }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(null);
    const { likeLoading, liked, countOfLikes, disliked, handleLike } = useLike(isLiked, 0, false, "video", videoId);

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
    const handleRemoveLike = async () => {
        await handleLike();
        setVideos((prevVideo) => prevVideo.filter((v) => v._id !== videoId))
        handleMenuClose();
    }

    // 🎯 Only card menu options here
    const cardMenuOption = [
        { text: "Save to Playlist", dialog: "playlist" },
        { text: "Save to Watch Later" },
        { text: "Share" },
        { text: "Not Interested" },
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
                {isLiked && (
                    <MenuItem
                        onClick={handleRemoveLike}
                        disabled={likeLoading}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        {likeLoading ? (
                            <CircularProgress size={18} thickness={5} />
                        ) : (
                            "Remove Like"
                        )}
                    </MenuItem>
                )}

            </Menu>

            {/* Playlist dialog (only when user selects "Save to Playlist") */}
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
