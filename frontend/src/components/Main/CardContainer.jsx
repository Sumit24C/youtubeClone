import { Box, Typography, Avatar } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import MenuButton from '../Buttons/MenuButton';
import {displayViews, displayDuration, displayCreatedAt} from '../../utils';
function CardContainer({ p_id, video, vertical = false }) {
  const {
    _id,
    thumbnailUrl,
    title,
    channel,
    views,
    createdAt,
    duration,
  } = video;
  const path = p_id ? `/v/${_id}/Pl=/${p_id}` : `/v/${_id}`;

  return (
    <Box
      position="relative"
      display={vertical ? 'flex' : 'block'}
      justifyContent={vertical ? 'flex-start' : 'initial'}
      alignItems={vertical ? 'flex-start' : 'initial'}
      width="100%"
    >
      {/* Thumbnail (Link to video) */}
      <Link to={path || 'default'} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <Box sx={{ position: "relative" }}>

          <Box
            component="img"
            src={thumbnailUrl}
            alt={title}
            className="thumbnail"
            sx={{
              width: vertical ? '168px' : '100%',
              height: vertical ? '94px' : 200,
              borderRadius: 2,
              objectFit: 'cover',
            }}
          />
          {duration && (
            <Box
              sx={{
                position: "absolute",
                bottom: "10px",
                right: "5px",
                bgcolor: "rgba(0, 0, 0, 0.47)",
                color: "#fff",
                px: 0.5,
                py: 0.25,
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: 500
              }}
            >
              {displayDuration(duration)}
            </Box>
          )}
        </Box>
      </Link>

      {/* Info */}
      {vertical ? (
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" width="100%" ml={1}>
          {/* Content Section */}
          <Box display="flex" flexDirection="column" flex={1} minWidth={0} pr={1}>
            {/* Title (Link to video) */}
            <Link to={path || 'default'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                fontSize="0.95rem"
                fontWeight={600}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  whiteSpace: 'normal',
                  lineHeight: 1.3,
                  mb: 0.5,
                }}
              >
                {title}
              </Typography>
            </Link>

            <Link to={path || 'default'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography fontSize="0.95rem" color="gray" noWrap sx={{ mb: 0.25 }}>
                {channel[0].username || "unknown"}
              </Typography>
            </Link>

            <Link to={path || 'default'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography fontSize="0.8rem" color="gray">
                {displayViews(views)} • {displayCreatedAt(createdAt)}
              </Typography>
            </Link>
          </Box>

          {/* Menu Button */}
          <Box flexShrink={0} ml={1}>
            <MenuButton videoId={_id} />
          </Box>
        </Box>
      ) : (
        <Box display="flex" alignItems="flex-start" mt={1}>
          {/* Avatar Link */}
          {channel && <Link to={`/c/${channel[0].username}`} style={{ textDecoration: 'none' }}>
            <Avatar
              src={channel[0].avatar || ""}
              alt={channel[0].username || "unknown"}
              sx={{ width: 36, height: 36, mr: 1.5 }}
            />
          </Link>}

          <Box minWidth={0} flex={1}>
            {/* Title (Video Link) */}
            <Link to={path || 'default'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                fontSize="0.95rem"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  whiteSpace: 'normal',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
            </Link>

            {/* Channel Link */}
            {channel && <Link to={`/c/${channel[0].username}`} style={{ textDecoration: 'none' }}>
              <Typography display={"inline-block"} fontSize="0.95rem" color="gray" noWrap>
                {channel[0].username || "unknown"}
              </Typography>
            </Link>}

            <Link to={path || 'default'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography fontSize="0.9rem" color="gray">
                {displayViews(views)} • {displayCreatedAt(createdAt)}
              </Typography>
            </Link>
          </Box>

          {/* Menu Icon for non-vertical layout */}
          <Box position="absolute" bottom={8} right={0}>
            <MenuButton videoId={_id} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default CardContainer;