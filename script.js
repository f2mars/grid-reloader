// ==UserScript==
// @name         Simple grid reloader
// @namespace    http://tampermonkey.net/
// @version      2025-02-07
// @description  Simple grid reloader extension
// @author       f2mars
// @match        https://omega.omega365.com/nt/scope-items*
// @match        https://omega.omega365.com/scope-items*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=omega365.com
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/f2mars/grid-reloader/main/script.js
// @downloadURL  https://raw.githubusercontent.com/f2mars/grid-reloader/main/script.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.top !== window.self) return;

  // Parameters to customize ------------------------------------------------------------------------------------------------
  const autoStart = true;
  const refreshPause = 5 * 60 * 1000;
  const lampColors = {
    on: "rgb(0 188 8)",
    off: "#F44336",
    pending: "#FF9800",
  };
  // ------------------------------------------------------------------------------------------------------------------------

  // container: document ----------------------------------------------------------------------------------------------------
  const gridViewportSelector =
    "#scope-library_dsScopeItems_grid > div.col-container > div.o365-datagrid-viewport-panel";
  // ------------------------------------------------------------------------------------------------------------------------

  // container: $gridViewport -----------------------------------------------------------------------------------------------
  const refreshBtnSelector =
    "div.o365-grid-body > div.o365-footer > button:has(i.bi-arrow-clockwise)";
  const gridMainListSelector =
    "div.o365-grid-body.center-viewport-overflown > div.o365-body-center-viewport.o365-main-list";
  // ------------------------------------------------------------------------------------------------------------------------

  // container: $gridMainList -----------------------------------------------------------------------------------------------
  const loadingOverlaySelector = "div.overlay";
  // ------------------------------------------------------------------------------------------------------------------------
  const spinDuration = 300;
  let $gridViewport = null;
  let $refreshBtn = null;
  let $gridMainList = null;
  let $lamp = null;
  let refreshInterval = null;
  let lastRefresh = null;

  getRequiredElements().then(init);

  function init() {
    initStyles();
    initNewElements();

    if (autoStart) enable();
  }

  function initNewElements() {
    $lamp = document.createElement("div");
    $lamp.classList.add("ext-reloader-lamp");

    $refreshBtn.addEventListener("mouseover", updateTimer);
    $refreshBtn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      toggle();
    });
    $refreshBtn.addEventListener("click", handleRefresh);
    $refreshBtn.style.position = "relative";
    $refreshBtn.append($lamp);
  }

  function initStyles() {
    const styles = document.createElement("style");
    styles.innerHTML = `
          .ext-reloader-spin {
            rotate: 360deg;
            transition: rotate ${spinDuration}ms;
          }

          .ext-reloader-lamp {
            height: 5px;
            width: 5px;
            border-radius: 50%;
            position: absolute;
            top: 50%;left: 50%;
            transform: translate(-50%, -50%);
            background-color: transparent;
            background-color = ${lampColors.off};
            transition: background-color 250ms;
          }
        `;
    document.body.append(styles);
  }

  async function getRequiredElements() {
    return new Promise(async (resolve, reject) => {
      await querySelectorAsync(gridViewportSelector).then(($el) => {
        $gridViewport = $el;
      });

      await querySelectorAsync(gridMainListSelector, $gridViewport).then(
        ($el) => {
          $gridMainList = $el;
        }
      );

      querySelectorAsync(refreshBtnSelector, $gridViewport).then(($el) => {
        $refreshBtn = $el;
        resolve();
      });
    });
  }

  async function querySelectorAsync(
    elementSelector,
    container = document,
    { retryPause, retry } = { retryPause: 1000, retry: 10 }
  ) {
    let $el;
    let iteration = 0;

    return new Promise((resolve, reject) => {
      const lookForElInterval = setInterval(() => {
        $el = container.querySelector(elementSelector);
        if ($el) {
          clearInterval(lookForElInterval);
          return resolve($el);
        }

        if (++iteration > retry) {
          console.warn(`Element ${elementSelector} not founc.`);
          return reject(new Error(`Element ${elementSelector} not found.`));
          clearInterval(lookForElInterval);
        }
      }, retryPause);
    });
  }

  function refreshedAgo() {
    if (lastRefresh === null) return "never";

    const now = (Date.now() / 1000).toFixed();
    let diff = now - lastRefresh;

    if (diff < 60) return `${diff} sec. ago`;

    diff = (diff / 60).toFixed();
    if (diff < 60) return `${diff} min. ago`;

    diff = (diff / 60).toFixed();
    return `${diff} hours. ago`;
  }

  function handleRefresh(e) {
    const overlay = $gridMainList.querySelector(loadingOverlaySelector);

    if (overlay && refreshInterval) {
      handlePending();
      onElementRemoved(overlay, () => {
        enable();
      });
    }
    $refreshBtn.classList.add("ext-reloader-spin");
    $refreshBtn.addEventListener(
      "transitionend",
      () => $refreshBtn.classList.remove("ext-reloader-spin"),
      { once: true }
    );
    lastRefresh = (Date.now() / 1000).toFixed();
    if (e.trusted && refreshInterval) reenable();
    handleNewData();
  }

  function handleNewData() {}

  function updateTimer() {
    $refreshBtn.title = "Last refresh: " + refreshedAgo();
  }

  function reenable() {
    // reset refresh interval
    disable();
    enable();
  }

  function handlePending() {
    clearInterval(refreshInterval);
    refreshInterval = null;
    $lamp.style.backgroundColor = lampColors.pending;
  }

  function enable() {
    if (refreshInterval) return console.warn("Reloader is already enabled");
    refreshInterval = setInterval(() => {
      $refreshBtn.click();
      lastRefresh = (Date.now() / 1000).toFixed();
    }, refreshPause);
    $lamp.style.backgroundColor = lampColors.on;
  }

  function disable() {
    clearInterval(refreshInterval);
    refreshInterval = null;
    $lamp.style.backgroundColor = lampColors.off;
  }

  function toggle() {
    if (refreshInterval) {
      disable();
    } else {
      enable();
    }
  }

  function onElementRemoved(element, callback) {
    new MutationObserver(function (mutations) {
      if (!document.body.contains(element)) {
        callback();
        this.disconnect();
      }
    }).observe(element.parentElement, { childList: true });
  }
})();
