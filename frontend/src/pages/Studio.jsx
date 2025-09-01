import React from "react";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import GroupsIcon from "@mui/icons-material/Groups";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Studio() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "dashboard" },
    { text: "Channel Content", icon: <GroupsIcon />, path: "content" },
    { text: "Analytics", icon: <AnalyticsIcon />, path: "analytics" },
    { text: "Community", icon: <GroupsIcon />, path: "community" },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#121212", color: "white" }}>
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>
            {
              menuItems.find((item) => location.pathname.includes(item.path))?.text ||
              "Dashboard"
            }
          </h2>
          <Button
            variant="contained"
            sx={{ bgcolor: "#3ea6ff", "&:hover": { bgcolor: "#65b9ff" } }}
          >
            View Channel
          </Button>
        </Box>

        {/* Nested Routes Render Here */}
        <Box sx={{ mt: 3 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Sidebar (Right side) */}
      <Drawer
        anchor="right"
        variant="permanent"
        sx={{
          width: 220,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 220,
            boxSizing: "border-box",
            bgcolor: "#181818",
            color: "white",
            borderLeft: "1px solid #333",
          },
        }}
      >
        <Box sx={{ p: 2, fontWeight: "bold", fontSize: "20px" }}>Your Channel</Box>
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname.includes(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                "&.Mui-selected": { bgcolor: "#333333" },
                "&:hover": { bgcolor: "#2a2a2a" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
