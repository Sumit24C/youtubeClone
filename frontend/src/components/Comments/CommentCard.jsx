import { Box, Typography, Avatar, IconButton } from '@mui/material';
import { ThumbUpOutlined, ThumbUp, ThumbDown, ThumbDownOutlined, Share, Download, MoreHoriz } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import { displayCreatedAt } from '../../utils';
import { useLike } from '../../hooks/useLike';
import VideoPageButton from '../Buttons/VideoPageButton';

function CommentCard({ comment }) {
  const { owner, createdAt, content, repliesCount = 0 } = comment;
  const { likeLoading, liked, countOfLikes, handleLike } = useLike(comment.isLiked, comment.likesCount, false, "comment", comment._id);
  console.log(comment);

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

        {/* Comment Text */}
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

        {/* Actions (Like, Reply count) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <VideoPageButton
            onClick={handleLike}
            loading={likeLoading}
            icon={liked ? <ThumbUp fontSize="small" sx={{ color: 'white' }} /> : <ThumbUpOutlined fontSize="small" sx={{ color: 'white' }} />}
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
      </Box>

      {/* Menu Button */}
      <Box flexShrink={0}>
        <IconButton size="small" sx={{ color: '#aaa' }}>
          <MoreVertIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default CommentCard;
