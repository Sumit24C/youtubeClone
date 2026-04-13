import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Channel } from "../types/channel";

type ChannelState = {
    channelData: Channel[];
};

const initialState: ChannelState = {
    channelData: [],
};

const channelSlice = createSlice({
    name: "channel",
    initialState,
    reducers: {
        setChannels: (state, action: PayloadAction<Channel[]>) => {
            state.channelData = action.payload;
        },
        addChannel: (state, action: PayloadAction<Channel>) => {
            state.channelData.push(action.payload);
        },
        removeChannel: (state, action: PayloadAction<Channel>) => {
            state.channelData = state.channelData.filter(
                (c) => c._id !== action.payload._id
            );
        },
    },
});

export const { setChannels, addChannel, removeChannel } =
    channelSlice.actions;

export default channelSlice.reducer;