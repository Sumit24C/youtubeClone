import { useState, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { extractErrorMsg } from "../utils";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import ChannelHeader from "../components/Channel/ChannelHeader";
import ChannelTabs from "../components/Channel/ChannelTabs";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { Channel } from "../types/channel";

function ChannelPage() {
    const { id } = useParams<{ id?: string }>();

    const [channelInfo, setChannelInfo] = useState<Channel | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const axiosPrivate = useAxiosPrivate();

    const fetchChannelInfo = async (): Promise<void> => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await axiosPrivate.get(
                `/users/channel-profile/${id}`
            );

            setChannelInfo(response.data.data);
        } catch (error: unknown) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChannelInfo();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    if (errorMsg) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <Typography color="error">{errorMsg}</Typography>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" px={{ xs: 2, md: 6 }} mt={2}>
            {channelInfo && (
                <>
                    <ChannelHeader
                        channelInfo={channelInfo}
                        fetchChannelInfo={fetchChannelInfo}
                    />
                    <ChannelTabs />
                    <Outlet />
                </>
            )}
        </Box>
    );
}

export default ChannelPage;