# 라멘 도장깨기 Product Overview

## 1. 제품 방향

라멘집 방문 기록을 안정적으로 쌓고, 이후 지도 기반 도장깨기로 확장하는 웹 우선 서비스다.

초기 목표는 앱보다 웹을 먼저 완성하는 것이다. 1차 MVP는 지도보다 다녀온 라멘집과 방문 기록 CRUD, 안정적인 서버 구동, Swagger/OpenAPI 기반 개발 루프를 우선한다. 지도는 기록이 쌓인 뒤 시각화와 탐색을 강화하는 2차 목표로 둔다.

## 2. 핵심 컨셉

- 다녀온 라멘집을 안정적으로 기록한다.
- 어떤 메뉴를 먹었는지, 국물/면/토핑/재방문 의사는 어땠는지 기록한다.
- 가보고 싶은 라멘집을 저장한다.
- 지역, 스타일, 방문 여부 기준으로 도장깨기 진행도를 볼 수 있게 확장한다.
- 각 방문 기록과 라멘집 상세 페이지는 공유 가능해야 한다.

## 3. About 문구 초안

```text
라멘집 도장깨기를 위한 지도형 기록장입니다.

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
- TanStack Query
- OpenAPI Generator 기반 API client
- Naver Maps JavaScript API
- PWA 대응

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

1차 MVP는 지도 기능보다 기록 CRUD와 서버 안정성을 우선한다.

### 포함

- 라멘집 등록
- 라멘집 목록/상세 조회
- 라멘집 수정/삭제
- 방문 기록 등록
- 방문 기록 수정/삭제
- 방문 기록 상세
- 가고 싶은 라멘집 저장
- 기본 About 페이지
- Swagger UI
- OpenAPI 기반 TS client 생성
- health check
- DB migration
- 서버 로컬 구동 문서화

### 제외

- 지도 화면
- 주변 라멘집 조회
- PostGIS 기반 거리 검색
- 도장깨기 통계
- 소셜 로그인
- 팔로우/피드
- 댓글
- 고급 추천 알고리즘
- 사진 저장소 연동
- 푸시 알림
- 앱스토어 배포

## 8. 1차 마일스톤

1. GitHub public repo 생성
2. 모노레포 기본 구조 생성
3. `pnpm-workspace.yaml` 작성
4. `infra/docker-compose.yml`로 Postgres/PostGIS 실행
5. `server/api` Spring Boot 프로젝트 생성
6. springdoc-openapi 연결
7. Swagger UI와 `/openapi` 확인
8. Flyway 마이그레이션 작성
9. `shops`, `visits`, `wishlist` CRUD API 구현
10. OpenAPI Generator로 `packages/api-client` 생성
11. `apps/web` Vite React 프로젝트 생성
12. TanStack Router 설정
13. TanStack Query 설정
14. 라멘집 CRUD 화면 구현
15. 방문 기록 CRUD 화면 구현
16. 서버/프론트 로컬 구동 스크립트 정리

## 9. 작업 시작 순서

```text
1. GitHub public repo 생성
2. 로컬 repo clone
3. 모노레포 디렉터리 생성
4. DB compose 작성
5. Spring Boot API 생성
6. Swagger/OpenAPI 확인
7. shops/visits 스키마 작성
8. CRUD API 구현
9. api-client 생성
10. Vite React 앱 생성
11. TanStack Router/Query 연결
12. 라멘집/방문 기록 CRUD 화면 구현
```

## 10. 의사결정 기록

### Next.js를 쓰지 않는다

Next.js의 서버 컴포넌트, SSR, 파일 기반 서버 기능은 현재 목표에 비해 무겁다. 초기 제품은 CRUD 중심 웹 앱이므로 Vite React가 더 단순하고 빠르다.

### TanStack Router를 쓴다

지도 필터, 상세 페이지, 공유 가능한 URL, typed search params가 서비스 성격과 잘 맞는다.

### OpenAPI Generator를 쓴다

Kotlin DTO와 TypeScript 타입을 수동으로 중복 관리하지 않는다. 서버 OpenAPI 스펙을 기준으로 프론트 API client를 생성한다.

### Docker는 우선 DB에만 쓴다

개발 초반에는 API와 Web은 로컬에서 실행한다. PostGIS 설치/버전 관리를 단순화하기 위해 DB만 Docker로 띄운다.

### Web first, app later

바이럴과 공유를 위해 웹을 먼저 만든다. 앱은 React Native WebView wrapper로 추후 배포한다.

### 기록 CRUD first, 지도 later

지도는 서비스의 중요한 정체성이지만 1차 MVP의 핵심은 아니다. 먼저 라멘집과 방문 기록을 안정적으로 생성, 조회, 수정, 삭제할 수 있게 만들고, 서버 구동/DB migration/OpenAPI 생성 흐름을 단단히 만든 뒤 지도 기능을 붙인다.
