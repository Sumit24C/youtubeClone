// VideoPageButton.jsx
import React from 'react';
import { Button, IconButton } from '@mui/material';

function VideoPageButton({
  onClick,
  loading = false,
  variant = 'contained',
  children,
  icon,
  iconOnly = false,
  grouped = false,
  active = false,
  ...props
}) {
  const commonStyles = {
    height: '36px',
    borderRadius: iconOnly ? 0 : '16px',
    fontSize: '0.8rem',
    fontWeight: 600,
    textTransform: 'none',
    px: iconOnly ? 2 : 2,
    minWidth: iconOnly ? '36px' : '94px',
    bgcolor: active ? '#414141ff' : 'white',
    color: active ? 'white' : 'black',
    '&:hover': {
      bgcolor: active ? '#3a3a3aff' : "#e5e5e5",
    },
    ...props.sx,
  };

  if (iconOnly) {
    return (
      <IconButton onClick={onClick} disabled={loading} sx={commonStyles} {...props}>
        {icon}
      </IconButton>
    );
  }

  return (
    <Button
      loading={loading}
      onClick={onClick}
      variant={variant}
      startIcon={icon}
      sx={commonStyles}
      {...props}
    >
      {children}
    </Button>
  );
}

export default VideoPageButton;
