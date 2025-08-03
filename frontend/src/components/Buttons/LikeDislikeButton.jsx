import {
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  ThumbDownOutlined,
} from '@mui/icons-material';
import { Box, Button, IconButton } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { isCancel } from 'axios';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';

function LikeDislikeButton({ isLiked, isDisliked, likesCount }) {
  const {id} = useParams();
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  console.log("liked: ",liked)
  const [count, setCount] = useState(likesCount);
  const axiosPrivate = useAxiosPrivate();
  const controller = useRef(null);
  controller.current = new AbortController();

  const handleLike = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.post(`/likes/toggle/v/${id}`, {
        signal: controller.current.signal
      });

      const likedRes = response.data.data.isLiked
      setLiked(likedRes);

      if (likedRes) {
        setCount(prev => prev + 1)
      } else {
        setCount(prev => prev - 1)
      }

    } catch (error) {
      if (isCancel(error)) {
        console.error("likedAxios :: error :: ", error)
      } else {
        console.error("liked :: error :: ", error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      controller.current.abort();
    }
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#272727',
        borderRadius: '18px',
        height: '36px',
        overflow: 'hidden',
        minWidth: '120px', 
      }}
    >
      {/* Like Button */}
      <Button
        onClick={handleLike}
        loading={loading}
        startIcon={
          liked ? (
            <ThumbUp fontSize="small" sx={{ color: 'white' }} />
          ) : (
            <ThumbUpOutlined fontSize="small" sx={{ color: 'white' }} />
          )
        }
        sx={{
          color: 'white',
          fontSize: '0.85rem',
          fontWeight: 500,
          textTransform: 'none',
          px: 2, // increased horizontal padding
          minWidth: 'unset',
          borderRadius: 0,
          bgcolor: liked ? '#3a3a3a' : 'transparent',
          '&:hover': {
            bgcolor: '#3a3a3a',
          },
        }}
      >
        {count}
      </Button>

      {/* Divider */}
      <Box
        sx={{
          height: '60%',
          width: '1px',
          backgroundColor: 'gray',
        }}
      />

      {/* Dislike Button */}
      <IconButton
        size="small"
        sx={{
          color: isDisliked ? 'white' : '#ccc',
          borderRadius: 0,
          px: 2, // increased padding for spacing
          '&:hover': {
            bgcolor: '#3a3a3a',
          },
        }}
      >
        {isDisliked ? (
          <ThumbDown fontSize="small" />
        ) : (
          <ThumbDownOutlined fontSize="small" />
        )}
      </IconButton>
    </Box>
  );
}

export default LikeDislikeButton;
