import Hls from "hls.js";

class VideoPlayer {

    constructor({
        playerElement,
        videoElement,
        controlsElement,
        playBtn,
        fullscreenBtn,
        progress,
        bufferBar,
        volume,
        qualitySelect,
        speedControl,
        timeDisplay,
        videoFile
    }) {
        this.player = playerElement;
        this.video = videoElement;
        this.controls = controlsElement;

        this.playBtn = playBtn;
        this.fullscreenBtn = fullscreenBtn;
        this.progress = progress;
        this.bufferBar = bufferBar;
        this.volume = volume;
        this.qualitySelect = qualitySelect;
        this.speedControl = speedControl;
        this.timeDisplay = timeDisplay;

        this.hls = null;
        this.hideTimeout = null;
        this.showControls = this.showControls.bind(this);
        this.init(videoFile);
    }

    init(videoFile) {
        this.initStreaming(videoFile);
        this.initControls();
        this.initKeyboard();
        this.initProgress();
        this.initVolume();
        this.initQuality();
        this.initPlaybackSpeed();
        this.initAutoHide();
    }

    initStreaming(videoFile) {
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

    togglePlay() {
        this.video.paused ? this.video.play() : this.video.pause();
    }

    toggleFullscreen() {
        if (document.fullscreenElement !== this.player) {
            this.player.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    initQuality() {
        if (!this.qualitySelect) return;
        const autoOption = document.createElement("option")
        autoOption.value = -1
        autoOption.textContent = "Auto"
        autoOption.selected = true

        this.qualitySelect.appendChild(autoOption)

        if (!this.hls) return

        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.hls.levels.forEach((level, index) => {
                const option = document.createElement("option")
                option.value = index
                option.textContent = level.height + "p"
                this.qualitySelect.appendChild(option)
            })
        })

        this.qualitySelect.addEventListener("change", () => {
            this.hls.currentLevel = parseInt(this.qualitySelect.value)
        })

    }

    initControls() {

        this.playBtn.addEventListener("click", () => this.togglePlay());
        this.video.addEventListener("click", () => this.togglePlay());
        this.video.addEventListener("dblclick", () => this.toggleFullscreen());

        this.fullscreenBtn.addEventListener(
            "click",
            () => this.toggleFullscreen()
        );
    }

    initKeyboard() {
        document.addEventListener("keydown", (e) => {
            const active = document.activeElement.tagName

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

            }
        })
    }

    initProgress() {
        this.video.addEventListener("timeupdate", () => {
            if (!this.video.duration) return;

            const percent = (this.video.currentTime / this.video.duration) * 100;
            this.progress.value = percent;

            const current = this.formatTime(this.video.currentTime);
            console.log(current)
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
            const time = (this.progress.value / 100) * this.video.duration;
            this.video.currentTime = time;
        });
    }

    initVolume() {
        this.volume.addEventListener("input", () => {
            this.video.volume = this.volume.value;
        });
    }

    initPlaybackSpeed() {
        if (!this.speedControl) return;
        ["0.5", "0.75", "1", "1.25", "1.5", "2"].forEach(speed => {
            const option = document.createElement("option")
            option.value = speed
            option.textContent = speed + "x"
            if (speed === "1") option.selected = true
            this.speedControl.appendChild(option)
        });

        this.speedControl.addEventListener("change", () => {
            this.video.playbackRate = parseFloat(this.speedControl.value);
        });
    }

    initAutoHide() {
        this.video.addEventListener("play", this.showControls);

        this.player.addEventListener(
            "mousemove",
            this.showControls
        );
    }

    showControls() {
        this.controls.classList.remove("hide");
        clearTimeout(this.hideTimeout);

        this.hideTimeout = setTimeout(() => {
            this.controls.classList.add("hide");
        }, 2000);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    loadVideo(videoFile) {
        if (this.hls) {
            this.hls.stopLoad();
            this.hls.detachMedia();
            this.hls.destroy();
            this.hls = null;
        }

        this.initStreaming(videoFile);
    }

    destroy() {
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