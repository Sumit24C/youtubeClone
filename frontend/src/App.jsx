import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import { Box, CssBaseline } from '@mui/material';
import { DrawerHeader } from '../src/styles/MuiStyles';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        bgcolor: 'background.default', 
        color: 'text.primary' 
      }}>
        <Sidebar open={open} setOpen={setOpen} />

        <Box 
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflow: 'hidden',
            transition: (theme) => theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ml: 0,
            mt: 0,
          }}
        >
          <Header open={open} setOpen={setOpen} />

          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minHeight: 0, 
              p: 0,
              m: 0,
            }}
          >
            <DrawerHeader sx={{ minHeight: 64 }} />
            
            <Box
              sx={{
                flexGrow: 1,
                width: '100%',
                height: '100%',
                overflow: 'auto', 
                p: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default App;