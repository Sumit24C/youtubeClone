import { Box, Typography, Avatar, Button, CardMedia } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import MenuButton from '../Buttons/MenuButton';
import { displayViews, displayDuration, displayCreatedAt } from '../../utils';
import DeleteVideoWatchHistory from '../Buttons/DeleteVideoWatchHistory';
function CardContainer({ p_id, video, vertical = false, size = "medium", history = false, setVideos, isLiked = false }) {
  const {
    _id,
    thumbnailUrl,
    title,
    channel,
    views = [],
    createdAt,
    duration,
  } = video;

  const path = p_id ? `/v/${_id}/Pl=/${p_id}` : `/v/${_id}`;
  const sizes = {
    "medium": {
      width: "168px", height: "94px"
    },
    "large": {
      width: "200px", height: "120px"
    }
  }

  const [loading, setLoading] = useState(false);

  return (
    <Box
      position="relative"
      display={vertical ? 'flex' : 'block'}
      justifyContent={vertical ? 'flex-start' : 'initial'}
      alignItems={vertical ? 'flex-start' : 'initial'}
      width="100%"
      m={1}
    >
      {/* Thumbnail (Link to video) */}
      <Link to={path || 'default'} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            src={thumbnailUrl}
            alt={title}
            className="thumbnail"
            sx={{
              width: vertical ? sizes[size].width : '100%',
              height: vertical ? sizes[size].height : 260,
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

          {history && <Box flexShrink={0} ml={1}>
            <DeleteVideoWatchHistory
              videoId={video._id}
              setVideos={setVideos}
            />
          </Box>}
          {/* Menu Button */}
          <Box flexShrink={0} ml={1}>
            <MenuButton videoId={_id} isLiked={true} setVideos={setVideos} />
          </Box>
        </Box>
      ) : (
        <Box display="flex" alignItems="flex-start" mt={1}>
          {/* Avatar Link */}
          {channel && (
            <Link to={`/c/${channel[0].username}`} style={{ textDecoration: 'none' }}>
              <Avatar
                src={channel[0].avatar || ""}
                alt={channel[0].username || "unknown"}
                sx={{ width: 36, height: 36, mr: 1.5 }}
              />
            </Link>
          )}

          {/* Text Content */}
          <Box minWidth={0} flex={1}>
            {/* MenuButton at the top right inside flex */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Link
                to={path || 'default'}
                style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  fontSize="1rem"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    whiteSpace: 'normal',
                    lineHeight: 1.25,
                    mb: 0.3,
                  }}
                >
                  {title}
                </Typography>
              </Link>

              <MenuButton videoId={_id} />
            </Box>

            {/* Channel Link */}
            {channel && (
              <Link to={`/c/${channel[0].username}`} style={{ textDecoration: 'none' }}>
                <Typography
                  display="inline-block"
                  fontSize="0.95rem"
                  color="gray"
                  noWrap
                  sx={{ lineHeight: 1.2, mb: 0.2 }}
                >
                  {channel[0].username || "unknown"}
                </Typography>
              </Link>
            )}

            {/* Views + CreatedAt */}
            <Link to={path || 'default'} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography fontSize="0.9rem" color="gray" sx={{ lineHeight: 1.2 }}>
                {displayViews(views)} • {displayCreatedAt(createdAt)}
              </Typography>
            </Link>
          </Box>
        </Box>


      )}
    </Box>
  );
}

export default CardContainer;