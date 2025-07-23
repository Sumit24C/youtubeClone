import axios from 'axios'

export const isCancel = axios.isCancel
const api = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    withCredentials: true
})

export default api