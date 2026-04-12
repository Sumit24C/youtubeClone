import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import { isCancel } from "axios";
import VideoPlayer from "../../utils/videoPlayer";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
} from "lucide-react";

const CustomVideoPlayer = ({ videoFile, thumbnail, isEdit = false }) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const [watchTime, setWatchTime] = useState(0);
    const [view, setView] = useState({});
    const [showSettings, setShowSettings] = useState(false);
    const controllerRef = useRef(null);

    const playerRef = useRef(null);
    const videoRef = useRef(null);
    const controlsRef = useRef(null);

    const playBtnRef = useRef(null);
    const centerPlayRef = useRef(null);
    const fullscreenBtnRef = useRef(null);
    const progressRef = useRef(null);
    const bufferRef = useRef(null);
    const volumeRef = useRef(null);
    const qualityRef = useRef(null);
    const speedRef = useRef(null);
    const timeRef = useRef(null);

    const playerInstance = useRef(null);

    useEffect(() => {
        if (isEdit) return;

        (async function () {
            try {
                setLoading(true);

                const response = await axiosPrivate.get(`/views/${id}`);

                setView(response.data.data);

                if (response.data?.data?.watchTime) {
                    setWatchTime(response.data.data.watchTime);
                }
            } catch (error) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id, axiosPrivate, isEdit]);

    useEffect(() => {
        if (
            !videoRef.current ||
            !playBtnRef.current ||
            !progressRef.current ||
            !volumeRef.current
        ) {
            return;
        }
        
        playerInstance.current?.destroy();
        playerInstance.current = new VideoPlayer({
            playerElement: playerRef.current,
            videoElement: videoRef.current,
            controlsElement: controlsRef.current,

            playBtn: playBtnRef.current,
            fullscreenBtn: fullscreenBtnRef.current,
            progress: progressRef.current,
            bufferBar: bufferRef.current,
            volume: volumeRef.current,
            qualitySelect: qualityRef.current,
            speedControl: speedRef.current,
            timeDisplay: timeRef.current,

            videoFile,
        });

        return () => playerInstance.current?.destroy();
    }, [videoFile]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) return;

        if (watchTime && !isEdit) {
            const setTime = () => {
                video.currentTime = watchTime;
            };
            video.addEventListener("loadedmetadata", setTime);

            return () => {
                video.removeEventListener("loadedmetadata", setTime);
            };
        }
    }, [watchTime, isEdit]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || isEdit) return;

        const handleTimeUpdate = () => {
            setWatchTime(video.currentTime);
        };

        video.addEventListener("timeupdate", handleTimeUpdate);

        const sendView = async (isCompleted = false) => {
            try {
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
                    },
                );
            } catch (error) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            }
        };

        const handlePause = () => {
            if (video.currentTime >= video.duration - 0.1) return;

            sendView(false);
        };

        const handleEnded = () => sendView(true);

        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);

        const handleBeforeUnload = () => sendView(view.isCompleted);

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);

            window.removeEventListener("beforeunload", handleBeforeUnload);

            if (controllerRef.current) {
                controllerRef.current.abort();
            }
        };
    }, [id, axiosPrivate, isEdit, view]);

    return (
        <Box className="w-full max-w-[900px] mx-auto">
            <div
                ref={playerRef}
                className="group relative w-full aspect-video bg-black rounded-lg overflow-hidden"
            >
                {/* VIDEO */}
                <video
                    ref={videoRef}
                    poster={thumbnail}
                    className="absolute inset-0 w-full h-full object-contain"
                    playsInline
                    preload="metadata"
                />

                {/* CENTER PLAY BUTTON */}
                <button
                    ref={centerPlayRef}
                    className="absolute inset-0 flex items-center justify-center z-20"
                >
                    <Play size={70} className="text-white opacity-80" />
                </button>

                {/* CONTROLS */}
                <div
                    ref={controlsRef}
                    className="
        absolute bottom-0 left-0 w-full
        bg-gradient-to-t from-black/90 via-black/40 to-transparent
        px-4 pb-3 pt-6
        opacity-0 group-hover:opacity-100
        transition-opacity duration-200
        z-30
        "
                >
                    {/* PROGRESS BAR */}
                    <div className="relative w-full mb-3">
                        <div
                            ref={bufferRef}
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] bg-gray-500 w-0 rounded"
                        />

                        <input
                            ref={progressRef}
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="0"
                            className="progress-bar w-full"
                        />
                    </div>

                    {/* CONTROL ROW */}
                    <div className="flex items-center justify-between text-white">
                        {/* LEFT CONTROLS */}
                        <div className="flex items-center gap-4">
                            <button ref={playBtnRef} className="player-btn">
                                <Play size={22} />
                            </button>

                            <div className="flex items-center gap-2">
                                <Volume2 size={20} />

                                <input
                                    ref={volumeRef}
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    defaultValue="1"
                                    className="volume-bar"
                                />
                            </div>

                            <span ref={timeRef} className="text-sm">
                                0:00 / 0:00
                            </span>
                        </div>

                        {/* RIGHT CONTROLS */}
                        <div className="flex items-center gap-4">
                            {/* SETTINGS MENU */}
                            <div className="relative">
                                <button
                                    className="player-btn"
                                    onClick={() => setShowSettings((prev) => !prev)}
                                >
                                    <Settings size={20} />
                                </button>

                                {showSettings && (
                                    <div
                                        className="
                  absolute bottom-12 right-0
                  bg-black/90 backdrop-blur
                  rounded-md
                  p-3
                  w-44
                  shadow-lg
                  flex flex-col gap-3
                  text-sm
                  "
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-300">Playback Speed</span>

                                            <select ref={speedRef} className="player-select w-full" />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-300">Quality</span>

                                            <select
                                                ref={qualityRef}
                                                className="player-select w-full"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <span className="text-gray-300">Subtitles</span>

                                            <select className="player-select w-full">
                                                <option>Off</option>
                                                <option>English</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button ref={fullscreenBtnRef} className="player-btn">
                                <Maximize size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    );
};

export default CustomVideoPlayer;
