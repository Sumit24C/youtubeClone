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
import extractErrorMsg from "../utils/extractErrorMsg.js";
import { Link as RouterLink } from "react-router-dom";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate.js";
import { BASE_URL } from "../constant.js";

function Signup() {
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const axiosPrivate = useAxiosPrivate();

  const submit = async (data) => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await axiosPrivate.post("/users/register", data);
      dispatch(login(res.data.data));
    } catch (error) {
      setLoading(false);
      dispatch(logout());
      if (isCancel(error)) {
        console.error("axiosSignup :: error :: ", error);
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
              {...register("password", {
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: "Password must contain atleast 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character",
                },
              })}
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

            <Button
              fullWidth
              onClick={() => window.open(`${BASE_URL}/auth/google`, "_self")}
              sx={{
                mt: 2,
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                border: "1px solid #dadce0",
                backgroundColor: "#fff",
                color: "#3c4043",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
                "&:hover": {
                  backgroundColor: "#f7f8f8",
                  borderColor: "#c6c6c6",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
                },
              }}
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Icon"
                style={{ width: 22, height: 22 }}
              />
              Continue with Google
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
