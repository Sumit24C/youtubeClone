import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box, CssBaseline, Divider, Drawer as MuiDrawer, List,
  Typography,
} from '@mui/material';
import {
  HomeFilled as HomeFilledIcon,
  AccountCircle as AccountCircleIcon,
  Subscriptions as SubscriptionsIcon,
  History as HistoryIcon,
  PlaylistPlay as PlaylistPlayIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import CustomListItems from './CustomListItems';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': open ? openedMixin(theme) : closedMixin(theme),
}));

const menuItems = [
  { name: 'Home', path: '/', icon: <HomeFilledIcon /> },
  { name: 'Subscription', path: '/subscription', icon: <SubscriptionsIcon /> },
  { name: 'You', path: '/you', icon: <AccountCircleIcon /> },
];

const onOpenYouItems = [
  { name: 'History', path: '/history', icon: <HistoryIcon /> },
  { name: 'Playlist', path: '/playlist', icon: <PlaylistPlayIcon /> },
  { name: 'Liked Videos', path: '/liked-videos', icon: <ThumbUpIcon /> },
];

export default function Sidebar({ open }) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <List sx={{ pt: 8 }}>
          {menuItems.map((item) =>
            (open && item.name !== 'You') || !open ? (
              <CustomListItems key={item.name} item={item} open={open} />
            ) : null
          )}
        </List>

        {open && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="subtitle2"
              sx={{
                px: 2.5,
                py: 1,
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              <Link to="/you" style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                You
              </Link>
            </Typography>
            <List>
              {onOpenYouItems.map((item) => (
                <CustomListItems key={item.name} item={item} open={open} />
              ))}
            </List>
          </>
        )}
      </Drawer>
    </Box>
  );
}
