(function () {
    const doc = document.documentElement;

    if (doc.dataset.browserDetected === '1') return;
    doc.dataset.browserDetected = '1';

    const rootEl = document.querySelector('.content__wrapper__prompt');
    const scrollEl = document.querySelector('.prompt__content');


    console.log(rootEl);

    if (!rootEl) return;

    function isMobileViewport() {
        return window.matchMedia('(max-width: 560px)').matches;
    }

    function detectDvhSupport() {
        try {
            return !!(window.CSS && CSS.supports && CSS.supports('height', '100dvh'));
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    function inspectScroll(target) {
        if (!target) {
            return {
                exists: false,
                canScroll: false,
                hasOverflow: false,
                scrollHeight: 0,
                clientHeight: 0,
                overflowY: '',
                overflow: '',
            };
        }

        const style = getComputedStyle(target);
        const canScroll =
                /(auto|scroll|overlay)/.test(style.overflowY) ||
                /(auto|scroll|overlay)/.test(style.overflow);

        const hasOverflow = target.scrollHeight > target.clientHeight;

        console.log(canScroll);
        console.log(hasOverflow);

        return {
            exists: true,
            canScroll,
            hasOverflow,
            scrollHeight: target.scrollHeight,
            clientHeight: target.clientHeight,
            overflowY: style.overflowY,
            overflow: style.overflow,
        };
    }

    function getBrowserVersionInfo() {
        const ua = navigator.userAgent;

        const chromeMatch = ua.match(/Chrome\/(\d+)/) || ua.match(/CriOS\/(\d+)/);
        const firefoxMatch = ua.match(/Firefox\/(\d+)/) || ua.match(/FxiOS\/(\d+)/);
        const safariMatch = ua.match(/Version\/(\d+)(?:\.(\d+))?/);
        const edgeMatch =
                ua.match(/Edg\/(\d+)/) ||
                ua.match(/EdgA\/(\d+)/) ||
                ua.match(/EdgiOS\/(\d+)/);
        const operaMatch = ua.match(/OPR\/(\d+)/);

        return {
            ua,
            chromeVersion: chromeMatch ? parseInt(chromeMatch[1], 10) : null,
            firefoxVersion: firefoxMatch ? parseInt(firefoxMatch[1], 10) : null,
            safariMajor: safariMatch ? parseInt(safariMatch[1], 10) : null,
            safariMinor: safariMatch ? parseInt(safariMatch[2] || '0', 10) : 0,
            edgeVersion: edgeMatch ? parseInt(edgeMatch[1], 10) : null,
            operaVersion: operaMatch ? parseInt(operaMatch[1], 10) : null,
        };
    }

    function needsLegacyBrowserPatch(info) {
        if (info.chromeVersion !== null && info.chromeVersion < 108) return true;
        if (info.edgeVersion !== null && info.edgeVersion < 108) return true;
        if (info.firefoxVersion !== null && info.firefoxVersion < 101) return true;
        if (info.operaVersion !== null && info.operaVersion < 94) return true;
        if (
                info.safariMajor !== null &&
                (info.safariMajor < 15 || (info.safariMajor === 15 && info.safariMinor < 4))
        ) {
            return true;
        }
        return false;
    }

    function clearPatchClasses() {
        doc.classList.remove(
                'legacy-no-dvh',
                'needs-legacy-browser-patch',
                'needs-scroll-fix',
                'is-dvh-supported',
                'is-mobile-viewport'
        );

        rootEl.classList.remove(
                'chrome-pre',
                'chrome-post'
        );
    }

    function applyViewportPatch(state) {
        clearPatchClasses();

        if (state.mobile) {
            doc.classList.add('is-mobile-viewport');
        }

        if (state.dvhSupported) {
            doc.classList.add('is-dvh-supported');
        }

        // 1) dvh 미지원 모바일
        if (state.mobile && state.dvhSupported) {
            doc.classList.add('legacy-no-dvh');
            rootEl.classList.add('chrome-pre');

        }

        // 2) 스크롤 이상이 있고, dvh 지원 모바일
        if (
                state.mobile &&
                state.scroll.exists &&
                state.scroll.hasOverflow &&
                !state.scroll.canScroll &&
                state.dvhSupported
        ) {
            doc.classList.add('needs-scroll-fix');
            rootEl.classList.add('chrome-post');
        }

        // 3) 구형 브라우저 패치
        if (state.mobile && state.legacyBrowser) {
            doc.classList.add('needs-legacy-browser-patch');
            rootEl.classList.add('chrome-pre');
        }
    }

    function buildState() {
        const browserInfo = getBrowserVersionInfo();
        const scroll = inspectScroll(scrollEl);

        return {
            mobile: isMobileViewport(),
            dvhSupported: detectDvhSupport(),
            legacyBrowser: needsLegacyBrowserPatch(browserInfo),
            browserInfo,
            scroll,
        };
    }

    function debugState(state) {
        console.group('viewport patch state');
        console.table({
            mobile: state.mobile,
            dvhSupported: state.dvhSupported,
            legacyBrowser: state.legacyBrowser,
            scrollExists: state.scroll.exists,
            canScroll: state.scroll.canScroll,
            hasOverflow: state.scroll.hasOverflow,
            scrollHeight: state.scroll.scrollHeight,
            clientHeight: state.scroll.clientHeight,
            overflowY: state.scroll.overflowY,
            appliedDocClasses: Array.from(doc.classList).join(' '),
            appliedRootClasses: Array.from(rootEl.classList).join(' '),
        });
        console.table(state.browserInfo);
        console.groupEnd();
    }

    function run() {
        const state = buildState();
        applyViewportPatch(state);
        debugState(state);
    }

    run();

    window.addEventListener('resize', run);
    window.addEventListener('orientationchange', run);
})();