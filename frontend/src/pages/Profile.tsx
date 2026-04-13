import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
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
import { useForm } from "react-hook-form";
import type { User } from "../types/user";

type ProfileForm = {
    username: string;
    fullName: string;
    email: string;
};

type PasswordForm = {
    oldPassword: string;
    newPassword: string;
};

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
});

export default function Profile() {
    const dispatch = useDispatch();
    const axiosPrivate = useAxiosPrivate();
    const { enqueueSnackbar } = useSnackbar();

    const [user, setUser] = useState<User | null>(null);

    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [avatar, setAvatar] = useState("");
    const [coverImage, setCoverImage] = useState("");

    const [avatarLoading, setAvatarLoading] = useState(false);
    const [coverImgLoading, setCoverImgLoading] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<ProfileForm>();

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        watch: watchPassword,
    } = useForm<PasswordForm>();

    const handleAvatarClick = () => avatarInputRef.current?.click();
    const handleCoverClick = () => coverInputRef.current?.click();

    const fetchUser = async () => {
        try {
            const res = await axiosPrivate.get(
                "/users/current-user"
            );

            const data = res.data.data;

            setUser(data);
            setAvatar(data.avatar || "");
            setCoverImage(data.coverImage || "");

            reset({
                username: data.username || "",
                fullName: data.fullName || "",
                email: data.email || "",
            });
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const onSubmitProfile = async (data: ProfileForm) => {
        setLoading(true);
        try {
            const res = await axiosPrivate.patch(
                "/users/update-account-details",
                data
            );

            const updatedUser = res.data.data;

            dispatch(login(updatedUser));
            setUser(updatedUser);

            reset(data);

            enqueueSnackbar("Account updated successfully!", {
                variant: "success",
            });
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const onSubmitPassword = async (data: PasswordForm) => {
        setPasswordLoading(true);
        try {
            const res = await axiosPrivate.post(
                "/users/change-password",
                data
            );

            resetPassword();

            enqueueSnackbar(res.data.message || "Password updated", {
                variant: "success",
            });
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setPasswordLoading(false);
        }
    };

    const passwordValues = watchPassword();
    const canChangePassword =
        passwordValues.oldPassword?.trim() &&
        passwordValues.newPassword?.trim();

    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarLoading(true);

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            await axiosPrivate.patch("/users/update-avatar", formData);
            await fetchUser();
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCoverImgLoading(true);

        const formData = new FormData();
        formData.append("coverImage", file);

        try {
            await axiosPrivate.patch("/users/update-coverImage", formData);
            await fetchUser();
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setCoverImgLoading(false);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ minHeight: "100vh", backgroundColor: "#181818" }}>
                {/* Cover */}
                <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pt: 2 }}>
                    <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden" }}>
                        {coverImgLoading ? (
                            <CircularProgress />
                        ) : (
                            <Box component="img" src={coverImage} sx={{ width: "100%", height: 220 }} />
                        )}

                        <input hidden ref={coverInputRef} type="file" onChange={handleCoverUpload} />
                        <IconButton onClick={handleCoverClick}>
                            <CameraAltIcon />
                        </IconButton>
                    </Box>

                    {/* Avatar */}
                    <Box display="flex" justifyContent="center" mt={-9}>
                        {avatarLoading ? (
                            <CircularProgress />
                        ) : (
                            <Avatar src={avatar} sx={{ width: 140, height: 140 }} />
                        )}

                        <input hidden ref={avatarInputRef} type="file" onChange={handleAvatarUpload} />
                        <IconButton onClick={handleAvatarClick}>
                            <CameraAltIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Forms */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <Box sx={{ width: "100%", maxWidth: 600 }}>
                        {/* Profile */}
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6">Profile Info</Typography>
                            <Stack spacing={2}>
                                <TextField label="Username" {...register("username")} />
                                <TextField label="Full Name" {...register("fullName")} />
                                <TextField label="Email" {...register("email")} />

                                <Button
                                    disabled={!isDirty || loading}
                                    onClick={handleSubmit(onSubmitProfile)}
                                >
                                    {loading ? <CircularProgress size={24} /> : "Update Account"}
                                </Button>
                            </Stack>
                        </Paper>

                        {/* Password */}
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6">Change Password</Typography>
                            <Stack spacing={2}>
                                <TextField
                                    type="password"
                                    label="Old Password"
                                    {...registerPassword("oldPassword")}
                                />
                                <TextField
                                    type="password"
                                    label="New Password"
                                    {...registerPassword("newPassword")}
                                />

                                <Button
                                    disabled={!canChangePassword || passwordLoading}
                                    onClick={handlePasswordSubmit(onSubmitPassword)}
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