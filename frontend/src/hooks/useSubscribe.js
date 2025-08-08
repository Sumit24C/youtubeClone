import { useAxiosPrivate } from './useAxiosPrivate';
import { isCancel } from 'axios';
import { useEffect, useState, useRef } from 'react';
const useSubscribe = (channel) => {
    const [subscribeLoading, setSubscribeLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(channel.isSubscribed);
    const [subscribersCount, setSubscribersCount] = useState(channel.subscribersCount);
    const channelId = channel._id;
    const axiosPrivate = useAxiosPrivate();
    const controller = useRef(null);
    controller.current = new AbortController();

    const handleSubscribe = async () => {
        setSubscribeLoading(true);
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
            setSubscribeLoading(false)
            if (isCancel(error)) {
                console.error("subscribeAxios :: error :: ", error)
            } else {
                console.error("subscribe :: error :: ", error)
            }
        } finally {
            setSubscribeLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            controller.current?.abort();
        }
    }, [])

    return { subscribeLoading, subscribed, subscribersCount, handleSubscribe };

};

export { useSubscribe };
