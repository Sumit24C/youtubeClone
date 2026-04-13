import { useState, useEffect } from "react";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import ChannelCard from "../components/Channel/ChannelCard";
import { extractErrorMsg } from "../utils";
import { Box, Typography, CircularProgress } from "@mui/material";
import { isCancel } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setChannels } from "../store/channelSlice";
import type { Channel } from "../types/channel";

type Subscription = {
    channel: Channel;
};

type ApiResponse<T> = {
    data: T;
};

type RootState = {
    channel: {
        channelData: Channel[];
    };
};

function SubscribedChannel() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const dispatch = useDispatch();

    const { channelData } = useSelector(
        (state: RootState) => state.channel
    );

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchSubscriptions = async (): Promise<void> => {
            setLoading(true);
            setErrorMsg("");

            try {
                const response = await axiosPrivate.get<
                    ApiResponse<Subscription[]>
                >(`/subscriptions/u`);

                const subscription = response.data.data;

                dispatch(
                    setChannels(subscription.map((s) => s.channel))
                );
            } catch (error: unknown) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, [axiosPrivate, dispatch]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", maxWidth: "900px", mx: "auto", mt: 3 }}>
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
            >
                All Subscriptions
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    width: "100%",
                }}
            >
                {errorMsg ? (
                    <Typography color="error">{errorMsg}</Typography>
                ) : channelData.length > 0 ? (
                    channelData.map((channel) => (
                        <ChannelCard
                            key={channel._id}
                            channelInfo={channel}
                        />
                    ))
                ) : (
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ textAlign: "center", mt: 4 }}
                    >
                        No subscribed channels
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default SubscribedChannel;