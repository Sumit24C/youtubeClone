import React, { useEffect, useState } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate.js'
import {useNavigate, useLocation} from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../api/api.js'
function Comments() {

    const navigate = useNavigate()
const axiosPrivate = useAxiosPrivate()
    useEffect(() => {

        (async () => {
            try {
                const res = await axiosPrivate.get('/users/current-user')
                console.log(res.data.data)
            } catch (error) {
                console.log(error)
                navigate('/login')
            }
        })()
    }, [])

    return (
        <>
            <div>Hello, from comment</div>
            <div>user</div>
        </>
    )
}

export default Comments