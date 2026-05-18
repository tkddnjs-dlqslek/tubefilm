# TubeFilm — 세션 핸드오프 문서

> 이전 세션에서 진행한 작업과 컨텍스트를 새 세션이 그대로 이어받기 위한 문서.
> **새 세션 시작 시 가장 먼저 이 파일을 읽고 PLAN.md, BRAINSTORM.md를 함께 참조할 것.**

## 한 줄 요약

YouTube 영상에 영화/필름 감성 필터(6개 프리셋 + 슬라이더)를 입히는 Chrome 확장. Manifest V3. Chrome Web Store 출시 목표. **Phase 1 (MVP) 코드 완성 상태, 실제 브라우저 테스트 미진행.**

## 새 세션이 첫 메시지에서 할 일 (체크리스트)

1. [ ] 이 `HANDOFF.md`, `BRAINSTORM.md`, `PLAN.md` 세 문서 읽기
2. [ ] 사용자에게 push target 저장소 이름 확인 (예: `tubefilm`)
3. [ ] GitHub MCP로 해당 저장소 권한 있는지 확인 (`mcp__github__get_me`, `mcp__github__list_branches` 등으로 테스트)
4. [ ] 권한 OK면 번들 내 모든 파일을 `main` 브랜치에 일괄 push (`mcp__github__push_files`)
5. [ ] 사용자에게 "로컬 clone → Chrome 개발자 모드로 로드 → YouTube에서 패널 확인" 안내
6. [ ] 사용자 피드백 수신 후 **Phase 2** 진행 (PLAN.md 참고)

## 이전 세션의 의사결정 (확정 사항, 변경 시 사용자 확인 필수)

| 항목 | 결정 | 근거 |
|---|---|---|
| 기술 수준 | CSS filter + 노이즈 오버레이 | 기존 확장 대부분 CSS filter만 사용 → 그레인이 차별점. WebGL은 MVP에 과함 |
| 프리셋 | 6개 (뉴진스 디지캠, 민희진 필름, 오즈의 마법사, 야인시대, 필름 누아르, 80년대 VHS) | 사용자 선택 |
| UI | 인페이지 플로팅 드래그 패널 (우상단 기본) | 영상 보며 슬라이더 조정 가능 |
| 적용 범위 | YouTube만 (`*://*.youtube.com/*`) | 권한 최소화로 Web Store 심사 유리 |
| 배포 | Chrome Web Store 출시 | 사용자 결정 |
| 이름 | TubeFilm (임시, 변경 가능) | 중립적, 상표 충돌 적음 |
| 프레임워크 | Vanilla JS (IIFE + window.__TubeFilm 네임스페이스) | 번들 크기 최소화, 의존성 0 |
| 저장소 동기화 | `chrome.storage.sync` | 기기 간 설정 공유 |
| 그레인 생성 | canvas 즉석 생성 (외부 PNG 무의존) | 라이선스 문제 회피 |

## 워크플로우 재현 가이드

이전 세션은 다음 순서로 진행했습니다. 새 세션도 동일하게 유지해주세요:

1. **Brainstorm** — 핵심 결정사항을 `AskUserQuestion`으로 2~3 라운드 물어서 확정
2. **Plan 작성** — 사용자가 plan mode를 명시할 경우 `ExitPlanMode` 사용, 아니면 텍스트로 명료한 계획 제출 후 승인 대기
3. **Phase별 구현** — 사용자가 "C" 옵션 (Phase별로 끊어서)을 선택했음. **Phase 1 → 사용자 검토 → Phase 2 → 검토 → Phase 3** 순서 유지
4. **테스트** — 이 환경은 클라우드 컨테이너라 Chrome 브라우저 테스트 불가. 사용자에게 로컬에서 검증 요청
5. **커밋 메시지 스타일** — 한국어, `feat(tubefilm): 한국어 요약 — 추가 설명` 형식 (이전 저장소 컨벤션 참고)

## 알려진 제약 / 이슈

- **이전 환경 GitHub MCP 제한**: 이전 세션은 `tkddnjs-dlqslek/k-apt-alert`에만 잠겨있어 push 불가했음. 새 세션은 새 저장소에 자유롭게 push 가능해야 함 (사용자 권한 부여 완료 가정)
- **브라우저 테스트 미진행**: Phase 1 코드는 문법 검증(`node --check`)만 통과. 실제 YouTube에서 작동 여부는 사용자 첫 테스트가 검증 시점
- **풀스크린/시어터/PiP**: Phase 2 작업. 현재 코드는 일반 재생만 보장
- **광고 구간**: 광고 영상에도 필터 적용됨 (현재 의도된 동작). 옵션화는 Phase 2
- **아이콘 / 팝업 / 스토어 자산**: Phase 3 미구현

## 폴더 구조

```
tubefilm/
├── manifest.json              # MV3 매니페스트
├── README.md                  # 사용자 대상 설명 (개발자 모드 로드법 포함)
└── content/
    ├── presets.js             # 6개 프리셋 정의 (filter / overlay / sliders)
    ├── filter.js              # CSS filter 문자열 생성 + 4종 오버레이 div 관리
    ├── panel.js               # 플로팅 패널 UI (드래그 / 슬라이더 / 프리셋 선택)
    ├── content.js             # 진입점 (storage / 비디오 감시 / 콜백 / SPA 라우팅)
    └── styles.css             # 패널 + 오버레이 레이어 스타일
```

## 사용된 도구 / 패턴 메모

- `window.__TubeFilm` 글로벌 네임스페이스로 각 IIFE가 서로 참조 (ES module 안 씀 — content script 환경)
- 매니페스트 `content_scripts.js` 배열 순서대로 로드되어 의존성 해결: presets → filter → panel → content
- `MutationObserver` + URL 폴링(500ms)으로 YouTube SPA 라우팅 추적
- `chrome.storage.sync.set` 디바운스 200ms로 슬라이더 드래그 시 과도한 쓰기 방지
- 오버레이는 비디오의 부모 엘리먼트에 추가, `position: relative`가 아니면 강제 적용
- 그레인=overlay, 스캔라인/비네트=multiply, 빛샘=screen 블렌드 모드

## 다음 우선 작업 (Phase 2)

PLAN.md 참고. 요약:
1. 풀스크린 시 오버레이 재부착 (`fullscreenchange` 이벤트)
2. 시어터 모드 / 미니 플레이어 비디오 컨테이너 변경 추적
3. 광고 구간 감지 + 비활성화 옵션
4. 패널 위치 화면 밖으로 나가지 않게 클램프 (현재 구현 있음, 윈도우 리사이즈 시 재조정 필요)
5. 슬라이더 키보드 접근성 (이미 native input range라 기본 지원, 테스트 필요)

## 참고: 시장 조사 결과 (BRAINSTORM.md에 상세)

- 단순 grayscale 확장: 이미 다수 (YouTube Black & White Filter, Video Filters [QVI] 등)
- 시네마틱 프리셋 확장: 일부 존재 (Video Controls Plus, Retro Display Video Filter, HiSoft YouTube Video Effects)
- **차별점**: 한국 사용자 대상 문화적 프리셋 네이밍(뉴진스 디지캠, 야인시대 등) + 그레인/스캔라인 오버레이로 진짜 필름 텍스처
