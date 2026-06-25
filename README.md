# 라멘 도장깨기

라멘집 방문 기록을 쌓고, 이후 지도 기반 도장깨기로 확장하는 웹 우선 서비스입니다.

## 구조

```text
apps/web             Vite React frontend
server/api           Kotlin Spring Boot API
packages/api-client  TypeScript API client
infra                Local Postgres/PostGIS
docs                 Product, frontend, backend, API docs
```

## 먼저 볼 설계 문서

DB 관계를 먼저 잡고 API DTO를 설계합니다.

- 제품 방향: [docs/01-product-overview.md](/Users/yijihun/ramen-dojang/docs/01-product-overview.md)
- DB ERD: [docs/06-database-erd.md](/Users/yijihun/ramen-dojang/docs/06-database-erd.md)
- API 계약: [docs/04-api-contract.md](/Users/yijihun/ramen-dojang/docs/04-api-contract.md)
- 프론트 설계: [docs/02-frontend-plan.md](/Users/yijihun/ramen-dojang/docs/02-frontend-plan.md)
- 백엔드 설계: [docs/03-backend-plan.md](/Users/yijihun/ramen-dojang/docs/03-backend-plan.md)
- 학습 기록: [docs/LESSONS.md](/Users/yijihun/ramen-dojang/docs/LESSONS.md)

## 준비물

- Node.js 24 이상
- Corepack, Node.js에 포함
- Java 17
- Docker, 로컬 PostgreSQL/PostGIS 실행용

`pnpm`은 별도 전역 설치 대신 Corepack으로 활성화합니다.

```bash
corepack prepare pnpm@10.12.1 --activate
corepack enable pnpm
```

의존성을 설치합니다.

```bash
pnpm install
```

환경변수 예시 파일을 개인 로컬 env 파일로 복사합니다.

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp server/api/.env.example server/api/.env
```

`.env`, `.env.local`은 개인 로컬 설정이므로 git에 올리지 않습니다.

## 개발 실행

프론트와 서버는 분리해서 실행하는 것을 기본으로 둡니다.

먼저 DB를 실행합니다.

```bash
pnpm infra:up
```

터미널을 하나 더 열어 API 서버를 실행합니다.

```bash
pnpm dev:api
```

터미널을 하나 더 열어 프론트 서버를 실행합니다.

```bash
pnpm dev:web
```

편의상 한 터미널에서 둘을 같이 띄울 수도 있습니다.

```bash
pnpm dev
```

`pnpm dev:api`는 Node 서버를 띄우는 명령이 아닙니다. 루트에서 `server/api`의 Gradle wrapper를 호출하는 진입점입니다.

```bash
cd server/api && ./gradlew bootRun
```

즉 아래 두 명령은 같은 API 서버를 실행합니다.

```bash
pnpm dev:api
cd server/api && ./gradlew bootRun
```

## URL

- Web: `http://localhost:5173`
- API health: `http://localhost:8080/health`
- Swagger UI: `http://localhost:8080/swagger`
- OpenAPI JSON: `http://localhost:8080/openapi`

## 빌드와 검증

전체 프론트 관련 타입체크를 실행합니다.

```bash
pnpm typecheck
```

전체 프론트 빌드를 실행합니다.

```bash
pnpm build
```

이 명령은 아래 두 작업을 순서대로 실행합니다.

```bash
pnpm --filter @ramen-dojang/api-client build
pnpm --filter web build
```

서버는 Gradle wrapper로 따로 검증합니다.

```bash
cd server/api
./gradlew compileKotlin
./gradlew test
```

API 서버까지 실제로 띄우려면 DB가 먼저 떠 있어야 합니다.

```bash
pnpm infra:up
pnpm dev:api
```

서버가 뜬 뒤 health check를 확인합니다.

```bash
curl http://localhost:8080/health
```

## API Client 생성

현재는 `packages/api-client`에 임시 fetch client가 있습니다. 서버 OpenAPI 스펙 기준 generated client로 바꿀 때는 API 서버를 먼저 띄운 뒤 실행합니다.

```bash
pnpm infra:up
pnpm dev:api
pnpm api:generate
```

`pnpm api:generate`는 `http://localhost:8080/openapi`를 읽어서 TypeScript client를 생성하는 명령입니다.

## DB 중지

로컬 DB를 내립니다.

```bash
pnpm infra:down
```

## 자주 쓰는 명령

```bash
pnpm install       # Node workspace 의존성 설치
pnpm infra:up      # PostgreSQL/PostGIS 실행
pnpm dev:web       # 프론트 개발 서버 실행
pnpm dev:api       # Kotlin Spring Boot API 실행
pnpm typecheck     # TypeScript 타입체크
pnpm build         # API client + web 빌드
```

## 작업 체크리스트

진행 상황은 [docs/TODO.md](/Users/yijihun/ramen-dojang/docs/TODO.md)에서 관리합니다.

프로젝트를 하며 배운 개념과 문제 해결 기록은 [docs/LESSONS.md](/Users/yijihun/ramen-dojang/docs/LESSONS.md)에 남깁니다.
