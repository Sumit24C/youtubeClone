import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { displayCreatedAt, displayDuration, extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import { Outlet, useNavigate } from "react-router-dom";

function Content() {
  const [tab, setTab] = useState(0);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  const navigate = useNavigate();

  return (
    <Box sx={{ px: 2, bgcolor: "#121212", minHeight: "100vh", color: "white" }}>
      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="inherit"
        indicatorColor="primary"
        sx={{ borderBottom: "1px solid #333", mb: 2 }}
      >
        <Tab onClick={() => navigate('')} label="Videos" />
        <Tab onClick={() => navigate('')} label="Live" />
        <Tab onClick={() => navigate('pl')} label="Playlists" />
        <Tab onClick={() => navigate('p')} label="Posts" />
      </Tabs>
      <Outlet />
    </Box>
  );
}

export default Content;
