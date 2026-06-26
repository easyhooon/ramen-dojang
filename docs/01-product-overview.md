# 라멘 도장깨기 Product Overview

## 1. 제품 방향

라멘집 방문 기록을 가볍게 쌓고, 이후 동기화와 지도 기반 도장깨기로 확장하는 웹사이트 + 토스 미니앱 서비스다.

초기 목표는 앱스토어/플레이스토어 배포용 native wrapper나 로그인 있는 개인화 서비스가 아니라, 같은 웹 코어를 토스 미니앱으로 먼저 올릴 수 있는지 검증하는 것이다. 1차 MVP는 로그인 없이 공용 라멘집 카탈로그를 서버에서 받고, 개인 방문 기록과 위시리스트만 로컬 저장에 둔다. 서버는 라멘집 검색 데이터 갱신용으로 필요하고, 계정과 개인 기록 동기화는 기록 경험이 쓸 만해진 뒤 붙인다.

## 2. 핵심 컨셉

- 다녀온 라멘집을 안정적으로 기록한다.
- 어떤 메뉴를 먹었는지, 국물/면/토핑/재방문 의사는 어땠는지 기록한다.
- 가보고 싶은 라멘집을 저장한다.
- 지역, 스타일, 방문 여부 기준으로 내가 쌓은 라멘 도장을 돌아볼 수 있게 확장한다.
- 각 방문 기록과 라멘집 상세 페이지는 공유 가능해야 한다.

## 3. About 문구 초안

```text
라멘집 도장깨기를 위한 작은 기록장입니다.

다녀온 곳과 맛의 기억을 남기고, 언젠가 다시 가고 싶은 라멘집을 모아둡니다.
하나씩 찾아가며 나만의 라멘 지도를 채워보세요.
```

## 4. 모노레포 구조

```text
ramen-dojang/
  apps/
    web/

  server/
    api/

  packages/
    api-client/

  infra/
    docker-compose.yml
    caddy/
    postgres/

  docs/
    decisions/
    api/

  package.json
  pnpm-workspace.yaml
```

모노레포지만 JavaScript 빌드와 Gradle 빌드를 억지로 하나로 합치지는 않는다. 루트 스크립트는 각 앱과 서버를 실행하는 진입점만 제공한다.

## 5. 확정 기술 스택

### Frontend

- Vite
- React
- TypeScript
- TanStack Router
- 서버 기반 공용 라멘집 catalog API
- localStorage 기반 개인 기록 repository
- TanStack Query
- OpenAPI Generator 기반 API client
- Toss Mini App SDK, 확인 후 적용
- Toss Design System, 확인 후 적용
- Naver Maps JavaScript API

### Backend

- Kotlin
- Spring Boot
- Spring Web
- springdoc-openapi
- PostgreSQL
- PostGIS
- Flyway
- Spring Security는 인증 도입 시점에 추가

### Infra

- Docker Compose
- 로컬 개발에서는 우선 PostgreSQL/PostGIS만 Docker로 실행
- 배포 단계에서 API, Web, DB, Caddy를 Compose로 묶는 방향
- Caddy는 HTTPS/reverse proxy 용도

## 6. 개발 실행 흐름

```text
pnpm infra:up
pnpm dev
```

예상 루트 스크립트:

```json
{
  "scripts": {
    "dev": "concurrently \"pnpm dev:web\" \"pnpm dev:api\"",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "cd server/api && ./gradlew bootRun",
    "infra:up": "docker compose -f infra/docker-compose.yml up -d",
    "infra:down": "docker compose -f infra/docker-compose.yml down",
    "api:generate": "openapi-generator-cli generate -i http://localhost:8080/openapi -g typescript-fetch -o packages/api-client/src/generated"
  }
}
```

초기에는 API와 Web은 로컬에서 직접 실행하고, DB만 Docker로 띄운다.

## 7. MVP 범위

1차 MVP는 지도 기능이나 로그인보다 공용 라멘집 검색, 로컬 개인 기록, 앱인토스 샌드박스 실행을 우선한다.

### 포함

- 서버 catalog 기반 라멘집 목록, 검색, 상세
- 로컬 저장 기반 방문 기록 등록, 수정, 삭제, 상세
- 로컬 저장 기반 가고 싶은 라멘집 저장
- 기본 About 페이지
- 앱인토스 `.ait` 빌드와 샌드박스 실행
- 모바일 우선 반응형 화면

### 제외

- 로그인
- 서버 동기화
- 지도 화면
- 주변 라멘집 조회
- PostGIS 기반 거리 검색
- 전체 라멘집 대비 완료율
- 소셜 로그인
- 팔로우/피드
- 댓글
- 고급 추천 알고리즘
- 사진 저장소 연동
- 푸시 알림
- 앱스토어 배포
- 플레이스토어 배포
- Expo/React Native WebView wrapper 확장

## 8. 1차 마일스톤, 앱인토스 로컬 MVP

1. 앱인토스 콘솔 앱 만들기
2. `apps/web`을 Granite `.ait` 빌드 경로에 연결
3. 라멘집 목록/검색은 서버 catalog API로 연결
4. 방문 기록과 위시리스트를 `localStorage` 저장 모드로 유지
5. 모바일 우선 화면으로 홈, 목록, 상세, 작성/수정 흐름 정리
6. TDS 컴포넌트 적용 범위 산정
7. 앱 정보와 약관 등록
8. `.ait` 업로드 후 샌드박스에서 서버 catalog와 로컬 기록을 수동 테스트
9. 사용감 확인 뒤 개인 기록 동기화와 로그인 필요성 재판단

## 9. 작업 시작 순서

```text
1. 현재 프론트 화면의 API 의존 지점 확인
2. 라멘집 catalog API를 프론트에 연결
3. 방문 기록/위시리스트 화면을 local repository로 연결
4. 모바일 폭에서 화면 깨짐 확인
5. build:ait 재실행
6. 앱인토스 샌드박스 업로드와 수동 테스트
```

## 10. 의사결정 기록

### Next.js를 쓰지 않는다

Next.js의 서버 컴포넌트, SSR, 파일 기반 서버 기능은 현재 목표에 비해 무겁다. 초기 제품은 CRUD 중심 웹 앱이므로 Vite React가 더 단순하고 빠르다.

### TanStack Router를 쓴다

지도 필터, 상세 페이지, 공유 가능한 URL, typed search params가 서비스 성격과 잘 맞는다.

### OpenAPI Generator는 서버 모드에서 쓴다

서버 모드로 돌아가면 Kotlin DTO와 TypeScript 타입을 수동으로 중복 관리하지 않는다. 서버 OpenAPI 스펙을 기준으로 프론트 API client를 생성한다.

### Docker는 우선 DB에만 쓴다

개발 초반에는 API와 Web은 로컬에서 실행한다. PostGIS 설치/버전 관리를 단순화하기 위해 DB만 Docker로 띄운다.

### Website + Toss Mini App first, store app later

웹 기술 기반 구현은 유지하고, `apps/web`을 웹사이트와 토스 미니앱의 공통 코어로 둔다. Toss Design System 컴포넌트를 쓸 수 있으면 프론트 디자인 공수를 줄이고 토스 안의 사용자 경험과 맞춘다. Expo/React Native WebView wrapper는 스토어 배포가 다시 필요해질 때만 재검토한다.

### Local-first mini app first, server later

첫 앱인토스 MVP는 로그인 없이 낸다. 다만 라멘집 검색 데이터는 앱에 하드코딩하지 않고 서버 catalog API에서 받는다. 개인 방문 기록과 위시리스트만 로컬 저장에 두고, 기기 간 동기화나 토스 로그인은 실제로 필요해질 때 2차 경로로 재개한다.

### Local record first, map and server later

지도는 서비스의 중요한 정체성이지만 1차 MVP의 핵심은 아니다. 먼저 서버 라멘집 catalog 조회와 로컬 방문 기록/위시리스트가 앱인토스 안에서 자연스럽게 동작하는지 확인한다.
