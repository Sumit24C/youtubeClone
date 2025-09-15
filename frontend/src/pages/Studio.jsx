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

function Studio() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  // Mock analytics data (replace with API values later)
  const analytics = {
    subscribers: 1200,
    views: 45000,
    watchHours: 320,
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 6, lg: 10 }, // horizontal padding instead of mx:auto
        bgcolor: "#121212",
        minHeight: "100vh",
        color: "white",
        maxWidth: "1600px", // keeps content from being too wide
      }}
    >
      {/* --- Top Row: View Channel + Stats --- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap", // responsive on small screens
          gap: 2,
        }}
      >
        {/* Left: View Channel */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/channel")}
        >
          View Channel
        </Button>

        {/* Right: Stats */}
        <Grid container spacing={2} sx={{ width: "auto" }}>
          {[
            { label: "Subscribers", value: analytics.subscribers },
            { label: "Views", value: analytics.views },
            { label: "Watch Hours", value: analytics.watchHours },
          ].map((item, index) => (
            <Grid item key={index}>
              <Paper
                sx={{
                  p: 1.5,
                  px: 2,
                  minWidth: 120,
                  bgcolor: "#1e1e1e",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" color="gray">
                  {item.label}
                </Typography>
                <Typography variant="h6">{item.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* --- Tabs Row --- */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="inherit"
        indicatorColor="primary"
        sx={{ borderBottom: "1px solid #333", mb: 2 }}
      >
        <Tab onClick={() => navigate("")} label="Videos" />
        <Tab onClick={() => navigate("pl")} label="Playlists" />
        <Tab onClick={() => navigate("p")} label="Posts" />
      </Tabs>

      {/* --- Outlet for Tab Content --- */}
      <Outlet />
    </Box>
  );
}

export default Studio;
