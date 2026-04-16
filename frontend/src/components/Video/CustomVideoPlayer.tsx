import { useEffect, useRef, useState, useCallback } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import { isCancel } from "axios";
import Hls from "hls.js";
import { Play, Maximize, Settings, Pause, Volume2, VolumeX, Subtitles } from "lucide-react";

type View = {
    watchTime: number;
    isCompleted: boolean;
};
type Subtitle = {
    subtitleUrl: string;
    language: string;
}

type Props = {
    videoFile?: string;
    thumbnail?: string;
    subtitles?: Subtitle[];
    isEdit?: boolean;
};

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const CustomVideoPlayer = ({ videoFile, thumbnail, subtitles, isEdit = false }: Props) => {
    const { id } = useParams<{ id: string }>();
    const axiosPrivate = useAxiosPrivate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [qualities, setQualities] = useState<{ label: string; value: number }[]>([]);
    const [selectedQuality, setSelectedQuality] = useState(-1);
    const [progress, setProgress] = useState(0);
    const [showSubtitles, setShowSubtitles] = useState(true);

    const [buffer, setBuffer] = useState(0);
    const [time, setTime] = useState("0:00 / 0:00");
    const [showSettings, setShowSettings] = useState(false);
    const [view, setView] = useState<View | null>(null);

    const playerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = 0;

        setProgress(0);
        setBuffer(0);
        setTime("0:00 / 0:00");
        setIsPlaying(false);
    }, [videoFile]);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.paused ? video.play() : video.pause();
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => {
            if (!prev) return true;
            setVolume((v) => (v === 0 ? 0.5 : v));
            return false;
        });
    }, []);

    const toggleFullscreen = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;
        if (document.fullscreenElement !== player) {
            player.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    const toggleSubtitles = useCallback(() => {
        const video = videoRef.current;
        if (!video || !video.textTracks.length || !video.textTracks[0]) return;
        setShowSubtitles((prev) => {
            video.textTracks[0].mode = prev ? "hidden" : "showing";
            return !prev;
        });
    }, []);

    useEffect(() => {
        if (!id || isEdit) return;

        const controller = new AbortController();

        (async () => {
            try {
                const res = await axiosPrivate.get<{ data: View }>(`/views/${id}`, {
                    signal: controller.signal,
                });
                const viewData = res.data.data;
                setView(viewData);

                const video = videoRef.current;
                const prevWatchTime = viewData.watchTime;

                if (video && prevWatchTime && prevWatchTime < video.duration) {
                    const setTime = () => { video.currentTime = viewData.watchTime };
                    if (video.readyState >= 1) {
                        setTime();
                    } else {
                        video.addEventListener("loadedmetadata", setTime, { once: true });
                    }
                }
            } catch (error: any) {
                if (!isCancel(error)) extractErrorMsg(error);
            }
        })();

        return () => controller.abort();
    }, [id, axiosPrivate, isEdit]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || isEdit || !id) return;

        const sendView = async (isCompleted: boolean) => {
            try {
                abortRef.current?.abort();
                abortRef.current = new AbortController();

                await axiosPrivate.post(
                    `/views/${id}`,
                    {},
                    {
                        params: { watchTime: Math.floor(video.currentTime), isCompleted },
                        signal: abortRef.current.signal,
                    }
                );
            } catch (error: any) {
                if (!isCancel(error)) extractErrorMsg(error);
            }
        };

        const handlePause = () => { if (video.currentTime < video.duration - 0.1) sendView(false); };
        const handleEnded = () => sendView(true);
        const handleUnload = () => sendView(view?.isCompleted ?? false);

        video.addEventListener("pause", handlePause);
        video.addEventListener("ended", handleEnded);
        window.addEventListener("beforeunload", handleUnload);

        return () => {
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("ended", handleEnded);
            window.removeEventListener("beforeunload", handleUnload);
            abortRef.current?.abort();
        };
    }, [id, axiosPrivate, isEdit, view]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoFile) return;

        hlsRef.current?.destroy();

        if (Hls.isSupported()) {
            const hls = new Hls({ capLevelToPlayerSize: true });
            hlsRef.current = hls;

            hls.loadSource(videoFile);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                const levels = hls.levels.map((l, i) => ({ label: `${l.height}p`, value: i }));
                setQualities([{ label: "Auto", value: -1 }, ...levels]);
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoFile;
        }

        return () => hlsRef.current?.destroy();
    }, [videoFile]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !subtitles?.length) return;

        const enableTrack = () => {
            if (video.textTracks[0]) {
                video.textTracks[0].mode = "showing";
                setShowSubtitles(true)
            }
        };

        if (video.readyState >= 1) enableTrack();
        else video.addEventListener("loadedmetadata", enableTrack, { once: true });
    }, [videoFile, subtitles]);

    useEffect(() => {
        if (hlsRef.current) hlsRef.current.currentLevel = selectedQuality;
    }, [selectedQuality]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = volume;
        video.muted = isMuted;
        video.playbackRate = playbackSpeed;
    }, [volume, isMuted, playbackSpeed]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        const onTimeUpdate = () => {
            if (!video.duration) return;
            setProgress((video.currentTime / video.duration) * 100);
            setTime(`${formatTime(video.currentTime)} / ${formatTime(video.duration)}`);
        };

        const onProgress = () => {
            if (!video.duration || video.buffered.length === 0) return;
            const end = video.buffered.end(video.buffered.length - 1);
            setBuffer((end / video.duration) * 100);
        };

        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("ended", onEnded);
        video.addEventListener("timeupdate", onTimeUpdate);
        video.addEventListener("progress", onProgress);

        return () => {
            video.removeEventListener("play", onPlay);
            video.removeEventListener("pause", onPause);
            video.removeEventListener("ended", onEnded);
            video.removeEventListener("timeupdate", onTimeUpdate);
            video.removeEventListener("progress", onProgress);
        };
    }, [videoFile]);

    useEffect(() => {
        const player = playerRef.current;
        const video = videoRef.current;
        if (!player || !video) return;

        const handleClick = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest("button, input, select")) return;
            togglePlay();
        };

        const handleDblClick = () => toggleFullscreen();

        player.addEventListener("click", handleClick);
        video.addEventListener("dblclick", handleDblClick);

        return () => {
            player.removeEventListener("click", handleClick);
            video.removeEventListener("dblclick", handleDblClick);
        };
    }, [togglePlay, toggleFullscreen]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const video = videoRef.current;
            const player = playerRef.current;
            if (!video || !player) return;
            if (document.activeElement?.tagName === "TEXTAREA") return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "ArrowRight":
                    video.currentTime = Math.min(video.currentTime + 10, video.duration);
                    break;
                case "ArrowLeft":
                    video.currentTime = Math.max(video.currentTime - 10, 0);
                    break;
                case "ArrowUp":
                    setVolume((v) => Math.min(+(v + 0.1).toFixed(1), 1));
                    break;
                case "ArrowDown":
                    setVolume((v) => Math.max(+(v - 0.1).toFixed(1), 0));
                    break;
                case "KeyF":
                    toggleFullscreen();
                    break;
                case "KeyM":
                    toggleMute();
                    break;
            }
        };

        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [togglePlay, toggleMute, toggleFullscreen]);

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
                    crossOrigin="anonymous"
                >
                    {subtitles?.map((sub, index) => (
                        <track
                            key={index}
                            src={sub.subtitleUrl}
                            kind="subtitles"
                            srcLang={sub.language}
                            label={sub.language.toUpperCase()}
                            default={index === 0}
                        />
                    ))}
                </video>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Controls */}
                <div className="absolute bottom-0 left-0 w-full px-3 pb-2 opacity-0 group-hover:opacity-100 transition duration-200 z-30">

                    {/* Progress / seek bar */}
                    <div className="relative w-full h-1 bg-gray-500/40 rounded cursor-pointer hover:h-2 transition-all">
                        {/* Buffer bar */}
                        <div
                            className="absolute top-0 left-0 h-full bg-gray-400/60 rounded pointer-events-none"
                            style={{ width: `${buffer}%` }}
                        />
                        {/* Seek input */}
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={progress}
                            onChange={(e) => {
                                const video = videoRef.current;
                                if (!video || !video.duration) return;
                                video.currentTime = (Number(e.target.value) / 100) * video.duration;
                            }}
                            className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-white text-sm">
                        <div className="flex items-center gap-3">

                            <button onClick={togglePlay} className="hover:scale-110 transition">
                                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                            </button>

                            <button onClick={toggleMute} className="hover:scale-110 transition">
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>

                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setVolume(val);
                                    setIsMuted(val === 0);
                                }}
                                className="w-20 accent-white"
                            />

                            <span className="text-xs">{time}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowSettings((p) => !p)}
                                className="hover:rotate-45 transition"
                            >
                                <Settings size={20} />
                            </button>

                            {subtitles?.length! > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleSubtitles(); }}
                                    className={`hover:scale-110 transition ${showSubtitles ? "text-white" : "text-gray-400"}`}
                                    title="Toggle Subtitles"
                                >
                                    <Subtitles size={20} />
                                </button>
                            )}

                            <button onClick={toggleFullscreen} className="hover:scale-110 transition">
                                <Maximize size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Settings panel */}
                    {showSettings && (
                        <div
                            data-no-toggle
                            className="absolute bottom-14 right-2 w-52 bg-[rgba(15,15,15,0.97)] border border-white/10 rounded-xl overflow-hidden text-white text-sm z-40"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="px-3.5 py-2 text-[10px] font-medium uppercase tracking-widest text-white/30 border-b border-white/8">
                                Settings
                            </div>

                            {/* Speed */}
                            <div className="px-3.5 py-2.5 border-b border-white/8">
                                <p className="text-[10px] text-white/40 font-medium mb-2">Playback speed</p>
                                <div className="flex flex-wrap gap-1">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setPlaybackSpeed(s)}
                                            className={`px-2.5 py-1 rounded-full text-xs border transition
                            ${playbackSpeed === s
                                                    ? "bg-white text-black border-white font-medium"
                                                    : "bg-transparent text-white/70 border-white/15 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            {s}×
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="px-3.5 py-2.5 border-b border-white/8">
                                <p className="text-[10px] text-white/40 font-medium mb-2">Quality</p>
                                <div className="flex flex-wrap gap-1">
                                    {qualities.map((q) => (
                                        <button
                                            key={q.value}
                                            onClick={() => setSelectedQuality(q.value)}
                                            className={`px-2.5 py-1 rounded-full text-xs border transition
                            ${selectedQuality === q.value
                                                    ? "bg-white text-black border-white font-medium"
                                                    : "bg-transparent text-white/70 border-white/15 hover:bg-white/10 hover:text-white"
                                                }`}
                                        >
                                            {q.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {subtitles?.length! > 0 && (
                                <div className="px-3.5 py-2.5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <Subtitles size={14} className="text-white/40" />
                                        Subtitles
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSubtitles(); }}
                                        className={`w-8 h-4.5 rounded-full relative transition-colors duration-200
                        ${showSubtitles ? "bg-white" : "bg-white/15"}`}
                                    >
                                        <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-transform duration-200
                        ${showSubtitles ? "translate-x-4 bg-black" : "translate-x-0.5 bg-white/60"}`}
                                        />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Box>
    );
};

export default CustomVideoPlayer;