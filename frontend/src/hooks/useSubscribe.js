import { useAxiosPrivate } from './useAxiosPrivate';
import { isCancel } from 'axios';
import { useEffect, useState, useRef } from 'react';
import { addChannel, removeChannel } from "../store/channelSlice";
import { useDispatch } from 'react-redux';

const useSubscribe = (channel) => {
    const [subscribeLoading, setSubscribeLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(channel.isSubscribed);
    const [subscribersCount, setSubscribersCount] = useState(channel.subscribersCount);
    const channelId = channel._id;
    const axiosPrivate = useAxiosPrivate();
    const controller = useRef(null);
    controller.current = new AbortController();
    const dispatch = useDispatch();
    const handleSubscribe = async () => {
        setSubscribeLoading(true);
        try {
            const response = await axiosPrivate.post(`/subscriptions/c/${channelId}`, {
                signal: controller.current.signal
            });

            const subscribedRes = response.data.data.isSubscribed
            setSubscribed(subscribedRes);

            if (subscribedRes) {
                dispatch(addChannel({...channel, subscribersCount: subscribersCount + 1}))
                setSubscribersCount(prev => prev + 1)
            } else {
                dispatch(removeChannel({...channel, subscribersCount: subscribersCount - 1}))
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
