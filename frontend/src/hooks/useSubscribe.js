import { useAxiosPrivate } from './useAxiosPrivate';
import { isCancel } from 'axios';
import { useEffect, useState, useRef } from 'react';
const useSubscribe = (channel) => {
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(channel.isSubscribed);
    const [subscribersCount, setSubscribersCount] = useState(channel.subscribersCount);
    const channelId = channel._id;
    const axiosPrivate = useAxiosPrivate();
    const controller = useRef(null);
    controller.current = new AbortController();

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.post(`/subscriptions/c/${channelId}`, {
                signal: controller.current.signal
            });

            const subscribedRes = response.data.data.isSubscribed
            setSubscribed(subscribedRes);

            if (subscribedRes) {
                setSubscribersCount(prev => prev + 1)
            } else {
                setSubscribersCount(prev => prev - 1)
            }

        } catch (error) {
            if (isCancel(error)) {
                console.error("subscribeAxios :: error :: ", error)
            } else {
                console.error("subscribe :: error :: ", error)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            controller.current?.abort();
        }
    }, [])

    return { loading, subscribed, subscribersCount, handleSubscribe };

};

export { useSubscribe };
