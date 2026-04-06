(function () {
     const doc = document.documentElement;

        if (doc.dataset.browserDetected === '1') return;
        doc.dataset.browserDetected = '1';

        const rootEl = document.querySelector('.content__wrapper__prompt');
        const scrollEl = document.querySelector('.prompt__content');

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

        function clearPatchClasses() {
            doc.classList.remove(
                    'legacy-no-dvh',
                    'is-dvh-supported',
                    'is-mobile-viewport',
                    'needs-scroll-fix'
            );

            rootEl.classList.remove('chrome-pre', 'chrome-post');
        }

        function applyViewportPatch(state) {
            clearPatchClasses();

            if (state.mobile) {
                doc.classList.add('is-mobile-viewport');
            }

            if (state.dvhSupported) {
                doc.classList.add('is-dvh-supported');
            }

            // 1) 모바일 + dvh 미지원
            if (state.mobile && !state.dvhSupported) {
                doc.classList.add('legacy-no-dvh');
                rootEl.classList.add('chrome-pre');
            }

            // 2) 모바일 + overflow는 있는데 scroll 불가 + dvh 지원
            if (
                    state.mobile &&
                    state.dvhSupported &&
                    state.scroll.exists &&
                    state.scroll.hasOverflow &&
                    !state.scroll.canScroll
            ) {
                doc.classList.add('needs-scroll-fix');
                rootEl.classList.add('chrome-post');
            }
        }

        function buildState() {
            return {
                mobile: isMobileViewport(),
                dvhSupported: detectDvhSupport(),
                scroll: inspectScroll(scrollEl),
            };
        }

        function debugState(state) {
            console.group('viewport patch state');
            console.table({
                mobile: state.mobile,
                dvhSupported: state.dvhSupported,
                scrollExists: state.scroll.exists,
                canScroll: state.scroll.canScroll,
                hasOverflow: state.scroll.hasOverflow,
                scrollHeight: state.scroll.scrollHeight,
                clientHeight: state.scroll.clientHeight,
                overflowY: state.scroll.overflowY,
                docClasses: Array.from(doc.classList).join(' '),
                rootClasses: Array.from(rootEl.classList).join(' '),
            });
            console.groupEnd();
        }

        function run() {

            const state = buildState();
            applyViewportPatch(state);
            debugState(state);
        }

        let rafId = null;

        function scheduleRun() {
            if (rafId) cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
                run();
                rafId = null;
            });
        }

        run();

        window.addEventListener('resize', scheduleRun);
        window.addEventListener('orientationchange', scheduleRun);
        window.visualViewport?.addEventListener('resize', scheduleRun);
        window.visualViewport?.addEventListener('scroll', scheduleRun);
})();