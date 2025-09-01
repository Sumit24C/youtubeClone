import {configureStore} from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import channelReducer from "./channelSlice.js"

const store = configureStore({
    reducer: {
        auth: authReducer,
        channel: channelReducer,
    }
});

export default store;