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

  const isExcludedBrowser =
    /Edg\//.test(ua) ||
    /EdgA\//.test(ua) ||
    /EdgiOS\//.test(ua) ||
    /OPR\//.test(ua) ||
    /SamsungBrowser\//.test(ua) ||
    /Firefox\//.test(ua) ||
    /FxiOS\//.test(ua) ||
    /\bwv\b/.test(ua);

  const isChromePre106 =
    !!chromeVersion && !isExcludedBrowser && chromeVersion < 106;

  const el = document.querySelector('.content__wrapper__prompt');
  if (!el) return;

  if (isChromePre106 || forceChromePatch) {
    el.classList.add('chrome-pre106');
  }
})();
