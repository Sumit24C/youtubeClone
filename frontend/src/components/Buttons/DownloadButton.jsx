import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';

const DownloadButton = () => {
  return (
    <Button
      startIcon={<Download fontSize="small" />}
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
      Download
    </Button>
  );
};

export default DownloadButton;
