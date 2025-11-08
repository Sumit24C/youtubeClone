import React from "react";
import { Box, Typography, Button, Paper, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          color: "#E0EFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
          px: 2,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(90deg, #00B4D8, #0077B6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "4rem", sm: "6rem" },
            }}
          >
            404
          </Typography>
        </motion.div>

        <Typography variant="h6" fontWeight={500}>
          Oops! Page not found
        </Typography>

        <Typography variant="body2" color="#8FBFE0" mb={2}>
          The page you’re looking for doesn’t exist or may have been moved.
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            background: "linear-gradient(90deg, #00B4D8, #0077B6)",
            color: "white",
            px: 4,
            py: 1,
            borderRadius: 3,
            "&:hover": {
              background: "linear-gradient(90deg, #0096C7, #023E8A)",
            },
          }}
        >
          Go Home
        </Button>
      </Box>
    </>
  );
}
