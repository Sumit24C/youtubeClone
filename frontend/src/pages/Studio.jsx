import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import ChannelStats from "../components/Studio/ChannelStats";
import { useSelector } from "react-redux";

function Studio() {
  const { userData } = useSelector((state) => state.auth);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6, lg: 10 },
        bgcolor: "#121212",
        minHeight: "100vh",
        color: "white",
        maxWidth: "1600px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/c/${userData?.username}`)}
        >
          View Channel
        </Button>

        <ChannelStats />
      </Box>

      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="inherit"
        indicatorColor="primary"
        sx={{ borderBottom: "1px solid #333", mb: 2 }}
      >
        <Tab onClick={() => navigate("")} label="Videos" />
        <Tab onClick={() => navigate("pl")} label="Playlists" />
      </Tabs>

      <Outlet />
    </Box>
  );
}

export default Studio;
