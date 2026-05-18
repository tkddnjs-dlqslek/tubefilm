(() => {
  const TF = (window.__TubeFilm = window.__TubeFilm || {});

  const STORAGE_KEY = 'tubefilm.state.v1';
  const DEFAULT_STATE = {
    enabled: true,
    activePreset: null,
    sliderValues: {},
    position: null,
    collapsed: false,
    adFilterOff: false,
    hintDismissed: false
  };

  let state = { ...DEFAULT_STATE };
  let currentVideo = null;
  let videoObserver = null;
  let saveTimer = null;
  let adObserver = null;
  let resizeTimer = null;
  let storageWarned = false;
  let adActive = false;

  function loadState() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(STORAGE_KEY, (data) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            warnStorageOnce();
          }
          const loaded = data && data[STORAGE_KEY];
          state = { ...DEFAULT_STATE, ...(loaded || {}) };
          state.sliderValues = state.sliderValues || {};
          resolve();
        });
      } catch {
        warnStorageOnce();
        resolve();
      }
    });
  }

  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        chrome.storage.sync.set({ [STORAGE_KEY]: state }, () => {
          if (chrome.runtime && chrome.runtime.lastError) warnStorageOnce();
        });
      } catch {
        warnStorageOnce();
      }
    }, 200);
  }

  function warnStorageOnce() {
    if (storageWarned) return;
    storageWarned = true;
    if (TF.showToast) TF.showToast('저장소 접근 실패 — 이번 세션에서만 설정 유지됩니다', 4000);
  }

  function getDefaultSliderValues(presetId) {
    const preset = TF.PRESETS[presetId];
    const out = {};
    preset.sliders.forEach((s) => { out[s.key] = s.default; });
    return out;
  }

  function findVideo() {
    return document.querySelector('video.html5-main-video') || document.querySelector('video');
  }

  function applyCurrent() {
    const video = findVideo();
    if (!video) return;
    if (currentVideo && currentVideo !== video) {
      TF.clearVideo(currentVideo);
    }
    currentVideo = video;

    const shouldDisable =
      !state.enabled ||
      !state.activePreset ||
      (state.adFilterOff && adActive);

    if (shouldDisable) {
      TF.clearVideo(video);
      return;
    }
    const preset = TF.PRESETS[state.activePreset];
    if (!preset) return;
    const values = state.sliderValues[state.activePreset] || getDefaultSliderValues(state.activePreset);
    TF.applyToVideo(video, preset, values);
  }

  function rerenderPanel() {
    TF.mountPanel(state, callbacks);
    const panel = document.getElementById('tubefilm-panel');
    if (panel && !state.enabled) panel.classList.add('tubefilm-disabled');
  }

  const callbacks = {
    onToggleEnabled() {
      state.enabled = !state.enabled;
      saveState();
      applyCurrent();
      rerenderPanel();
    },
    onToggleCollapsed() {
      state.collapsed = !state.collapsed;
      saveState();
      rerenderPanel();
    },
    onSelectPreset(id) {
      state.activePreset = id;
      if (!state.sliderValues[id]) {
        state.sliderValues[id] = getDefaultSliderValues(id);
      }
      saveState();
      applyCurrent();
      rerenderPanel();
    },
    onSlider(key, value) {
      const id = state.activePreset;
      if (!id) return;
      state.sliderValues[id] = state.sliderValues[id] || getDefaultSliderValues(id);
      state.sliderValues[id][key] = value;
      saveState();
      applyCurrent();
    },
    onToggleAdFilter(value) {
      state.adFilterOff = !!value;
      saveState();
      applyCurrent();
    },
    onDismissHint() {
      state.hintDismissed = true;
      saveState();
    }
  };

  TF._onPositionChange = (pos) => {
    state.position = pos;
    saveState();
  };

  function watchVideoChanges() {
    if (videoObserver) videoObserver.disconnect();
    videoObserver = new MutationObserver(() => {
      const v = findVideo();
      if (v && v !== currentVideo) {
        applyCurrent();
      }
    });
    videoObserver.observe(document.body, { childList: true, subtree: true });
  }

  function watchUrlChanges() {
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(applyCurrent, 300);
      }
    }, 500);
  }

  function watchAds() {
    const moviePlayer = document.querySelector('#movie_player');
    const target = moviePlayer || document.body;
    const readAdState = () => {
      const mp = document.querySelector('#movie_player');
      return !!(mp && mp.classList.contains('ad-showing'));
    };
    adActive = readAdState();
    if (adObserver) adObserver.disconnect();
    adObserver = new MutationObserver(() => {
      const next = readAdState();
      if (next !== adActive) {
        adActive = next;
        applyCurrent();
      }
    });
    adObserver.observe(target, { attributes: true, subtree: true, attributeFilter: ['class'] });
  }

  function handleFullscreenChange() {
    const fsEl = document.fullscreenElement;
    if (TF.setPanelHost) TF.setPanelHost(fsEl || null);
    if (currentVideo && TF.reattachOverlay) TF.reattachOverlay(currentVideo);
    setTimeout(() => {
      applyCurrent();
      if (TF.clampPanel) TF.clampPanel();
    }, 50);
  }

  function watchResize() {
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (TF.clampPanel) TF.clampPanel();
      }, 200);
    });
  }

  function watchPip() {
    const attach = (video) => {
      if (!video || video.__tfPipBound) return;
      video.__tfPipBound = true;
      video.addEventListener('enterpictureinpicture', () => {
        if (TF.showToast) TF.showToast('PiP 모드에서는 필터가 적용되지 않습니다', 3500);
      });
    };
    attach(findVideo());
    const obs = new MutationObserver(() => attach(findVideo()));
    obs.observe(document.body, { childList: true, subtree: true });
  }

  async function init() {
    await loadState();
    rerenderPanel();
    applyCurrent();
    watchVideoChanges();
    watchUrlChanges();
    watchAds();
    watchResize();
    watchPip();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
