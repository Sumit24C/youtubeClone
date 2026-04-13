import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../utils";
import { isCancel } from "axios";
import { Box, Typography, CircularProgress } from "@mui/material";
import CommentCard from "../components/Comments/CommentCard";
import CreateComment from "../components/Comments/CreateComment";
import type { Comment } from "../types/comment";

function Comments() {
    const { id } = useParams<{ id?: string }>();

    const [comments, setComments] = useState<Comment[]>([]);
    const [_errorMsg, setErrorMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [lastCursor, setLastCursor] = useState<string>("");

    const api = useAxiosPrivate();
    const observerRef = useRef<IntersectionObserver | null>(null);

    const fetchComments = async (cursor: string): Promise<void> => {
        if (!id) return;

        setLoading(true);

        try {
            const response = await api.get(`/comments/${id}?cursor=${cursor}`);

            const { comments: newComments, nextCursor } = response.data.data;

            setComments((prev) => [...prev, ...newComments]);
            setLastCursor(nextCursor);
        } catch (error: unknown) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
                setComments([]);
                setLastCursor("");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLastCursor("");
        setComments([]);
        fetchComments("");
    }, [id]);

    useEffect(() => {
        if (loading) return;

        if (observerRef.current) observerRef.current.disconnect();

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && lastCursor !== "") {
                fetchComments(lastCursor);
            }
        });

        const anchor = document.getElementById("scroll-anchor");
        if (anchor) observer.observe(anchor);
        observerRef.current = observer;

        return () => observer.disconnect();
    }, [lastCursor, loading]);

    if (loading && comments.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "60vh",
                    width: "100%",
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

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <CommentCard
                            key={comment._id}
                            comment={comment}
                            setComments={setComments}
                        />
                    ))
                ) : (
                    <Typography color="gray" textAlign="center">
                        No comments available.
                    </Typography>
                )}

                {/* Scroll anchor */}
                <div id="scroll-anchor" style={{ height: "20px" }} />

                {/* Pagination loader */}
                {loading && comments.length > 0 && (
                    <Box
                        sx={{
                            gridColumn: "1 / -1",
                            display: "flex",
                            justifyContent: "center",
                            py: 2,
                        }}
                    >
                        <CircularProgress size={30} />
                    </Box>
                )}
            </Box>
        </>
    );
}

export default Comments;