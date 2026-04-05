(function () {
  const doc = document.documentElement;
  if (doc.dataset.browserDetected === '1') return;
  doc.dataset.browserDetected = '1';

  const ua = navigator.userAgent;
  const forceChromePatch =
    doc.hasAttribute('data-force-chrome-pre106') ||
    location.search.includes('forceChromePre106=1');

  const chromeMatch = ua.match(/Chrome\/(\d+)/) || ua.match(/CriOS\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : null;

  const isSafariOnly =
            /Safari\//.test(uaString) &&
            /Version\//.test(uaString) &&
            !/Chrome\//.test(uaString) &&
            !/CriOS\//.test(uaString) &&
            !isEdge &&
            !isOpera &&
            !isFirefox;

  const safariMatch = uaString.match(/Version\/(\d+)(?:\.(\d+))?/);
  const safariMajor = safariMatch ? parseInt(safariMatch[1], 10) : null;
  const safariMinor = safariMatch ? parseInt(safariMatch[2] || '0', 10) : 0;

  const isExcludedBrowser =
    /Edg\//.test(ua) ||
    /EdgA\//.test(ua) ||
    /EdgiOS\//.test(ua) ||
    /OPR\//.test(ua) ||
    /SamsungBrowser\//.test(ua) ||
    /Firefox\//.test(ua) ||
    /FxiOS\//.test(ua) ||
    /\bwv\b/.test(ua);

  const isExcludedBrowser =
            isEdge || isOpera || isSamsungBrowser || isFirefox || isWebView;

  const isSafariNoDvh =
            isSafariOnly &&
            safariMajor !== null &&
            (safariMajor < 15 || (safariMajor === 15 && safariMinor < 4));

  const isChromePre108 =
    !!chromeVersion && !isExcludedBrowser && chromeVersion < 108;

  const el = document.querySelector('.content__wrapper__prompt');
  if (!el) return;

  if (isChromePre108 || forceChromePatch || isSafariNoDvh) {
    el.classList.add('chrome-pre');
  }
})();
