import React, { useEffect, useState, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
    Divider,
    CircularProgress,
    Avatar,
    IconButton,
    ThemeProvider,
    createTheme,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { useSnackbar } from "notistack";
import { extractErrorMsg } from "../utils";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#181818",
            paper: "#202020",
        },
        primary: {
            main: "#ff0000",
        },
    },
    typography: {
        fontFamily: "Roboto, sans-serif",
    },
});

export default function Profile() {
    const dispatch = useDispatch();
    const axiosPrivate = useAxiosPrivate();
    const { enqueueSnackbar } = useSnackbar();

    const [user, setUser] = useState({});
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // avatar + cover image
    const [avatar, setAvatar] = useState("");
    const [coverImage, setCoverImage] = useState("");

    const [avatarloading, setAvatarLoading] = useState(false);
    const [coverImgloading, setCoverImgLoading] = useState(false);

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleAvatarClick = () => avatarInputRef.current?.click();
    const handleCoverClick = () => coverInputRef.current?.click();

    const fetchUser = async () => {
        try {
            const res = await axiosPrivate.get("/users/current-user");
            const data = res.data.data;
            setUser(data);
            setFullName(data.fullName || "");
            setEmail(data.email || "");
            setUsername(data.username || "");
            setAvatar(data.avatar);
            setCoverImage(data.coverImage);
        } catch (err) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        }
    };

    useEffect(() => {
        (async () => {
            await fetchUser()
        })()
    }, []);

    const usernameChanged = username.trim() !== user.username || ""
    const fullnameChanged = fullName.trim() !== user.fullName || ""
    const emailChanged = email.trim() !== user.email && ""

    const hasAccountChanged = fullName.trim() && username.trim() && email.trim() && (
        usernameChanged || fullnameChanged || emailChanged
    )

    const handleUpdateAccount = async () => {
        setLoading(true);
        try {
            const res = await axiosPrivate.patch("/users/update-account-details", {
                fullName,
                email,
                username
            });
            const updatedUser = res.data.data.user;
            dispatch(login(updatedUser));
            setUser(updatedUser);
            enqueueSnackbar("Account updated successfully!", { variant: "success" });
        } catch (err) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const canChangePassword = oldPassword.trim() && newPassword.trim();

    const handleChangePassword = async () => {
        setPasswordLoading(true);
        try {
            const res = await axiosPrivate.post("/users/change-password", {
                oldPassword,
                newPassword,
            });
            setOldPassword("");
            setNewPassword("");
            enqueueSnackbar(res.data.message, { variant: "success" });
        } catch (err) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        setAvatarLoading(true);
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            const res = await axiosPrivate.patch("/users/update-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchUser();
        } catch (err) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleCoverUpload = async (e) => {
        setCoverImgLoading(true);
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("coverImage", file);

        try {
            await axiosPrivate.patch("/users/update-coverImage", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchUser();
        } catch (err) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setCoverImgLoading(false);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#181818" }}>

                {/* ✅ Top section: centered horizontally only */}
                <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pt: 2 }}>

                    {/* Cover Image */}
                    <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden" }}>
                        {coverImgloading ? (
                            <Box display="flex" justifyContent="center" py={6}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box
                                component="img"
                                src={
                                    coverImage ||
                                    "https://res.cloudinary.com/youtube236/image/upload/v1754237354/xwd482mt0jae4d5xblr5.png"
                                }
                                alt="Cover"
                                sx={{ width: "100%", height: 220, objectFit: "cover" }}
                            />
                        )}

                        <input type="file" hidden accept="image/*" ref={coverInputRef} onChange={handleCoverUpload} />
                        <IconButton
                            onClick={handleCoverClick}
                            sx={{
                                position: "absolute",
                                right: 16,
                                bottom: 16,
                                bgcolor: "#000a",
                                color: "#fff",
                                "&:hover": { bgcolor: "#000d" },
                            }}
                        >
                            <CameraAltIcon />
                        </IconButton>
                    </Box>

                    {/* Avatar */}
                    <Box display="flex" justifyContent="center" mt={-9}>
                        <Box position="relative">
                            {avatarloading ? (
                                <CircularProgress />
                            ) : (
                                <Avatar
                                    src={avatar}
                                    alt={username}
                                    sx={{
                                        width: 140,
                                        height: 140,
                                        border: "4px solid #202020",
                                    }}
                                />
                            )}

                            <input type="file" hidden accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} />
                            <IconButton
                                onClick={handleAvatarClick}
                                sx={{
                                    position: "absolute",
                                    bottom: 4,
                                    right: 4,
                                    bgcolor: "#000a",
                                    color: "#fff",
                                    "&:hover": { bgcolor: "#000d" },
                                }}
                            >
                                <CameraAltIcon />
                            </IconButton>
                        </Box>
                    </Box>

                </Box>

                {/* ✅ Centered account forms */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 6,
                        pb: 6,
                    }}
                >
                    <Box sx={{ width: "100%", maxWidth: 600 }}>

                        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                            <Typography variant="h6" mb={2}>Profile Info</Typography>
                            <Stack spacing={2}>
                                <TextField label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
                                <TextField label="Full Name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
                                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                                <Button
                                    variant="contained"
                                    onClick={handleUpdateAccount}
                                    disabled={!hasAccountChanged || loading}
                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Update Account"}
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" mb={2}>Change Password</Typography>
                            <Stack spacing={2}>
                                <TextField label="Old Password" type="password" value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)} fullWidth />
                                <TextField label="New Password" type="password" value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)} fullWidth />
                                <Button
                                    variant="contained"
                                    disabled={!canChangePassword || passwordLoading}
                                    onClick={handleChangePassword}
                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                >
                                    {passwordLoading ? <CircularProgress size={24} /> : "Change Password"}
                                </Button>
                            </Stack>
                        </Paper>

                    </Box>
                </Box>

            </Box>
        </ThemeProvider>
    );

}
