# Changelog

본 프로젝트의 모든 주요 변경사항을 이 파일에 기록합니다.

형식: [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/), 버전 규칙: [SemVer](https://semver.org/lang/ko/).

## [Unreleased]

### Added
- Phase 3 출시 준비 자산: 아이콘(16/48/128), `PRIVACY.md`/`PRIVACY.en.md`, `STORE_LISTING.md`, `scripts/build.sh`, `CHANGELOG.md`
- `.gitignore` (dist 산출물 제외)

## [0.2.0] — 2026-05-18

### Added
- 풀스크린 진입/종료 대응 (`fullscreenchange`) — 패널 호스트 이동 + 오버레이 재부착
- 시어터 모드 / 미니 플레이어 전환 시 stale 오버레이 정리 후 재생성
- YouTube 광고 감지 (`#movie_player.ad-showing`) + "광고에는 필터 끄기" 옵션
- PiP 진입 시 토스트 안내 (`enterpictureinpicture`)
- 윈도우 리사이즈 시 패널 viewport 안 클램프 (200ms 디바운스)
- 첫 진입 가이드 배너 (`hintDismissed` 상태)
- 비디오 해상도에 따른 그레인 해상도 자동 선택 (128/256, 크기별 캐시)
- `chrome.storage` 실패 시 토스트 안내 (`warnStorageOnce`)

### Changed
- `manifest.json` 버전 0.1.0 → 0.2.0

### Documentation
- `RISKS.md` — Phase 2 예상 리스크 사전 기록 (R1~R10)
- `PLAN.md` — Phase 2 항목 ✅ 마킹

## [0.1.0] — 2026-05-18

### Added
- Phase 1 MVP
- Manifest V3, `*.youtube.com` 호스트 권한, `storage` 권한
- 6개 프리셋: 뉴진스 디지캠 · 민희진 필름 · 오즈의 마법사 · 야인시대 · 필름 누아르 · 80년대 VHS
- CSS filter 빌더 + 4종 오버레이 (grain, scanline, vignette, light leak)
- 플로팅 패널 (드래그, 슬라이더, ON/OFF, 접기)
- `chrome.storage.sync` 자동 저장
- YouTube SPA 라우팅 추적 (`MutationObserver` + URL 폴링)

[Unreleased]: https://github.com/tkddnjs-dlqslek/tubefilm/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/tkddnjs-dlqslek/tubefilm/releases/tag/v0.2.0
[0.1.0]: https://github.com/tkddnjs-dlqslek/tubefilm/releases/tag/v0.1.0
