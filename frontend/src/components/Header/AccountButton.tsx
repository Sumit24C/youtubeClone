import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    IconButton,
    Menu,
    MenuItem,
    Divider,
    Typography,
    Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { styled } from "@mui/system";
import { useLogout } from "../../hooks/useLogout";

const UserCircle = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#4caf50",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1rem",
}));

function AccountButton() {
    const { loading, logout } = useLogout();
    const navigate = useNavigate();

    const userData = useSelector((state: any) => state.auth.userData);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) =>
        setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    return (
        <>
            {/* Avatar */}
            <IconButton onClick={handleClick} sx={{ p: 0 }}>
                <UserCircle>
                    {userData?.username?.[0]?.toUpperCase() || "A"}
                </UserCircle>
            </IconButton>

            {/* Menu */}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 280,
                        borderRadius: 2,
                        mt: 1,
                    },
                }}
            >
                {/* User Info */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {userData?.fullName || "User Name"}
                    </Typography>

                    <Link to="/profile">
                        <Typography variant="body2" color="text.secondary">
                            @{userData?.username || "username"}
                        </Typography>
                    </Link>

                    <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: "pointer", mt: 0.5 }}
                        onClick={() => {
                            handleClose();
                            if (userData?.username) {
                                navigate(`/c/${userData.username}`);
                            }
                        }}
                    >
                        View your channel
                    </Typography>
                </Box>

                <Divider />

                {/* Studio */}
                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate("/studio");
                    }}
                >
                    <VideoCallIcon sx={{ mr: 1 }} /> MyTube Studio
                </MenuItem>

                <Divider />

                {/* Settings */}
                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate("/settings");
                    }}
                >
                    <SettingsIcon sx={{ mr: 1 }} /> Settings
                </MenuItem>

                {/* Help */}
                <MenuItem
                    onClick={() => {
                        handleClose();
                        navigate("/help");
                    }}
                >
                    <HelpOutlineIcon sx={{ mr: 1 }} /> Help
                </MenuItem>

                <Divider />

                {/* Logout */}
                <MenuItem
                    onClick={() => {
                        handleClose();
                        logout();
                    }}
                    disabled={loading}
                >
                    <LogoutIcon sx={{ mr: 1 }} />
                    {loading ? "Signing out..." : "Sign out"}
                </MenuItem>
            </Menu>
        </>
    );
}

export default AccountButton;