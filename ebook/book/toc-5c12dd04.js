// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="introduction.html">Introduction</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="reading-order.html">Reading order</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="boards-and-caps.html">Boards and capabilities</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="flash-firmware.html">Flash firmware</a></span></li><li class="chapter-item expanded "><li class="part-title">Vanilla labs</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="tracks/vanilla.html"><strong aria-hidden="true">1.</strong> Vanilla labs</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex00-hello/index.html"><strong aria-hidden="true">1.1.</strong> ex00-hello</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex01-dynamic-elements/index.html"><strong aria-hidden="true">1.2.</strong> ex01-dynamic-elements</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex02-dynamic-style/index.html"><strong aria-hidden="true">1.3.</strong> ex02-dynamic-style</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex03-form-events/index.html"><strong aria-hidden="true">1.4.</strong> ex03-form-events</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex04-keyboard-pointer/index.html"><strong aria-hidden="true">1.5.</strong> ex04-keyboard-pointer</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex05-svg-draw/index.html"><strong aria-hidden="true">1.6.</strong> ex05-svg-draw</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex06-canvas-draw/index.html"><strong aria-hidden="true">1.7.</strong> ex06-canvas-draw</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex07-web-audio-mic/index.html"><strong aria-hidden="true">1.8.</strong> ex07-web-audio-mic</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex08-web-audio-speaker/index.html"><strong aria-hidden="true">1.9.</strong> ex08-web-audio-speaker</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex09-web-video-camera/index.html"><strong aria-hidden="true">1.10.</strong> ex09-web-video-camera</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex10-web-serial/index.html"><strong aria-hidden="true">1.11.</strong> ex10-web-serial</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex11-web-bluetooth/index.html"><strong aria-hidden="true">1.12.</strong> ex11-web-bluetooth</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex12-led-writeacked/index.html"><strong aria-hidden="true">1.13.</strong> ex12-led-writeacked</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex13-wave-cmd/index.html"><strong aria-hidden="true">1.14.</strong> ex13-wave-cmd</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex14-led-sliders/index.html"><strong aria-hidden="true">1.15.</strong> ex14-led-sliders</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex15-sfx-play/index.html"><strong aria-hidden="true">1.16.</strong> ex15-sfx-play</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex16-sfx-volume/index.html"><strong aria-hidden="true">1.17.</strong> ex16-sfx-volume</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex17-sfx-params/index.html"><strong aria-hidden="true">1.18.</strong> ex17-sfx-params</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex18-mic-hello/index.html"><strong aria-hidden="true">1.19.</strong> ex18-mic-hello</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex19-mic-vu/index.html"><strong aria-hidden="true">1.20.</strong> ex19-mic-vu</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/vanilla/ex20-mic-wave/index.html"><strong aria-hidden="true">1.21.</strong> ex20-mic-wave</a></span></li></ol><li class="chapter-item expanded "><li class="part-title">Reference</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="sdk/index.html"><strong aria-hidden="true">2.</strong> @sdk board link library</a></span></li><li class="chapter-item expanded "><li class="part-title">React labs</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="tracks/react.html"><strong aria-hidden="true">3.</strong> React labs</a><a class="chapter-fold-toggle"><div>❱</div></a></span><ol class="section"><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex00-getting-started/index.html"><strong aria-hidden="true">3.1.</strong> ex00-getting-started</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex01-react-component/index.html"><strong aria-hidden="true">3.2.</strong> ex01-react-component</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex02-web-serial-picker/index.html"><strong aria-hidden="true">3.3.</strong> ex02-web-serial-picker</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex03-board-hello/index.html"><strong aria-hidden="true">3.4.</strong> ex03-board-hello</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex04-rgb-led/index.html"><strong aria-hidden="true">3.5.</strong> ex04-rgb-led</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex05-led-studio/index.html"><strong aria-hidden="true">3.6.</strong> ex05-led-studio</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex06-sfx-play/index.html"><strong aria-hidden="true">3.7.</strong> ex06-sfx-play</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex07-sfx-volume/index.html"><strong aria-hidden="true">3.8.</strong> ex07-sfx-volume</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex08-sfx-params/index.html"><strong aria-hidden="true">3.9.</strong> ex08-sfx-params</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex09-sfx-melody/index.html"><strong aria-hidden="true">3.10.</strong> ex09-sfx-melody</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex10-sfx-studio/index.html"><strong aria-hidden="true">3.11.</strong> ex10-sfx-studio</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex11-mic-hello/index.html"><strong aria-hidden="true">3.12.</strong> ex11-mic-hello</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex12-mic-vu/index.html"><strong aria-hidden="true">3.13.</strong> ex12-mic-vu</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex13-mic-gain/index.html"><strong aria-hidden="true">3.14.</strong> ex13-mic-gain</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex14-mic-wave/index.html"><strong aria-hidden="true">3.15.</strong> ex14-mic-wave</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex15-mic-studio/index.html"><strong aria-hidden="true">3.16.</strong> ex15-mic-studio</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex16-key-hello/index.html"><strong aria-hidden="true">3.17.</strong> ex16-key-hello</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex17-key-action/index.html"><strong aria-hidden="true">3.18.</strong> ex17-key-action</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex18-batt-hello/index.html"><strong aria-hidden="true">3.19.</strong> ex18-batt-hello</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex19-batt-warn/index.html"><strong aria-hidden="true">3.20.</strong> ex19-batt-warn</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex20-imu-hello/index.html"><strong aria-hidden="true">3.21.</strong> ex20-imu-hello</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex21-imu-shake/index.html"><strong aria-hidden="true">3.22.</strong> ex21-imu-shake</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex22-rtc-sync/index.html"><strong aria-hidden="true">3.23.</strong> ex22-rtc-sync</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex23-sound-led/index.html"><strong aria-hidden="true">3.24.</strong> ex23-sound-led</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex24-button-appliance/index.html"><strong aria-hidden="true">3.25.</strong> ex24-button-appliance</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex25-caps-gate/index.html"><strong aria-hidden="true">3.26.</strong> ex25-caps-gate</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex26-mic-fft/index.html"><strong aria-hidden="true">3.27.</strong> ex26-mic-fft</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex27-mic-spectrogram/index.html"><strong aria-hidden="true">3.28.</strong> ex27-mic-spectrogram</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex28-mic-recorder/index.html"><strong aria-hidden="true">3.29.</strong> ex28-mic-recorder</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex29-mic-filter/index.html"><strong aria-hidden="true">3.30.</strong> ex29-mic-filter</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex30-mic-features/index.html"><strong aria-hidden="true">3.31.</strong> ex30-mic-features</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex31-mic-pitch/index.html"><strong aria-hidden="true">3.32.</strong> ex31-mic-pitch</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex32-mic-classify/index.html"><strong aria-hidden="true">3.33.</strong> ex32-mic-classify</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex33-mic-react/index.html"><strong aria-hidden="true">3.34.</strong> ex33-mic-react</a></span></li><li class="chapter-item "><span class="chapter-link-wrapper"><a href="generated/react/ex34-sense-appliance/index.html"><strong aria-hidden="true">3.35.</strong> ex34-sense-appliance</a></span></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split('#')[0].split('?')[0];
        if (current_page.endsWith('/')) {
            current_page += 'index.html';
        }
        const links = Array.prototype.slice.call(this.querySelectorAll('a'));
        const l = links.length;
        for (let i = 0; i < l; ++i) {
            const link = links[i];
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The 'index' page is supposed to alias the first chapter in the book.
            // Check both with and without the '.html' suffix to be robust against pretty URLs
            if (link.href.replace(/\.html$/, '') === current_page.replace(/\.html$/, '')
                || i === 0
                && path_to_root === ''
                && current_page.endsWith('/index.html')) {
                link.classList.add('active');
                let parent = link.parentElement;
                while (parent) {
                    if (parent.tagName === 'LI' && parent.classList.contains('chapter-item')) {
                        parent.classList.add('expanded');
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', e => {
            if (e.target.tagName === 'A') {
                const clientRect = e.target.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                sessionStorage.setItem('sidebar-scroll-offset', clientRect.top - sidebarRect.top);
            }
        }, { passive: true });
        const sidebarScrollOffset = sessionStorage.getItem('sidebar-scroll-offset');
        sessionStorage.removeItem('sidebar-scroll-offset');
        if (sidebarScrollOffset !== null) {
            // preserve sidebar scroll position when navigating via links within sidebar
            const activeSection = this.querySelector('.active');
            if (activeSection) {
                const clientRect = activeSection.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                const currentOffset = clientRect.top - sidebarRect.top;
                this.scrollTop += currentOffset - parseFloat(sidebarScrollOffset);
            }
        } else {
            // scroll sidebar to current active section when navigating via
            // 'next/previous chapter' buttons
            const activeSection = document.querySelector('#mdbook-sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        const sidebarAnchorToggles = document.querySelectorAll('.chapter-fold-toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(el => {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define('mdbook-sidebar-scrollbox', MDBookSidebarScrollbox);


// ---------------------------------------------------------------------------
// Support for dynamically adding headers to the sidebar.

(function() {
    // This is used to detect which direction the page has scrolled since the
    // last scroll event.
    let lastKnownScrollPosition = 0;
    // This is the threshold in px from the top of the screen where it will
    // consider a header the "current" header when scrolling down.
    const defaultDownThreshold = 150;
    // Same as defaultDownThreshold, except when scrolling up.
    const defaultUpThreshold = 300;
    // The threshold is a virtual horizontal line on the screen where it
    // considers the "current" header to be above the line. The threshold is
    // modified dynamically to handle headers that are near the bottom of the
    // screen, and to slightly offset the behavior when scrolling up vs down.
    let threshold = defaultDownThreshold;
    // This is used to disable updates while scrolling. This is needed when
    // clicking the header in the sidebar, which triggers a scroll event. It
    // is somewhat finicky to detect when the scroll has finished, so this
    // uses a relatively dumb system of disabling scroll updates for a short
    // time after the click.
    let disableScroll = false;
    // Array of header elements on the page.
    let headers;
    // Array of li elements that are initially collapsed headers in the sidebar.
    // I'm not sure why eslint seems to have a false positive here.
    // eslint-disable-next-line prefer-const
    let headerToggles = [];
    // This is a debugging tool for the threshold which you can enable in the console.
    let thresholdDebug = false;

    // Updates the threshold based on the scroll position.
    function updateThreshold() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // The number of pixels below the viewport, at most documentHeight.
        // This is used to push the threshold down to the bottom of the page
        // as the user scrolls towards the bottom.
        const pixelsBelow = Math.max(0, documentHeight - (scrollTop + windowHeight));
        // The number of pixels above the viewport, at least defaultDownThreshold.
        // Similar to pixelsBelow, this is used to push the threshold back towards
        // the top when reaching the top of the page.
        const pixelsAbove = Math.max(0, defaultDownThreshold - scrollTop);
        // How much the threshold should be offset once it gets close to the
        // bottom of the page.
        const bottomAdd = Math.max(0, windowHeight - pixelsBelow - defaultDownThreshold);
        let adjustedBottomAdd = bottomAdd;

        // Adjusts bottomAdd for a small document. The calculation above
        // assumes the document is at least twice the windowheight in size. If
        // it is less than that, then bottomAdd needs to be shrunk
        // proportional to the difference in size.
        if (documentHeight < windowHeight * 2) {
            const maxPixelsBelow = documentHeight - windowHeight;
            const t = 1 - pixelsBelow / Math.max(1, maxPixelsBelow);
            const clamp = Math.max(0, Math.min(1, t));
            adjustedBottomAdd *= clamp;
        }

        let scrollingDown = true;
        if (scrollTop < lastKnownScrollPosition) {
            scrollingDown = false;
        }

        if (scrollingDown) {
            // When scrolling down, move the threshold up towards the default
            // downwards threshold position. If near the bottom of the page,
            // adjustedBottomAdd will offset the threshold towards the bottom
            // of the page.
            const amountScrolledDown = scrollTop - lastKnownScrollPosition;
            const adjustedDefault = defaultDownThreshold + adjustedBottomAdd;
            threshold = Math.max(adjustedDefault, threshold - amountScrolledDown);
        } else {
            // When scrolling up, move the threshold down towards the default
            // upwards threshold position. If near the bottom of the page,
            // quickly transition the threshold back up where it normally
            // belongs.
            const amountScrolledUp = lastKnownScrollPosition - scrollTop;
            const adjustedDefault = defaultUpThreshold - pixelsAbove
                + Math.max(0, adjustedBottomAdd - defaultDownThreshold);
            threshold = Math.min(adjustedDefault, threshold + amountScrolledUp);
        }

        if (documentHeight <= windowHeight) {
            threshold = 0;
        }

        if (thresholdDebug) {
            const id = 'mdbook-threshold-debug-data';
            let data = document.getElementById(id);
            if (data === null) {
                data = document.createElement('div');
                data.id = id;
                data.style.cssText = `
                    position: fixed;
                    top: 50px;
                    right: 10px;
                    background-color: 0xeeeeee;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(data);
            }
            data.innerHTML = `
                <table>
                  <tr><td>documentHeight</td><td>${documentHeight.toFixed(1)}</td></tr>
                  <tr><td>windowHeight</td><td>${windowHeight.toFixed(1)}</td></tr>
                  <tr><td>scrollTop</td><td>${scrollTop.toFixed(1)}</td></tr>
                  <tr><td>pixelsAbove</td><td>${pixelsAbove.toFixed(1)}</td></tr>
                  <tr><td>pixelsBelow</td><td>${pixelsBelow.toFixed(1)}</td></tr>
                  <tr><td>bottomAdd</td><td>${bottomAdd.toFixed(1)}</td></tr>
                  <tr><td>adjustedBottomAdd</td><td>${adjustedBottomAdd.toFixed(1)}</td></tr>
                  <tr><td>scrollingDown</td><td>${scrollingDown}</td></tr>
                  <tr><td>threshold</td><td>${threshold.toFixed(1)}</td></tr>
                </table>
            `;
            drawDebugLine();
        }

        lastKnownScrollPosition = scrollTop;
    }

    function drawDebugLine() {
        if (!document.body) {
            return;
        }
        const id = 'mdbook-threshold-debug-line';
        const existingLine = document.getElementById(id);
        if (existingLine) {
            existingLine.remove();
        }
        const line = document.createElement('div');
        line.id = id;
        line.style.cssText = `
            position: fixed;
            top: ${threshold}px;
            left: 0;
            width: 100vw;
            height: 2px;
            background-color: red;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(line);
    }

    function mdbookEnableThresholdDebug() {
        thresholdDebug = true;
        updateThreshold();
        drawDebugLine();
    }

    window.mdbookEnableThresholdDebug = mdbookEnableThresholdDebug;

    // Updates which headers in the sidebar should be expanded. If the current
    // header is inside a collapsed group, then it, and all its parents should
    // be expanded.
    function updateHeaderExpanded(currentA) {
        // Add expanded to all header-item li ancestors.
        let current = currentA.parentElement;
        while (current) {
            if (current.tagName === 'LI' && current.classList.contains('header-item')) {
                current.classList.add('expanded');
            }
            current = current.parentElement;
        }
    }

    // Updates which header is marked as the "current" header in the sidebar.
    // This is done with a virtual Y threshold, where headers at or below
    // that line will be considered the current one.
    function updateCurrentHeader() {
        if (!headers || !headers.length) {
            return;
        }

        // Reset the classes, which will be rebuilt below.
        const els = document.getElementsByClassName('current-header');
        for (const el of els) {
            el.classList.remove('current-header');
        }
        for (const toggle of headerToggles) {
            toggle.classList.remove('expanded');
        }

        // Find the last header that is above the threshold.
        let lastHeader = null;
        for (const header of headers) {
            const rect = header.getBoundingClientRect();
            if (rect.top <= threshold) {
                lastHeader = header;
            } else {
                break;
            }
        }
        if (lastHeader === null) {
            lastHeader = headers[0];
            const rect = lastHeader.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top >= windowHeight) {
                return;
            }
        }

        // Get the anchor in the summary.
        const href = '#' + lastHeader.id;
        const a = [...document.querySelectorAll('.header-in-summary')]
            .find(element => element.getAttribute('href') === href);
        if (!a) {
            return;
        }

        a.classList.add('current-header');

        updateHeaderExpanded(a);
    }

    // Updates which header is "current" based on the threshold line.
    function reloadCurrentHeader() {
        if (disableScroll) {
            return;
        }
        updateThreshold();
        updateCurrentHeader();
    }


    // When clicking on a header in the sidebar, this adjusts the threshold so
    // that it is located next to the header. This is so that header becomes
    // "current".
    function headerThresholdClick(event) {
        // See disableScroll description why this is done.
        disableScroll = true;
        setTimeout(() => {
            disableScroll = false;
        }, 100);
        // requestAnimationFrame is used to delay the update of the "current"
        // header until after the scroll is done, and the header is in the new
        // position.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Closest is needed because if it has child elements like <code>.
                const a = event.target.closest('a');
                const href = a.getAttribute('href');
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    threshold = targetElement.getBoundingClientRect().bottom;
                    updateCurrentHeader();
                }
            });
        });
    }

    // Takes the nodes from the given head and copies them over to the
    // destination, along with some filtering.
    function filterHeader(source, dest) {
        const clone = source.cloneNode(true);
        clone.querySelectorAll('mark').forEach(mark => {
            mark.replaceWith(...mark.childNodes);
        });
        dest.append(...clone.childNodes);
    }

    // Scans page for headers and adds them to the sidebar.
    document.addEventListener('DOMContentLoaded', function() {
        const activeSection = document.querySelector('#mdbook-sidebar .active');
        if (activeSection === null) {
            return;
        }

        const main = document.getElementsByTagName('main')[0];
        headers = Array.from(main.querySelectorAll('h2, h3, h4, h5, h6'))
            .filter(h => h.id !== '' && h.children.length && h.children[0].tagName === 'A');

        if (headers.length === 0) {
            return;
        }

        // Build a tree of headers in the sidebar.

        const stack = [];

        const firstLevel = parseInt(headers[0].tagName.charAt(1));
        for (let i = 1; i < firstLevel; i++) {
            const ol = document.createElement('ol');
            ol.classList.add('section');
            if (stack.length > 0) {
                stack[stack.length - 1].ol.appendChild(ol);
            }
            stack.push({level: i + 1, ol: ol});
        }

        // The level where it will start folding deeply nested headers.
        const foldLevel = 3;

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const level = parseInt(header.tagName.charAt(1));

            const currentLevel = stack[stack.length - 1].level;
            if (level > currentLevel) {
                // Begin nesting to this level.
                for (let nextLevel = currentLevel + 1; nextLevel <= level; nextLevel++) {
                    const ol = document.createElement('ol');
                    ol.classList.add('section');
                    const last = stack[stack.length - 1];
                    const lastChild = last.ol.lastChild;
                    // Handle the case where jumping more than one nesting
                    // level, which doesn't have a list item to place this new
                    // list inside of.
                    if (lastChild) {
                        lastChild.appendChild(ol);
                    } else {
                        last.ol.appendChild(ol);
                    }
                    stack.push({level: nextLevel, ol: ol});
                }
            } else if (level < currentLevel) {
                while (stack.length > 1 && stack[stack.length - 1].level > level) {
                    stack.pop();
                }
            }

            const li = document.createElement('li');
            li.classList.add('header-item');
            li.classList.add('expanded');
            if (level < foldLevel) {
                li.classList.add('expanded');
            }
            const span = document.createElement('span');
            span.classList.add('chapter-link-wrapper');
            const a = document.createElement('a');
            span.appendChild(a);
            a.href = '#' + header.id;
            a.classList.add('header-in-summary');
            filterHeader(header.children[0], a);
            a.addEventListener('click', headerThresholdClick);
            const nextHeader = headers[i + 1];
            if (nextHeader !== undefined) {
                const nextLevel = parseInt(nextHeader.tagName.charAt(1));
                if (nextLevel > level && level >= foldLevel) {
                    const toggle = document.createElement('a');
                    toggle.classList.add('chapter-fold-toggle');
                    toggle.classList.add('header-toggle');
                    toggle.addEventListener('click', () => {
                        li.classList.toggle('expanded');
                    });
                    const toggleDiv = document.createElement('div');
                    toggleDiv.textContent = '❱';
                    toggle.appendChild(toggleDiv);
                    span.appendChild(toggle);
                    headerToggles.push(li);
                }
            }
            li.appendChild(span);

            const currentParent = stack[stack.length - 1];
            currentParent.ol.appendChild(li);
        }

        const onThisPage = document.createElement('div');
        onThisPage.classList.add('on-this-page');
        onThisPage.append(stack[0].ol);
        const activeItemSpan = activeSection.parentElement;
        activeItemSpan.after(onThisPage);
    });

    document.addEventListener('DOMContentLoaded', reloadCurrentHeader);
    document.addEventListener('scroll', reloadCurrentHeader, { passive: true });
})();

