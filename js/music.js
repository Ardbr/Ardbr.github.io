class MusicPlayer {
    constructor() {
        this.firstPlay = true
        this.musicMode = 1
        this.current = 0

        this.musicList = ["/music/云烟成雨 - 房东的猫.mp3", "/music/使一颗心免于哀伤 - HOYO-MiX,Chevy,知更鸟.mp3", "/music/单向箭头 - 双笙 (陈元汐).mp3"]
        this.coverList = ["/img/云烟成雨-cover.webp", "/img/使一颗心免于哀伤-cover.jpg", "/img/单向箭头-cover.webp"]
        this.lyricList = ["/lyrics/云烟成雨.lrc", "/lyrics/使一颗心免于哀伤.lrc", "/lyrics/单向箭头.lrc"]

        this.lrcInfo = ""
        this.lyricIndex = 0
        this.lyricLoad = false

        this.audio = new Audio()
        this.cachedAudioBlobs = []
        this.cachedLyrics = []
        this.cachedLoad = []
    }

    checkScroll = () => {
        const $musicNameContainerEle = document.getElementById('music-name-container')
        const $musicNameEle = document.getElementById('music-name')
        console.log($musicNameContainerEle.offsetWidth, $musicNameEle.offsetWidth)
        if ($musicNameContainerEle.offsetWidth < $musicNameEle.offsetWidth) {
            $musicNameEle.classList.add('scroll')
        }
        else {
            $musicNameEle.classList.remove('scroll')
        }
    }

    // preload music
    preloadMusicAndLyric = () => {
        this.musicList.forEach((url, index) => {
            this.cachedLoad[index] = 0
            const requestMusic = new XMLHttpRequest()
            requestMusic.open("GET", url, true)
            requestMusic.responseType = "blob"
            requestMusic.onload = () => {
                if (requestMusic.status === 200) {
                    this.cachedAudioBlobs[index] = requestMusic.response
                    this.cachedLoad[index] += 1
                    console.log(`Loaded ${url}`)
                }
                else {
                    console.log("request error: ", requestMusic.status)
                }
            }
    
            requestMusic.onerror = () => {
                console.error(`Failed to load ${url}`)
            }

            requestMusic.send()
        })

        this.lyricList.forEach((url, index) => {

            const requestLyric = new XMLHttpRequest()
            requestLyric.open("GET", url, true)
            requestLyric.responseType = 'text'
            requestLyric.onload = () => {
                if (requestLyric.status === 200) {
                    this.cachedLyrics[index] = window.parseLyric(requestLyric.responseText)
                    this.cachedLoad[index] += 1
                    console.log(`Loaded ${url}`)
                }
                else {
                    console.log("request error: ", requestLyric.status)
                }
            }
    
            requestLyric.onerror = () => {
                console.error(`Failed to load ${url}`)
            }

            requestLyric.send()
        })
    }

    // format date(00:00)
    getFormattingTime = (time) => {
        var m = parseInt(time / 60)    // minute
        var s = parseInt(time % 60)    // second
        
        m = m > 9 ? m : "0" + m      // add zero
        s = s > 9 ? s : "0" + s
        return m + ":" + s
    }

    handleMusicEnded = () => {
        
        // list loop
        if (this.musicMode == 1){
            this.current = this.current == this.musicList.length - 1 ? 0 : this.current + 1
            this.loadMusicAndPlay(this.current)
        }
        // single loop
        else if(this.musicMode == 2){
            this.loadMusicAndPlay(this.current)
        }
        // random play
        else {
            this.current = Math.floor(Math.random() * this.musicList.length)
            this.loadMusicAndPlay(this.current)
        }
    }

    // load music and play
    loadMusicAndPlay = (id) => {
        
        let music = this.musicList[id]
        let cover = this.coverList[id]
        
        if (this.cachedAudioBlobs[id]) {
            this.audio.src = URL.createObjectURL(this.cachedAudioBlobs[id])
            this.audio.load()
            this.audio.play().catch(error => {
                console.error('Playback failed:', error)
            })
        }
        else {
            console.log("Audio not preload yet.")
        }

        // update the cover
        let $musicCoverEle = document.getElementById('music-cover')
        $musicCoverEle.style.backgroundImage = `url(${cover})`

        // update the status
        let $musicPlayOrPauseEle = document.getElementById('music-playOrPause')
        $musicPlayOrPauseEle.className = "music-icon iconfont icon-zanting"

        // update the name
        let $musicNameEle = document.getElementById("music-name")
        $musicNameEle.innerText = music.replace('/music/', '').replace('.flac', '').replace('.mp3', '').replace('.ogg', '')
        
        // get lyric content
        if (this.cachedLyrics[id]) {
            this.lrcInfo = this.cachedLyrics[id]
        }
        else {
            console.log("Lyric not preload yet.")
        }

        musicPlayer.lyricIndex = 0

        this.checkScroll()
    }

    handleMusicProgressBar = (event) => {
        let $musicProgressBar = document.getElementById('music-progressBar')
        const progressBarWidth = $musicProgressBar.clientWidth
        const clickX = event.clientX - $musicProgressBar.getBoundingClientRect().left // Click position relative to progress bar
        const clickPercentage = clickX / progressBarWidth // Calculate click position percentage
        this.audio.currentTime = clickPercentage * this.audio.duration // Update audio current time

        // redirect the index of lyric
        let i = 0
        while (i < this.lrcInfo.lrc.length && this.lrcInfo.lrc[i].timeMs < this.audio.currentTime * 1000) {
            i += 1
        }
        this.lyricIndex = i - 1
    }

    // play or pause
    handlePlayOrPause = () => {
        if (this.musicList.length > 0) {
            // if first play after open the website, we need to load and then play
            if (this.firstPlay) {
                if (this.cachedLoad[this.current] != 2) {
                    btf.snackbarShow("音乐加载中，请稍后～～")
                }
                else {
                    this.loadMusicAndPlay(this.current)
                    this.firstPlay = false
                }
            }
            else {
                if (this.audio.paused) this.audio.play()
                else this.audio.pause()
            }
        }
    }

    // previous music
    handlePrev = () => {

        if (this.musicList.length > 0){
            this.current = this.current == 0 ? this.musicList.length - 1 : this.current - 1
            if (this.cachedLoad[this.current] != 2) {
                btf.snackbarShow("音乐加载中，请稍后～～")
            }
            else {
                this.firstPlay = false
                this.loadMusicAndPlay(this.current)
            }
        }
    }

    // next music
    handleNext = () => {

        if (this.musicList.length > 0) {

            this.current = this.current == this.musicList.length - 1 ? 0 : this.current + 1
            if (this.cachedLoad[this.current] != 2) {
                btf.snackbarShow("音乐加载中，请稍后～～")
            }
            else {
                this.firstPlay = false
                this.loadMusicAndPlay(this.current)
            }
        }
    }

    // switch play mode
    handleMusicMode = () => {
        let $musicModeEle = document.getElementById('music-mode')
        if (this.musicMode == 1){
            this.musicMode = 2
            $musicModeEle.className = "music-icon iconfont icon-danquxunhuan"
        }
        else if (this.musicMode == 2){
            this.musicMode = 3
            $musicModeEle.className = "music-icon iconfont icon-suijibofang"
        }
        else {
            this.musicMode = 1
            $musicModeEle.className = "music-icon iconfont icon-liebiaoxunhuan"
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    musicPlayer = new MusicPlayer()
    let $musicProgressTextEle, $musicCurrentProgressEle, $musicDotEle, $musicLyricEle, $playOrPauseEle

    const updateProgressBar = () => {
        let currentTime = musicPlayer.audio.currentTime
            let totalTime = musicPlayer.audio.duration
            
            if (!isNaN(totalTime) && isFinite(totalTime)) {
                $musicProgressTextEle.innerText = musicPlayer.getFormattingTime(currentTime) + " / " + musicPlayer.getFormattingTime(totalTime)
                
                // current progressbar
                let width = Math.floor(currentTime / totalTime * 110)
                $musicCurrentProgressEle.style.width = width + "px"
                $musicDotEle.style.left = (width - 2.5) + "px"
            }

            let index = musicPlayer.lyricIndex
            nextIndex = index + 1 == musicPlayer.lrcInfo.lrc.length ? index : index + 1
            if (currentTime * 1000 < musicPlayer.lrcInfo.lrc[nextIndex].timeMs) {
                $musicLyricEle.innerText = musicPlayer.lrcInfo.lrc[index].lyric
            }
            else {
                musicPlayer.lyricIndex = nextIndex
                $musicLyricEle.innerText = musicPlayer.lrcInfo.lrc[musicPlayer.lyricIndex].lyric
            }
    }
    
    // event need to rebind after Pjax overload
    const refreshMusicFn = () => {

        // used in refreshMusicFn
        let $prevEle = document.getElementById('music-prev'),    // previous music
            $nextEle = document.getElementById('music-next'),   // next music
            $musicModeEle = document.getElementById('music-mode'), // switch the play mode
            $musicNameEle = document.getElementById('music-name'),
            $musicProgressBarEle = document.getElementById('music-progressBar'),
            $musicCoverEle = document.getElementById('music-cover')

        // used in unRefreshMusicFn
        $playOrPauseEle = document.getElementById('music-playOrPause'), // play or pause
        $musicProgressTextEle = document.getElementById('music-progressText')
        $musicCurrentProgressEle = document.getElementById('music-currentProgress')
        $musicDotEle = document.getElementById('music-dot')
        $musicLyricEle = document.getElementById('music-lyric')

        if (!musicPlayer.firstPlay) {
            $musicNameEle.innerText = musicPlayer.musicList[musicPlayer.current].replace('/music/', '').replace('.flac', '').replace('.mp3', '').replace('.ogg', '')
            
            // update play or pause button
            if (musicPlayer.audio.paused) $playOrPauseEle.className = "music-icon iconfont icon-bofang"
            else $playOrPauseEle.className = "music-icon iconfont icon-zanting"
            
            // update cover
            $musicCoverEle.style.backgroundImage = `url(${musicPlayer.coverList[musicPlayer.current]})`

            updateProgressBar()
        }

        // update music mode button
        if (musicPlayer.musicMode == 1) $musicModeEle.className = "music-icon iconfont icon-liebiaoxunhuan"
        else if (musicPlayer.musicMode == 2) $musicModeEle.className = "music-icon iconfont icon-danquxunhuan"
        else $musicModeEle.className = "music-icon iconfont icon-suijibofang"

        musicPlayer.checkScroll()

        // register all the event
        btf.addEventListenerPjax($prevEle, "click", musicPlayer.handlePrev)
        btf.addEventListenerPjax($playOrPauseEle, "click", musicPlayer.handlePlayOrPause)
        btf.addEventListenerPjax($nextEle, "click", musicPlayer.handleNext)
        btf.addEventListenerPjax($musicModeEle, "click", musicPlayer.handleMusicMode)
        btf.addEventListenerPjax($musicProgressBarEle, "click", (event) => { musicPlayer.handleMusicProgressBar(event) })
    }

    // event do not need to rebind
    const unRefreshMusicFn = () => {
        
        musicPlayer.preloadMusicAndLyric()

        // monitor whether current music has finished
        musicPlayer.audio.addEventListener('ended', function () {
            musicPlayer.handleMusicEnded()
        }, false)

        // update progress bar and lyric
        musicPlayer.audio.addEventListener('timeupdate', function (){
            updateProgressBar()
        })

        musicPlayer.audio.addEventListener('loadedmetadata', function () {
            
        })

        musicPlayer.audio.addEventListener('play', () => {
            $playOrPauseEle.className = "music-icon iconfont icon-zanting"
        });

        musicPlayer.audio.addEventListener('pause', () => {
            $playOrPauseEle.className = "music-icon iconfont icon-bofang"
        });
    }

    btf.addGlobalFn('pjaxComplete', refreshMusicFn, 'refreshMusicFn')
    refreshMusicFn()
    unRefreshMusicFn()
})

window.addEventListener('resize', () => {
    const $musicNameContainerEle = document.getElementById('music-name-container')
    const $musicNameEle = document.getElementById('music-name')
    console.log($musicNameContainerEle.offsetWidth, $musicNameEle.offsetWidth)
    const checkScroll = () => {
        if ($musicNameContainerEle.offsetWidth < $musicNameEle.offsetWidth) {
            $musicNameEle.classList.add('scroll')
        }
        else {
            $musicNameEle.classList.remove('scroll')
        }
    }
    checkScroll()
})