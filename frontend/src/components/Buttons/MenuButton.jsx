import React from 'react'
import { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, Dialog, DialogContent } from '@mui/material';
import CreatePlaylist from "../Playlist/CreatePlaylist"

function MenuButton({ videoId }) {
    const [anchorEl, setAnchorE1] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const open = Boolean(anchorEl);

    const handleMenuClose = (e) => {
        setAnchorE1(null);
    }

    const handleMenuOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorE1(e.currentTarget);
    }

    const handleDialogOpen = (type) => {
        handleMenuClose();
        setDialogOpen(true);
    }

    const handleDialogClose = () => {
        setDialogOpen(false);
    }

    return (
        <Box>
            <IconButton 
                onClick={handleMenuOpen} 
                size="small"
            >
                <MoreVertIcon />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => handleDialogOpen('playlist')}>Save to Playlist</MenuItem>
                <MenuItem onClick={handleMenuClose}>Share</MenuItem>
                <MenuItem onClick={handleMenuClose}>Not Interested</MenuItem>
                <MenuItem onClick={handleMenuClose}>Download</MenuItem>
                <MenuItem onClick={handleMenuClose}>Save to Watch Later</MenuItem>
            </Menu>

            <Dialog 
                open={dialogOpen} 
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
                disableRestoreFocus={true} 
            >
                <DialogContent sx={{ p: 0 }}>
                    <CreatePlaylist 
                        videoId={videoId} 
                        handleDialogClose={handleDialogClose}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    )
}

export default MenuButton