import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import { isCancel } from "axios";
import VideoPlayer from "../../utils/videoPlayer";
import { Play, Maximize, Settings } from "lucide-react";

type View = {
    watchTime: number;
    isCompleted: boolean;
};

type Props = {
    videoFile?: string;
    thumbnail?: string;
    isEdit?: boolean;
};

const CustomVideoPlayer = ({
    videoFile,
    thumbnail,
    isEdit = false,
}: Props) => {
    const { id } = useParams<{ id: string }>();
    const axiosPrivate = useAxiosPrivate();

    const [watchTime, setWatchTime] = useState<number>(0);
    const [view, setView] = useState<View | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    const controllerRef = useRef<AbortController | null>(null);

    const controlsRef = useRef({
        playBtn: null as HTMLButtonElement | null,
        fullscreenBtn: null as HTMLButtonElement | null,
    });

    const timelineRef = useRef({
        progress: null as HTMLInputElement | null,
        bufferBar: null as HTMLDivElement | null,
        timeDisplay: null as HTMLSpanElement | null,
    });

    const audioRef = useRef({
        volume: null as HTMLInputElement | null,
    });

    const settingsRef = useRef({
        qualitySelect: null as HTMLSelectElement | null,
        speedControl: null as HTMLSelectElement | null,
    });

    const playerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const controlsContainerRef = useRef<HTMLDivElement | null>(null);

    const playerInstance = useRef<any>(null);
    useEffect(() => {
        if (!id || isEdit) return;

        (async () => {
            try {
                const res = await axiosPrivate.get<{ data: View }>(`/views/${id}`);

                setView(res.data.data);

                if (res.data.data?.watchTime) {
                    setWatchTime(res.data.data.watchTime);
                }
            } catch (error: any) {
                if (!isCancel(error)) extractErrorMsg(error);
            }
        })();
    }, [id, axiosPrivate, isEdit]);

    useEffect(() => {
        const controls = controlsRef.current;
        const timeline = timelineRef.current;
        const audio = audioRef.current;
        const settings = settingsRef.current;

        const playerEl = playerRef.current;
        const videoEl = videoRef.current;
        const controlsEl = controlsContainerRef.current;

        if (
            !videoFile ||
            !playerEl ||
            !videoEl ||
            !controlsEl ||
            !controls.playBtn ||
            !controls.fullscreenBtn ||
            !timeline.progress ||
            !timeline.timeDisplay ||
            !audio.volume
        ) return;

        playerInstance.current?.destroy();

        playerInstance.current = new VideoPlayer({
            playerElement: playerEl,
            videoElement: videoEl,
            controlsElement: controlsEl,

            controls: {
                playBtn: controls.playBtn,
                fullscreenBtn: controls.fullscreenBtn,
            },

            timeline: {
                progress: timeline.progress,
                bufferBar: timeline.bufferBar!,
                timeDisplay: timeline.timeDisplay,
            },

            audio: {
                volume: audio.volume,
            },

            settings,
            videoFile,
        });

        return () => playerInstance.current?.destroy();
    }, [videoFile]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || isEdit || !watchTime) return;

        const setTime = () => {
            video.currentTime = watchTime;
        };

        video.addEventListener("loadedmetadata", setTime);
        return () => video.removeEventListener("loadedmetadata", setTime);
    }, [watchTime, isEdit]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || isEdit || !id) return;

        const sendView = async (isCompleted = false) => {
            try {
                controllerRef.current?.abort();
                controllerRef.current = new AbortController();

                await axiosPrivate.post(
                    `/views/${id}`,
                    {},
                    {
                        params: {
                            watchTime: Math.floor(video.currentTime),
                            isCompleted,
                        },
                        signal: controllerRef.current.signal,
                    }
                );
            } catch (error: any) {
                if (!isCancel(error)) extractErrorMsg(error);
            }
        };

        const handlePause = () => {
            if (video.currentTime >= video.duration - 0.1) return;
            sendView(false);
        };

        const handleEnded = () => sendView(true);

        const handleBeforeUnload = () =>
            sendView(view?.isCompleted ?? false);

        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            controllerRef.current?.abort();
        };
    }, [id, axiosPrivate, isEdit, view]);

    return (
        <Box className="w-full max-w-[900px] mx-auto">
            <div
                ref={playerRef}
                className="group relative w-full aspect-video bg-black rounded-lg overflow-hidden"
            >
                <video
                    ref={videoRef}
                    poster={thumbnail}
                    className="absolute inset-0 w-full h-full object-contain"
                    playsInline
                    preload="metadata"
                />

                {/* Center Play */}
                <button className="absolute inset-0 flex items-center justify-center z-20">
                    <Play size={70} className="text-white opacity-80" />
                </button>

                {/* Controls */}
                <div
                    ref={controlsContainerRef}
                    className="absolute bottom-0 left-0 w-full opacity-0 group-hover:opacity-100 transition"
                >
                    <input
                        ref={(el) => { timelineRef.current.progress = el }}
                        type="range"
                        className="w-full"
                    />

                    <div
                        ref={(el) => { timelineRef.current.bufferBar = el }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] bg-gray-500 w-0 rounded"
                    />

                    <div className="flex justify-between text-white">
                        <button
                            ref={(el) => { controlsRef.current.playBtn = el }}
                        >
                            <Play size={20} />
                        </button>

                        <input
                            ref={(el) => { audioRef.current.volume = el }}
                            type="range"
                        />

                        <span
                            ref={(el) => { timelineRef.current.timeDisplay = el }}
                        >
                            0:00 / 0:00
                        </span>

                        <button onClick={() => setShowSettings((p) => !p)}>
                            <Settings size={20} />
                        </button>

                        <button
                            ref={(el) => { controlsRef.current.fullscreenBtn = el }}
                        >
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </Box>
    );
};

export default CustomVideoPlayer;