import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, Dialog, DialogContent, CircularProgress } from '@mui/material';
import CreatePlaylist from "../Playlist/CreatePlaylist";
import { useLike } from '../../hooks/useLike';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
function MenuButton({ videoId, isLiked = false, setVideos, isWatchLater = false }) {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(null);
    const { likeLoading, liked, countOfLikes, disliked, handleLike } = useLike(isLiked, 0, false, "video", videoId);
    useEffect(() => {
        ;(async function () {


            setLoading(true);
            try {
                const response = await axiosPrivate.patch(`/users//watch-later/v/toggle/${videoId}`, {
                    signal: controller.current.signal
                });

                console.log(response.data.data);
                const watchLaterRes = response.data.data.isWatchLater
                setWatchLater(watchLaterRes);

            } catch (error) {
                sel(false);
                if (isCancel(error)) {
                    console.error("watchLaterAxios :: error :: ", error)
                } else {
                    console.error("watchLater :: error :: ", error)
                }
            } finally {
                setwatchLaterLoading(false)
            }
        })()
    }, [id, videoId])

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
                <MenuItem
                    // onClick={handleToggleLike}
                    disabled={likeLoading}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                    {likeLoading ? (
                        <CircularProgress size={18} thickness={5} />
                    ) : (
                        "Save to WatchLater"
                    )}
                </MenuItem>
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
