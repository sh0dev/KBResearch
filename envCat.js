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

    function syncAppHeight() {
        const h =
            (window.visualViewport && window.visualViewport.height) ||
            window.innerHeight ||
            doc.clientHeight ||
            ((document.body && document.body.clientHeight) || 0);

        doc.style.setProperty('--app-h', Math.round(h) + 'px');
    }

    const env = detectBrowserEnv(ua);
    console.log('[browser-env]', env);

    if (env.isSafariiOS) doc.classList.add('ios-safari');
    if (env.isChromeiOS) doc.classList.add('ios-chrome');

    if (env.isChromeAndroid) {
        doc.classList.add('android-chrome');

        if (env.isChromePre106) {
            doc.classList.add('chrome-pre');
            syncAppHeight();

            window.addEventListener('resize', syncAppHeight, false);
            window.addEventListener('orientationchange', syncAppHeight, false);

            if (window.visualViewport && window.visualViewport.addEventListener) {
                window.visualViewport.addEventListener('resize', syncAppHeight, false);
            }
        }
    }
})();