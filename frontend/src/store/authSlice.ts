import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "../types/user";

const initialState: AuthState = {
    status: false,
    userData: undefined
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<any>) => {
            state.status = true;
            state.userData = action.payload;
        },
        logout: (state) => {
            state.status = false;
            state.userData = undefined;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;