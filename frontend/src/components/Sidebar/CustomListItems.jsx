import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';

function CustomListItems({ item, open }) {
  const location = useLocation();
  const theme = useTheme();

  const isActive = location.pathname === item.path;

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        component={NavLink}
        to={item.path}
        selected={isActive}
        sx={{
          minHeight: 48,
          margin:1,
          borderRadius: !open ? 100 : 30,
          justifyContent: open ? 'initial' : 'center',
          px: 2.5,
          color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
          '&.Mui-selected': {
            backgroundColor: theme.palette.action.selected,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: open ? 3 : 'auto',
            justifyContent: 'center',
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          sx={{
            opacity: open ? 1 : 0,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}

export default CustomListItems;
