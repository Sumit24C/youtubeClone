import React, { useEffect, useRef, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton, Menu, MenuItem, CircularProgress } from '@mui/material';
import PlaylistForm from '../../components/Playlist/PlaylistForm'
import { isCancel } from 'axios';
import { extractErrorMsg } from '../../utils';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';

function CommentMenu({ comment, setComments, isEdit, setIsEdit }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const open = Boolean(anchorEl);
    const { enqueueSnackbar } = useSnackbar();
    const userData = useSelector((state) => state.auth.userData);

    const handleMenuOpen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const deleteComment = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.delete(`/comments/c/${comment._id}`);

            enqueueSnackbar(response.data.message);
            setComments((prev) => prev.filter((c) => c._id !== comment._id));
        } catch (error) {
            if (!isCancel(error)) {
                setErrMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
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
                {userData._id === comment?.owner[0]?._id && [
                    <MenuItem key="edit" onClick={() => setIsEdit(true)}>
                        Edit
                    </MenuItem>,
                    <MenuItem key="delete" onClick={deleteComment}>
                        {loading ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CircularProgress size={18} thickness={4} />
                                Deleting...
                            </Box>
                        ) : (
                            "Delete"
                        )}
                    </MenuItem>
                ]}

                <MenuItem key="report">Report</MenuItem>
            </Menu>

        </Box>
    );
}

export default CommentMenu;
