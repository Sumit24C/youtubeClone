import { useState } from "react";
import api from "../api";
import {useNavigate, Navigate} from 'react-router-dom'

const ProtectedRoutes = async ({ children }) => {

    const [isAuthorized, setIsAuthorized] = useState(false)
    const refreshToken = async () => {

    }

    const auth = async () => {
        try {
            await api.post('/users/current-user')
            setIsAuthorized(true)
        } catch (error) {
            if (error.response?.status === 401) {
                decodeToken = 
                await refreshToken()
            } else {
                setIsAuthorized(false)
            }
        }
    }

    return (    
        isAuthorized ? children : <Navigate to='/login'/>
    )
}