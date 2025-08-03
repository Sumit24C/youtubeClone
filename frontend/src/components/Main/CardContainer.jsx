import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { displayCreatedAt } from '../../utils/index';

function CardContainer({ video, horizontal = false }) {
  const {
    _id,
    thumbnailUrl,
    title,
    avatar,
    channel,
    views,
    createdAt,
  } = video;

  return (
    <Box
      component={Link}
      to={`/v/${_id || 'default'}`}
      sx={{
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        gap: horizontal ? 1.5 : 0,
      }}
    >
      {/* Thumbnail */}
      <Box
        component="img"
        src={thumbnailUrl}
        alt={title}
        className="thumbnail"
        sx={{
          width: horizontal ? '168px' : '100%',
          height: horizontal ? '94px' : 200,
          borderRadius: 2,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />

      {/* Info */}
      {horizontal ? (
        <Box display="flex" flexDirection="column" ml={1} flex={1} minWidth={0}>
          <Typography fontSize="0.95rem" fontWeight={600} noWrap>
            {title}
          </Typography>
          <Typography fontSize="0.85rem" color="gray" noWrap>
            {channel}
          </Typography>
          <Typography fontSize="0.8rem" color="gray">
            {views.toLocaleString()} views • {displayCreatedAt(createdAt)}
          </Typography>
        </Box>
      ) : (
        <Box display="flex" mt={1}>
          <Avatar
            src={avatar}
            alt={channel}
            sx={{ width: 36, height: 36, mr: 1.5 }}
          />
          <Box minWidth={0}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              fontSize="0.95rem"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,          // ✅ Limit to 2 lines
                WebkitBoxOrient: 'vertical',
                whiteSpace: 'normal',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>

            <Typography fontSize="0.85rem" color="gray" noWrap>
              {channel}
            </Typography>
            <Typography fontSize="0.8rem" color="gray">
              {views.toLocaleString()} views • {displayCreatedAt(createdAt)}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default CardContainer;
