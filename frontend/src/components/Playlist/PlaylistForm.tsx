import { useForm } from "react-hook-form";
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils/extractErrorMsg";
import { useSnackbar } from "notistack";
import type { Playlist } from "../../types/playlist";

type FormData = {
    name: string;
    description: string;
    isPrivate: boolean;
};

type Props = {
    videoId?: string;
    prev?: Partial<Playlist>;
    setPlaylist: React.Dispatch<any>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setErrMsg: React.Dispatch<React.SetStateAction<string>>;
    setShowForm?: React.Dispatch<React.SetStateAction<boolean>>;
    handleDialogClose: () => void;
};

function PlaylistForm({
    videoId,
    prev = {},
    setPlaylist,
    loading,
    setLoading,
    setErrMsg,
    setShowForm,
    handleDialogClose,
}: Props) {
    const {
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: prev.name || "",
            description: prev.description || "",
            isPrivate: prev.isPrivate === true,
        },
    });

    const axiosPrivate = useAxiosPrivate();
    const { enqueueSnackbar } = useSnackbar();

    const createOrEdit = async (data: FormData): Promise<void> => {
        setLoading(true);
        setErrMsg("");

        try {
            const url = prev?._id
                ? `/playlist/${prev._id}`
                : `/playlist`;

            const method = prev?._id ? "patch" : "post";

            const payload = {
                name: data.name,
                description: data.description,
                isPrivate: data.isPrivate,
                ...(!prev._id && { videoId }),
            };

            const response = await axiosPrivate[method](url, payload);

            enqueueSnackbar(response.data.message);

            if (prev?._id) {
                setPlaylist((prevState: Playlist) => ({
                    ...prevState,
                    name: response.data.data.name,
                    description: response.data.data.description,
                    isPrivate: response.data.data.isPrivate,
                    updatedAt: response.data.data.updatedAt,
                }));
            } else {
                setPlaylist((prevState: Playlist[]) => [
                    ...prevState,
                    response.data.data,
                ]);
            }

            reset();
            handleDialogClose();
        } catch (error: any) {
            const errorMessage = extractErrorMsg(error);
            setErrMsg(errorMessage);
            enqueueSnackbar(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                minWidth: 280,
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "#151515ff",
            }}
        >
            <Box
                component="form"
                onSubmit={handleSubmit(createOrEdit)}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
                <TextField
                    label="Playlist Name"
                    {...register("name", { required: "Playlist name is required" })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    fullWidth
                />

                <TextField
                    label="Description"
                    {...register("description", {
                        required: "Description is required",
                    })}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    fullWidth
                    multiline
                    rows={3}
                />

                {/* 🔥 FIXED SELECT */}
                <FormControl fullWidth>
                    <InputLabel id="private-label">Privacy</InputLabel>
                    <Select
                        labelId="private-label"
                        defaultValue={prev.isPrivate ?? true}
                        {...register("isPrivate")}
                        disabled={loading}
                    >
                        <MenuItem value={"true"}>Private</MenuItem>
                        <MenuItem value={"false"}>Public</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
                    {!prev._id && setShowForm && (
                        <Button
                            variant="outlined"
                            onClick={() => setShowForm(false)}
                            disabled={loading}
                        >
                            Back
                        </Button>
                    )}

                    <Button type="submit" variant="contained" disabled={loading}>
                        {prev?._id
                            ? loading
                                ? "Editing..."
                                : "Edit Playlist"
                            : loading
                                ? "Creating..."
                                : "Create Playlist"}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default PlaylistForm;