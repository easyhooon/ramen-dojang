# 라멘 도장깨기

라멘집 방문 기록을 쌓고, 이후 동기화와 지도 기반 도장깨기로 확장하는 웹사이트 + 토스 미니앱 서비스입니다. 1차 MVP는 로그인 없이 공용 라멘집 카탈로그는 서버에서 받고, 개인 방문 기록과 위시리스트는 `apps/web`의 로컬 저장에 둡니다.

## 구조

```text
apps/web             Vite React frontend
apps/mobile          Expo React Native WebView wrapper, deferred
server/api           Kotlin Spring Boot API
packages/api-client  TypeScript API client
infra                Local Postgres/PostGIS
docs                 Product, frontend, backend, API docs
```

## 기술 스택

| 영역     | 주요 기술                                            | 목적                                    |
| -------- | ---------------------------------------------------- | --------------------------------------- |
| Web      | React, Vite, TanStack Router, TanStack Query, localStorage | 웹사이트/미니앱 화면, 서버 카탈로그 조회와 로컬 개인 기록 저장 |
| Mini App | Toss Mini App SDK, Toss Design System                | 토스 미니앱 등록과 토스 앱 안의 UI      |
| Mobile   | Expo, React Native, react-native-webview, ~~nitro-webview~~ | Expo Go smoke용 모바일 WebView 래퍼 |
| API      | Kotlin, Spring Boot, JDBC, Flyway, springdoc-openapi | 공용 라멘집 카탈로그와 Swagger/OpenAPI  |
| DB/Infra | PostgreSQL, PostGIS, Docker Compose                  | 공용 라멘집 DB와 지도 확장 대비         |
| Contract | OpenAPI Generator, TypeScript API client             | 서버 스펙 기반 프론트 client 생성       |

라이브러리별 사용 목적은 [docs/10-tech-stack.md](docs/10-tech-stack.md)에 정리합니다.

## 먼저 볼 설계 문서

DB 관계를 먼저 잡고 API DTO를 설계합니다.

- 제품 방향: [docs/01-product-overview.md](docs/01-product-overview.md)
- 개발 FLOW: [docs/11-development-flow.md](docs/11-development-flow.md)
- DB ERD: [docs/06-database-erd.md](docs/06-database-erd.md)
- API 계약: [docs/04-api-contract.md](docs/04-api-contract.md)
- 프론트 설계: [docs/02-frontend-plan.md](docs/02-frontend-plan.md)
- 프론트 모듈 구조: [docs/07-frontend-module-structure.md](docs/07-frontend-module-structure.md)
- 모바일 웹뷰 래퍼: [docs/09-mobile-webview-wrapper.md](docs/09-mobile-webview-wrapper.md)
- 기술 스택: [docs/10-tech-stack.md](docs/10-tech-stack.md)
- 백엔드 설계: [docs/03-backend-plan.md](docs/03-backend-plan.md)
- 백엔드 모듈 구조: [docs/08-backend-module-structure.md](docs/08-backend-module-structure.md)
- 인수인계: [docs/HANDOFF.md](docs/HANDOFF.md)
- 새 컴퓨터 세팅: [docs/NEW_MACHINE_SETUP.md](docs/NEW_MACHINE_SETUP.md)
- 날짜별 작업 기록: [docs/WORKLOG.md](docs/WORKLOG.md), [docs/worklog](docs/worklog)
- 학습 기록: [docs/LESSONS.md](docs/LESSONS.md)

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
cp apps/mobile/.env.example apps/mobile/.env.local
cp server/api/.env.example server/api/.env
```

`.env`, `.env.local`은 개인 로컬 설정이므로 git에 올리지 않습니다.

## 개발 실행

1차 MVP도 라멘집 검색에는 API 서버가 필요합니다. 개인 방문 기록과 위시리스트만 브라우저 localStorage에 저장합니다.

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

앱인토스 산출물은 아래 명령으로 만듭니다.

```bash
pnpm --filter web build:ait
```

모바일 웹뷰 래퍼를 확인하려면 프론트 서버를 먼저 띄운 뒤 별도 터미널에서 실행합니다.

```bash
pnpm dev:mobile
```

`apps/mobile`은 Expo 기반 React Native 앱이며, 지금은 Expo Go smoke test를 위해 `react-native-webview`를 사용합니다. 실기기에서 로컬 웹을 볼 때는 폰과 개발 컴퓨터가 같은 Wi-Fi/LAN에 있어야 하며, `apps/mobile/.env.local`의 `EXPO_PUBLIC_WEB_URL`은 `localhost`가 아니라 개발 컴퓨터의 LAN 주소를 사용합니다.

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
- Mobile wrapper: Expo Go 또는 Expo development build
- API health: `http://localhost:8080/health`
- Swagger UI: `http://localhost:8080/swagger`
- OpenAPI JSON: `http://localhost:8080/openapi`

## 빌드와 검증

현재 가능한 전체 검증 하네스를 실행합니다.

```bash
pnpm verify
```

이 명령은 타입체크, web/API client 빌드, 서버 테스트, 모바일 Expo config 검증을 순서대로 실행합니다.
전체 흐름도는 [Verification Harness](docs/12-verification-harness.md)에 정리돼 있습니다.

커밋할 때도 `.githooks/pre-commit`이 `pnpm verify`를 실행합니다. 같은 검증을 사람이 기억하지 않아도 커밋 단계에서 한 번 더 확인합니다.

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

## 웹 배포

공개 웹사이트는 Vercel로 배포합니다.

Vercel 프로젝트 설정:

```text
Root Directory: apps/web
Framework Preset: Vite
Build Command: pnpm build
Output Directory: dist
```

`apps/web/vercel.json`에는 Vite SPA deep link가 `/index.html`로 열리도록 rewrite를 둡니다.

모바일 wrapper는 Expo SDK 조합과 app config를 먼저 확인합니다.

```bash
cd apps/mobile
pnpm dlx expo-doctor@latest
```

그 다음 TypeScript를 확인합니다.

```bash
pnpm --filter mobile typecheck
```

`expo-doctor`가 통과해도 iOS/Android native build 성공을 보장하는 것은 아닙니다. 현재는 Expo Go smoke test용 `react-native-webview`를 쓰고, ~~`nitro-webview`~~ 같은 custom native module은 스토어 앱 출시 목표가 다시 생길 때 development build에서 검증합니다.

서버는 Gradle wrapper로 따로 검증합니다.

```bash
cd server/api
./gradlew compileKotlin
./gradlew test
```

루트에서도 서버 테스트만 실행할 수 있습니다.

```bash
pnpm test
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

`packages/api-client/src/generated`는 서버 OpenAPI 스펙에서 생성합니다. 생성된 low-level client는 직접 수정하지 않고, `packages/api-client/src/index.ts` wrapper에서 프론트가 쓰기 좋은 타입과 함수로 감쌉니다.

```bash
pnpm dev:api:docs
pnpm api:generate
```

`pnpm dev:api:docs`는 DB 없이 OpenAPI 문서만 뽑기 위한 서버 실행 명령입니다. 내부적으로 Flyway를 끄고, datasource 초기 연결 실패가 서버 시작을 막지 않게 합니다.

```bash
cd server/api && ./gradlew bootRun --args='--server.address=127.0.0.1 --spring.flyway.enabled=false --spring.datasource.hikari.initialization-fail-timeout=0'
```

`pnpm api:generate`는 `openapi-generator-config.json` 설정으로 `http://127.0.0.1:8080/openapi`를 읽고 `typescript-fetch` client를 생성합니다.

실제 DB와 Flyway까지 함께 검증하려면 별도로 DB를 띄운 뒤 일반 API 서버를 실행합니다.

```bash
pnpm infra:up
pnpm dev:api
```

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
pnpm dev:mobile    # Expo React Native 웹뷰 래퍼 실행
pnpm dev:api       # Kotlin Spring Boot API 실행
pnpm dev:api:docs  # DB 없이 OpenAPI 생성용 API 실행
pnpm api:generate  # OpenAPI Generator TypeScript client 생성
pnpm typecheck     # TypeScript 타입체크
pnpm test          # 서버 테스트 실행
pnpm verify        # 현재 가능한 전체 검증 하네스 실행
pnpm build         # API client + web 빌드
```

검증 하네스 흐름은 [docs/12-verification-harness.md](docs/12-verification-harness.md)에서 확인합니다.

## 작업 체크리스트

진행 상황은 [docs/TODO.md](docs/TODO.md)에서 관리합니다.

날짜별로 어떤 작업을 했는지는 `docs/worklog/YYYY-MM-DD.md`에 남기고, [docs/WORKLOG.md](docs/WORKLOG.md)는 인덱스로 사용합니다.

프로젝트를 하며 배운 개념과 문제 해결 기록은 [docs/LESSONS.md](docs/LESSONS.md)에 남깁니다.
