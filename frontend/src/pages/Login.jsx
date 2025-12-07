import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Card, CardContent, TextField, Typography, CircularProgress } from "@mui/material";
import { login, logout } from '../store/authSlice.js'
import { useDispatch, useSelector } from 'react-redux'
import extractErrorMsg from '../utils/extractErrorMsg.js'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { Link } from "@mui/material";
import { useAxiosPrivate } from '../hooks/useAxiosPrivate.js'
import { isCancel } from 'axios';
import { BASE_URL } from '../constant.js';
function Login() {

    const axiosPrivate = useAxiosPrivate()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from || '/'
    const { userData } = useSelector((state) => state.auth)
    const dispatch = useDispatch();
    const [errMsg, setErrMsg] = useState("")
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const submit = async (data) => {
        setLoading(true)
        setErrMsg("")
        try {
            const res = await axiosPrivate.post('/users/login', data);
            dispatch(login(res.data.data.user))
            navigate(from, { replace: true })
        } catch (error) {
            setLoading(false)
            if (isCancel(error)) {
                console.error('axiosLogin :: error :: ', error);
            } else {
                console.error(error)
                setErrMsg(extractErrorMsg(error))
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="#f5f6fa"
        >
            <Card sx={{ width: 380, borderRadius: 3, boxShadow: 5, p: 2 }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                        Login
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
                            type="text"
                            label="Username or Email"
                            placeholder="Enter your username or email"
                            variant="outlined"
                            error={!!errors.username}
                            helperText={errors?.username?.message}
                            {...register("username", { required: "Username is required" })}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            variant="outlined"
                            error={!!errors.password}
                            helperText={errors?.password?.message}
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
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

                    {/* Signup link */}
                    <Typography align="center" sx={{ mt: 2 }}>
                        Don’t have an account?{" "}
                        <Link
                            component={RouterLink}
                            to="/signup"
                            underline="hover"
                            fontWeight="bold"
                        >
                            Sign up
                        </Link>
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Login