import { useState } from "react";
import { isCancel } from "axios";
import { useAxiosPrivate } from "./useAxiosPrivate";
import { addChannel, removeChannel } from "../store/channelSlice";
import { useDispatch } from "react-redux";
import type { Channel } from "../types/channel";

const useSubscribe = (channel: Channel) => {
    const [subscribeLoading, setSubscribeLoading] = useState<boolean>(false);
    const [subscribed, setSubscribed] = useState<boolean>(
        channel.isSubscribed
    );
    const [subscribersCount, setSubscribersCount] = useState<number>(
        channel.subscribersCount
    );

    const channelId = channel._id;

    const axiosPrivate = useAxiosPrivate();
    const dispatch = useDispatch();

    const handleSubscribe = async (): Promise<void> => {
        setSubscribeLoading(true);

        try {
            const response = await axiosPrivate.post(
                `/subscriptions/c/${channelId}`
            );

            const subscribedRes: boolean = response.data.data.isSubscribed;

            setSubscribed(subscribedRes);

            if (subscribedRes) {
                dispatch(
                    addChannel({
                        ...channel,
                        subscribersCount: subscribersCount + 1,
                    })
                );
                setSubscribersCount((prev) => prev + 1);
            } else {
                dispatch(
                    removeChannel({
                        ...channel,
                        subscribersCount: subscribersCount - 1,
                    })
                );
                setSubscribersCount((prev) => prev - 1);
            }
        } catch (error: any) {
            setSubscribeLoading(false);

            if (isCancel(error)) {
                console.error("subscribeAxios :: error :: ", error);
            } else {
                console.error("subscribe :: error :: ", error);
            }
        } finally {
            setSubscribeLoading(false);
        }
    };

    return {
        subscribeLoading,
        subscribed,
        subscribersCount,
        handleSubscribe,
    };
};

export { useSubscribe };