import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import UploadVideoDialog from "./UploadVideoDialog";

function CreateButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showUploadVideoForm, setShowUploadVideoForm] =
        useState<boolean>(false);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) =>
        setAnchorEl(event.currentTarget);

    const handleCloseMenu = () => setAnchorEl(null);

    const handleUploadVideoForm = () => {
        setAnchorEl(null);
        setShowUploadVideoForm(true);
    };

    const handleCloseDialog = () => setShowUploadVideoForm(false);

    return (
        <>
            {/* Create Button */}
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleClick}
                sx={{
                    textTransform: "none",
                    borderRadius: "20px",
                    backgroundColor: "#646464ff",
                    "&:hover": { backgroundColor: "#808080ff" },
                }}
            >
                Create
            </Button>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={handleUploadVideoForm}>
                    <VideoCallIcon sx={{ mr: 1 }} /> Upload video
                </MenuItem>

                <MenuItem onClick={handleCloseMenu}>
                    <LiveTvIcon sx={{ mr: 1 }} /> Go live
                </MenuItem>
            </Menu>

            {/* Dialog */}
            <UploadVideoDialog
                open={showUploadVideoForm}
                handleClose={handleCloseDialog}
            />
        </>
    );
}

export default CreateButton;