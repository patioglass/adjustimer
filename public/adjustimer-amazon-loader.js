console.log("Content Script: inject script Amazon Prime");

const INTERVAL_TIME = 300;

(() => {
  if (window.__adjustimerAmazonLoader) return;
  window.__adjustimerAmazonLoader = true;

  const STATE_ELEMENT_ID = "adjustimer-amazon-playback-state";
  let cachedContexts = null;

  const getFiber = (element) => {
    if (!element) return null;
    const key = Object.keys(element).find((name) =>
      name.startsWith("__reactFiber") || name.startsWith("__reactInternalInstance")
    );
    return key ? element[key] : null;
  };

  const inspectFiber = (fiber, result) => {
    let node = fiber;
    for (let depth = 0; node && depth < 30; depth += 1, node = node.return) {
      const contexts = [node.stateNode?.context, node.stateNode?.props?.context];
      for (const context of contexts) {
        if (!context) continue;
        if (!result.timeline && context.timeline) result.timeline = context.timeline;
        if (!result.adPlayback && context.adPlayback) result.adPlayback = context.adPlayback;
      }
    }
  };

  const findContexts = () => {
    const result = {};
    const roots = document.querySelectorAll(
      ".webPlayerSDKContainer, .webPlayerUIContainer, .atvwebplayersdk-player-container, .atvwebplayersdk-bottompanel-container, .dv-player-fullscreen"
    );
    for (const root of roots) {
      inspectFiber(getFiber(root), result);
      for (const element of root.querySelectorAll("*")) {
        inspectFiber(getFiber(element), result);
        if (result.timeline && result.adPlayback) return result;
      }
    }
    return result;
  };

  const getPositionMs = (contexts) => {
    const timelinePosition = Number(contexts?.timeline?.timelineInfo?.positionMs);
    // ReactのuseStateの値の参照なので、前の情報を取得することになるため、＋INTERVAL_TIME秒 する
    console.log(timelinePosition)
    return Number.isFinite(timelinePosition) ? timelinePosition + INTERVAL_TIME : null;
  };

  const update = () => {
    let positionMs = getPositionMs(cachedContexts);
    if (positionMs === null) {
      cachedContexts = findContexts();
      positionMs = getPositionMs(cachedContexts);
    }

    const currentAdInfo = cachedContexts?.adPlayback?.currentAdInfo;
    const adPlaying = currentAdInfo != null || Boolean(document.querySelector(
      ".atvwebplayersdk-ad-timer, .atvwebplayersdk-ad-timer-remaining-time"
    ));

    let stateElement = document.getElementById(STATE_ELEMENT_ID);
    if (!stateElement) {
      stateElement = document.createElement("span");
      stateElement.id = STATE_ELEMENT_ID;
      stateElement.hidden = true;
      (document.body || document.documentElement).appendChild(stateElement);
    }
    if (positionMs !== null) {
      stateElement.setAttribute("data-position-ms", String(positionMs));
    } else {
      stateElement.removeAttribute("data-position-ms");
    }
    stateElement.setAttribute("data-ad-playing", String(adPlaying));
  };

  new MutationObserver((mutations) => {
    const playerChanged = mutations.some((mutation) =>
      [...mutation.addedNodes, ...mutation.removedNodes].some((node) =>
        node instanceof Element && (node.matches("video, .webPlayerSDKContainer, .webPlayerUIContainer")
          || Boolean(node.querySelector("video, .webPlayerSDKContainer, .webPlayerUIContainer")))
      )
    );
    if (playerChanged) {
      cachedContexts = null;
      console.log("Content Script: inject script playerChanged cache clear.");
      update();
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  setInterval(update, INTERVAL_TIME);
  update();
})();
