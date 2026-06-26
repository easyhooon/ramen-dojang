# Tech Stack

이 문서는 프로젝트에서 쓰는 주요 기술과 라이브러리의 사용 목적을 정리한다. 의존성을 추가하거나 교체할 때는 이 문서의 목적과 맞는지 먼저 확인한다.

## 선택 기준

- 웹사이트와 토스 미니앱을 제품의 1차 배포 경로로 본다.
- 웹 기술 기반 구현을 유지하고, `apps/web`을 웹사이트와 토스 미니앱의 공통 코어로 둔다.
- native 기능은 웹사이트와 토스 미니앱 환경이 제공하지 못하는 요구가 생길 때만 별도 앱 shell로 확장한다.
- 1차 MVP는 서버 없이 localStorage로 저장한다.
- 서버 모드에서는 API 계약은 OpenAPI를 기준으로 하고, 프론트 client는 생성한다.
- 서버 모드에서는 DB schema 변경은 migration으로 남긴다.
- 지도 기반 확장을 고려해 서버 쪽에는 PostGIS를 둔다.

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
| localStorage | `apps/web` | 1차 MVP에서 서버 없이 라멘집, 방문 기록, 위시리스트를 저장한다. |
| TanStack Query | `apps/web`, server mode | API 호출 결과, loading/error 상태, cache invalidation을 관리한다. |
| @ramen-dojang/api-client | `apps/web`, server mode | OpenAPI에서 생성한 client를 앱 타입으로 감싼 공용 client다. |
| @apps-in-toss/web-framework | `apps/web` | 기존 Vite 앱을 앱인토스 Granite dev/build/packaging 흐름에 태우기 위해 사용한다. |
| @toss/tds-mobile | `apps/web` | 앱인토스 비게임 심사와 토스 UX 일관성을 위해 Button, ListRow, TextField 같은 TDS 컴포넌트를 사용한다. |
| @toss/tds-mobile-ait | `apps/web` | 앱인토스 환경에서 TDS가 올바르게 동작하도록 `TDSMobileAITProvider`를 제공한다. |
| @emotion/react | `apps/web` | TDS Mobile의 peer dependency다. |
| @sentry/react-native | `apps/web`, future | 앱인토스 WebView 안의 JavaScript 오류를 Sentry로 추적할 때 사용한다. 앱인토스에서는 `enableNative: false`로 설정한다. |
| @granite-js/plugin-sentry | `apps/web`, future | 앱인토스 배포 후 Sentry sourcemap upload 흐름을 붙일 때 사용한다. |
| Toss Mini App SDK | `apps/web`, future | 토스 미니앱 등록과 토스 앱 안의 runtime 연동에 사용한다. 공식 문서 확인 후 적용한다. |
| Toss Design System | `apps/web`, future | 토스 미니앱 UI를 토스 사용자 경험에 맞추고, 자체 디자인 공수를 줄인다. 공식 문서 확인 후 적용한다. |

선택 이유:

- 이 프로젝트는 기록형 서비스라 목록, 상세, 수정 화면이 URL로 표현되는 것이 중요하다.
- 1차 앱인토스 MVP는 개인 기록 앱이므로 localStorage가 서버보다 싸고 빠르다.
- 서버 모드에서는 서버 상태를 화면 local state와 분리하는 편이 낫기 때문에 TanStack Query를 둔다.
- 서버 모드에서는 프론트가 서버 DTO를 손으로 맞추지 않도록 generated API client를 사용한다.
- Granite는 Vite 대체가 아니라 앱인토스용 wrapper다. 기존 `vite dev`, `vite build`를 `granite.config.ts`에서 호출한다.
- TDS 2.5.0은 React 18까지 peer dependency로 선언되어 있어, React 19에서 실제 빌드와 런타임을 확인하며 적용한다.
- Sentry는 첫 샌드박스/콘솔 업로드 후 외부 테스트를 시작할 때 초기화한다. 지금은 의존성만 명시하고 DSN, source map upload, token 설정은 보류한다.
- 토스 미니앱으로 등록할 수 있다면 TDS 컴포넌트를 우선 사용하고, 웹사이트에서도 무리 없이 재사용 가능한 화면 조립과 도메인 표현만 직접 만든다.

## Mobile, Deferred

현재 `apps/mobile`은 이미 만들어 둔 Expo/Nitro WebView wrapper 실험 산출물이다. 제품 1차 목표가 웹사이트 + 토스 미니앱 출시로 바뀌었으므로, 스토어 앱 배포 요구가 다시 생기기 전까지 확장하지 않는다.

| 기술 | 사용 위치 | 목적 |
| --- | --- | --- |
| Expo | `apps/mobile`, deferred | React Native 앱 실행, prebuild, development build 흐름을 단순화한다. |
| expo-dev-client | `apps/mobile` | Expo Go에 없는 custom native module을 포함한 development build를 실행한다. |
| React Native | `apps/mobile` | 모바일 앱 shell과 native WebView wrapper 화면을 만든다. |
| nitro-webview | `apps/mobile` | 웹 앱을 띄우는 WebView 구현체다. Nitro Modules 기반으로 event/method bridge 비용을 줄이는 방향이다. |
| react-native-nitro-modules | `apps/mobile` | `nitro-webview`가 사용하는 Nitro runtime/JSI native module 기반이다. |

선택 이유:

- 모바일 앱은 같은 웹 경험을 앱으로 배포하는 shell 성격이므로 Expo로 시작 비용을 줄일 수 있다.
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
| PostGIS | `infra/docker-compose.yml`, migration | 라멘집 좌표를 `geography(Point, 4326)`로 저장하고, 이후 주변 검색과 지도 bounds 조회를 DB에서 처리한다. |
| Docker Compose | `infra/docker-compose.yml` | 로컬 개발 DB를 같은 설정으로 띄운다. |

선택 이유:

- 라멘집과 방문 기록은 관계형 모델이 자연스럽다.
- 지도 기반 도장깨기로 확장할 계획이 있으므로 위치 검색을 고려해 PostGIS를 먼저 선택했다.
- 단순 `latitude`, `longitude` 숫자 컬럼만으로도 화면 표시와 디버깅은 가능하지만, 반경 검색, 거리 정렬, 지도 viewport 안의 라멘집 조회는 직접 계산을 구현해야 한다.
- PostGIS를 쓰면 `shops.location`에 GiST index를 걸고 `ST_DWithin`, `ST_Distance` 같은 DB 함수를 사용해 위치 조건을 안정적으로 처리할 수 있다.
- MVP에서는 CRUD가 먼저라 주변 검색 API는 아직 만들지 않는다. 다만 migration 단계에서 `location`과 index를 잡아 두어 나중에 schema를 다시 흔들지 않는다.

## External Place Data

| Provider/API | 사용 후보 | 목적 |
| --- | --- | --- |
| Naver Search Local API | `shop_candidates` sync | 라멘집 후보의 상호명, 주소, 좌표, 카테고리, 상세 URL을 수집한다. |
| Kakao Local API | `shop_candidates` sync | 장소 ID 기반 중복 제거와 음식점 카테고리 검색 후보를 수집한다. |
| Google Places / Photos | future | 비용과 정책을 검토한 뒤 썸네일, 영업시간, 평점 같은 보조 데이터를 보강할 때 검토한다. |

선택 기준:

- 외부 API 결과는 `shops`에 바로 넣지 않고 `shop_candidates`에 저장한다.
- 상호명, 주소, 좌표는 상대적으로 신뢰 가능한 핵심 데이터다.
- 전화번호, 장소 URL, 썸네일, 영업시간, 평점은 provider별 optional 데이터로 본다.
- 메뉴 목록과 가격은 공개 장소 API에서 안정적으로 가져올 수 없으므로 MVP 자동 수집 범위에서 제외한다.
- provider별 최대 제공 필드와 한계는 [Place Open API Data Research](13-place-open-api-research.md)를 기준으로 한다.

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

- web: 공개 웹사이트는 Vercel, 토스 미니앱은 앱인토스 `.ait` 업로드와 샌드박스 테스트
- API: 1차 MVP에서는 배포하지 않음
- DB: 1차 MVP에서는 배포하지 않음
- mobile: Expo/EAS/native build는 스토어 배포가 다시 필요해질 때 검토

아직 확정하지 않은 것:

- 토스 미니앱 등록 요건과 심사 기준
- Toss Mini App SDK/TDS 적용 방식
- 웹사이트 도메인
- 사용자 식별 방식: 1차 MVP는 로그인 없음, `getAnonymousKey`와 토스 로그인은 동기화가 필요해질 때 재검토
- API/DB production hosting, 서버 모드 재개 시
- mobile store 배포 여부

앱인토스 콘솔 앱 만들기 초안:

- 어떤 앱을 만들고 싶나요: 다녀온 라멘집과 가고 싶은 라멘집을 기록하고, 방문 메모와 평점을 모아 나만의 라멘 도장을 하나씩 쌓아가는 서비스
- 앱 이름: 라멘 도장깨기
- appName: `ramen-dojang`
- 앱 유형: 비게임
