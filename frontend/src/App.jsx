import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import { Box, Toolbar } from '@mui/material';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* AppBar/Header */}
        <Header open={open} setOpen={setOpen} />

        {/* Spacer for fixed AppBar */}
        <Toolbar />

        {/* Main page content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
