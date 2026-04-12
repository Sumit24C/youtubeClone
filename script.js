class VideoPlayer {

    constructor() {
        this.player = document.getElementById("player")
        this.video = document.getElementById("video")
        this.controls = document.getElementById("controls")

        this.playBtn = document.getElementById("playBtn")
        this.fullscreenBtn = document.getElementById("fullscreen")
        this.progress = document.getElementById("progress")
        this.bufferBar = document.getElementById("bufferBar")
        this.volume = document.getElementById("volume")
        this.qualitySelect = document.getElementById("quality")
        this.speedControl = document.getElementById("playbackSpeed")
        this.timeDisplay = document.getElementById("timeDisplay")
        this.showControls = this.showControls.bind(this)
        this.hideTimeout = null
        this.hls = null
        this.init()
    }

    init() {
        this.initStreaming()
        this.initControls()
        this.initKeyboard()
        this.initProgress()
        this.initVolume()
        this.initQuality()
        this.initPlaybackSpeed()
        this.initAutoHide()
    }

    togglePlay() {
        this.video.paused ? this.video.play() : this.video.pause()
    }

    toggleFullscreen() {
        if (document.fullscreenElement !== this.player) {
            this.player.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    initStreaming() {
        if (Hls.isSupported()) {
            this.hls = new Hls()
            const src = "https://pub-0d3bc5fede3940478b0020fa451076dc.r2.dev/videos/da92c904-bd22-4e9b-a546-15c0fbd9f486/hls/master.m3u8"
            this.hls.loadSource(src)
            this.hls.attachMedia(this.video)
        }
    }

    initQuality() {
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

    initPlaybackSpeed() {
        this.speedControl.addEventListener("change", () => {
            const speed = parseFloat(this.speedControl.value)
            this.video.playbackRate = speed
        })
    }

    initControls() {
        this.playBtn.addEventListener(
            "click",
            () => this.togglePlay()
        )
        this.video.addEventListener("click", () => {
            this.togglePlay()
        })
        this.video.addEventListener("dblclick", () => {
            this.toggleFullscreen()
        })
        this.fullscreenBtn.addEventListener(
            "click",
            () => this.toggleFullscreen()
        )
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

        this.video.addEventListener("loadedmetadata", () => {
            const total = this.formatTime(this.video.duration)
            this.timeDisplay.textContent = `0:00 / ${total}`
        })

        this.video.addEventListener("timeupdate", () => {
            if (!this.video.duration) return
            const percent = (this.video.currentTime / this.video.duration) * 100
            this.progress.value = percent
            const current = this.formatTime(this.video.currentTime)
            const total = this.formatTime(this.video.duration)
            this.timeDisplay.textContent = `${current} / ${total}`
        })

        this.video.addEventListener("progress", () => {
            if (!this.video.duration) return
            if (this.video.buffered.length === 0) return
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1)
            const percent = (bufferedEnd / this.video.duration) * 100
            this.bufferBar.style.width = percent + "%"
        })

        this.progress.addEventListener("input", () => {
            const time = (this.progress.value / 100) * this.video.duration
            this.video.currentTime = time
        })

    }

    initVolume() {
        this.volume.addEventListener("input", () => {
            this.video.volume = this.volume.value
        })
    }

    initAutoHide() {
        this.video.addEventListener("play", this.showControls)
        this.player.addEventListener("mousemove", this.showControls)
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    showControls() {
        this.controls.classList.remove("hide")
        clearTimeout(this.hideTimeout)
        this.hideTimeout = setTimeout(() => {
            this.controls.classList.add("hide")
        }, 2000)
    }
}

new VideoPlayer()