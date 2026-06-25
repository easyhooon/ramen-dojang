# Tech Stack

이 문서는 프로젝트에서 쓰는 주요 기술과 라이브러리의 사용 목적을 정리한다. 의존성을 추가하거나 교체할 때는 이 문서의 목적과 맞는지 먼저 확인한다.

## 선택 기준

- 웹사이트로 직접 접근 가능한 웹 앱이 제품의 본체다.
- 모바일 앱은 별도 제품이 아니라 같은 웹 앱을 WebView로 감싸 앱 형태로 제공하는 wrapper다.
- native 기능은 push notification, native auth callback, 파일 업로드처럼 앱 shell에서 꼭 필요한 것부터 확장한다.
- 서버 API 계약은 OpenAPI를 기준으로 하고, 프론트 client는 생성한다.
- DB schema 변경은 migration으로 남긴다.
- 지도 기반 확장을 고려해 처음부터 PostGIS를 둔다.

## Monorepo / Tooling

| 기술 | 사용 위치 | 목적 |
| --- | --- | --- |
| pnpm workspace | root | `apps/*`, `packages/*`를 하나의 repo에서 관리한다. |
| Corepack | README setup | 전역 pnpm 설치 대신 Node에 포함된 Corepack으로 pnpm 버전을 맞춘다. |
| concurrently | root `pnpm dev` | web/api 개발 서버를 한 명령으로 같이 띄우는 편의 도구다. |
| TypeScript | web, mobile, api-client | 프론트와 generated client의 타입 안정성을 확보한다. |

주의점:

- `pnpm dev:api`는 Node 서버가 아니라 `server/api`의 Gradle wrapper를 호출하는 편의 명령이다.
- 실제 `.env`, `.env.*`는 커밋하지 않고 `*.env.example`만 공유한다.

## Web

| 기술 | 사용 위치 | 목적 |
| --- | --- | --- |
| React | `apps/web` | 라멘집 목록, 상세, 방문 기록 같은 화면 UI를 만든다. |
| Vite | `apps/web` | 빠른 개발 서버와 web build를 담당한다. |
| @vitejs/plugin-react | `apps/web` | Vite에서 React transform과 Fast Refresh를 사용한다. |
| TanStack Router | `apps/web` | 라멘집 상세, 방문 기록 등 URL 기반 화면 전환을 관리한다. |
| TanStack Query | `apps/web` | API 호출 결과, loading/error 상태, cache invalidation을 관리한다. |
| @ramen-dojang/api-client | `apps/web` | OpenAPI에서 생성한 client를 앱 타입으로 감싼 공용 client다. |

선택 이유:

- 이 프로젝트는 기록형 서비스라 목록, 상세, 수정 화면이 URL로 표현되는 것이 중요하다.
- 서버 상태는 화면 local state와 분리하는 편이 낫기 때문에 TanStack Query를 둔다.
- 프론트가 서버 DTO를 손으로 맞추지 않도록 generated API client를 사용한다.

## Mobile

| 기술 | 사용 위치 | 목적 |
| --- | --- | --- |
| Expo | `apps/mobile` | React Native 앱 실행, prebuild, development build 흐름을 단순화한다. |
| expo-dev-client | `apps/mobile` | Expo Go에 없는 custom native module을 포함한 development build를 실행한다. |
| React Native | `apps/mobile` | 모바일 앱 shell과 native WebView wrapper 화면을 만든다. |
| nitro-webview | `apps/mobile` | 웹 앱을 띄우는 WebView 구현체다. Nitro Modules 기반으로 event/method bridge 비용을 줄이는 방향이다. |
| react-native-nitro-modules | `apps/mobile` | `nitro-webview`가 사용하는 Nitro runtime/JSI native module 기반이다. |

선택 이유:

- 모바일 앱은 현재 같은 웹 경험을 앱으로 배포하는 shell 성격이므로 Expo로 시작 비용을 줄인다.
- WebView는 loading, navigation, message, error, download처럼 event가 많아 Nitro 기반 접근을 실험할 가치가 있다.
- `nitro-webview`는 `window.ReactNativeWebView.postMessage(...)` 같은 익숙한 WebView 계약을 유지하면서 Nitro 방식의 `callback(...)`, `hybridRef`를 사용한다.

주의점:

- `nitro-webview`는 Expo Go로 검증하는 대상이 아니다. `expo-dev-client`가 포함된 development build 또는 prebuild 이후 native build로 확인한다.
- `expo-doctor` 통과는 SDK 조합과 app config 검증이지, iOS/Android native build 성공을 보장하지 않는다.
- file upload/download이 필요해지면 iOS permission string, Android media permission, Android Maven repository 설정을 실제 build에서 확인한다.

## API Server

| 기술 | 사용 위치 | 목적 |
| --- | --- | --- |
| Kotlin | `server/api` | Spring Boot API 서버의 주 언어다. |
| Spring Boot | `server/api` | REST API, 설정, dependency injection, app lifecycle을 담당한다. |
| Spring Web | `server/api` | HTTP controller와 JSON API를 만든다. |
| Spring JDBC | `server/api` | 초기 단계에서 단순하고 명시적인 SQL 기반 DB 접근을 한다. |
| Spring Validation | `server/api` | request DTO 입력값 검증을 담당한다. |
| Spring Boot Actuator | `server/api` | health check 같은 운영/진단 endpoint 기반을 제공한다. |
| Jackson Kotlin Module | `server/api` | Kotlin data class와 JSON 직렬화/역직렬화를 자연스럽게 연결한다. |
| Flyway | `server/api` | DB schema 변경 이력을 migration 파일로 관리한다. |
| PostgreSQL driver | `server/api` | Spring 서버가 PostgreSQL에 연결할 때 사용한다. |
| springdoc-openapi | `server/api` | Spring controller/DTO에서 Swagger UI와 OpenAPI JSON을 생성한다. |
| JUnit 5 / Kotlin test | `server/api` | 서버 단위 테스트와 Spring Boot 테스트를 실행한다. |

선택 이유:

- 서버는 다중 사용자와 데이터 소유권을 전제로 하는 API 계층이다.
- DB schema는 코드처럼 추적되어야 하므로 Flyway를 둔다.
- 프론트 client 생성을 위해 Swagger UI만이 아니라 OpenAPI JSON 품질이 중요하다.

주의점:

- 일반 `pnpm dev:api`는 DB 연결과 Flyway migration이 성공해야 서버가 끝까지 뜬다.
- DB 없이 OpenAPI만 뽑을 때는 `pnpm dev:api:docs`를 사용한다.
- 이미 적용된 Flyway migration 파일은 함부로 수정하지 않고 새 migration을 추가하는 쪽이 기본이다.

## Database / Infra

| 기술 | 사용 위치 | 목적 |
| --- | --- | --- |
| PostgreSQL | `infra/docker-compose.yml` | 라멘집, 방문 기록, 위시리스트 같은 관계형 데이터를 저장한다. |
| PostGIS | `infra/docker-compose.yml`, migration | 이후 지도 기반 검색과 위치 데이터 확장을 대비한다. |
| Docker Compose | `infra/docker-compose.yml` | 로컬 개발 DB를 같은 설정으로 띄운다. |

선택 이유:

- 라멘집과 방문 기록은 관계형 모델이 자연스럽다.
- 지도 기반 도장깨기로 확장할 계획이 있으므로 위치 검색을 고려해 PostGIS를 먼저 선택했다.

## API Contract / Generated Client

| 기술 | 사용 위치 | 목적 |
| --- | --- | --- |
| OpenAPI | `/openapi`, `docs/04-api-contract.md` | 서버와 프론트가 공유하는 API 계약이다. |
| @openapitools/openapi-generator-cli | root | OpenAPI JSON에서 TypeScript client를 생성한다. |
| typescript-fetch generator | `openapi-generator-config.json` | browser fetch 기반 TypeScript client를 만든다. |
| api-client wrapper | `packages/api-client/src/index.ts` | generated client를 앱에서 쓰기 좋은 타입과 함수로 감싼다. |

선택 이유:

- 서버와 프론트 DTO를 손으로 중복 관리하면 drift가 생기기 쉽다.
- generated code는 low-level 계약으로 두고, 앱 친화 변환은 wrapper에서 한다.

주의점:

- `packages/api-client/src/generated`는 직접 수정하지 않는다.
- API가 바뀌면 서버 controller/DTO/OpenAPI annotation을 수정한 뒤 `pnpm api:generate`를 다시 실행한다.
- generated client의 `Date`, optional/nullable field는 wrapper에서 앱 타입으로 변환한다.

## Deployment Direction

현재 배포 방향:

- web: Vercel 우선 검토
- API: 아직 미정
- DB: API 배포 방식에 맞춰 managed PostgreSQL/PostGIS 검토
- mobile: Expo development build로 검증 후 EAS build 또는 native build 흐름 검토

아직 확정하지 않은 것:

- 인증 제공자: Google/Kakao/Naver/OAuth 우선순위
- API/DB production hosting
- mobile store 배포 방식
