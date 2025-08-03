import { Button } from '@mui/material';
import { Share } from '@mui/icons-material';

const ShareButton = () => {
  return (
    <Button
      startIcon={<Share fontSize="small" />}
      sx={{
        bgcolor: '#272727',
        color: 'white',
        borderRadius: '18px',
        height: '36px',
        fontSize: '0.8rem',
        fontWeight: 600,
        textTransform: 'none',
        px: 2,
        minWidth: '94px',
        '&:hover': {
          bgcolor: '#3c3c3c',
        },
      }}
    >
      Share
    </Button>
  );
};

export default ShareButton;
