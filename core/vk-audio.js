class VkAudio {
    constructor(a, b, c) {
        this.id = a.id, this.url = a.url, this.title = a.title, this.singer = a.singer, this.duration = a.duration, this.bitrate = a.bitrate || '', this.size = a.size || '', this.$row = b, this.model = c, this.stoperGetContentLength = !1, this.inDownloadQueue = !1, this.loadedPercent = 0, this.url && this.renderBtn(), this.size && this.renderInfo()
    }
    get dataForCache() {
        return {
            id: this.id,
            url: this.url,
            title: this.title,
            singer: this.singer,
            duration: this.duration,
            bitrate: this.bitrate,
            size: this.size
        }
    }
    renderBtn() {
        $('.audio_row__play_btn .vkmusic-btn').length || (this.$row.find('.audio_row__play_btn').after(`<div class="vkmusic-btn">                <div class="vkmusic-btn-inner"></div>                <div class="progress-pie-chart">                    <svg width="36" height="36">                        <circle r="15" cx="18" cy="18" fill="#fff"                                stroke="#507299" stroke-width="3" stroke-dasharray="260%" stroke-dashoffset="260%">                        </circle>                    </svg>                    <div class="ppc-percents">                        <span class="process">0%</span>                        <span class="queue">...</span>                    </div>                </div>            </div>`), this.$el = this.$row.find('.vkmusic-btn'), this.$el.on('click', (a) => {
            a.stopPropagation(), this.clickVkMusicBtn()
    }), 'off' !== this.model.c.settings.showInfo && this.$row.on('mouseenter', () => this.getContentLength()))
    }
    renderInfo() {
        this.$row.find('.vkmusic-info').remove();
        const a = this.model.c.settings.showInfo;
        let b = '';
        'off' !== a && ('bitrate' === a ? b = `<div class="vkmusic-info">${this.bitrate}</div>` : 'size' === a ? b = `<div class="vkmusic-info">${this.size}</div>` : 'all' === a && (b = `<div class="vkmusic-info">${this.bitrate} <br> ${this.size}</div>`), this.$row.find('.audio_row__duration').after(b))
    }
    getContentLength() {
        if (!(this.size || this.stoperGetContentLength)) {
            this.stoperGetContentLength = !0;
            var a = new XMLHttpRequest;
            a.open('HEAD', this.url, !0), a.timeout = 6e4, a.onload = () => {
                if (200 === a.status) {
                    const b = a.getResponseHeader('Content-Length');
                    if (b) {
                        const a = 8 * b / 1024 / this.duration;
                        this.bitrate = Math.min(32 * Math.round(a / 32), 320) + 'kbps', this.size = (b / 1024 / 1024).toFixed(1) + 'MB', this.renderInfo(), this.model.saveCache()
                    }
                }
            }, a.send()
        }
    }
    clickVkMusicBtn(a = !1) {
        return this.model.c.settings.popupDisplayed ? void(this.$el.hasClass('vkmusic-btn-queued') ? (this.inDownloadQueue = !1, this.$el.removeClass('vkmusic-btn-queued'), this.model.setBadge(), this.saveHistory('abort')) : this.$el.hasClass('vkmusic-btn-progress') ? (this.xhr.abort(), this.model.setBadge()) : !a && this.pushToQueue()) : new TutorialModal(this.model.c)
    }
    pushToQueue() {
        this.$el.addClass('vkmusic-btn-queued'), this.inDownloadQueue = !0, this.updateLoaderIndicator(0), this.saveHistory('in-queue'), this.model.setBadge()
    }
    download() {
        this.xhr = new XMLHttpRequest, this.xhr.responseType = 'blob', this.xhr.timeout = 3e5, this.xhr.addEventListener('loadstart', () => {
            this.$el.removeClass('vkmusic-btn-queued'), this.$el.addClass('vkmusic-btn-progress')
    }), this.xhr.addEventListener('progress', (a) => {
            let b = 0;
        a.lengthComputable && (b = Math.round(100 * (a.loaded / a.total))), this.updateLoaderIndicator(b), this.loadedPercent !== b && (this.loadedPercent = b, this.saveHistory(b))
    }), this.xhr.addEventListener('abort', () => this.endDownloadAction('abort')), this.xhr.addEventListener('error', () => this.endDownloadAction('error')), this.xhr.addEventListener('load', () => {
            var b = window.URL.createObjectURL(new window.Blob([this.xhr.response], {
                type: 'octet/stream'
            })),
            c = document.createElement('a');
        c.href = b;
        const a = this.singer + ' - ' + this.title + '.mp3';
        c.innerHTML = this.clearPath(a), c.download = c.innerText, document.body.appendChild(c), c.click(), document.body.removeChild(c), window.URL.revokeObjectURL(b), this.endDownloadAction('load')
    }), this.xhr.open('GET', this.url, !0), this.xhr.send()
    }
    clearPath(a) {
        return a.replace(/^\./, '_').replace(/\t/g, ' ').replace(/[\\/:*?<>|~]/g, '_')
    }
    updateLoaderIndicator(a) {
        this.$el.find('svg circle').attr('stroke-dashoffset', 260 * (1 - a / 100) + '%'), this.$el.find('.ppc-percents span.process').text(a + '%')
    }
    endDownloadAction(a) {
        this.$el.removeClass('vkmusic-btn-progress vkmusic-btn-queued'), this.model.activeDownloadingCount--, 'load' === a && (this.model.downloadedToday.push(this.id), sessionStorage.setItem('vk-music-downloaded-today', JSON.stringify(this.model.downloadedToday))), this.model.setBadge(), this.saveHistory(a)
    }
    saveHistory(a) {
        const b = this.model.history.find((a) => a.audioId === this.id);
        if (b) b.status = a, b.date + 300000 < +new Date && (b.date = +new Date);
        else {
            const b = {
                audioId: this.id,
                title: this.title,
                singer: this.singer,
                date: +new Date,
                status: a
            };
            this.model.history.push(b)
        }
        chrome.storage.local.set({
            history: this.model.history
        })
    }
}