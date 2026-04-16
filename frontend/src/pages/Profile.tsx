import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";
import { useSnackbar } from "notistack";
import { extractErrorMsg } from "../utils";
import { useForm } from "react-hook-form";
import { getUploadUrl, uploadUserProfileMedia } from "../services/uploadService";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import type { AuthState, User } from "../types/user";

type PasswordForm = {
    oldPassword: string;
    newPassword: string;
};

type RootAuth = {
    auth: AuthState;
};

export default function Profile() {
    const dispatch = useDispatch();
    const api = useAxiosPrivate();
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const { userData } = useSelector((state: RootAuth) => state.auth);

    const [avatar, setAvatar] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [uploadLoading, setUploadLoading] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<User>({
        defaultValues: {
            _id: userData?._id,
            username: userData?.username || "",
            email: userData?.email || "",
            fullName: userData?.fullName || "",
        },
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        watch: watchPassword,
    } = useForm<PasswordForm>();

    const handleAvatarClick = () => {
        if (!uploadLoading) avatarInputRef.current?.click();
    };
    const handleCoverClick = () => {
        if (!uploadLoading) coverInputRef.current?.click();
    };

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/current-user");
            const data = res.data.data;
            setAvatar(data.avatar || "");
            setCoverImage(data.coverImage || "");
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const onSubmitProfile = async (data: User) => {
        setLoading(true);
        try {
            const res = await api.patch("/users/update-account-details", data);
            const updatedUser = res.data.data;
            dispatch(login(updatedUser));
            reset(data);
            enqueueSnackbar("Account updated successfully!", { variant: "success" });
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const onSubmitPassword = async (data: PasswordForm) => {
        setPasswordLoading(true);
        try {
            const res = await api.post("/users/change-password", data);
            resetPassword();
            enqueueSnackbar(res.data.message || "Password updated", { variant: "success" });
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setPasswordLoading(false);
        }
    };

    const passwordValues = watchPassword();
    const canChangePassword =
        passwordValues.oldPassword?.trim() && passwordValues.newPassword?.trim();

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>, type: string) => {
        const file = e.target.files?.[0];
        if (!file || uploadLoading) return;

        e.target.value = "";

        try {
            setUploadLoading(true);
            const { url, key } = await getUploadUrl(api, {
                id: userData?._id || "",
                filename: file.name,
                contentType: file.type,
                folderName: "thumbnails",
            });

            await uploadUserProfileMedia(api, { file, url, key, type });

            const localUrl = URL.createObjectURL(file);
            if (type === "avatar") setAvatar(localUrl);
            else setCoverImage(localUrl);

            enqueueSnackbar(
                `${type === "avatar" ? "Avatar" : "Cover image"} updated successfully!`,
                { variant: "success" }
            );
        } catch (err: unknown) {
            enqueueSnackbar(extractErrorMsg(err), { variant: "error" });
        } finally {
            setUploadLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#181818] text-white">
            <div className="max-w-5xl mx-auto px-4 pt-4">

                {/* ── Cover Image ── */}
                <div className="relative rounded-2xl overflow-hidden bg-neutral-800 h-52">
                    {coverImage ? (
                        <img
                            src={coverImage}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900" />
                    )}

                    {/* Cover upload overlay */}
                    <button
                        onClick={handleCoverClick}
                        disabled={uploadLoading}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors duration-200 group disabled:cursor-not-allowed"
                        aria-label="Change cover image"
                    >
                        {uploadLoading ? (
                            <Loader2
                                className="text-white animate-spin opacity-0 group-hover:opacity-100 transition-opacity"
                                size={32}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={28} />
                                <span className="text-white text-xs font-medium">Change cover</span>
                            </div>
                        )}
                    </button>

                    <input
                        hidden
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(e, "coverImage")}
                    />
                </div>

                {/* ── Avatar ── */}
                <div className="flex justify-center -mt-16 relative z-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-[#181818] overflow-hidden bg-neutral-700">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-neutral-400">
                                        {userData?.fullName?.[0]?.toUpperCase() || "?"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Avatar upload button */}
                        <button
                            onClick={handleAvatarClick}
                            disabled={uploadLoading}
                            className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center justify-center border-2 border-[#181818] transition-colors duration-200 shadow-lg"
                            aria-label="Change avatar"
                        >
                            {uploadLoading ? (
                                <Loader2 className="animate-spin text-white" size={16} />
                            ) : (
                                <Camera size={16} className="text-white" />
                            )}
                        </button>

                        <input
                            hidden
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, "avatar")}
                        />
                    </div>
                </div>

                {/* ── Username display ── */}
                <div className="text-center mt-3 mb-8">
                    <p className="text-neutral-400 text-sm">@{userData?.username}</p>
                </div>
            </div>

            {/* ── Forms ── */}
            <div className="flex justify-center px-4 pb-12">
                <div className="w-full max-w-lg space-y-4">

                    {/* Profile Info */}
                    <div className="bg-[#202020] rounded-2xl p-6 border border-neutral-800">
                        <h2 className="text-base font-semibold text-white mb-5">
                            Profile Info
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                    Username
                                </label>
                                <input
                                    {...register("username")}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    {...register("fullName")}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                    Email
                                </label>
                                <input
                                    {...register("email")}
                                    type="email"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    placeholder="Enter email"
                                />
                            </div>

                            <button
                                disabled={!isDirty || loading}
                                onClick={handleSubmit(onSubmitProfile)}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors duration-200"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Saving…</span>
                                    </>
                                ) : (
                                    "Update Account"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-[#202020] rounded-2xl p-6 border border-neutral-800">
                        <h2 className="text-base font-semibold text-white mb-5">
                            Change Password
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                    Old Password
                                </label>
                                <input
                                    {...registerPassword("oldPassword")}
                                    type="password"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                                    New Password
                                </label>
                                <input
                                    {...registerPassword("newPassword")}
                                    type="password"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                                    placeholder="Enter new password"
                                />
                            </div>

                            <button
                                disabled={!canChangePassword || passwordLoading}
                                onClick={handlePasswordSubmit(onSubmitPassword)}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors duration-200"
                            >
                                {passwordLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Updating…</span>
                                    </>
                                ) : (
                                    "Change Password"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}