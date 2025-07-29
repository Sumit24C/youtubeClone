// MuiStyles.jsx - Updated with fixed Main component
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer as MuiDrawer,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

// ==================== CONSTANTS ====================
export const DRAWER_WIDTH = 240;
export const DRAWER_COLLAPSED_WIDTH = 64;
export const HEADER_HEIGHT = 64;

// ==================== APP LAYOUT STYLES ====================
export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // Use fixed height instead of toolbar mixin
  minHeight: HEADER_HEIGHT,
  height: HEADER_HEIGHT,
}));

export const ContentWrapper = styled(Box)({
  width: '100%',
  maxWidth: '100%',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
});

// ==================== SIDEBAR STYLES ====================
export const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED_WIDTH,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowX: 'hidden',
    // Ensure drawer stays in place
    position: 'fixed',
    height: '100vh',
    zIndex: theme.zIndex.drawer,
  },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2.5),
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  fontWeight: 500,
  fontSize: '0.75rem',
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

// ==================== LIST ITEM STYLES ====================
export const StyledListItem = styled(ListItem)({
  display: 'block',
  padding: 0,
});

export const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => !['open', 'isActive'].includes(prop),
})(({ theme, open, isActive }) => ({
  minHeight: 48,
  margin: theme.spacing(0.5, 1),
  borderRadius: open ? theme.spacing(1.5) : '50%',
  justifyContent: open ? 'flex-start' : 'center',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  
  // Active state styling
  ...(isActive && {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  
  // Hover effect
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const StyledListItemIcon = styled(ListItemIcon, {
  shouldForwardProp: (prop) => !['open', 'isActive'].includes(prop),
})(({ theme, open, isActive }) => ({
  minWidth: 0,
  marginRight: open ? theme.spacing(3) : 'auto',
  justifyContent: 'center',
  color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
}));

export const StyledListItemText = styled(ListItemText, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  opacity: open ? 1 : 0,
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    fontWeight: 400,
  },
}));

// ==================== THEME MIXINS ====================

// ==================== RESPONSIVE BREAKPOINTS ====================
export const breakpoints = {
  mobile: '@media (max-width: 768px)',
  tablet: '@media (max-width: 1024px)',
  desktop: '@media (min-width: 1025px)',
};