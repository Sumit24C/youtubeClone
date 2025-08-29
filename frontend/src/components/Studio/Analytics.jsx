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
// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

function Analytics() {
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Dummy data
  const data = [
    { date: "Aug 1", views: 0 },
    { date: "Aug 6", views: 0 },
    { date: "Aug 10", views: 0 },
    { date: "Aug 15", views: 0 },
    { date: "Aug 20", views: 0 },
    { date: "Aug 25", views: 0 },
    { date: "Aug 28", views: 0 },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#121212", minHeight: "100vh", color: "white" }}>
      <Typography variant="h5" gutterBottom>
        Channel analytics
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="inherit"
        indicatorColor="primary"
        sx={{ borderBottom: "1px solid #333", mb: 2 }}
      >
        <Tab label="Overview" />
        <Tab label="Content" />
        <Tab label="Audience" />
        <Tab label="Trends" />
      </Tabs>

      {/* Summary + Graph */}
      <Grid container spacing={2}>
        {/* Summary boxes */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ bgcolor: "#1e1e1e", p: 2, mb: 2 }}>
            <Typography variant="h6">
              Your channel didn’t get any views in the last 28 days
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Paper sx={{ bgcolor: "#2a2a2a", p: 2 }}>
                  <Typography variant="subtitle2" color="gray">
                    Views
                  </Typography>
                  <Typography variant="h6">—</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ bgcolor: "#2a2a2a", p: 2 }}>
                  <Typography variant="subtitle2" color="gray">
                    Watch time (hours)
                  </Typography>
                  <Typography variant="h6">—</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ bgcolor: "#2a2a2a", p: 2 }}>
                  <Typography variant="subtitle2" color="gray">
                    Subscribers
                  </Typography>
                  <Typography variant="h6">—</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Graph */}
            <Box sx={{ height: 250, mt: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="views" stroke="#00b0ff" />
                  <CartesianGrid stroke="#333" strokeDasharray="5 5" />
                  <XAxis dataKey="date" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Realtime */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ bgcolor: "#1e1e1e", p: 2 }}>
            <Typography variant="h6">Realtime</Typography>
            <Typography color="gray" variant="body2">
              Updating live
            </Typography>
            <Typography sx={{ mt: 2 }}>— Subscribers</Typography>
            <Button
              variant="contained"
              size="small"
              sx={{ mt: 1, bgcolor: "#333" }}
            >
              See live count
            </Button>

            <Typography sx={{ mt: 3 }}>0 Views · Last 48 hours</Typography>
            <Box sx={{ height: 100, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="views" stroke="#00b0ff" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Button
              variant="contained"
              size="small"
              sx={{ mt: 2, bgcolor: "#333" }}
            >
              See more
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics;
