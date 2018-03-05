class Popup {
    constructor() {
        this.settings = CONFIG.settings, this.history = [], this.stopRender = !1, this.initHandlers(), this.initSettings(), this.initHistory(), this.applyLocales(), setInterval(() => this.initHistory(), CONFIG.historyUpdateInterval)
    }
    initHandlers() {
        $(document.body).on('click', '.download-folder', () => this.showDefaultFolder()), $(document.body).on('click', '[data-show-tab]', (a) => this.toggleTab(a)), $(document.body).on('click', '.date-range', (a) => this.dateRangeClick(a)), $(document.body).on('click', '#clear-history', (a) => this.clearHistory(a)), $(document.body).on('change', 'form', (a) => this.changeForm(a))
    }
    initSettings() {
        chrome.storage.sync.get('settings', (a) => {
            a.settings && a.settings.version === this.settings.version ? this.settings = a.settings : this.saveSetting(), $(`[name="showInfo"][value="${this.settings.showInfo}"]`).prop('checked', !0), $(`[name="downloadAllBtn"][value="${this.settings.downloadAllBtn?1:0}"]`).prop('checked', !0), $('[name="disableAds"]').prop('checked', this.settings.disableAds)
    })
    }
    saveSetting() {
        chrome.storage.sync.set({
            settings: this.settings
        })
    }
    initHistory() {
        const a = +$('.date-range.active').attr('data-range');
        chrome.storage.local.get({
            history: []
        }, (b) => {
            if (!b.history) return;
        const c = +new Date;
        this.history = b.history.filter((b) => c - b.date < a).sort((c, a) => c.date > a.date ? -1 : 1);
        this.stopRender || this.renderHistory()
    })
    }
    renderHistory() {
        let a = '';
        a = this.history.length ? this.history.map((a) => `                <li class="history-item">                    <div class="inner">                        ${this.getTpl(a)}                        <div class="info">                            <div class="title">${a.title}</div>                            <div class="singer">${a.singer}</div>                        </div>                    </div>                    <div class="date" title="${this.formatTime(a.date)}">${this.formatDate(a.date)}</div>                </li>            `).join('') : `<p class="empty-history" bind-locale-msg="emptyHistoryMsg">Здесь будет отображаться история скачаных записей</p>`, $('ul.history-ul').html(a), this.applyLocales()
    }
    getTpl(a) {
        return 'load' === a.status ? this.downloadedTpl() : 'in-queue' === a.status ? this.queueTpl() : 'number' == typeof a.status ? this.progressTpl(a) : 'error' === a.status ? this.errorTpl() : 'abort' === a.status ? this.abortTpl() : (console.error('wrong status', a), '')
    }
    downloadedTpl() {
        return `<div class="icon downloaded" title="Скачано" bind-locale-msg="downloaded" bind-locale-to="title"></div>`
    }
    queueTpl() {
        return `<div class="progress-pie-chart" title="В очереди на загрузку" bind-locale-msg="inQueue" bind-locale-to="title">                    <svg width="36" height="36">                        <circle r="15" cx="18" cy="18" fill="#fff"                                stroke="#507299" stroke-width="3" stroke-dasharray="260%"                                 stroke-dashoffset="260%">                        </circle>                    </svg>                    <div class="ppc-percents">                        <span class="process">...</span>                    </div>                </div>`
    }
    progressTpl(a) {
        return `<div class="progress-pie-chart" title="Загружается" bind-locale-msg="inProcess" bind-locale-to="title">                    <svg width="36" height="36">                        <circle r="15" cx="18" cy="18" fill="#fff"                                stroke="#507299" stroke-width="3" stroke-dasharray="260%"                                 stroke-dashoffset="${this.dashoffset(a.status)}%">                        </circle>                    </svg>                    <div class="ppc-percents">                        <span class="process">${a.status?a.status:0}%</span>                    </div>                </div>`
    }
    errorTpl() {
        return `<div class="icon error" title="Ошибка" bind-locale-msg="error" bind-locale-to="title"></div>`
    }
    abortTpl() {
        return `<div class="icon abort" title="Отменено" bind-locale-msg="abort" bind-locale-to="title"></div>`
    }
    dashoffset(a) {
        return 'number' == typeof a ? 260 * (1 - a / 100) : 260
    }
    toggleTab(a) {
        const b = a.target.dataset.showTab;
        $('.tab').fadeOut(100).delay(100).filter(b).fadeIn(100), $(a.target).hasClass('core-need-hide') && $(a.target).hide().siblings().show()
    }
    changeForm() {
        this.settings.showInfo = $('[name="showInfo"]:checked').val(), this.settings.downloadAllBtn = !!+$('[name="downloadAllBtn"]:checked').val(), this.settings.disableAds = $('[name="disableAds"]').prop('checked'), this.saveSetting()
    }
    dateRangeClick(a) {
        $('.date-range').removeClass('active'), $(a.target).addClass('active'), this.initHistory()
    }
    clearHistory(a) {
        this.history = [], chrome.storage.local.set({
            history: []
        }), this.renderHistory(), $(a.target).remove()
    }
    formatDate(a) {
        const b = new Date(a);
        let c = b.getDate();
        10 > c && (c = '0' + c);
        let d = b.getMonth() + 1;
        10 > d && (d = '0' + d);
        let e = b.getFullYear() % 100;
        return 10 > e && (e = '0' + e), c + '.' + d + '.' + e
    }
    formatTime(a) {
        const b = new Date(a),
            c = b.getHours(),
            d = b.getMinutes();
        return (10 > c ? '0' + c : c) + ':' + (10 > d ? '0' + d : d)
    }
    showDefaultFolder() {
        chrome.permissions.request({
            permissions: ['downloads']
        }, function(a) {
            a && chrome.downloads.showDefaultFolder()
        })
    }
    applyLocales() {
        $('[bind-locale-msg]').each((a, b) => {
            const c = $(b);
        if (!c.hasClass('localized')) {
            const a = c.attr('bind-locale-msg'),
                b = chrome.i18n.getMessage(a),
                d = c.attr('bind-locale-to');
            b && ('title' === d ? c.attr('title', b) : c.text(b), c.addClass('localized'))
        }
    })
    }
}
let p;
chrome.tabs.query({
    active: !0
}, (a) => {
(!a[0].url || ['vk.com', 'www.vk.com', 'new.vk.com'].every((b) => -1 === a[0].url.indexOf(b))) && -1 === location.href.indexOf('/html/options.html') ? chrome.tabs.create({
    url: 'https://vk.com/audio'
}) : p = new Popup
});