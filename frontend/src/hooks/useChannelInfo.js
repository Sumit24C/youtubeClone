import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { isCancel } from 'axios';
import { useAxiosPrivate } from './useAxiosPrivate';

function useChannelInfo() {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const controller = useRef(null);
    controller.current = new AbortController();

    const handleChannelInfo = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.post(`/users/channel-profile/${id}`, {
                signal: controller.current.signal
            });

            console.log(response.data.data)

        } catch (error) {
            if (isCancel(error)) {
                console.error("channelInfoAxios :: error :: ", error)
            } else {
                console.error("channelInfo :: error :: ", error)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            controller.current.abort();
        }
    }, [])

    return {  }
}

export { useChannelInfo };
