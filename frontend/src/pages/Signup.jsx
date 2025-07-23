import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, TextField, Button, Input } from '@mui/material'
import axios, {isCancel} from '../api.js'
import { login, logout } from '../store/authSlice.js'
import { useDispatch } from 'react-redux'
import extractErrorMsg from '../utils/extractErrorMsg.js'
function Signup() {

    const dispatch = useDispatch();
    const controllerRef = useRef(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const submit = async (data) => {
        setLoading(true)
        setError("")
        try {
            const formData = new FormData();
            formData.append('username', data.username)
            formData.append('fullName', data.fullName)
            formData.append('email', data.email)
            formData.append('password', data.password)
            formData.append('avatar', data.avatar[0]);

            controllerRef.current = new AbortController();
            const res = await axios.post('/users/register', formData, {
                signal: controllerRef.current.signal
            });
            console.log("Res: ",res)
            // dispatch(login(res.data))
        } catch (error) {
            setLoading(false)

            // dispatch(logout())
            if (isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                setError(extractErrorMsg(error))
            }
        } finally {
            setLoading(false)
            controllerRef.current = null
        }
    }

    useEffect(() => {
        return () => {
            if (controllerRef.current) controllerRef.current.abort();
        }
    }, [])

    return (
        <>
            <Box component={'form'} onSubmit={handleSubmit(submit)}>
                <TextField id="username" label="username" variant="outlined" error={!!errors.username} helperText={errors.username?.message || ""} {...register("username", { required: true })} />
                <TextField id="fullName" label="fullName" variant="outlined" error={!!errors.username} helperText={errors.username?.message || ""} {...register("fullName", { required: true })} />
                <Input id='avatar' type='file' accept='image/*' {...register("avatar", { required: true })} />
                <TextField id="email" type='email' label="email" variant="outlined" {...register("email", { required: true })} />
                <TextField id="password" type='password' label="password" variant="outlined" {...register("password", { required: true })} />
                <Button disabled={loading} type='submit'>{loading ? "submitting" : "Signup"}</Button>
            </Box>
            <h1>{error}</h1>
        </>
    )
}

export default Signup