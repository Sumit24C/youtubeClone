import { useRef, useState, useEffect } from "react";
import {
    Box, Avatar, TextField, IconButton,
    Button, Stack, CircularProgress, Typography
} from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import { useParams } from "react-router-dom";
import { isCancel } from "axios";
import { useSelector } from "react-redux";

export default function CreateComment({ setComments }) {
    const { id } = useParams();
    const [content, setContent] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const { userData } = useSelector((state) => state.auth);

    const create = async () => {
        setLoading(true);
        setErrMsg("");
        try {
            const response = await axiosPrivate.post(`/comments/${id}`, {
                content: content
            });
            console.log(response.data.data);
            setComments(prev => [{
                content: response.data.data.content,
                _id: response.data.data._id,
                createdAt: response.data.data.createdAt,
                updatedAt: response.data.data.updatedAt,
                video: id,
                owner: [{
                    username: userData.username,
                    avatar: userData.avatar,
                }],
                likesCount: 0,
                isLiked: false
            }, ...(prev || [])]);

            setContent("");
        } catch (error) {
            if (!isCancel(error)) {
                const errorMessage = extractErrorMsg(error);
                setErrMsg(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
                position: "relative"
            }}
        >

            {/* Avatar */}
            <Avatar src={userData.avatar} alt={userData.username}>
                {userData.username?.[0]?.toUpperCase()}
            </Avatar>
            {/* Input + Actions */}
            <Box sx={{ flex: 1 }}>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    variant="standard"
                    placeholder="Add a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                    InputProps={{
                        sx: { color: "text.primary" }
                    }}
                />

                {/* Error Message */}
                {errMsg && (
                    <Typography
                        variant="body2"
                        color="error"
                        sx={{ mt: 1 }}
                    >
                        {errMsg}
                    </Typography>
                )}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 2 }}
                >
                    {/* Emoji Icon */}
                    <IconButton color="default" disabled={loading}>
                        <EmojiEmotionsIcon />
                    </IconButton>

                    {/* Buttons */}
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="text"
                            color="inherit"
                            onClick={() => setContent("")}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={create}
                            variant="contained"
                            disabled={!content.trim() || loading}
                            sx={{
                                borderRadius: "20px",
                                textTransform: "none"
                            }}
                        >
                            Comment
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
