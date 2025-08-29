import React from "react";
import { Grid, Box, Paper, Typography, Button } from "@mui/material";

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3, bgcolor: "#121212", minHeight: "100vh", color: "#fff" }}>
      <Grid container spacing={3}>
        
        {/* Left Content Area */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            
            {/* Latest Video Performance */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: "#1e1e1e", borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Latest video performance
                </Typography>
                <Box sx={{ bgcolor: "#333", height: 180, borderRadius: 2, mb: 2 }} />
                <Button variant="contained" color="primary" fullWidth>
                  Go to video analytics
                </Button>
              </Paper>
            </Grid>

            {/* Channel Analytics */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: "#1e1e1e", borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Channel analytics
                </Typography>
                <Typography>Subscribers: 0</Typography>
                <Typography>Views: 0</Typography>
                <Typography>Watch time: 0h</Typography>
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  Go to channel analytics
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Sidebar */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            
            {/* YouTube Known Issues */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: "#1e1e1e", borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  YouTube known issues
                </Typography>
                <Typography>🚨 Video captions not working</Typography>
              </Paper>
            </Grid>

            {/* Creator Insider */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: "#1e1e1e", borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Creator Insider
                </Typography>
                <Box sx={{ bgcolor: "#333", height: 180, borderRadius: 2, mb: 2 }} />
                <Button variant="contained" color="primary" fullWidth>
                  Watch on YouTube
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
