import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    channelData: []
}

const channelSlice = createSlice({
    name: 'channel',
    initialState,
    reducers: {
        setChannels: (state, action) => {
            state.channelData = action.payload
        },
        addChannel: (state, action) => {
            state.channelData.push(action.payload)
        },
        removeChannel: (state, action) => {
            state.channelData = state.channelData.filter((c) => c._id !== action.payload._id)
        }
    }
})

export const { setChannels, addChannel, removeChannel } = channelSlice.actions
export default channelSlice.reducer