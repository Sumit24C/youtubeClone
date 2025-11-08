import React from 'react'
import { useState } from 'react'
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { useRef } from 'react';
import { isCancel } from 'axios';
import { extractErrorMsg } from '../../utils';
import { Box, Typography, Avatar, Button } from '@mui/material';
import { useEffect } from 'react';


function DeleteVideoWatchHistory({ videoId, setVideos }) {

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const axiosPrivate = useAxiosPrivate();

    const handleDelete = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const response = await axiosPrivate.patch(`/users/watch-history/v/${videoId}`, {})
            console.log(response)
            if (response.data) {
                setVideos((prev) => prev.filter((p) => p._id !== videoId))
            }

        } catch (error) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Box flexShrink={0} ml={1}>
                <Button onClick={handleDelete} loading={loading} disabled={loading}>
                    X
                </Button>
            </Box>
        </>
    )
}

export default DeleteVideoWatchHistory