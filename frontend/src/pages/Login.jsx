import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, TextField, Button, Input } from '@mui/material'
import axios, { axiosPrivate, isCancel } from '../api/api.js'
import { login, logout } from '../store/authSlice.js'
import { useDispatch, useSelector } from 'react-redux'
import extractErrorMsg from '../utils/extractErrorMsg.js'
import { useNavigate } from 'react-router-dom'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate.js'
function Login() {

    const axiosPrivate = useAxiosPrivate()
    const navigate = useNavigate()
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
            dispatch(login(res.data.data.user, {accessToken : res.data.data.accessToken}))
            navigate('/comment')
        } catch (error) {
            setLoading(false)
            dispatch(logout())
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
        <>
            <h1>{errMsg}</h1>
            <Box component={'form'} onSubmit={handleSubmit(submit)}>
                <TextField id="username" type='text' label="username" variant="outlined" placeholder='username or email' error={!!errors.username} helperText={errors?.username?.message} {...register("username", { required: true })} />
                <TextField id="password" type='password' label="password" variant="outlined" error={!!errors.username} helperText={errors?.username?.message} {...register("password", { required: true })} />
                <Button disabled={loading} type='submit'>{loading ? "submitting" : "Login"}</Button>
            </Box>
        </>
    )
}

export default Login