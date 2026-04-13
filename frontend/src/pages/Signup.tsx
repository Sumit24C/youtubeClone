import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
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
import { login, logout } from "../store/authSlice";
import { extractErrorMsg } from "../utils/extractErrorMsg";
import { Link as RouterLink } from "react-router-dom";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { BASE_URL } from "../constant";

type SignupFormInputs = {
    username: string;
    fullName: string;
    email: string;
    password: string;
};

function Signup() {
    const dispatch = useDispatch();
    const axiosPrivate = useAxiosPrivate();

    const [errMsg, setErrMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormInputs>();

    const submit: SubmitHandler<SignupFormInputs> = async (data) => {
        setLoading(true);
        setErrMsg("");

        try {
            const res = await axiosPrivate.post(
                "/users/register",
                data
            );

            dispatch(login(res.data.data));
        } catch (error: unknown) {
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
                    <Typography
                        variant="h5"
                        align="center"
                        gutterBottom
                        fontWeight="bold"
                    >
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
                            label="Username"
                            error={!!errors.username}
                            helperText={errors.username?.message}
                            {...register("username", {
                                required: "Username is required",
                            })}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            label="Full Name"
                            error={!!errors.fullName}
                            helperText={errors.fullName?.message}
                            {...register("fullName", {
                                required: "Full name is required",
                            })}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            type="email"
                            label="Email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email",
                                },
                            })}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            type="password"
                            label="Password"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            {...register("password", {
                                required: "Password is required",
                                pattern: {
                                    value:
                                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                                    message:
                                        "Min 8 chars, uppercase, lowercase, number, special char",
                                },
                            })}
                        />

                        <Button
                            fullWidth
                            sx={{ mt: 3, borderRadius: 2, py: 1.2 }}
                            variant="contained"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>

                        <Button
                            fullWidth
                            onClick={() =>
                                window.open(`${BASE_URL}/auth/google`, "_self")
                            }
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
                            }}
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                alt="Google"
                                style={{ width: 22, height: 22 }}
                            />
                            Continue with Google
                        </Button>
                    </Box>

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