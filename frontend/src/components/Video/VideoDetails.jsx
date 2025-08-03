import { Box, Typography, Avatar, Button, IconButton } from '@mui/material';
import { ThumbUpOutlined, ThumbUp, ThumbDown, ThumbDownOutlined, Share, Download, MoreHoriz } from '@mui/icons-material';
import LikeDislikeButton from '../Buttons/LikeDislikeButton';
import SubscribeButton from '../Buttons/SubscribeButton';
import ShareButton from '../Buttons/ShareButton';
import DownloadButton from '../Buttons/DownloadButton';
import { useState } from 'react';

const VideoDetails = ({ channel, isLiked, likesCount }) => {
  const [subscribersCount, setSubscribersCount] = useState(channel.subscribersCount);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 0.5,
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >

      {/* Channel Info & Subscribe Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={channel.avatar} alt={channel.username} sx={{ width: 40, height: 40 }} />
        <Box>
          <Typography fontSize="1rem" fontWeight={600} color="white">
            {channel.username}
          </Typography>
          <Typography fontSize="0.85rem" fontWeight={500} color="gray">
            {`${subscribersCount} subscriber${subscribersCount > 1 ? 's' : ''}`}
          </Typography>
        </Box>
        <SubscribeButton isSubscribed={channel.isSubscribed} setSubscribersCount={setSubscribersCount} channelId={channel._id} />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LikeDislikeButton isLiked={isLiked} isDisliked={false} likesCount={likesCount} />
        <ShareButton />
        <DownloadButton />
        <IconButton size="small" sx={{ color: 'white', height: '36px', width: '36px' }}>
          <MoreHoriz fontSize="small" />
        </IconButton>
      </Box>

    </Box>
  );
};

export default VideoDetails;
