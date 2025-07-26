import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, TextField, Button, Input } from '@mui/material'
import axios, { isCancel } from '../api/api.js'
import { login, logout } from '../store/authSlice.js'
import { useDispatch, useSelector } from 'react-redux'
import extractErrorMsg from '../utils/extractErrorMsg.js'
function Signup() {

    const dispatch  = useDispatch()
    const controllerRef = useRef(null)
    const [errMsg, setErrMsg] = useState("")
    const [loading, setLoading] = useState(false)
    const { register, handleSubmit, formState: { errors } } = useForm()

    const submit = async (data) => {
        setLoading(true)
        setErrMsg("")
        try {
            controllerRef.current = new AbortController();
            const res = await axios.post('/users/register', data, {
                signal: controllerRef.current.signal
            });
            dispatch(login(res.data.data))
        } catch (error) {
            setLoading(false)
            dispatch(logout())
            if (isCancel(error)) {
                console.log('Request canceled:', error.message);
            } else {
                setErrMsg(extractErrorMsg(error))
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
            <h1>{errMsg}</h1>
            <Box component={'form'} onSubmit={handleSubmit(submit)}>
                <TextField id="username" label="username" variant="outlined" error={!!errors.username} helperText={errors.username?.message || ""} {...register("username", { required: true })} />
                <TextField id="fullName" label="fullName" variant="outlined" error={!!errors.username} helperText={errors.username?.message || ""} {...register("fullName", { required: true })} />
                <TextField id="email" type='email' label="email" variant="outlined" {...register("email", { required: true })} />
                <TextField id="password" type='password' label="password" variant="outlined" {...register("password", { required: true })} />
                <Button disabled={loading} type='submit'>{loading ? "submitting" : "Signup"}</Button>
            </Box>
        </>
    )
}

export default Signup