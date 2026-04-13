import { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
    Box,
    IconButton,
    Menu,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { isCancel } from "axios";
import { extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

function AnalyticsMenu({
    id,
    setContents,
    type,
}: {
    id: string;
    setContents: React.Dispatch<React.SetStateAction<any[]>>;
    type: string;
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    // const [dialogOpen, setDialogOpen] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [_errMsg, setErrMsg] = useState<string>("");

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const open = Boolean(anchorEl);
    const { enqueueSnackbar } = useSnackbar();

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const deleteContent = async (): Promise<void> => {
        setLoading(true);

        let url = `/dashboard/${type}/${id}`;
        if (type === "playlist") url = `/playlist/${id}`;

        try {
            const response = await axiosPrivate.delete(url);

            enqueueSnackbar(response.data.message);

            setContents((prev) => prev.filter((c) => c._id !== id));
        } catch (error: any) {
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
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                {type !== "playlist" && (
                    <MenuItem onClick={() => navigate(`edit/v/${id}`)}>
                        Edit
                    </MenuItem>
                )}

                <MenuItem onClick={deleteContent}>
                    {loading ? (
                        <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                            <CircularProgress size={18} thickness={4} />
                        </Box>
                    ) : (
                        "delete"
                    )}
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default AnalyticsMenu;