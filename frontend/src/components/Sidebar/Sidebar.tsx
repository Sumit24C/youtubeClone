import {
    Home as HomeIcon,
    Subscriptions as SubscriptionsIcon,
    History as HistoryIcon,
    PlaylistPlay as PlaylistIcon,
    ThumbUp as LikedIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import CustomListItems from "./CustomListItems";
import { useEffect, useState } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import { isCancel } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setChannels } from "../../store/channelSlice";

export default function Sidebar({ open }: { open: boolean }) {
    const primaryMenuItems = [
        { name: "Home", path: "/", icon: <HomeIcon /> },
        { name: "Subscriptions", path: "/subscriptions", icon: <SubscriptionsIcon /> },
    ];

    const secondaryMenuItems = [
        { name: "History", path: "/history", icon: <HistoryIcon /> },
        { name: "Playlists", path: "/playlist", icon: <PlaylistIcon /> },
        { name: "Liked Videos", path: "/liked-videos", icon: <LikedIcon /> },
    ];

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const dispatch = useDispatch();
    const { channelData } = useSelector((state: any) => state.channel);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        setLoading(true);
        setErrorMsg("");

        (async function () {
            try {
                const response = await axiosPrivate.get("/subscriptions/u");
                const subscription = response.data.data;
                const channels = subscription.map((s: any) => s.channel);
                dispatch(setChannels(channels));
            } catch (error: any) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <aside
            className={`
        fixed top-0 left-0 h-screen
        bg-[#181818] text-gray-200
        border-r border-gray-800
        transition-[width] duration-150 ease-linear
        ${open ? "w-[240px]" : "w-[64px]"}
        z-50
      `}
        >
            {/* Header offset */}
            <div className="h-16" />

            {/* Scroll */}
            <div className="h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">

                {/* Primary */}
                <div className="px-2">
                    {primaryMenuItems.map((item) => (
                        <CustomListItems key={item.name} item={item} open={open} />
                    ))}
                </div>

                {open && (
                    <>
                        <div className="my-2 border-t border-gray-800" />

                        {/* Secondary */}
                        <div className="px-2">
                            {secondaryMenuItems.map((item) => (
                                <CustomListItems key={item.name} item={item} open={open} />
                            ))}
                        </div>

                        <div className="my-2 border-t border-gray-800" />

                        {/* Subscriptions */}
                        {channelData && channelData.length > 0 && (
                            <div className="px-2">
                                <Link
                                    to="/feed/channel"
                                    className="block px-3 py-2 text-xs text-gray-400 uppercase hover:text-white"
                                >
                                    Subscriptions
                                </Link>

                                {channelData.map((item: any) => (
                                    <CustomListItems
                                        key={item._id}
                                        channel={item}
                                        open={open}
                                        type="channel"
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </aside>
    );
}