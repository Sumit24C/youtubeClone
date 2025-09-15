import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, Card, CardContent, TextField, Typography, CircularProgress } from "@mui/material";

import axios, { axiosPrivate, isCancel } from '../api/api.js'
import { login, logout } from '../store/authSlice.js'
import { useDispatch, useSelector } from 'react-redux'
import extractErrorMsg from '../utils/extractErrorMsg.js'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { Link } from "@mui/material";
import { useAxiosPrivate } from '../hooks/useAxiosPrivate.js'
function Login() {

    const axiosPrivate = useAxiosPrivate()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from || '/'
    const { userData } = useSelector((state) => state.auth)
    const dispatch = useDispatch();
    const controllerRef = useRef(null)
    const [errMsg, setErrMsg] = useState("")
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const submit = async (data) => {
        setLoading(true)
        setErrMsg("")
        try {
            controllerRef.current = new AbortController();
            const res = await axiosPrivate.post('/users/login', data, {
                signal: controllerRef.current.signal
            });
            console.log(res.data)
            dispatch(login(res.data.data.user, { accessToken: res.data.data.accessToken }))
            navigate(from, { replace: true })
        } catch (error) {
            setLoading(false)
            if (isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                console.log(error)
                setErrMsg(extractErrorMsg(error))
            }
        } finally {
            setLoading(false)
            controllerRef.current = null
        }
    }

    useEffect(() => {
        console.log("userData: ", userData)
    }, [userData])

    useEffect(() => {
        return () => {
            if (controllerRef.current) controllerRef.current.abort();
        }
    }, [])
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