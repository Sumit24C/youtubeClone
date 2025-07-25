import { createSlice } from "@reduxjs/toolkit";

const initialState ={
    status: null,
    userData: null,
    accessToken: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true
            state.userData = action.payload
            state.accessToken = action.payload.accessToken
        },
        logout: (state, action) => {
            state.status = false
            state.userData = null
            state.accessToken = null
        },
        refreshAccessToken: (state, action) => {
            state.accessToken = action.payload 
        }
    }
})

export const {login, logout, refreshAccessToken} = authSlice.actions
export default authSlice.reducer