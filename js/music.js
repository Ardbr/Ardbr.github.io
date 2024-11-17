class MusicPlayer {
    constructor() {
        this.firstPlay = true
        this.musicMode = 1
        this.current = 0

        this.musicList = ["/music/云烟成雨-房东的猫.flac", "/music/使一颗心免于哀伤-Chevy.flac"]
        this.coverList = ["/img/云烟成雨-cover.webp", "/img/使一颗心免于哀伤-cover.jpg"]
        this.lyricList = ["/lyrics/云烟成雨.lrc", "/lyrics/使一颗心免于哀伤.lrc"]

        this.lrcInfo = ""
        this.lyricIndex = 0
        this.lyricLoad = false

        this.audio = new Audio()
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
        let lyric = this.lyricList[id]
        this.lyricLoad = false
        
        let requestMusic = new XMLHttpRequest()
        requestMusic.open("GET", music, true)
        requestMusic.responseType = "blob"
        requestMusic.onload = () => {
            if (requestMusic.status == 200) {
                this.audio.src = URL.createObjectURL(requestMusic.response)
                this.audio.load()
                this.audio.play().catch(error => {
                    console.error('Playback failed:', error)
                })
            }
            else {
                console.log("Audio file could not be loaded, status: ", requestMusic.status)
            }
        }
        requestMusic.onerror = function() {
            console.error('Request failed')
        }
        requestMusic.send()

        // update the cover
        let $musicCoverEle = document.getElementById("music-cover")
        $musicCoverEle.style.backgroundImage = `url(${cover})`

        // update the status
        let $musicPlayOrPauseEle = document.getElementById("music-playOrPause")
        $musicPlayOrPauseEle.className = "music-icon iconfont icon-zanting"

        // update the name
        let $musicNameEle = document.getElementById("music-name")
        $musicNameEle.innerText = music.replace('/music/', '').replace('.flac', '').replace('.mp3', '').replace('.ogg', '')
        
        // get lyric content
        let requestLyric = new XMLHttpRequest()
        requestLyric.open("GET", lyric, true)
        requestLyric.responseType = 'text'
        requestLyric.onload = () => {
            if (requestLyric.status == 200) {
                this.lrcInfo = window.parseLyric(requestLyric.responseText)
                this.lyricLoad = true
            }
            else {
                console.log("lyric file could not be loaded, status: ", requestLyric.status)
            }
        }
        requestLyric.onerror = function() {
            console.error('Request failed')
        }
        requestLyric.send()
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
                this.loadMusicAndPlay(this.current)
                this.firstPlay = false
            }
            else {
                let $playOrPauseEle = document.getElementById('music-playOrPause')
                if (this.audio.paused) {
                    $playOrPauseEle.className = "music-icon iconfont icon-zanting"
                    this.audio.play()
                }
                else {
                    $playOrPauseEle.className = "music-icon iconfont icon-bofang"
                    this.audio.pause()
                }
            }
        }
    }

    // previous music
    handlePrev = () => {
        this.firstPlay = false
        if (this.musicList.length > 0){

            this.current = this.current == 0 ? this.musicList.length - 1 : this.current - 1
            this.loadMusicAndPlay(this.current)
        }
    }

    // next music
    handleNext = () => {
        this.firstPlay = false
        if (this.musicList.length > 0) {

            this.current = this.current == this.musicList.length - 1 ? 0 : this.current + 1
            this.loadMusicAndPlay(this.current)
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
        
    let $musicProgressTextEle, $musicCurrentProgressEle, $musicDotEle, $musicLyricEle

    // event need to rebind after Pjax overload
    const refreshMusicFn = () => {

        // used in refreshMusicFn
        let $prevEle = document.getElementById('music-prev'),    // previous music
            $playOrPauseEle = document.getElementById('music-playOrPause'), // play or pause
            $nextEle = document.getElementById('music-next'),   // next music
            $musicModeEle = document.getElementById('music-mode'), // switch the play mode
            $musicNameEle = document.getElementById('music-name'),
            $musicProgressBarEle = document.getElementById('music-progressBar')
            $musicCoverEle = document.getElementById('music-cover')

        // used in unRefreshMusicFn
        $musicProgressTextEle = document.getElementById('music-progressText')
        $musicCurrentProgressEle = document.getElementById('music-currentProgress')
        $musicDotEle = document.getElementById('music-dot')
        $musicLyricEle = document.getElementById('music-lyric')

        if (musicPlayer.lyricLoad)
            $musicNameEle.innerText = musicPlayer.musicList[musicPlayer.current].replace('/music/', '').replace('.flac', '').replace('.mp3', '').replace('.ogg', '')
        
        // get current audio status and update the icon
        if (musicPlayer.audio.paused) $playOrPauseEle.className = "music-icon iconfont icon-bofang"
        else $playOrPauseEle.className = "music-icon iconfont icon-zanting"

        // cover
        $musicCoverEle.style.backgroundImage = `url(${musicPlayer.coverList[musicPlayer.current]})`

        // register all the event
        btf.addEventListenerPjax($prevEle, "click", musicPlayer.handlePrev)
        btf.addEventListenerPjax($playOrPauseEle, "click", musicPlayer.handlePlayOrPause)
        btf.addEventListenerPjax($nextEle, "click", musicPlayer.handleNext)
        btf.addEventListenerPjax($musicModeEle, "click", musicPlayer.handleMusicMode)
        btf.addEventListenerPjax($musicProgressBarEle, "click", (event) => { musicPlayer.handleMusicProgressBar(event) })
    }

    // event do not need to rebind
    const unRefreshMusicFn = () => {

        // monitor whether current music has finished
        musicPlayer.audio.addEventListener('ended', function () {
            musicPlayer.handleMusicEnded()
        }, false)

        // update progress bar and lyric
        musicPlayer.audio.addEventListener('timeupdate', function (){
            let currentTime = musicPlayer.audio.currentTime
            let totalTime = musicPlayer.audio.duration
            
            if (!isNaN(totalTime) && isFinite(totalTime)) {
                $musicProgressTextEle.innerText = musicPlayer.getFormattingTime(currentTime) + " / " + musicPlayer.getFormattingTime(totalTime)
                
                // current progressbar
                let width = Math.floor(currentTime / totalTime * 110)// 得到播放时间与总时长的比值
                $musicCurrentProgressEle.style.width = width + "px"
                $musicDotEle.style.left = (width - 2.5) + "px"
            }

            if (musicPlayer.lyricLoad == false) return 0

            let index = musicPlayer.lyricIndex
            nextIndex = index + 1 == musicPlayer.lrcInfo.lrc.length ? index : index + 1
            if (currentTime * 1000 < musicPlayer.lrcInfo.lrc[nextIndex].timeMs) {
                $musicLyricEle.innerText = musicPlayer.lrcInfo.lrc[index].lyric
            }
            else {
                musicPlayer.lyricIndex = nextIndex
                $musicLyricEle.innerText = musicPlayer.lrcInfo.lrc[musicPlayer.lyricIndex].lyric
            }
        })

        musicPlayer.audio.addEventListener('loadedmetadata', function () {
            musicPlayer.lyricIndex = 0
        })
    }

    btf.addGlobalFn('pjaxComplete', refreshMusicFn, 'refreshMusicFn')
    refreshMusicFn()
    unRefreshMusicFn()
})