import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { extractErrorMsg } from '../utils';
import { isCancel } from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';
import CommentCard from '../components/Comments/CommentCard';
import CreateComment from '../components/Comments/CreateComment';
import { useRef } from 'react';
function Comments() {

    const { id } = useParams();
    const [comments, setComments] = useState([]);
    const [errorMsg, setErrorMsg] = useState("")
    const [loading, setLoading] = useState(false)
    const axiosPrivate = useAxiosPrivate()
    const observerRef = useRef();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [lastCursor, setLastCursor] = useState("");

    const fetchComments = async (lastCursor) => {
        setLoading(true);

        try {
            const response = await axiosPrivate.get(`/comments/${id}?cursor=${lastCursor}`);
            const { comments: newComments, nextCursor } = response.data.data;
            setComments((prev) => [...prev, ...newComments]);
            setLastCursor(nextCursor);
        } catch (error) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error))
                setComments([])
                setLastCursor("");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        ; (async function () {
            setLastCursor("");
            setComments([]);
            await fetchComments("");
        })()
    }, [id])

    useEffect(() => {
        if (loading) return;

        if (observerRef.current) observerRef.current.disconnect();

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && lastCursor !== "") {
                fetchComments(lastCursor);
            }
        });

        if (document.getElementById("scroll-anchor")) {
            observer.observe(document.getElementById("scroll-anchor"))
        }

        observerRef.current = observer;

        return () => observer.disconnect();
    }, [lastCursor, loading])

    if (loading && comments.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    width: '100%',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Box>
                <CreateComment setComments={setComments} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {comments && comments.length > 0 ? (
                    comments.map((comment, index) => (
                        <CommentCard key={comment._id} comment={comment} setComments={setComments} />
                    ))
                ) : (
                    <Typography color="gray" textAlign="center">No comments available.</Typography>
                )}

                <div id="scroll-anchor" style={{ height: '20px' }}></div>

                {loading && comments.length > 0 && (
                    <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={30} />
                    </Box>
                )}
            </Box>
        </>
    )
}

export default Comments