import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import SearchBar from './SearchBar';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreateButton from './CreateButton';
import Badge from '@mui/material/Badge';
import AccountButton from './AccountButton';
import { Link } from 'react-router-dom';

function Header({ setOpen, open }) {
  const handleToggleDrawer = () => setOpen(prev => !prev);

  return (
    <MuiAppBar
      position="fixed"
      elevation={1}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        height: '8vh',
        minHeight: '50px',
      }}
    >
      <Toolbar sx={{ height: '100%', minHeight: '0', px: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          {/* Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" onClick={handleToggleDrawer} sx={{ ml: -1 }}>
              <MenuIcon />
            </IconButton>
            <Link to="/" style={{ textDecoration: "none", color: "white" }}>
              <Typography variant="h6" noWrap>
                MyTube
              </Typography>
            </Link>
          </Box>

          {/* Center */}
          <Box
            sx={{
              flex: 1,
              mx: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <SearchBar />
          </Box>

          {/* Right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Create Button */}
            <CreateButton />

            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <AccountButton />
          </Box>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}

export default Header;
