import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Link,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { login, logout } from "../store/authSlice.js";
import axios, { isCancel } from "../api/api.js";
import extractErrorMsg from "../utils/extractErrorMsg.js";
import { Link as RouterLink } from "react-router-dom";

function Signup() {
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submit = async (data) => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await axios.post("/users/register", data);
      dispatch(login(res.data.data));
    } catch (error) {
      setLoading(false);
      dispatch(logout());
      if (isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        setErrMsg(extractErrorMsg(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f6fa"
    >
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 5, p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
            Create an Account
          </Typography>

          {errMsg && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {errMsg}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
            <TextField
              fullWidth
              margin="normal"
              id="username"
              label="Username"
              variant="outlined"
              error={!!errors.username}
              helperText={errors.username?.message}
              {...register("username", { required: "Username is required" })}
            />

            <TextField
              fullWidth
              margin="normal"
              id="fullName"
              label="Full Name"
              variant="outlined"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              {...register("fullName", { required: "Full name is required" })}
            />

            <TextField
              fullWidth
              margin="normal"
              id="email"
              type="email"
              label="Email"
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email", { required: "Email is required" })}
            />

            <TextField
              fullWidth
              margin="normal"
              id="password"
              type="password"
              label="Password"
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password", { required: "Password is required" })}
            />

            <Button
              fullWidth
              sx={{ mt: 3, borderRadius: 2, py: 1.2 }}
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
            </Button>
          </Box>

          {/* Login link */}
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              underline="hover"
              fontWeight="bold"
            >
              Login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Signup;
