(() => {
  const TF = (window.__TubeFilm = window.__TubeFilm || {});

  TF.PRESETS = {
    'newjeans-digicam': {
      name: '뉴진스 디지캠',
      desc: 'Y2K 디지털 캠코더 톤',
      filter: { saturate: 1.15, brightness: 1.08, contrast: 0.90, sepia: 0.05, hueRotate: 5 },
      overlay: { grain: 0.35, vignette: 0.0, scanlines: 0.0, lightLeak: 0.0 },
      sliders: [
        { key: 'intensity', label: '전체 강도', default: 100 },
        { key: 'grain', label: '그레인', default: 100 },
        { key: 'warmth', label: '색온도(따뜻)', default: 50 }
      ]
    },
    'minheejin-film': {
      name: '민희진 필름',
      desc: '소프트 · 들뜬 블랙 · 빛샘',
      filter: { saturate: 0.88, brightness: 1.05, contrast: 0.92, sepia: 0.12, hueRotate: -5 },
      overlay: { grain: 0.20, vignette: 0.0, scanlines: 0.0, lightLeak: 0.5 },
      sliders: [
        { key: 'intensity', label: '전체 강도', default: 100 },
        { key: 'lightLeak', label: '빛샘', default: 100 },
        { key: 'grain', label: '그레인', default: 100 }
      ]
    },
    'wizard-of-oz': {
      name: '오즈의 마법사',
      desc: '클래식 세피아 · 비네트',
      filter: { saturate: 0.30, brightness: 1.00, contrast: 1.10, sepia: 0.80, hueRotate: 0 },
      overlay: { grain: 0.15, vignette: 0.6, scanlines: 0.0, lightLeak: 0.0 },
      sliders: [
        { key: 'sepia', label: '세피아', default: 100 },
        { key: 'vignette', label: '비네트', default: 100 },
        { key: 'grain', label: '그레인', default: 100 }
      ]
    },
    'yain-shidae': {
      name: '야인시대',
      desc: '70년대 한국 사극 톤',
      filter: { saturate: 0.60, brightness: 0.95, contrast: 1.25, sepia: 0.45, hueRotate: 0 },
      overlay: { grain: 0.25, vignette: 0.3, scanlines: 0.0, lightLeak: 0.0 },
      sliders: [
        { key: 'contrast', label: '콘트라스트', default: 100 },
        { key: 'sepia', label: '세피아', default: 100 },
        { key: 'grain', label: '그레인', default: 100 }
      ]
    },
    'film-noir': {
      name: '필름 누아르',
      desc: '흑백 · 강콘트라스트',
      filter: { saturate: 0.00, brightness: 0.95, contrast: 1.40, sepia: 0.00, hueRotate: 0, grayscale: 1.0 },
      overlay: { grain: 0.40, vignette: 0.7, scanlines: 0.0, lightLeak: 0.0 },
      sliders: [
        { key: 'contrast', label: '콘트라스트', default: 100 },
        { key: 'grain', label: '그레인', default: 100 },
        { key: 'vignette', label: '비네트', default: 100 }
      ]
    },
    'vhs-80s': {
      name: '80년대 VHS',
      desc: '비디오테이프 · 스캔라인',
      filter: { saturate: 1.20, brightness: 1.00, contrast: 0.85, sepia: 0.0, hueRotate: -3, blur: 0.5 },
      overlay: { grain: 0.10, vignette: 0.2, scanlines: 0.5, lightLeak: 0.0 },
      sliders: [
        { key: 'scanlines', label: '스캔라인', default: 100 },
        { key: 'blur', label: '블러', default: 100 },
        { key: 'intensity', label: '전체 강도', default: 100 }
      ]
    }
  };

  TF.PRESET_ORDER = [
    'newjeans-digicam',
    'minheejin-film',
    'wizard-of-oz',
    'yain-shidae',
    'film-noir',
    'vhs-80s'
  ];
})();
