import React from 'react';
import { Box, Typography, Avatar, darkScrollbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { displayCreatedAt } from '../../utils/index';
function CardContainer({ video }) {

  console.log("cardVideo: ",video)
  return (
    <Box
      component={Link}
      to={`/v/${video._id || 'default'}`}
      state={{video}}
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        margin: 1,
        cursor: 'pointer',
        '&:hover .thumbnail': { transform: 'scale(1.03)' },
      }}
    >
      <Box
        component="img"
        src={video.thumbnail}
        alt={video.title}
        loading="lazy"
        className="thumbnail"
        sx={{
          width: '100%',
          height: 200,
          borderRadius: 2,
          objectFit: 'cover',
          transition: '0.3s ease-in-out',
        }}
      />

      {/* Info section */}
      <Box display="flex" mt={1}>
        <Avatar
          src={video.avatar}
          alt={video.channel}
          sx={{ width: 40, height: 40, mr: 1 }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {video.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {video.channel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {video.views.toLocaleString()} views • {displayCreatedAt(video.createdAt)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default CardContainer;
