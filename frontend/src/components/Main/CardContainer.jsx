import { Box, Typography, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { displayCreatedAt } from '../../utils/index';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';

function CardContainer({ video, vertical = false }) {
  const {
    _id,
    thumbnailUrl,
    title,
    channel,
    views,
    createdAt,
  } = video;
  const [anchorEl, setAnchorE1] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClose = (e) => {
    setAnchorE1(null);
  }

  const handleMenuOpen = (e) => {
    setAnchorE1(e.currentTarget);
  }

  console.log(video);
  return (
    <Box
      position="relative"
      display={vertical ? 'flex' : 'block'}
      justifyContent={vertical ? 'space-between' : 'initial'}
      alignItems="flex-start"
    >
      {/* Thumbnail (Link to video) */}
      <Link to={`/v/${_id || 'default'}`} style={{ textDecoration: 'none' }}>
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
            flexShrink: 0,
          }}
        />
      </Link>

      {/* Info */}
      {vertical ? (
        <Link to={`/v/${_id || 'default'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mt={0.5} width="100%">
            <Box display="flex" flexDirection="column" ml={1} flex={1} minWidth={0} maxWidth="60%">
              {/* Title (Link to video) */}
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
                }}
              >
                {title}
              </Typography>

              <Typography fontSize="0.95rem" color="gray" noWrap>
                {channel[0].username || "unknown"}
              </Typography>

              <Typography fontSize="0.8rem" color="gray">
                {views.toLocaleString()} views • {displayCreatedAt(createdAt)}
              </Typography>
            </Box>
          </Box>
        </Link>
      ) : (
        <Box display="flex" alignItems="flex-start" mt={1}>
          {/* Avatar Link */}
          <Link to={`/c/${channel[0].username}`} style={{ textDecoration: 'none' }}>
            <Avatar
              src={channel[0].avatar || ""}
              alt={channel[0].username || "unknown"}
              sx={{ width: 36, height: 36, mr: 1.5 }}
            />
          </Link>

          <Box minWidth={0}>
            {/* Title (Video Link) */}
            <Link to={`/v/${_id || 'default'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
            <Link to={`/c/${channel[0].username}`} style={{ textDecoration: 'none' }}>
              <Typography display={"inline-block"} fontSize="0.95rem" color="gray" noWrap>
                {channel[0].username || "unknown"}
              </Typography>
            </Link>

            <Link to={`/v/${_id || 'default'}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography fontSize="0.9rem" color="gray">
                {views.toLocaleString()} views • {displayCreatedAt(createdAt)}
              </Typography>
            </Link>
          </Box>
        </Box>
      )}

      {/* Menu Icon */}
      <Box
        position="absolute"
        top={vertical ? 0 : 'auto'}
        bottom={vertical ? 'auto' : 8}
        right={0}
      >
        <IconButton onClick={handleMenuOpen} size="small">
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Menu Items */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleMenuClose}>Save to Playlist</MenuItem>
        <MenuItem onClick={handleMenuClose}>Share</MenuItem>
        <MenuItem onClick={handleMenuClose}>Not Interested</MenuItem>
        <MenuItem onClick={handleMenuClose}>Download</MenuItem>
        <MenuItem onClick={handleMenuClose}>Save to Watch Later</MenuItem>
      </Menu>
    </Box>
  );
}

export default CardContainer;
