import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate'
import { useRefreshToken } from '../hooks/useRefreshToken'
import { login } from '../store/authSlice'
import { Outlet } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material';

function PersistLogin() {
    const axiosPrivate = useAxiosPrivate()
    const refresh = useRefreshToken()
    const [loading, setLoading] = useState(true)
    const { userData } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    useEffect(() => {
        const verify = async () => {
            try {
                await refresh()
                const res = await axiosPrivate.get('/users/current-user')
                dispatch(login(res.data.data))
                console.log("user: ", res.data.data)
                return res.data.data
            } catch (error) {
                console.error(error)
                return false
            } finally {
                setLoading(false)
            }
        }

        (async () => {
            if (!userData) {
                await verify()
            } else {
                setLoading(false)
            }
        })()
    }, [userData])

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    width: '100%',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Outlet />
        </>
    )
}

export default PersistLogin