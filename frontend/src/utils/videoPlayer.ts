import Hls from "hls.js";

type Controls = {
    playBtn: HTMLElement;
    fullscreenBtn: HTMLElement;
};

type Timeline = {
    progress: HTMLInputElement;
    bufferBar: HTMLElement;
    timeDisplay: HTMLElement;
};

type Audio = {
    volume: HTMLInputElement;
};

type Settings = {
    qualitySelect?: HTMLSelectElement | null;
    speedControl?: HTMLSelectElement | null;
};

type VideoPlayerConfig = {
    playerElement: HTMLElement;
    videoElement: HTMLVideoElement;
    controlsElement: HTMLElement;

    controls: Controls;
    timeline: Timeline;
    audio: Audio;
    settings?: Settings;

    videoFile: string;

    onPlayStateChange: (playing: boolean) => void
    onVolumeStateChange: (volume: number) => void
};

class VideoPlayer {
    private player: HTMLElement;
    private video: HTMLVideoElement;
    private controls: HTMLElement;

    private playBtn: HTMLElement;
    private fullscreenBtn: HTMLElement;
    private progress: HTMLInputElement;
    private bufferBar: HTMLElement;
    private volume: HTMLInputElement;
    private qualitySelect?: HTMLSelectElement | null;
    private speedControl?: HTMLSelectElement | null;
    private timeDisplay: HTMLElement;

    private hls: Hls | null;
    private hideTimeout: ReturnType<typeof setTimeout> | null;
    private onPlayStateChange: (playing: boolean) => void;
    private onVolumeStateChange: (volume: number) => void;

    constructor({
        playerElement,
        videoElement,
        controlsElement,
        controls,
        timeline,
        audio,
        settings,
        videoFile,
        onPlayStateChange,
        onVolumeStateChange,
    }: VideoPlayerConfig) {
        this.player = playerElement;
        this.video = videoElement;
        this.controls = controlsElement;

        this.playBtn = controls.playBtn;
        this.fullscreenBtn = controls.fullscreenBtn;

        this.progress = timeline.progress;
        this.bufferBar = timeline.bufferBar;
        this.timeDisplay = timeline.timeDisplay;

        this.volume = audio.volume;

        this.qualitySelect = settings?.qualitySelect;
        this.speedControl = settings?.speedControl;

        this.hls = null;
        this.hideTimeout = null;

        this.onPlayStateChange = onPlayStateChange;
        this.onVolumeStateChange = onVolumeStateChange;

        this.showControls = this.showControls.bind(this);

        this.init(videoFile);
    }

    private init(videoFile: string): void {
        this.initStreaming(videoFile);
        // this.initControls();
        // this.initKeyboard();
        this.initProgress();
        // this.initQuality();
        this.initPlaybackSpeed();
        this.initAutoHide();
    }

    private initStreaming(videoFile: string): void {
        if (!videoFile) return;
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }

        if (Hls.isSupported()) {
            this.hls = new Hls({
                capLevelToPlayerSize: true
            });

            this.hls.loadSource(videoFile);
            this.hls.attachMedia(this.video);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.video.style.width = "100%";
                this.video.style.height = "100%";
                this.video.style.objectFit = "contain";
            });
        }
    }

    private togglePlay(): void {
        this.video.paused ? this.video.play() : this.video.pause();
    }

    private toggleMute(): void {
        if (this.video.muted) {
            this.onVolumeStateChange(0);
        } else {
            this.onVolumeStateChange(this.video.volume);
        }

        this.video.muted = !this.video.muted;
    }

    private toggleFullscreen(): void {
        if (document.fullscreenElement !== this.player) {
            this.player.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    private initQuality(): void {
        if (!this.qualitySelect || !this.hls) return;
        const select = this.qualitySelect;
        const hlsObj = this.hls;
        const autoOption = document.createElement("option")
        autoOption.value = "-1"
        autoOption.textContent = "Auto"
        autoOption.selected = true

        select.appendChild(autoOption)
        hlsObj.on(Hls.Events.MANIFEST_PARSED, () => {
            hlsObj?.levels.forEach((level, index) => {
                const option = document.createElement("option")
                option.value = `${index}`
                option.textContent = level.height + "p"
                select?.appendChild(option)
            })
        })

        select.addEventListener("change", () => {
            hlsObj.currentLevel = parseInt(select.value)
        });
    }

    private initControls(): void {

        this.video.addEventListener("play", () => {
            this.player.classList.add("playing");
            this.onPlayStateChange(true);
        });

        this.video.addEventListener("pause", () => {
            this.player.classList.remove("playing");
            this.onPlayStateChange(false);
        });

        this.playBtn.addEventListener("click", () => this.togglePlay());
        this.player.addEventListener("click", (e) => {
            if ((e.target as HTMLElement).closest("button, input, select")) return;
            this.togglePlay()
        });

        this.video.addEventListener("dblclick", () => this.toggleFullscreen());

        this.fullscreenBtn.addEventListener(
            "click",
            () => this.toggleFullscreen()
        );
    }

    private initKeyboard(): void {
        document.addEventListener("keydown", (e) => {
            const active = document.activeElement?.tagName

            if (active === "INPUT" || active === "TEXTAREA")
                return

            switch (e.code) {

                case "Space":
                    e.preventDefault()
                    this.togglePlay()
                    break

                case "ArrowRight":
                    this.video.currentTime = Math.min(this.video.currentTime + 10, this.video.duration)
                    break

                case "ArrowLeft":
                    this.video.currentTime = Math.max(this.video.currentTime - 10, 0)
                    break

                case "ArrowUp":
                    this.video.volume =
                        Math.min(this.video.volume + 0.1, 1)
                    break

                case "ArrowDown":
                    this.video.volume =
                        Math.max(this.video.volume - 0.1, 0)
                    break

                case "KeyF":
                    this.toggleFullscreen()
                    break

                case "KeyM":
                    this.toggleMute()
                    break
            }
        })
    }

    private initProgress(): void {
        this.video.addEventListener("timeupdate", () => {
            if (!this.video.duration) return;

            const percent = (this.video.currentTime / this.video.duration) * 100;
            this.progress.value = `${percent}`;

            const current = this.formatTime(this.video.currentTime);
            const total = this.formatTime(this.video.duration);

            this.timeDisplay.textContent = `${current} / ${total}`;
        });

        this.video.addEventListener("progress", () => {
            if (!this.video.duration) return;
            if (this.video.buffered.length === 0) return;

            const bufferedEnd = this.video.buffered.end(
                this.video.buffered.length - 1
            );

            const percent = (bufferedEnd / this.video.duration) * 100;
            this.bufferBar.style.width = percent + "%";
        });

        this.progress.addEventListener("input", () => {
            const time = (Number(this.progress.value) / 100) * this.video.duration;
            this.video.currentTime = time;
        });
    }

    private initPlaybackSpeed(): void {
        if (!this.speedControl) return;
        const speedObj = this.speedControl;
        ["0.5", "0.75", "1", "1.25", "1.5", "2"].forEach(speed => {
            const option = document.createElement("option")
            option.value = speed
            option.textContent = speed + "x"
            if (speed === "1") option.selected = true
            speedObj?.appendChild(option)
        });

        this.speedControl.addEventListener("change", () => {
            this.video.playbackRate = parseFloat(speedObj.value);
        });
    }

    private initAutoHide(): void {
        this.video.addEventListener("play", this.showControls);

        this.player.addEventListener(
            "mousemove",
            this.showControls
        );
    }

    private showControls(): void {
        this.controls.classList.remove("hide");
        clearTimeout(Number(this.hideTimeout));

        this.hideTimeout = setTimeout(() => {
            this.controls.classList.add("hide");
        }, 2000);
    }

    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    public loadVideo(videoFile: string): void {
        if (this.hls) {
            this.hls.stopLoad();
            this.hls.detachMedia();
            this.hls.destroy();
            this.hls = null;
        }

        this.initStreaming(videoFile);
    }

    public destroy(): void {
        if (this.hls) {
            this.hls.destroy();
        }
        if (this.video) {
            this.video.pause();
            this.video.removeAttribute("src");
            this.video.load();
        }
    }
}

export default VideoPlayer;