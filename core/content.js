class Content {
    constructor() {
        this.settings = CONFIG.settings, this.initSettings(), this.model = new AudioModel(this), setInterval(() => this.model.init(), CONFIG.initInterval)
    }
    initSettings() {
        chrome.storage.sync.get('settings', (a) => {
            a.settings && a.settings.version === this.settings.version ? this.settings = a.settings : this.saveSetting()
    })
    }
    saveSetting() {
        chrome.storage.sync.set({
            settings: this.settings
        })
    }
}
if ('vk.com' == location.hostname || 'www.vk.com' == location.hostname) var c = new Content;