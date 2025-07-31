import React, { useEffect, useState } from 'react'
import CardContainer from './CardContainer'
import { Grid, Box } from '@mui/material';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { isCancel } from 'axios';
import extractErrorMsg from '../../utils/extractErrorMsg';
function MainContainer() {

    const axiosPrivate = useAxiosPrivate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        setLoading(true);
        const controller = new AbortController();
        ; (async () => {
            try {
                const response = await axiosPrivate.get("/videos", {
                    signal: controller.signal
                });
                console.log(response.data.data)
                setVideos(response.data.data);

            } catch (error) {
                if (isCancel(error)) {
                    console.log("MainError :: error :: ", error)
                } else {
                    console.error(error);
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })()

        return () => {
            controller.abort();
        }
    }, [])

    if (loading) {
        return <>Loading ...</>
    }

    return (
        <>
            <Box
                display="grid"
                gridTemplateColumns="repeat(3, 1fr)"
                gap={2}
                minHeight="200px"
            >
                {videos && videos.length > 0 && (
                    videos.map((video, index) => (
                        <CardContainer video={video} key={index} />
                    ))
                )}
                {videos.length === 0 && (
                    <Box gridColumn="span 1" textAlign="center">
                        No videos available.
                    </Box>
                )}
            </Box>

        </>
    )
}

export default MainContainer