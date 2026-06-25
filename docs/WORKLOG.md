# Worklog

날짜별 작업 내용을 사람이 읽기 쉬운 단위로 기록한다. 코드를 직접 보지 않아도 “그날 무엇을 만들었고, 무엇을 검증했고, 무엇이 남았는지” 파악하는 것이 목적이다.

## 기록 규칙

- 날짜는 실제 작업일 기준으로 적는다.
- 커밋 목록을 그대로 복사하기보다 작업 의도와 결과를 묶어서 쓴다.
- 완료한 것, 검증한 것, 남은 위험을 분리한다.
- 자세한 진행률은 [TODO](TODO.md), 배운 점은 [LESSONS](LESSONS.md), 새 세션 인수인계는 [HANDOFF](HANDOFF.md)를 본다.

## 2026-06-26

### 한 줄 요약

외부 장소 검색 결과를 바로 노출하지 않고 `shop_candidates`에 후보로 저장한 뒤 검수 후 라멘집으로 승격하는 방향을 잡았다.

### 문서화 / 도메인 모델

- 용어집에 `라멘집 후보`를 추가했다.
- [DB ERD](06-database-erd.md)에 `shop_candidates` 확장 모델과 승격 규칙을 추가했다.
- [Backend Plan](03-backend-plan.md)에 후보 보강 API, 수동 sync, cron/scheduled job 승격 기준을 정리했다.
- 외부 검색 결과를 후보로 저장한다는 결정을 [ADR 0001](adr/0001-external-place-search-as-candidates.md)로 기록했다.
- [LESSONS](LESSONS.md)에 외부 검색 API를 정답 DB가 아니라 후보 수집기로 쓰는 이유를 기록했다.

### 검증한 것

- 문서 변경 diff 확인
- `.githooks/pre-commit`

### 남은 일

- `shop_candidates` migration 작성
- 네이버 지역 검색 API 기반 후보 sync spike 작성
- 후보 scoring/중복 제거 기준 정의
- 후보 검수 후 `shops`로 승격하는 admin flow 설계
- 수동 sync가 안정된 뒤 cron/scheduled job 도입 판단

## 2026-06-25

### 한 줄 요약

라멘 도장깨기 프로젝트의 모노레포 뼈대, Kotlin Spring Boot API, Vite React 프론트, OpenAPI 기반 TypeScript client, Expo/Nitro WebView 모바일 래퍼, 문서/인수인계 체계를 한 번에 세팅했다.

### 공통 / 모노레포

- 루트 workspace를 `pnpm` 기준으로 구성했다.
- `apps/web`, `apps/mobile`, `server/api`, `packages/api-client`, `infra`, `docs` 구조를 잡았다.
- web/api/mobile 실행 스크립트를 루트 `package.json`에 정리했다.
- `.env.example` 공유 방식과 실제 `.env`, `.env.*` ignore 규칙을 정리했다.
- 다른 컴퓨터에서 이어받을 수 있도록 [NEW_MACHINE_SETUP](NEW_MACHINE_SETUP.md), [HANDOFF](HANDOFF.md)를 작성했다.
- [AGENTS.md](../AGENTS.md)에 문서 기반 작업, TODO/LESSONS 갱신, 작업 단위 커밋 규칙을 정리했다.

### Backend

- Kotlin Spring Boot API 서버 골격을 만들었다.
- Gradle wrapper, Spring Web, JDBC, Flyway, PostgreSQL, Validation, springdoc-openapi 의존성을 구성했다.
- PostGIS 기반 초기 Flyway migration을 작성했다.
- `shops`, `visits`, `wishlist` CRUD API를 구현했다.
- `/health` 엔드포인트를 구현했다.
- Swagger UI `/swagger`, OpenAPI JSON `/openapi` 경로를 설정했다.
- OpenAPI metadata, operation summary/description, request/response schema, 공통 error response, `operationId`를 정리했다.
- DB 없이 OpenAPI 문서를 뽑기 위한 `pnpm dev:api:docs`를 추가했다.

### API Client / Contract

- `openapi-generator-cli` 설정을 추가했다.
- 서버 `/openapi` 기준으로 `typescript-fetch` client를 생성했다.
- generated client는 직접 수정하지 않고, `packages/api-client/src/index.ts` wrapper에서 앱 타입으로 다듬는 구조로 전환했다.
- `Date`, optional/nullable field, generated `ResponseError` 변환 기준을 문서화했다.

### Frontend

- Vite React 앱 골격을 만들었다.
- TanStack Router와 TanStack Query를 구성했다.
- 홈, 라멘집 목록/필터/등록, 라멘집 상세/수정/삭제, 가고싶음, 방문 기록, About 화면을 구현했다.
- `frontend-design` 기준으로 라멘집 탐방 서비스에 맞는 UI 톤을 정리했다.
- 프론트/백엔드 모듈 구조 문서를 작성했다.

### Mobile

- `apps/mobile`에 Expo React Native WebView wrapper 앱을 추가했다.
- `nitro-webview`와 `react-native-nitro-modules`를 적용했다.
- `expo-dev-client`를 추가해 Expo Go가 아니라 development build 기준으로 확인하도록 정리했다.
- Expo SDK 56 기준 React Native, React, TypeScript 버전을 맞췄다.
- `expo-doctor`로 SDK 조합과 app config schema를 검증했다.
- Nitro가 왜 주목받는지, Expo와 어디까지 호환되는지, 남은 native build 검증은 무엇인지 [LESSONS](LESSONS.md)와 [Mobile WebView Wrapper](09-mobile-webview-wrapper.md)에 기록했다.

### 문서화 / 학습 기록

- DB ERD를 먼저 보고 API DTO를 설계한다는 원칙을 문서화했다.
- Flyway가 무엇인지, migration을 왜 코드처럼 관리해야 하는지 기록했다.
- `pnpm dev:api`가 Kotlin 서버를 Node로 실행하는 것이 아니라 Gradle wrapper를 호출하는 편의 명령임을 정리했다.
- Docker/Postgres가 없을 때 DB 기반 검증이 어디서 멈추는지 기록했다.
- 로그인은 UI 기능이 아니라 사용자 소유 데이터 설계와 연결된다는 점을 기록했다.
- Swagger/OpenAPI 작업은 code annotation 작성과 runtime Swagger UI 검증이 나뉜다는 점을 정리했다.
- Nitro/Expo 호환성, Expo Go와 development build 차이, New Architecture/JSI/Nitro 관계를 기록했다.
- ESLint와 oxlint의 차이, 이 프로젝트에서 oxlint-first로 trial할 근거와 주의점을 기록했다.
- `pnpm verify`와 `.githooks/pre-commit`이 어떤 순서로 동작하는지 Mermaid 흐름도로 기록했다.

### 검증한 것

- `pnpm typecheck`
- `pnpm build`
- `server/api ./gradlew compileKotlin`
- `server/api ./gradlew test`
- `pnpm dev:web` 실행 및 `http://localhost:5173/` HTTP 200 확인
- 브라우저에서 `http://localhost:5173/` 열기 확인
- `pnpm dev:api:docs` 실행 후 `http://127.0.0.1:8080/health` HTTP 200 확인
- `http://127.0.0.1:8080/openapi` HTTP 200 확인
- OpenAPI JSON에서 `license.identifier=MIT`, `operationId=listShops`, `application/json` response content 확인
- `pnpm api:generate`
- `pnpm --filter mobile typecheck`
- `cd apps/mobile && pnpm dlx expo-doctor@latest`
- `pnpm --filter mobile exec expo config --type public`
- env ignore 확인: 실제 `.env`, `.env.*`는 ignore되고 `.env.example`은 공유 가능
- `.githooks/pre-commit`

### 남은 일

- Docker/Postgres가 있는 환경에서 `pnpm infra:up` 후 Flyway migration 실제 적용 검증
- `pnpm dev:api` 일반 모드 실행 검증
- Swagger UI에서 shops, visits, wishlist CRUD 수동 검증
- 로그인/사용자 소유권 반영 ERD 확정
- `users` 테이블, `visits.user_id`, `wishlist.user_id` migration 작성
- OAuth/Spring Security 최소 세로 slice 구현
- oxlint trial 후 lint 정책 결정: oxlint 단독 또는 ESLint 병행
- 브라우저 화면 실제 UI 검증
- iOS/Android development build에서 `nitro-webview` 실제 로딩 검증
- file upload/download이 필요해지는 시점에 native host 설정 검증

### 관련 커밋

```text
9cc742f Add initial project planning docs
83ca061 docs: 정리 프로젝트 설계와 실행 흐름
fae760c feat: 추가 코프링 API 서버 스캐폴드
fbb1982 feat: 추가 라멘 기록 프론트 앱
34385ff docs: 추가 Swagger 작업 TODO
1f35fca docs: 추가 에이전트 작업 규칙
e6b830f docs: 추가 로컬 env 예시
70449b7 docs: 기록 로컬 앱 구동 결과
1767d14 docs: 반영 다중 사용자 인증 전제
ae14faf docs: 보강 Swagger API 문서
d46a7ba feat: OpenAPI 생성 클라이언트 연결
abe077d docs: 추가 인수인계와 새 컴퓨터 세팅
5c5f33c docs: 정리 프론트 백엔드 모듈 구조
9fcfaf2 feat: 추가 Nitro WebView 모바일 래퍼
ed716ff fix: 모바일 Expo Nitro 호환성 정리
d363ae0 chore: env 파일 ignore 범위 확장
```
