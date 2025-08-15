import React from 'react';
import { Box, Typography } from '@mui/material';

function CollapsedContainer({ playlist, videos, currentVideo, setIsCollapsed }) {
    const nextVideoIndex = currentVideo || 1;
    const nextVideo = videos?.[nextVideoIndex - 1];

    return (
        <Box
            sx={{
                bgcolor: nextVideoIndex == videos.length ? "#0625b096" : "#1a1a1a",
                color: "#fff",
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "8px",
                cursor: "pointer",
                "&:hover": {
                    bgcolor: "#2a2a2a"
                },
                border: "1px solid #333",
                width: "98%"
            }}
            onClick={() => setIsCollapsed(false)}
        >
            <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {nextVideoIndex !== videos.length ?
                        nextVideo ? `Next: ${nextVideo.title}` : 'Playlist'
                        : `End Of Playlist`
                    }
                </Typography>
            </Box>
            <Typography
                variant="caption"
                sx={{
                    color: "#aaa",
                    fontSize: "0.75rem",
                    flexShrink: 0
                }}
            >
                {currentVideo || 1} / {videos?.length || 0}
            </Typography>
        </Box>
    );
}

export default CollapsedContainer;