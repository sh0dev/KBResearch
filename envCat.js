(function () {
    const doc = document.documentElement;
    const ua = navigator.userAgent;
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    if (doc.dataset.browserDetected === '1') return;
    doc.dataset.browserDetected = '1';

    function detectBrowserEnv(uaString) {
        const isIPhone = /iPhone/.test(uaString);
        const isIPad =
            /iPad/.test(uaString) ||
            (/Macintosh/.test(uaString) && maxTouchPoints > 1);

        const isIOS = isIPhone || isIPad;
        const isAndroid = /Android/.test(uaString);

        const isEdgeiOS = /EdgiOS\//.test(uaString);
        const isFirefoxiOS = /FxiOS\//.test(uaString);
        const isChromeiOS = /CriOS\//.test(uaString);

        const isSafariiOS =
            isIOS &&
            /Safari\//.test(uaString) &&
            /Version\//.test(uaString) &&
            !isChromeiOS &&
            !isFirefoxiOS &&
            !isEdgeiOS;

        const isSamsungBrowser = /SamsungBrowser\//.test(uaString);
        const isEdgeAndroid = /EdgA\//.test(uaString);
        const isOperaAndroid = /OPR\//.test(uaString);
        const isWebView = /\bwv\b/.test(uaString);

        const chromeMatch = uaString.match(/Chrome\/(\d+)/);
        const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : null;

        const isChromeAndroid =
            isAndroid &&
            !!chromeVersion &&
            !isSamsungBrowser &&
            !isEdgeAndroid &&
            !isOperaAndroid &&
            !isWebView;

        return {
            ua: uaString,
            isIOS,
            isAndroid,
            isChromeiOS,
            isSafariiOS,
            isChromeAndroid,
            chromeVersion,
            isChromePre106: isChromeAndroid && chromeVersion < 106,
        };
    }

    const env = detectBrowserEnv(ua);
    console.log('[browser-env]', env);

    if (env.isSafariiOS) doc.classList.add('ios-safari');
    if (env.isChromeiOS) doc.classList.add('ios-chrome');

    if (env.isChromeAndroid) {
        const elScrollC = document.querySelector(".prompt__content")

        if (env.isChromePre106) {
            elScrollC.classList.add('chrome-pre');
        }
    }
})();