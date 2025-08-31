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
    const controllerRef = useRef();
    const observerRef = useRef();
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchComments = async (pageNum) => {
        setLoading(true);
        if (controllerRef.current) controllerRef.current.abort();

        controllerRef.current = new AbortController();

        try {
            const response = await axiosPrivate.get(`/comments/${id}?page=${page}`, {
                signal: controllerRef.current.signal
            });
            const { comments: newComments, totalPages } = response.data.data;

            setPage(pageNum)
            setTotalPages(totalPages);
            setComments((prev) => [...prev, ...newComments]);
        } catch (error) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error))
            }
        } finally {
            setLoading(false);
            setErrorMsg('');
        }
    }

    useEffect(() => {
        ; (async function () {
            await fetchComments(1);
        })()
    }, [])

    useEffect(() => {
        if (loading) return;

        if (observerRef.current) observerRef.current.disconnect();

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && page < totalPages) {
                fetchComments(page + 1);
            }
        });

        if (document.getElementById("scroll-anchor")) {
            observer.observe(document.getElementById("scroll-anchor"))
        }

        observerRef.current = observer;

    }, [page, loading, totalPages])

    useEffect(() => {
        return () => controllerRef.current.abort();
    }, [])

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
                        <CommentCard key={index} comment={comment} setComments={setComments}/>
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