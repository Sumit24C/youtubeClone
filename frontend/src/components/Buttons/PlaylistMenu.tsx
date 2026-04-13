import { useState, useRef } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogContent,
    CircularProgress,
} from "@mui/material";
import PlaylistForm from "../Playlist/PlaylistForm";
import { isCancel } from "axios";
import { extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import type { Playlist } from "../../types/playlist";

function PlaylistMenu({
    playlist,
    setPlaylist,
    setPlaylistInfo,
}: {
    playlist: Playlist;
    setPlaylist: React.Dispatch<React.SetStateAction<any>>;
    setPlaylistInfo: React.Dispatch<React.SetStateAction<any[]>>;
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [dialogOpen, setDialogOpen] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>("");

    const controllerRef = useRef<AbortController | null>(null);

    const axiosPrivate = useAxiosPrivate();
    const open = Boolean(anchorEl);
    const { enqueueSnackbar } = useSnackbar();

    const { userData } = useSelector((state: any) => state.auth);

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleDialogOpen = (dialog: string) => {
        handleMenuClose();
        setDialogOpen(dialog);
    };

    const handleDialogClose = () => setDialogOpen(null);

    const deletePlaylist = async (): Promise<void> => {
        if (playlist.owner !== userData?._id) return;

        setLoading(true);

        try {
            const response = await axiosPrivate.delete(
                `/playlist/${playlist._id}`
            );

            enqueueSnackbar(response.data.message);

            setPlaylistInfo((prev) =>
                prev.filter((p) => p._id !== playlist._id)
            );

            handleMenuClose();
        } catch (error: any) {
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
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {userData?._id === playlist.owner
                    ? [
                        <MenuItem
                            key="edit"
                            onClick={() => handleDialogOpen("edit")}
                        >
                            Edit
                        </MenuItem>,

                        <MenuItem key="delete" onClick={deletePlaylist}>
                            {loading ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <CircularProgress size={18} thickness={4} />
                                </Box>
                            ) : (
                                "delete"
                            )}
                        </MenuItem>,
                    ]
                    : [
                        <MenuItem key="save">Save playlist</MenuItem>,
                        <MenuItem key="watch later">Watch later</MenuItem>,
                        <MenuItem key="report">Report</MenuItem>,
                    ]}
            </Menu>

            <Dialog
                open={Boolean(dialogOpen)}
                onClose={handleDialogClose}
                disableRestoreFocus
            >
                <DialogContent sx={{ p: 0 }}>
                    {dialogOpen === "edit" && playlist && (
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