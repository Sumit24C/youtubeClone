import React, { useState } from "react";
import {
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { useEffect } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate.js"
import extractErrorMsg from "../../utils/extractErrorMsg.js";
import { isCancel } from "axios";
import { displayWatchTime } from "../../utils/displayWatchTime.js";

function ChannelStats() {

    const [loading, setLoading] = useState(false);
    const [viewsCount, setViewsCount] = useState(0);
    const [likesCount, setLikesCount] = useState(0);
    const [watchTime, setWatchTime] = useState(0);
    const [subscribersCount, setSubscribersCount] = useState(0);

    const axioxPrivate = useAxiosPrivate();

    useEffect(() => {
        ; (async function () {
            setLoading(true);
            try {
                const res = await axioxPrivate.get("/dashboard/stats");
                setLikesCount(res.data.data.videoStats.totalLikes);
                setWatchTime(res.data.data.videoStats.totalWatchTime);
                setViewsCount(res.data.data.videoStats.totalViews);
                setSubscribersCount(res.data.data.totalSubscribers);
            } catch (error) {
                if (isCancel(error)) {
                    console.error("axiosError :: error :: ", error)
                } else {
                    console.error("channelStats :: error :: ", error);
                    extractErrorMsg(error);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const analytics = {
        subscribers: subscribersCount,
        views: viewsCount,
        likes: likesCount,
        watchTime: displayWatchTime(watchTime),
    };

    return (
        <div>
            {!loading && (<Grid container spacing={2} sx={{ width: "auto" }}>
                {[
                    { label: "Subscribers", value: analytics.subscribers },
                    { label: "Views", value: analytics.views },
                    { label: "Likes", value: analytics.likes },
                    { label: "WatchTime", value: analytics.watchTime },
                ].map((item, index) => (
                    <Grid key={index}>
                        <Paper
                            sx={{
                                p: 1.5,
                                px: 2,
                                minWidth: 120,
                                bgcolor: "#1e1e1e",
                                borderRadius: 2,
                                textAlign: "center",
                            }}
                        >
                            <Typography variant="subtitle2" color="gray">
                                {item.label}
                            </Typography>
                            <Typography variant="h6">{item.value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>)}
        </div>
    )
}

export default ChannelStats