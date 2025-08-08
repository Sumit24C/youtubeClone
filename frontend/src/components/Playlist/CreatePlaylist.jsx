import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, TextField, Button, Typography, Alert } from '@mui/material'
import { isCancel } from 'axios'

import extractErrorMsg from '../../utils/extractErrorMsg.js'
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate.js'

function CreatePlaylist({ videoId, handleDialogClose }) {
    const axiosPrivate = useAxiosPrivate()
    const controller = useRef(null)
    const [errMsg, setErrMsg] = useState("")
    const { register, handleSubmit, formState: { errors }, reset } = useForm()
    const [loading, setLoading] = useState(false);
    const [playlist, setPlaylist] = useState(null);

    const create = async (data) => {
        setLoading(true);
        setErrMsg("");
        try {
            controller.current = new AbortController();
            const response = await axiosPrivate.post(`/playlist`, {
                name: data.name, 
                description: data.description, 
                videoId
            }, {
                signal: controller.current.signal
            });

            console.log(response.data.data);
            setPlaylist(response.data.data);
            
            reset();
            handleDialogClose();
            
        } catch (error) {
            if (isCancel(error)) {
                console.error("usePlaylistAxios :: error :: ", error)
            } else {
                const errorMessage = extractErrorMsg(error);
                console.error(errorMessage);
                setErrMsg(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        return () => {
            if (controller.current) controller.current.abort();
        }
    }, [])

    return (
        <Box sx={{ p: 3, minWidth: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Create New Playlist
            </Typography>
            
            {errMsg && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errMsg}
                </Alert>
            )}
            
            <Box component={'form'} onSubmit={handleSubmit(create)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField 
                    id="name" 
                    type='text' 
                    label="Playlist Name" 
                    variant="outlined" 
                    placeholder='Enter playlist name' 
                    error={!!errors.name} 
                    helperText={errors?.name?.message} 
                    {...register("name", { 
                        required: "Playlist name is required",
                        minLength: {
                            value: 1,
                            message: "Playlist name cannot be empty"
                        }
                    })} 
                    fullWidth
                    autoFocus
                />
                
                <TextField 
                    id="description" 
                    type='text' 
                    label="Description" 
                    variant="outlined" 
                    placeholder='Enter playlist description'
                    error={!!errors.description} 
                    helperText={errors?.description?.message} 
                    {...register("description", { 
                        required: "Description is required",
                        minLength: {
                            value: 1,
                            message: "Description cannot be empty"
                        }
                    })} 
                    fullWidth
                    multiline
                    rows={3}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button 
                        variant="outlined" 
                        onClick={handleDialogClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        disabled={loading} 
                        type='submit'
                        variant="contained"
                    >
                        {loading ? "Creating..." : "Create Playlist"}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default CreatePlaylist;