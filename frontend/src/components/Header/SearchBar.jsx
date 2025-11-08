import React, { useEffect, useRef, useState } from 'react';
import {
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { extractErrorMsg } from '../../utils';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debounceRef = useRef(null);
  const controllerRef = useRef(null);

  const handleQuery = async (query) => {
    setLoading(true);
    if (controllerRef.current) controllerRef.current.abort();

    try {
      controllerRef.current = new AbortController();
      const res = await axiosPrivate.get(`/videos/q?query=${query}`, {
        signal: controllerRef.current.signal
      });

      return res.data.data;
    } catch (error) {
      console.error("search :: error :: ", error);
      setErrorMsg(extractErrorMsg(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (controllerRef.current) {
      return () => controllerRef.current.abort();
    }
  }, [])

  const handleInputChange = async (_, query) => {
    if (!query.trim()) {
      setOptions([]);
      return;
    }
    setQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const queries = await handleQuery(query);
      if (!queries) return;
      const cleaned = queries
        .filter(Boolean)
        .map((q) => q.replace(/\n+/g, " ").trim().slice(0, 30))
        .slice(0, 5)
      setOptions(cleaned);
    }, 500);
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
        autoFocus={false}
        fullWidth
        open={open}
        freeSolo
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        onInputChange={handleInputChange}
        onChange={(_, value) => value && navigate(`/v/s?query=${value}`)}
        onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              navigate(`/v/s?query=${query}`)
            }
        }}
        filterOptions={(x) => x}
        getOptionLabel={(option) => option}
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
      <IconButton
        onClick={() => navigate(`/v/s?query=${query}`)}
        color="inherit"
      >
        <SearchIcon />
      </IconButton>
    </Box>
  );
}
