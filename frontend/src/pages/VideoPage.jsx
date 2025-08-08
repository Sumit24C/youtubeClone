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
        gap: 1,
        px: { xs: 1, md: 3 },
        py: 2,
        width: '100%',
        height: '100%',
      }}
    >
      {/* LeftContainer: Video + Info */}
      <Box
        sx={{
          flex: 2,
          width: { xs: '100%', md: '70%' },
        }}
      >
        <LeftContainer />
      </Box>

      {/* RightContainer: Recommendations */}
      <Box
        sx={{
          p: 0,
          flex: 1,
          width: { xs: '100%', md: '30%' },
        }}
      >
        <RightContainer />
      </Box>
    </Box>
  );
}

export default VideoPage;
