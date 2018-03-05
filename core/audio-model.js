class AudioModel {
    constructor(a) {
        this.c = a, this.cache = [], this.data = [], this.history = [], this.stoperGetAudioInfo = !1, this.activeDownloadingCount = 0, this.downloadedToday = JSON.parse(sessionStorage.getItem('vk-music-downloaded-today') || '[]'), this.getCache(), this.getHistory(), this.setBadge()
    }
    get audioWithoutAudioInfo() {
        return this.data.filter((a) => !a.url)
    }
    getCache() {
        chrome['storage']['local'].get('audioCache', (a) => {
            this.cache = a.audioCache || [];
        const b = +new Date;
        this.cache = this.cache.filter((a) => b - a.cacheTime < CONFIG.cacheLifetime), this.init()
    })
    }
    getHistory() {
        chrome['storage']['local'].get('history', (a) => {
            this.history = a.history || [];
        const b = +new Date;
        this.history = this.history.filter((a) => 2.592e9 > b - a.date).filter((a) => 'in-queue' !== a.status && 'number' != typeof a.status), chrome.storage.local.set({
            history: this.history
        })
    })
    }
    init() {
        this.renderDownloadAllBtns(), this.initVkAudio(), this.getAudioInfo(), this.downloadQueue()
    }
    initVkAudio() {
        const a = $('.audio_row[data-full-id]:not(.vkmusic-init)');
        a.length && a.each((a, b) => {
            const c = $(b);
        if (!c.hasClass('audio_claimed')) {
            const a = c.attr('data-full-id'),
                b = this.makeVkAudio(a, c),
                d = this.data.map((b) => b.id).indexOf(a); - 1 < d && this.data.splice(d, 1), this.data.push(b), c.addClass('vkmusic-init'), this.updateDownloadAllCounter()
        }
    })
    }
    makeVkAudio(a, b) {
        const d = this.cache.find((b) => b.id === a);
        return d ? new VkAudio(d, b, this) : new VkAudio({
            id: a
        }, b, this)
    }
    getAudioInfo() {
        if (!this.stoperGetAudioInfo) {
            var a = this.audioWithoutAudioInfo.slice(0, 10).map((a) => a.id).join(',');
            a && (this.stoperGetAudioInfo = !0, $.ajax({
                url: 'https://vk.com/al_audio.php',
                method: 'POST',
                timeout: 6e4,
                data: {
                    act: 'reload_audio',
                    al: 1,
                    ids: a
                },
                success: (a) => {
                const b = a.match(/<!json>([^<]+)<!>/);
            let c = [];
            try {
                c = JSON.parse(b[1])
            } catch (a) {}
            c && c.length && (c.forEach((a) => {
                const b = this.data.find((b) => b.id === a[1] + '_' + a[0]);
            if (b) {
                const c = this.getReadAudioUrl(a[2]);
                return c ? void(b.url = c, b.title = a[3], b.singer = a[4], b.duration = a[5], b.renderBtn()) : void(b.url = 'url_not_found')
            }
        }), this.saveCache()), this.stoperGetAudioInfo = !1
        },
            error: () => {
                this.stoperGetAudioInfo = !1
            }
        }))
        }
    }
    getReadAudioUrl(a) {
        var b = document.createElement('script'),
            c = 'vkmusic-player-data';
        return b.innerHTML = `            var player = new AudioPlayerHTML5({onFrequency:function(){}});             player.setUrl('${a}');             document.body.setAttribute('${c}', player._currentAudioEl.src);        `, document.body.appendChild(b), document.body.getAttribute(c)
    }
    saveCache() {
        this.data.length && (this.data.forEach((b) => {
            const a = this.cache.find((c) => b.id === c.id),
            c = b.dataForCache;
        a ? (a.id = c.id, a.url = c.url, a.title = c.title, a.singer = c.singer, a.duration = c.duration, a.bitrate = c.bitrate, a.size = c.size) : (c.cacheTime = +new Date, this.cache.push(c))
    }), chrome.storage.local.set({
            audioCache: this.cache
        }))
    }
    renderDownloadAllBtns() {
        if (!this.c.settings.downloadAllBtn) return;
        const a = chrome['i18n'].getMessage('downloadAll'),
            b = chrome['i18n'].getMessage('cancelAll');
        CONFIG.audioBlockSelectors.forEach((c) => {
            $(c).each((c, d) => {
            const e = $(d);
        e.find('.vkmusic-download-all-btn').length || $(`<div draggable="false" ondragstart="return false;" ondrop="return false;" class="vkmusic-download-all-btn">                       <div class="vkmusic-download-all-btn-inner clear_fix">                           <div class="vkmusic-btn-download-all-img">                               <div class="vkmusic-btn-download-all-img-inner"></div>                           </div>                           <div class="vkmusic-download-all-btn-text">                               <span class="vkmusic-download-all-btn-text-download">${a}</span>                               <span class="vkmusic-download-all-btn-text-cancel">${b}</span>                               <span class="counter">(0)</span>                           </div>                       </div>                   </div>`).prependTo(e).on('click', (a) => this.downloadAll(a))
    })
    })
    }
    updateDownloadAllCounter() {
        CONFIG.audioBlockSelectors.forEach((a) => {
            $(a).each((a, b) => {
            const c = $(b),
            d = c.find('.audio_row[data-full-id]:not(.audio_claimed)').length;
        c.find('.vkmusic-download-all-btn .counter').text(`(${d})`)
    })
    })
    }
    downloadAll(a) {
        const b = [],
            c = $(a.target),
            d = c.closest('.vkmusic-download-all-btn');
        return d.hasClass('vkmusic-downloading') ? void this.stopDownloadingAll() : void(d.parent().find('.audio_row[data-full-id]').each((a, c) => {
            const d = $(c).attr('data-full-id');
        b.push(d)
    }), this.data.filter((c) => -1 < b.indexOf(c.id)).filter((b) => -1 === this.downloadedToday.indexOf(b.id)).map((b) => b.pushToQueue()), d.addClass('vkmusic-downloading'))
    }
    stopDownloadingAll() {
        this.data.forEach((b) => b.clickVkMusicBtn(!0)), $('.vkmusic-download-all-btn').removeClass('vkmusic-downloading')
    }
    downloadQueue() {
        if (!(3 <= this.activeDownloadingCount)) {
            const a = this.data.find((b) => b.inDownloadQueue);
            a && (a.download(), a.inDownloadQueue = !1, this.activeDownloadingCount++)
        }
    }
    setBadge() {
        const a = this.data.filter((b) => b.inDownloadQueue);
        chrome['runtime'].sendMessage({
            action: 'setBadge',
            value: a.length + this.activeDownloadingCount
        })
    }
}