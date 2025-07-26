import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { replace, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { logout } from '../store/authSlice.js'

function AuthLayout({ authenticated = true }) {

    const { status } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (authenticated && !status) {
            dispatch(logout())
            navigate('/login', { state: { from: location.pathname }, replace: true })
        } else if (!authenticated && status) {
            navigate('/', {replace: true})
        }
    }, [status, authenticated])

    return (
        <>
            <Outlet/>
        </>
    )
}

export default AuthLayout