import React, { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate.js";
import extractErrorMsg from "../../utils/extractErrorMsg.js";
import { useSnackbar } from 'notistack';

function PlaylistForm({
    videoId,
    prev = {},
    setPlaylist,
    loading,
    setLoading,
    setErrMsg,
    setShowForm,
    handleDialogClose
}) {
    const { handleSubmit, register, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: prev.name || "",
            description: prev.description || "",
        }
    });

    const axiosPrivate = useAxiosPrivate();
    const controller = useRef(null);
    const { enqueueSnackbar } = useSnackbar();

    const createOrEdit = async (data) => {
        setLoading(true);
        setErrMsg("");
        try {
            controller.current = new AbortController();
            const url = prev?._id ? `/playlist/${prev._id}` : `/playlist`;
            const method = prev?._id ? "patch" : "post";
            const payload = {
                name: data.name,
                description: data.description,
                isPrivate: data.isPrivate,
                ...(!prev._id && { videoId })
            };

            const response = await axiosPrivate[method](url, payload, { signal: controller.current.signal });
            enqueueSnackbar(response.data.message)
            if (prev?._id) {
                setPlaylist(prev => ({
                    ...prev,
                    name: response.data.data.name,
                    description: response.data.data.description,
                    isPrivate: response.data.data.isPrivate,
                    updatedAt: response.data.data.updatedAt,
                }))
            } else {
                setPlaylist(prevState => [...prevState, response.data.data]);
            }

            reset();
            handleDialogClose();
        } catch (error) {
            const errorMessage = extractErrorMsg(error);
            setErrMsg(errorMessage);
            enqueueSnackbar(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => { if (controller.current) controller.current.abort(); };
    }, []);

    return (
        <Box sx={{ p: 2, minWidth: 280, maxWidth: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#151515ff' }}>

            <Box component="form" onSubmit={handleSubmit(createOrEdit)} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Playlist Name"
                    defaultValue={prev.name}
                    {...register("name", { required: "Playlist name is required" })}
                    error={!!errors.name}
                    helperText={errors?.name?.message}
                    fullWidth
                />

                <TextField
                    label="Description"
                    defaultValue={prev.description}
                    {...register("description", { required: "Description is required" })}
                    error={!!errors.description}
                    helperText={errors?.description?.message}
                    fullWidth
                    multiline
                    rows={3}
                />

                <FormControl fullWidth>
                    <InputLabel id="private-label">Privacy</InputLabel>
                    <Select
                        disabled={loading}
                        labelId="private-label"
                        id="private"
                        defaultValue={prev.isPrivate || true}
                        {...register("isPrivate")}
                    >
                        <MenuItem value={true}>Private</MenuItem>
                        <MenuItem value={false}>Public</MenuItem>
                    </Select>
                </FormControl>

                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
                    {!prev._id && <Button
                        variant="outlined"
                        onClick={() => setShowForm(false)}
                        disabled={loading}
                    >
                        Back
                    </Button>}
                    <Button type="submit" variant="contained" disabled={loading}>
                        {prev?._id ? (loading ? "Editing..." : "Edit Playlist") : (loading ? "Creating..." : "Create Playlist")}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default PlaylistForm;
