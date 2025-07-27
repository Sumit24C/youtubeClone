import * as React from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export default function SearchBar() {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const topFilms = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 },
    { title: "Schindler's List", year: 1993 },
    { title: 'Pulp Fiction', year: 1994 },
  ];

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      setLoading(true);
      await sleep(1000);
      setOptions(topFilms);
      setLoading(false);
    })();
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Autocomplete
        fullWidth
        open={open}
        freeSolo
        onOpen={handleOpen}
        onClose={handleClose}
        getOptionLabel={(option) => option.title}
        options={options}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      <IconButton color="inherit">
        <SearchIcon />
      </IconButton>
    </Box>
  );
}
