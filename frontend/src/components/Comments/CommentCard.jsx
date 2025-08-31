import { Box, Typography, Avatar, TextField, Button } from '@mui/material';
import { ThumbUpOutlined, ThumbUp } from '@mui/icons-material';
import { displayCreatedAt, extractErrorMsg } from '../../utils';
import { useLike } from '../../hooks/useLike';
import VideoPageButton from '../Buttons/VideoPageButton';
import CommentMenu from '../Buttons/CommentMenu';
import { useState } from 'react';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { useSnackbar } from 'notistack';

function CommentCard({ comment, setComments }) {
  const { owner, createdAt, content, repliesCount = 0 } = comment;
  const { likeLoading, liked, countOfLikes, handleLike } = useLike(
    comment.isLiked,
    comment.likesCount,
    false,
    "comment",
    comment._id
  );

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [editingContent, setEditingContent] = useState(content);
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await axiosPrivate.patch(`/comments/c/${comment._id}`, {
        content: editingContent,
      });
      const newComment = response.data.data
      setComments((prev) =>
        prev.map((c) =>
          c._id === comment._id ? { ...c, content: newComment.content } : c
        )
      );

      enqueueSnackbar(response.data.message, { variant: "success" });
      setIsEdit(false);
    } catch (error) {
      enqueueSnackbar(extractErrorMsg(error), { variant: "error" });
      setErrorMsg(extractErrorMsg(error))
    }
  };

  const handleCancel = () => {
    setEditingContent(content);
    setIsEdit(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        p: 1.5,
        '&:hover': {
          bgcolor: '#1a1a1a',
        },
        transition: 'all 0.2s ease'
      }}
    >
      {/* Avatar */}
      <Avatar
        src={owner[0]?.avatar || ""}
        alt={owner[0]?.username}
        sx={{ width: 40, height: 40, flexShrink: 0 }}
      />

      {/* Comment Body */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Username & Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#fff' }}>
            @{owner[0]?.username}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#aaa' }}>
            {displayCreatedAt(createdAt)}
          </Typography>
        </Box>

        {/* Editable or Static Comment */}
        {isEdit ? (
          <Box sx={{ mt: 0.5 }}>
            <TextField
              fullWidth
              multiline
              autoFocus
              variant="standard"
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  color: 'white',
                  fontSize: '0.85rem',
                },
              }}
            />
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#fff',
              whiteSpace: 'pre-line',
              mt: 0.5
            }}
          >
            {content}
          </Typography>
        )}

        {/* Actions (Like, Reply count) */}
        {!isEdit && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <VideoPageButton
              onClick={handleLike}
              loading={likeLoading}
              icon={liked
                ? <ThumbUp fontSize="small" sx={{ color: 'white' }} />
                : <ThumbUpOutlined fontSize="small" sx={{ color: 'white' }} />}
              iconOnly={false}
              sx={{
                color: 'white',
                bgcolor: 'transparent',
                '&:hover': {
                  bgcolor: '#565656ff',
                },
              }}
            >
              {countOfLikes}
            </VideoPageButton>

            {repliesCount > 0 && (
              <Typography sx={{ fontSize: '0.75rem', color: '#aaa', cursor: 'pointer' }}>
                {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Menu Button */}
      <Box flexShrink={0}>
        <CommentMenu comment={comment} setComments={setComments} isEdit={isEdit} setIsEdit={setIsEdit} />
      </Box>
    </Box>
  );
}

export default CommentCard;
