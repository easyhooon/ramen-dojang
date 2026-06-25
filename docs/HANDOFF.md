# 라멘 도장깨기 인수인계

새 컴퓨터나 새 작업 세션에서 이 프로젝트를 이어받기 위한 요약 문서다. 자세한 설명은 이미 있는 문서로 연결하고, 여기서는 현재 상태와 다음 행동만 빠르게 잡는다.

## 현재 상태

- GitHub remote: `https://github.com/easyhooon/ramen-dojang.git`
- 기본 branch: `main`
- 최신 기준 커밋 확인: `git log -1 --oneline`
- 작업 방식: 문서 기반으로 진행하고, 작업 전후로 [TODO](TODO.md), [WORKLOG](WORKLOG.md), [LESSONS](LESSONS.md)를 갱신한다.
- 에이전트 규칙: [AGENTS.md](../AGENTS.md)

## 먼저 읽을 문서

1. [README](../README.md): 로컬 실행, 빌드, OpenAPI client 생성 절차
2. [새 컴퓨터 세팅](NEW_MACHINE_SETUP.md): 클론 직후부터 앱 실행까지
3. [TODO](TODO.md): 완료/미완료 작업 목록
4. [WORKLOG](WORKLOG.md): 날짜별 작업 요약과 검증 기록
5. [DB ERD](06-database-erd.md): DB 관계와 확장 방향
6. [API 계약](04-api-contract.md): DTO, endpoint, OpenAPI Generator 원칙
7. [기술 스택](10-tech-stack.md): 주요 라이브러리와 사용 목적
8. [프론트 설계](02-frontend-plan.md), [프론트 모듈 구조](07-frontend-module-structure.md), [프론트 디자인 방향](05-frontend-design-direction.md)
9. [백엔드 설계](03-backend-plan.md), [백엔드 모듈 구조](08-backend-module-structure.md)
10. [도메인 언어](../CONTEXT.md)

## 구현된 것

- Vite React web app: `apps/web`
- Expo React Native WebView wrapper: `apps/mobile`
- Kotlin Spring Boot API: `server/api`
- TypeScript API client package: `packages/api-client`
- PostgreSQL/PostGIS local infra: `infra/docker-compose.yml`
- Flyway 초기 migration: `server/api/src/main/resources/db/migration`
- Swagger UI `/swagger`, OpenAPI JSON `/openapi`
- OpenAPI Generator `typescript-fetch` client: `packages/api-client/src/generated`
- Generated client를 감싼 앱용 wrapper: `packages/api-client/src/index.ts`
- Mobile WebView implementation: `nitro-webview` + `react-native-nitro-modules`

## 중요한 규칙

- `packages/api-client/src/generated`는 직접 수정하지 않는다.
- API가 바뀌면 서버 DTO/controller annotation을 고친 뒤 `pnpm api:generate`로 다시 생성한다.
- generated client가 만드는 `Date`, optional field는 wrapper에서 앱 타입으로 변환한다.
- DB/API 변경은 먼저 [DB ERD](06-database-erd.md)를 확인한다.
- 기능 추가/버그 수정/API 동작 변경은 [AGENTS.md](../AGENTS.md)의 TDD 기준을 따른다.
- 실제 `.env`, `.env.local`은 git에 올리지 않는다. `*.example`만 공유한다.
- 작업 단위가 끝나면 검증 후 커밋/푸시한다.

## 다음 작업 후보

우선순위가 높은 작업:

1. 로그인/사용자 소유권 반영 ERD 확정
2. `users` 테이블, `visits.user_id`, `wishlist.user_id` Flyway migration 추가
3. 인증 방식 결정: Google/Kakao/Naver/OAuth 우선순위
4. 인증/사용자 소유권 behavior 목록 작성 후 TDD 첫 세로 slice 선택
5. Spring Security/OAuth 최소 세로 slice 구현
6. Swagger UI에서 shops, visits, wishlist CRUD 수동 검증
7. 브라우저 화면 검증
8. Vercel 배포 설정 정리

현재 대기 중인 검증:

- Docker/Postgres가 있는 환경에서 `pnpm infra:up`
- `pnpm dev:api`
- Flyway migration 실제 적용 확인
- Swagger UI CRUD 수동 검증
- 기존 scaffold/API/frontend 작업의 테스트 부채 정리

## 자주 쓰는 명령

```bash
pnpm install
pnpm infra:up
pnpm dev:api
pnpm dev:web
pnpm test
pnpm verify
pnpm typecheck
pnpm build
```

OpenAPI client 재생성:

```bash
pnpm dev:api:docs
pnpm api:generate
```

서버 검증:

```bash
cd server/api
./gradlew compileKotlin
./gradlew test
```

현재 가능한 전체 검증 하네스:

```bash
pnpm verify
```

## 알려진 주의점

- `pnpm dev:api:docs`는 OpenAPI 생성용이다. DB 없이 `/openapi`를 뽑을 수 있지만, CRUD API를 직접 호출하면 DB 연결 오류가 날 수 있다.
- 실제 API 서버 검증은 `pnpm infra:up`으로 Postgres/PostGIS를 띄운 뒤 `pnpm dev:api`로 해야 한다.
- OpenAPI Generator는 첫 실행 때 Maven Central에서 generator jar를 내려받는다.
- Vercel 배포 시 web app은 Next.js가 아니라 Vite React다. monorepo root와 build command를 명확히 설정해야 한다.
- `apps/mobile`은 Expo Go가 아니라 development build/prebuild 검증이 필요할 수 있다. Nitro native module을 쓰기 때문이다.
- 오늘까지의 초기 scaffold는 typecheck/build/compile 중심으로 검증했지만, TDD red-green-refactor 흔적은 부족하다. 다음 behavior 구현부터는 테스트를 먼저 추가한다.
- `pnpm verify`는 현재 가능한 검증 하네스다. 프론트 behavior test runner와 API smoke/integration test는 아직 보강 TODO로 남아 있다.
- sandbox 환경에서는 Gradle wrapper가 `~/.gradle` lock 파일 접근에서 막힐 수 있다. 그 경우 승인 모드로 `pnpm verify`를 다시 실행한다.

## Suggested Skills

- `implement`: TODO 기반 기능 구현
- `domain-modeling`: ERD, 사용자 소유권, 도메인 용어 정리
- `tdd`: 인증, API, repository 동작 추가 전 테스트 설계
- `diagnosing-bugs`: Gradle, Flyway, Swagger, Docker 문제 진단
- `frontend-design`: 프론트 화면 검증과 디자인 조정
- `ponytail`: 과한 추상화 방지
- `commit-push`: 작업 단위 커밋/푸시
