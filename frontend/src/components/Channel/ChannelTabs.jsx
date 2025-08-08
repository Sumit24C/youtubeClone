import React, { useState } from 'react';
import { Tab, Tabs, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function ChannelTabs() {
  const [value, setValue] = useState("videos");

  const handleChange = (e, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="Channel Content Tabs"
      >
        <Tab
          label="Videos"
          value="videos"
          component={Link} 
          to=""
        />
        <Tab
          label="Playlists"
          value="playlist"
          component={Link}
          to="playlists"
        />
        <Tab
          label="Posts"
          value="posts"
          component={Link}
          to="posts"
        />
        <Tab
          label="About"
          value="about"
          component={Link}
          to="about"
        />
      </Tabs>
    </Box>
  );
}

export default ChannelTabs;
