import React from 'react';
import { Box } from '@mui/material';
import LeftContainer from '../components/Video/LeftContainer';
import RightContainer from '../components/Video/RightContainer';

function VideoPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        px: { xs: 1, md: 3 },
        py: 2,
        width: '100%',
        height: '100%',
      }}
    >
      {/* LeftContainer: Video + Info */}
      <Box
        sx={{
          flex: 3,
          width: { xs: '100%', md: '70%' },
        }}
      >
        <LeftContainer />
      </Box>

      {/* RightContainer: Recommendations */}
      <Box
        sx={{
          flex: 1,
          width: { xs: '100%', md: '30%' },
          maxHeight: '100vh',
          overflowY: 'auto',
        }}
      >
        <RightContainer />
      </Box>
    </Box>
  );
}

export default VideoPage;
