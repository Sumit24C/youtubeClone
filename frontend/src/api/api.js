import axios from 'axios'

const BASE_URL = "http://localhost:8000/api/v1"
export const isCancel = axios.isCancel
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true
})

export default api