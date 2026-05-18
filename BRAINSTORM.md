# TubeFilm — Brainstorming 기록

이전 세션의 발산-수렴 결과. 새 세션이 결정 근거를 이해하고 같은 방향을 유지하기 위함.

## 출발점

사용자 요청: "유튜브 컬러 영상을 흑백으로 바꾸는 Chrome 확장을 만들고 싶다."

## 시장 조사 결과 (검색 기반)

### 단순 흑백 필터 영역 (포화)
- YouTube 흑백 필터 (chromewebstore.google.com/detail/idfhjammokilkemckgdbjckkbgmbacne)
- Monochromate
- Grayscale Filter
- YouTube Thumbnails Grayscale (썸네일만)
- Turn Off the Lights (HTML5 video 흑백 변환 포함)

→ 단순 grayscale로는 차별점 없음. 확장 방향 모색.

### 시네마틱/빈티지 필터 영역 (부분 포화)
- Video Controls Plus — Cinema/Night 프리셋, 시네마틱 색 그레이딩, 빈티지 세피아, 필름 그레인, 글리치
- Retro Display Video Filter — 비네트, 스캔라인, 인광체 마스크 (CRT 룩 완성형)
- Video Filters for YouTube [QVI] — sepia / hue-rotate / blur 슬라이더
- HiSoft YouTube Video Effects — 50+ 필터 (Love, Warm, Moonlight, Sepia, Drawing, Contour, Edge Map)
- Retro YouTube Filter — 흑백 + 빈티지 무드

→ 영문권 감성 위주. 한국 사용자 대상 문화적 프리셋(뉴진스, 야인시대 등)은 빈 자리.

## 핵심 차별화 각도

1. **한국 문화적 프리셋 큐레이션** — 기존 확장은 "Moonlight", "Love" 등 영문 추상 이름. 한국 사용자에게 즉시 이해되는 "뉴진스 디지캠", "야인시대", "오즈의 마법사" 같은 네이밍 + 그에 맞는 톤 매핑
2. **CSS filter 한계 돌파 — 그레인/스캔라인 오버레이** — 기존 확장 대부분 CSS `filter` 프로퍼티만 사용. 진짜 필름 텍스처(노이즈 오버레이), 스캔라인, 빛샘은 추가 div + mix-blend-mode로만 구현 가능. 이게 핵심 기술 차별점

## 의사결정 라운드

### 라운드 1 — 기술/범위 결정

| 질문 | 옵션 | 선택 |
|---|---|---|
| 기술 수준 | (a) CSS filter만 (b) CSS filter + 노이즈 오버레이 (c) WebGL 셰이더 | **(b)** — 그레인 차별점, 복잡도 적정 |
| MVP 프리셋 | (a) 6개 전부 (b) 민희진 감성 2개만 (c) 민희진 + 클래식 1-2개 | **(a) 6개 전부 + 슬라이더** |
| 배포 목표 | (a) 개인 사용 (b) Chrome Web Store (c) GitHub만 | **(b) Chrome Web Store 출시** |

### 라운드 2 — UX/브랜딩

| 질문 | 옵션 | 선택 |
|---|---|---|
| UI 방식 | (a) 인페이지 플로팅 패널 (b) Chrome 팝업 (c) 둘 다 | **(a) 인페이지 플로팅 패널** — 영상 보며 조정 |
| 적용 범위 | (a) YouTube만 (b) YouTube + Netflix 등 (c) 모든 HTML5 | **(a) YouTube만** — 권한 최소화, 심사 유리 |
| 이름 | (a) TubeFilm (b) Cineroll/FilmReel (c) 나중 결정 | **(a) TubeFilm** (임시, 변경 가능) |

## 거부된 옵션 / 그 이유

- **WebGL 셰이더**: 색수차/빛샘/그레인 모두 정확히 표현 가능하지만 MVP에 과한 복잡도. 디버깅 어려움. Phase 4 이후 검토 가능
- **YouTube + Netflix 동시**: Netflix는 DRM으로 인해 CSS filter가 종종 무효화됨 (검은 화면). 디버깅 부담 큼. YouTube 검증 후 확장 검토
- **`<all_urls>` 권한**: Web Store 심사 까다로움, 사용자 경고 단계 강화, 의심 받을 가능성. 명시적 `*://*.youtube.com/*`이 정직하고 안전

## 6 프리셋 톤 매핑 (CSS filter + 오버레이 초기값)

| 프리셋 | 핵심 톤 | filter | overlay |
|---|---|---|---|
| 뉴진스 디지캠 | Y2K 디지캠 (후지필름 Finepix Z5fd 톤) | saturate 1.15, brightness 1.08, contrast 0.9, sepia 0.05, hue+5 | grain 0.35 |
| 민희진 필름 | 소프트, 들뜬 블랙, 빛샘 | saturate 0.88, brightness 1.05, contrast 0.92, sepia 0.12, hue-5 | grain 0.2, lightLeak 0.5 |
| 오즈의 마법사 | 클래식 세피아 | saturate 0.3, contrast 1.1, sepia 0.8 | grain 0.15, vignette 0.6 |
| 야인시대 | 70년대 사극 | saturate 0.6, brightness 0.95, contrast 1.25, sepia 0.45 | grain 0.25, vignette 0.3 |
| 필름 누아르 | 흑백 강콘트라스트 | saturate 0, brightness 0.95, contrast 1.4, grayscale 1.0 | grain 0.4, vignette 0.7 |
| 80년대 VHS | 비디오테이프 | saturate 1.2, contrast 0.85, hue-3, blur 0.5px | grain 0.1, vignette 0.2, scanlines 0.5 |

각 프리셋은 슬라이더 3개로 미세 조정. "intensity"는 모든 효과 전체 스케일, 나머지는 효과별 개별 강도.

## 블렌드 모드 선정 (overlay div별)

| 효과 | mix-blend-mode | 이유 |
|---|---|---|
| 그레인 (노이즈 256x256 캔버스 PNG) | overlay | 회색(128) 기준 위/아래로 영상 명도에 비례한 텍스처 → 진짜 필름 그레인과 유사 |
| 스캔라인 (repeating-linear-gradient) | multiply | 어두운 가로줄이 영상을 곱셈으로 어둡게 → CRT 라인 효과 |
| 비네트 (radial-gradient) | multiply | 가장자리 어둠 → 자연스러운 vignette |
| 빛샘 (radial-gradient 코너 오렌지/핑크) | screen | 색이 영상 위에 더해져 빛이 새는 느낌 |

단일 mix-blend-mode 사용 대신 4개 레이어로 분리한 이유: 효과별로 자연스러운 블렌드 모드가 다름. 하나로 통합하면 일부 효과 품질 저하.

## 시각 디자인 결정

- **다크 패널** (rgba(20,20,22,0.92) + backdrop-blur): YouTube 자체 어두운 UI와 일관성
- **2열 그리드** 프리셋 버튼: 6개를 컴팩트하게 표시
- **활성 프리셋 하이라이트**: 옅은 블루 (rgba(120,180,255,0.18)) — YouTube 빨간색과 충돌 피함
- **z-index: 2147483647** (max int32): YouTube의 어떤 오버레이보다 위
- **드래그 가능 + 위치 저장**: 사용자가 영상에 안 가리게 배치 가능

## 미해결 (추후 결정)

- 광고 구간에 필터 적용/해제 옵션화 (Phase 2)
- 프리셋 자동 저장 (즐겨찾기), 사용자 커스텀 프리셋 (Phase 4 이후)
- 다른 영상 사이트 확장 (Twitch, Vimeo) — 사용자 수요 보고 결정
