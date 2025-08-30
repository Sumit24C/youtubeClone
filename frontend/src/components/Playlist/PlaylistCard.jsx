import { Box, Typography, IconButton } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { displayCreatedAt, displayDuration, displayViews } from '../../utils/index';
import MenuButton from '../Buttons/MenuButton';
import { useEffect } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PlaylistMenu from '../Buttons/PlaylistMenu';

function PlaylistCard({ p_id, videoInfo, setCurrentVideo, isCurrentVideo }) {
  const { _id, thumbnailUrl, title, channel, views, createdAt, duration } = videoInfo.video;
  const path = `/v/${_id}/Pl=/${p_id}`;
  const { id } = useParams();

  useEffect(() => {
    if (id === _id) {
      setCurrentVideo(videoInfo.index + 1);
    }
  }, [id, _id, setCurrentVideo, videoInfo.index]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.5,
        bgcolor: isCurrentVideo ? "rgba(187, 5, 5, 0.37)" : "transparent",
        "&:hover": {  
          bgcolor: isCurrentVideo ? "rgba(182, 0, 0, 0.3)" : "#1a1a1a",
          cursor: "pointer"
        },
        transition: "all 0.2s ease"
      }}
    >
      {/* Index or Play Icon */}
      <Box
        sx={{
          width: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: isCurrentVideo ? "#fff" : "#aaa"
        }}
      >
        {isCurrentVideo ? (
          <PlayArrowIcon sx={{ fontSize: "16px", color: "#fff" }} />
        ) : (
          <Typography sx={{ fontSize: "0.8rem", color: "#aaa" }}>
            {videoInfo.index + 1}
          </Typography>
        )}
      </Box>

      {/* Thumbnail with Duration */}
      <Link to={path} style={{ textDecoration: 'none', flexShrink: 0 }}>
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src={thumbnailUrl}
            alt={title}
            sx={{
              width: '120px',
              height: '68px',
              borderRadius: 1,
              objectFit: 'cover',
            }}
          />
          {/* Duration overlay */}
          {duration && (
            <Box
              sx={{
                position: "absolute",
                bottom: "8px",
                right: "4px",
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

      {/* Video Info */}
      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
        <Link to={path} style={{ textDecoration: 'none' }}>
          <Typography
            sx={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: "#fff",
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
        </Link>

        <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#aaa",
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {channel[0]?.username || "Unknown"}
        </Typography>
      </Box>

      {/* Menu Button */}
      <Box flexShrink={0} ml={1}>
        <MenuButton videoId={_id} />
      </Box>
    </Box>
  );
}

export default PlaylistCard;