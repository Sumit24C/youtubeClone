import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { extractErrorMsg } from '../utils';
import { isCancel } from 'axios';
import { Box, Typography } from '@mui/material';
import CommentCard from '../components/Comments/CommentCard';
import CreateComment from '../components/Comments/CreateComment';
function Comments() {

    const { id } = useParams();
    const [comments, setComments] = useState(null);
    const [errorMsg, setErrorMsg] = useState("")
    const [loading, setLoading] = useState(false)
    const axiosPrivate = useAxiosPrivate()

    useEffect(() => {
        setLoading(true);
        const controller = new AbortController();
        ; (async () => {
            try {
                const response = await axiosPrivate.get(`/comments/${id}`, {
                    signal: controller.signal
                });
                setComments(response.data.data);

            } catch (error) {
                if (isCancel(error)) {
                    console.log("MainError :: error :: ", error)
                } else {
                    console.error(error);
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })()

        return () => {
            controller.abort();
        }
    }, [id])

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <Box>
                <CreateComment setComments={setComments}/>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments && comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <CommentCard key={index} comment={comment} />
                    ))
                ) : (
                    <Typography color="gray" textAlign="center">No comments available.</Typography>
                )}
            </Box>
        </>
    )
}

export default Comments