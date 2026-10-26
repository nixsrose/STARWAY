# STARWAY v0.397

우주 도로를 달리는 HTML5 아케이드 주행·플랫포머 게임입니다.
JavaScript / Canvas 클라이언트와 Cloudflare Worker / D1 온라인 기능으로 구성되어 있습니다.

## 로컬 실행
Node.js와 npm을 설치한 뒤 프로젝트 폴더에서 실행합니다.

```bash
npm run dev
```

브라우저에서 http://localhost:4173 에 접속합니다. 중지는 Ctrl+C입니다.
스토리·무한·도전 및 로컬 맵 편집은 정적 클라이언트에서 실행합니다.
온라인 창작 맵 공유·서버 기록 API는 별도 Worker와 D1 구성이 필요합니다.

## 빌드 및 검사

```bash
npm run build
node scripts/check-release.cjs
```

클라이언트 소스는 dist/*.js, CSS는 dist/cockpit.css 입니다.
생성된 dist/starway-*.js 및 dist/server/index.js 대신 원본 모듈을 수정하세요.
package.json의 기존 패키지 버전과 실제 게임 버전은 별개입니다.
실제 게임 버전은 dist/version.json에서 확인합니다.

## 폴더
- dist/: 게임 클라이언트, 에셋, 빌드 결과
- worker/: 온라인 기능 서버 원본
- shared/: 클라이언트·서버 공용 규칙
- drizzle/: D1 데이터베이스 스키마
- scripts/: 빌드·미리보기·검사 도구
- tests/: 자동 검증 및 테스트용 맵
- data/: 맵 참조 데이터
- assets/: 오디오 원본 및 크레딧
- docs/: 개발·검증 문서
- integrations/: 플랫폼 연동 자료

## GitHub에 올리기
ZIP을 해제한 뒤 STARWAY 폴더 안의 파일과 폴더를 저장소에 업로드합니다.
ZIP 하나만 업로드하면 GitHub에서 소스를 바로 탐색할 수 없습니다.
원격 저장소 연결 정보, 기존 Git 이력, 배포 계정 정보 및 사용자 저장 데이터는 포함하지 않았습니다.
처음에는 비공개 저장소를 권장합니다. 공개 시 소스와 맵을 누구나 열람할 수 있습니다.
오디오의 사용 조건과 저작자 표시는 assets/audio의 CREDITS.md를 확인하세요.

## 호스팅 참고
기존 Sites 배포 메타데이터는 프로젝트 재빌드를 위해 포함되어 있지만,
GitHub 업로드만으로 게임이나 온라인 API가 자동 배포되지는 않습니다.
GitHub Pages는 정적 파일만 제공하며 Worker/D1을 실행하지 않습니다.
사용자 저장 데이터는 브라우저와 운영 중인 DB에 있으며 이 소스 ZIP에는 없습니다.

## v0.397 변경 사항
- ?filming=1 주소로 접속하면 촬영용 전체 해금 상태를 제공합니다.
- 촬영 모드는 임시 저장소를 사용하므로 일반 저장 데이터에 영향을 주지 않습니다.
- 촬영 모드에서는 온라인 업로드와 서버 기록 등록을 차단합니다.
- 고스트는 완주 성공이 확인된 주행 중 가장 빠른 기록만 저장·재생합니다.
- 기존 미확인 고스트는 사용하지 않으며, 업데이트 후 완주하면 새로 기록합니다.

추가 검증: node tests/filming-mode.cjs 및 node tests/ghost-success-only.cjs

## GitHub Pages 음악 경로 수정
음악과 버전 확인 파일을 상대 경로로 불러옵니다. /STARWAY/dist/ 같은 하위 경로에서도 사용할 수 있습니다.

## 저장소 첫 주소에서 게임 실행
최상위 index.html이 dist/로 자동 이동합니다. GitHub Pages에서 main 브랜치 / (root)를 배포하면 됩니다. 기존 저장소의 .github/workflows 설정 파일은 이 압축본에 포함되어 있지 않습니다.

## 배포 기본 맵
제공된 백업의 수정 스토리 맵 14개를 기본 맵으로 내장했습니다. 나머지 맵은 기존 소스를 유지합니다. 도전 맵 3개를 포함하고, 연료 생존은 별도로 제공된 마지막 맵 파일을 반영했습니다. 포함 목록은 docs/included-release-maps.json입니다. 기존 사용자 저장 맵이 있으면 사용자 맵이 우선합니다. 개인 코인·기록·해금은 포함하지 않습니다.
