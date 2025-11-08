import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import EditIcon from "@mui/icons-material/Edit";
import UploadVideoDialog from "./UploadVideoDialog";

export default function CreateButton() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showUploadVideoForm, setShowUploadVideoForm] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleUploadVideoForm = () => {
    setAnchorEl(null);
    setShowUploadVideoForm(true);
  };

  const handleCloseDialog = () => setShowUploadVideoForm(false);

  return (
    <>
      {/* Main Create Button */}
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

      {/* Dropdown Menu */}
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

      {/* Popup Dialog */}
      <UploadVideoDialog
        open={showUploadVideoForm}
        handleClose={handleCloseDialog}
      />
    </>
  );
}
