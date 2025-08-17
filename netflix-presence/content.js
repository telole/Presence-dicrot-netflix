(function () {
  const WS_PING_MS = 15000;

  function parseTitle() {
    const t1 = document.querySelector('[data-uia="video-title"]')?.textContent?.trim();
    if (t1) return { title: t1 };

    const raw = document.title.replace(" | Netflix", "").replace("Netflix", "").trim();
    const m = raw.match(/(.*?)(?:\s-\s)?S(\d+)\s?E(\d+)/i);
    if (m) return { title: m[1].trim(), season: +m[2], episode: +m[3] };

    return { title: raw };
  }

  function getPlayback() {
    const video = document.querySelector("video");
    if (!video) return {};
    return {
      position: Math.floor(video.currentTime || 0),
      duration: Math.floor(video.duration || 0),
      paused: video.paused
    };
  }

  function collect() {
    const meta = parseTitle();
    const play = getPlayback();
    const url = location.href;
    return { ...meta, ...play, url, platform: "netflix" };
  }

  let lastPayload = "";
  function heartbeat() {
    const payload = JSON.stringify(collect());
    if (payload !== lastPayload) {
      chrome.runtime.sendMessage({ type: "NF_STATUS", payload: JSON.parse(payload) });
      lastPayload = payload;
    }
  }
  setInterval(heartbeat, WS_PING_MS);
  heartbeat();

  ["play", "pause", "seeked"].forEach(ev => {
    document.addEventListener(ev, () => setTimeout(heartbeat, 300), true);
  });

  const mo = new MutationObserver(() => setTimeout(heartbeat, 300));
  mo.observe(document.querySelector("title") || document.documentElement, { subtree: true, childList: true, characterData: true });
})();