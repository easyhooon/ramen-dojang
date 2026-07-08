# Lessons

프로젝트를 진행하면서 배운 것, 질문하면서 정리된 개념, 문제를 해결하며 얻은 깨달음을 기록한다.

## 기록 규칙

- 날짜는 실제 작업일 기준으로 적는다.
- 단순 작업 로그가 아니라 다음에 다시 써먹을 수 있는 깨달음을 남긴다.
- 문제가 있었다면 “증상 → 원인 → 해결 → 다음 예방책” 순서로 적는다.
- 사용자가 물어본 개념은 짧은 설명과 이 프로젝트에서의 적용 방식을 같이 적는다.

## 2026-06-26

### 외부 검색 API는 정답 DB가 아니라 후보 수집기로 쓰는 편이 안전하다

네이버 지역 검색 API 같은 외부 검색 API는 라멘집 발견에는 도움이 되지만, 앱의 기본 검색 결과를 그대로 대체하기에는 위험하다. 라멘집이 아닌 장소가 섞일 수 있고, 메뉴/썸네일/영업 상태/라멘 스타일 같은 라멘 특화 데이터가 안정적으로 오지 않을 수 있기 때문이다.

이번 프로젝트의 기준:

- 기본 검색은 검수된 `shops`만 대상으로 한다.
- 외부 검색 결과와 사용자 제보는 `shop_candidates`에 먼저 저장한다.
- 후보는 `pending`, `rejected`, `promoted` 같은 상태를 가진다.
- 검수 후에만 `shops`로 승격한다.
- cron-like job은 후보 데이터를 최신화할 수 있지만, 검수 없이 검증된 `shops`를 직접 바꾸지 않는다.

이렇게 하면 네이버 지도와 경쟁하는 “범용 장소 검색”이 아니라, 검수된 라멘집 DB와 방문 기록/위시리스트/라멘 특화 필터를 가진 서비스가 된다.

처음부터 cron을 자동화하면 잘못된 후보가 대량으로 쌓이거나 중복 데이터가 늘어날 수 있다. 먼저 수동 sync command/API로 후보 수집과 scoring을 검증하고, 기준이 안정되면 scheduled job으로 승격하는 편이 낫다.

참고:

- [Naver 지역 검색 API](https://developers.naver.com/docs/serviceapi/search/local/local.md)

### 장소 API는 메뉴 API가 아니다

Naver/Kakao/Google 장소 API를 공식 문서 기준으로 보면, 장소 발견과 기본 정보 보강에는 쓸 수 있지만 라멘 메뉴 목록과 가격을 안정적으로 가져오는 API로 보기는 어렵다.

이번 조사에서 확인한 기준:

- Naver/Kakao는 상호명, 주소, 좌표, 카테고리, 장소 URL 정도가 현실적인 핵심 데이터다.
- Kakao는 장소 ID가 있어 후보 중복 제거에 유리하다.
- Google은 사진, 영업시간, 평점, 리뷰 수, 웹사이트 같은 보조 정보까지 가능하지만 비용, FieldMask, attribution, 캐싱 정책을 고려해야 한다.
- 썸네일은 있으면 좋은 optional 데이터이고, 없으면 placeholder UX를 전제로 둔다.
- 메뉴 목록, 가격, 대표 메뉴는 자동 수집 대상이 아니라 방문 기록/메뉴판 사진/관리자 검수로 쌓아야 한다.

자세한 조사 결과는 [Place Open API Data Research](13-place-open-api-research.md)에 둔다.

### `rg`와 TDD Red/Green은 다른 말이다

터미널에서 쓰는 `rg`는 `ripgrep`의 실행 명령이다. repo 안에서 파일 내용이나 경로를 빠르게 검색할 때 쓴다.

TDD에서 말하는 Red/Green은 테스트 상태다.

- Red: 기대 behavior를 테스트로 먼저 적고 실패를 확인한 상태
- Green: 그 실패 테스트를 통과시키는 최소 구현을 끝낸 상태
- Refactor: Green을 유지하면서 구조만 다듬는 단계

즉 `rg`는 검색 도구 이름이고, Red/Green은 테스트 주도 개발의 사이클 용어다.

## 2026-06-25

### Flyway는 DB 변경 이력을 코드처럼 관리하는 도구다

Flyway는 DB schema 변경을 `V1__create_initial_schema.sql` 같은 migration 파일로 저장하고, 실행된 migration 이력을 DB 안의 schema history table에 기록한다.

이 프로젝트에서는 Spring Boot가 시작될 때 `server/api/src/main/resources/db/migration` 아래의 SQL migration을 읽어 PostgreSQL/PostGIS schema를 맞추는 용도로 쓴다.

핵심 감각:

- 애플리케이션 코드는 git으로 버전 관리한다.
- DB schema도 migration 파일로 버전 관리해야 한다.
- 새 테이블/컬럼이 필요하면 기존 migration을 고치기보다 다음 migration을 추가하는 쪽이 기본이다.
- 이미 다른 DB에 적용된 migration 파일을 수정하면 checksum이 달라져 Flyway가 이상 상태로 볼 수 있다.

현재 파일:

```text
server/api/src/main/resources/db/migration/V1__create_initial_schema.sql
```

### ERD를 먼저 잡고 API DTO를 설계하는 편이 맞다

API DTO부터 만들면 화면에 필요한 응답 모양에 끌려 DB 관계가 흐려질 수 있다. 라멘집, 방문 기록, 태그, 위시리스트 관계를 먼저 ERD로 고정하고, DTO는 그 모델을 외부에 쓰기 좋게 변환하는 계층으로 두는 편이 낫다.

이 프로젝트에서는 [docs/06-database-erd.md](06-database-erd.md)를 API 계약보다 먼저 보는 문서로 둔다.

### `pnpm dev:api`는 Kotlin 서버를 Node로 실행하는 게 아니다

루트 `package.json`의 `dev:api`는 편의 명령이다. 실제 실행은 `server/api`의 Gradle wrapper가 한다.

```bash
pnpm dev:api
```

위 명령은 개념적으로 아래와 같다.

```bash
cd server/api && ./gradlew bootRun
```

pnpm은 모노레포에서 명령 진입점을 통일해주는 역할이고, Kotlin/Spring Boot 빌드와 실행은 Gradle이 맡는다.

### Docker가 없으면 DB 기반 검증은 멈춘다

이 환경에서는 `docker` 명령이 없어서 `pnpm infra:up`, Flyway migration 실제 적용, Swagger/OpenAPI 런타임 검증을 하지 못했다.

대신 가능한 검증을 먼저 했다.

```bash
pnpm typecheck
pnpm build
cd server/api && ./gradlew compileKotlin
cd server/api && ./gradlew test
```

다음 예방책:

- README에 Docker가 준비물임을 명시한다.
- TODO에 DB 기반 검증 대기 항목을 남긴다.
- DB가 준비되면 `pnpm infra:up` 후 API 서버를 띄우고 `/health`, `/swagger`, `/openapi`를 확인한다.

### env 파일은 example만 공유한다

실제 `.env` 파일은 컴퓨터마다 다르고 비밀값이 들어갈 수 있으므로 git에 올리지 않는다. 대신 `.env.example`을 커밋해서 필요한 key와 로컬 기본값을 공유한다.

이 프로젝트의 기준:

```text
.env.example
apps/web/.env.example
server/api/.env.example
```

각 컴퓨터에서는 example 파일을 복사해서 자기 로컬 env 파일을 만든다.

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp server/api/.env.example server/api/.env
```

### Spring Boot API는 DB가 없으면 Flyway 단계에서 먼저 멈춘다

`pnpm dev:api`를 실행하면 Spring Boot는 뜨기 시작하지만, Flyway가 시작 시점에 DB connection을 잡고 migration을 적용하려 한다. `localhost:5432`에 Postgres가 없으면 API controller가 실제로 열리기 전에 애플리케이션 시작이 실패한다.

이번 실행에서 확인한 증상:

```text
Unable to obtain connection from database: Connection to localhost:5432 refused.
```

원인:

- 현재 환경에 `docker` CLI가 없다.
- 로컬 Postgres도 없다.
- 그래서 `pnpm infra:up`으로 Postgres/PostGIS를 띄울 수 없다.

해결 순서:

```bash
pnpm infra:up
pnpm dev:api
curl http://localhost:8080/health
```

즉 Swagger/OpenAPI 런타임 확인은 DB가 먼저 준비된 뒤 가능하다.

### 서버를 만든다는 건 다중 사용자 경로를 전제로 한다

“나만 쓸 거면 서버 안 만들었지”라는 피드백으로 모델이 바로잡혔다. 서버 기반 웹 서비스라면 로그인 구현을 당장 붙이지 않더라도, 방문 기록과 위시리스트는 결국 사용자 소유 데이터다.

깨달음:

- 로그인은 UI 기능이 아니라 데이터 소유권 설계와 연결된다.
- `users`, `visits.user_id`, `wishlist.user_id`는 나중에 덧붙일 장식이 아니라 ERD에서 먼저 고려해야 한다.
- 인증 구현은 나중에 자를 수 있지만, 사용자 소유권을 무시한 DB/API는 나중에 migration 비용이 커진다.

### Swagger 작업은 코드 문서화와 런타임 검증이 나뉜다

DB가 없어도 `@OpenAPIDefinition`, `@Operation`, `@ApiResponse`, `@Schema` 같은 annotation은 작성하고 컴파일 검증할 수 있다. 하지만 `/swagger`, `/openapi` 응답을 실제로 확인하려면 Spring Boot 애플리케이션이 끝까지 떠야 하므로 DB와 Flyway가 먼저 성공해야 한다.

이번에 DB 없이 가능한 작업:

- OpenAPI title/description/version 작성
- 컨트롤러별 operation summary/description 작성
- request/response DTO schema와 example 작성
- 공통 error response schema 문서화

아직 DB 준비 후 해야 할 작업:

- `/swagger` 렌더링 확인
- Swagger UI에서 shops, visits, wishlist CRUD 수동 검증

### DB 없이도 OpenAPI client 생성은 가능하다

Spring Boot 서버는 기본적으로 시작 시 Flyway가 DB 연결을 잡으려 해서 DB가 없으면 `/openapi`까지 도달하지 못한다. 하지만 문서 생성만 필요할 때는 Flyway를 끄고 Hikari 초기 연결 실패를 막으면 controller와 springdoc은 뜰 수 있다.

이번 프로젝트의 문서 생성용 명령:

```bash
pnpm dev:api:docs
```

핵심 옵션:

```text
--spring.flyway.enabled=false
--spring.datasource.hikari.initialization-fail-timeout=0
--server.address=127.0.0.1
```

이 모드는 migration 검증용이 아니다. `/openapi`를 뽑고 generated client를 만드는 용도로만 쓴다. 실제 DB/Flyway 검증은 `pnpm infra:up` 후 `pnpm dev:api`로 따로 해야 한다.

### OpenAPI Generator는 스펙을 엄격하게 본다

OpenAPI에 license를 명시한다면 OpenAPI 3.1 기준에 맞게 완성된 license object를 써야 한다. 프로젝트 license가 확정되지 않았다면 license 필드를 아예 생략하는 편이 낫다.

또 `operationId`를 명시하지 않으면 generated method 이름이 프레임워크 추론에 의존한다. API client를 프론트에서 오래 쓸 생각이라면 controller마다 `operationId`를 직접 고정하는 편이 낫다.

이번 기준:

- `createShop`, `listShops`, `getShop`, `updateShop`, `deleteShop`
- `createVisit`, `listVisits`, `getVisit`, `updateVisit`, `deleteVisit`, `listShopVisits`
- `upsertWishlist`, `listWishlist`, `deleteWishlist`
- `getHealth`

### generated client는 그대로 두고 wrapper에서 앱 타입으로 다듬는다

`typescript-fetch` generator는 `date`와 `date-time`을 `Date` 객체로 만든다. 프론트 폼의 `<input type="date">`와 화면 표시는 `YYYY-MM-DD` 문자열이 더 편하다.

그래서 `packages/api-client/src/generated`는 수정하지 않고, `packages/api-client/src/index.ts`에서 다음 변환을 맡긴다.

- `Date` 응답을 `YYYY-MM-DD` 또는 ISO 문자열로 변환한다.
- optional field와 nullable field 차이를 앱 타입의 `null` 기준으로 정리한다.
- generated `ResponseError`를 앱에서 쓰는 `ApiError`로 변환한다.

### 인수인계 문서는 repo-relative link가 안전하다

처음 README와 AGENTS에는 `/Users/yijihun/ramen-dojang/...` 형태의 절대경로 링크가 있었다. 같은 컴퓨터에서는 편하지만, 다른 컴퓨터로 clone하면 링크가 깨진다.

공유될 문서는 다음처럼 repository 기준 상대 링크를 써야 한다.

```markdown
[TODO](docs/TODO.md)
[DB ERD](docs/06-database-erd.md)
```

Codex app 안에서 특정 파일 위치를 안내할 때는 절대경로 링크가 편하지만, git에 남는 문서는 다른 컴퓨터에서도 열리는 형태가 우선이다.

### 모듈 구조는 처음부터 물리적으로 쪼갤 필요는 없다

Android 멀티모듈처럼 `:feature:shop`, `:core:network`를 먼저 만들 수도 있지만, 초기 웹/서버 프로젝트에서는 package와 folder 구조만으로도 충분한 경우가 많다.

이번 프로젝트의 기준:

- 프론트는 `apps/web` 안에서 `routes`, `features`, `lib`로 나눈다.
- 서버는 단일 Spring Boot module 안에서 `shop`, `visit`, `wishlist`, `common` 도메인 package로 나눈다.
- OpenAPI client처럼 실제로 여러 앱에서 공유될 가능성이 큰 것은 `packages/api-client`로 물리 package를 만든다.

물리 multi-module/package 분리는 재사용, 독립 테스트, dependency rule 강제 필요가 생길 때 승격한다. 먼저 interface와 의존 방향을 문서화하고, 진짜 비용을 줄이는 지점에서 쪼개는 쪽이 낫다.

### Nitro 계열 라이브러리는 bridge 비용을 줄이려는 선택이다

`nitro-webview`를 검토하면서 Nitro Modules 계열의 장점과 비용이 정리됐다.

Nitro Modules는 React Native native module을 JSI 쪽으로 직접 연결하고, 타입 기반 binding을 정적으로 생성하는 방향이다. 기존 bridge처럼 JSON serialization, `NativeEventEmitter`, thread hop에 의존하는 경로를 줄이는 것이 목표다.

WebView에서 이게 의미 있는 이유:

- WebView는 `onLoadStart`, `onLoadEnd`, navigation state, page message, error, download처럼 event가 많다.
- native method도 `reload`, `goBack`, `evaluateJavaScript`, cookie 조작처럼 자주 필요할 수 있다.
- Nitro 기반이면 이런 prop/event/method 호출이 legacy bridge round-trip을 덜 탄다.

하지만 공짜는 아니다.

- event handler를 `callback(...)`으로 감싸야 한다.
- imperative method는 React `ref`가 아니라 `hybridRef`로 받는다.
- native module이므로 Expo Go만으로는 부족할 수 있고 development build/prebuild 검증이 필요하다.
- `nitro-webview` 자체가 `react-native-webview`보다 덜 보편적인 선택이라, 안정성/문서/사례는 계속 확인해야 한다.

이번 프로젝트에서는 모바일 앱이 웹뷰 shell 성격이고 WebView 이벤트가 핵심이 될 수 있으므로 `nitro-webview`를 먼저 얹어본다. 다만 file upload/download, Android Maven repo, iOS permission 같은 native host 설정은 실제 development build에서 검증해야 한다.

참고:

- [nitro-webview](https://github.com/l2hyunwoo/nitro-webview)
- [Nitro Modules](https://github.com/mrousavy/nitro)

### Nitro와 Expo는 방향은 맞지만 Expo Go 검증 대상은 아니다

Expo SDK 55 이후는 New Architecture가 항상 켜져 있고 끌 수 없다. Nitro Modules는 JSI와 정적 binding을 통해 native module을 붙이는 New Architecture 친화 계열이라, 큰 방향은 Expo SDK 56과 맞는다.

다만 이것이 “Expo Go에서 바로 실행된다”는 뜻은 아니다. Expo Go는 고정된 native library만 들어 있는 앱이고, `nitro-webview`는 프로젝트에 추가되는 custom native module이다. 그래서 이 프로젝트의 모바일 앱은 `expo-dev-client`가 포함된 development build로 확인해야 한다.

이번에 `expo-doctor`가 잡아준 문제:

- `expo-dev-client`가 없는데 `expo start --dev-client`를 쓰고 있었다.
- Expo SDK 56 기준 기대값과 다르게 React Native, React, TypeScript 버전이 어긋나 있었다.
- SDK 55+에서는 New Architecture가 항상 켜져 있으므로 `app.json`의 `newArchEnabled` 설정이 오히려 schema 경고가 됐다.
- `android.edgeToEdgeEnabled`도 현재 Expo config schema에서 허용되지 않아 제거했다.

수정 후 확인:

```bash
cd apps/mobile
pnpm dlx expo-doctor@latest
pnpm --filter mobile typecheck
```

결과:

```text
21/21 checks passed. No issues detected.
```

다음 예방책:

- Expo/RN/React/TypeScript 조합은 감으로 올리지 말고 `expo-doctor`를 먼저 본다.
- `nitro-webview`처럼 native module을 추가하면 Expo Go 통과 여부가 아니라 development build 통과 여부를 기준으로 삼는다.
- `expo-doctor` 통과는 dependency/config 검증이고, iOS/Android native build와 WebView upload/download 동작은 별도 TODO로 남긴다.

### Nitro가 핫한 이유는 React Native의 기본 방향이 바뀌었기 때문이다

예전 React Native native module은 JS와 native 사이를 bridge로 오가며 serialization, queue, thread hop 비용을 감수했다. Nitro Modules는 JSI 쪽에서 native 객체와 method를 더 직접적으로 연결하고, TypeScript spec에서 Swift/Kotlin/C++ binding을 생성하는 방향이다.

그래서 요즘 주목받는 이유:

- React Native New Architecture가 현재와 미래의 기본 경로가 됐다.
- native module 호출 비용을 줄이는 방향이 성능상 중요해졌다.
- 타입 기반 codegen으로 JS/native 경계의 계약을 더 분명하게 만들 수 있다.
- WebView처럼 event와 imperative method가 많은 컴포넌트는 bridge 비용을 줄였을 때 이점이 생길 여지가 크다.

하지만 Nitro가 웹 페이지 자체를 빠르게 만들어주는 것은 아니다. 웹뷰 안에서 돌아가는 `apps/web`의 렌더링 성능은 여전히 웹 앱의 bundle, React rendering, 네트워크, 브라우저 엔진 영향을 받는다. Nitro는 React Native shell과 native WebView 사이의 통신 비용을 줄이려는 선택이다.

### typecheck/build 검증은 TDD 흔적이 아니다

초기 스캐폴딩을 빠르게 진행하면서 `pnpm typecheck`, `pnpm build`, `./gradlew compileKotlin`, `./gradlew test` 같은 검증은 많이 실행했다. 하지만 이것은 “이미 만든 구조가 깨지지 않는다”는 확인이지, behavior를 먼저 테스트로 정의하고 구현한 TDD 흐름은 아니다.

TDD 기준으로는 다음 흔적이 남아야 한다.

- public interface 기준 behavior를 먼저 적는다.
- behavior 하나에 대한 실패 테스트를 먼저 만든다.
- 최소 구현으로 green을 만든다.
- 다음 behavior로 반복한다.
- 모든 테스트가 green일 때만 refactor한다.

이번 깨달음:

- 스캐폴딩/문서/설정 작업은 TDD가 애매할 수 있다.
- 하지만 API behavior, 인증, 사용자 소유권, 프론트 query/mutation 흐름은 TDD로 잡을 수 있다.
- 다음 기능 구현부터는 “테스트 없이 구현 후 typecheck”를 완료 기준으로 삼지 않는다.

### ESLint와 oxlint는 속도보다 역할 차이를 먼저 봐야 한다

ESLint는 JavaScript/TypeScript linting의 오래된 표준에 가깝다. 규칙, parser, plugin, shareable config 생태계가 크고 React, 접근성, import 정리, custom rule 같은 팀별 규칙을 섬세하게 엮기 좋다. 대신 JavaScript 기반 plugin을 많이 실행할수록 느려질 수 있다.

oxlint는 Oxc compiler stack 위에 만든 Rust 기반 linter다. 공식 문서는 ESLint보다 훨씬 빠른 CI 성능, 많은 built-in rule, ESLint migration 지원을 장점으로 내세운다. 특히 아직 복잡한 ESLint 설정이 없는 프로젝트라면 “빠른 기본 lint”로 시작하기 좋다.

다만 oxlint가 무조건 ESLint의 완전한 대체재라는 뜻은 아니다.

- ESLint는 plugin 생태계와 edge case 호환성이 가장 강하다.
- oxlint는 기본 속도와 built-in rule 범위가 강하지만, 일부 ESLint plugin/rule 동작은 아직 그대로 옮기기 어려울 수 있다.
- oxlint의 JavaScript plugin 지원은 ESLint v9 API 호환을 목표로 하지만 현재 alpha 성격이 있다.
- `.vue`, `.svelte`, `.astro` 같은 framework file은 script block 중심 지원이라, 파일 형식이 늘어나면 다시 확인해야 한다.

이번 프로젝트 기준 판단:

- 현재는 Vite React, Expo, TypeScript 조합이고 복잡한 ESLint 설정이 없다.
- 따라서 처음 lint를 붙일 때는 oxlint-first가 합리적이다.
- 하지만 바로 pre-commit 하네스에 넣기보다 trial로 돌려서 React hooks, TS/TSX, generated client 제외, mobile 파일 false positive를 먼저 본다.
- oxlint만으로 부족한 규칙이 나오면 ESLint를 병행하거나, 꼭 필요한 plugin rule만 ESLint fallback으로 남긴다.

도입 순서:

```bash
pnpm add -D -w oxlint
```

이후 `lint`, `lint:fix` 스크립트를 추가하고, 처음 한 번은 수동으로 결과를 확인한다. 유용한 신호가 많고 noise가 적으면 그때 `pnpm verify`와 `.githooks/pre-commit`에 연결한다.

결론:

- “최근에 나왔고 빠르다”만으로 도입하지 않는다.
- 이 repo에서는 기존 ESLint 부채가 없으므로 oxlint를 먼저 시험해볼 가치가 크다.
- lint는 빌드보다 훨씬 자주 실행되므로 속도가 중요하지만, 팀이 실제로 믿고 고칠 수 있는 규칙인지가 더 중요하다.

참고:

- [Oxlint Linter](https://oxc.rs/docs/guide/usage/linter.html)
- [Oxlint: Migrate from ESLint](https://oxc.rs/docs/guide/usage/linter/migrate-from-eslint.html)
- [Oxlint JavaScript Plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html)
- [ESLint Getting Started](https://eslint.org/docs/latest/use/getting-started)
- [ESLint Configuration Files](https://eslint.org/docs/latest/use/configure/configuration-files)

### Homebrew PostGIS는 PostgreSQL major version을 맞춰야 한다

증상:

- `postgresql@16`과 `postgis`를 설치한 뒤 `CREATE EXTENSION postgis`가 실패했다.
- 에러는 `postgresql@16` extension 디렉터리에서 `postgis.control`을 찾을 수 없다는 내용이었다.

원인:

- 설치된 Homebrew `postgis 3.6.4`는 `postgresql@17`, `postgresql@18`용 extension 파일을 제공했고, `postgresql@16` 경로에는 파일이 없었다.

해결:

- `postgresql@17`을 추가 설치하고 17 클러스터에서 `ramen_dojang` DB와 PostGIS extension을 만들었다.
- 그 뒤 `pnpm dev:api`가 Flyway V1/V2 migration을 실제 DB에 적용했다.

다음 예방책:

- Docker가 없는 환경에서 Homebrew로 PostGIS를 쓸 때는 `find /opt/homebrew -name postgis.control`로 지원되는 PostgreSQL major version을 먼저 확인한다.
- PATH에 여러 PostgreSQL 버전이 섞이면 절대 경로(`/opt/homebrew/opt/postgresql@17/bin/...`)를 쓴다.

### 현재 Docker는 로컬 개발 DB 인프라용이다

지금 Docker는 앱 배포용이 아니라 PostgreSQL/PostGIS 개발 DB를 쉽게 띄우기 위한 용도다. repo 기준으로 `infra/docker-compose.yml`에는 PostGIS가 포함된 PostgreSQL 컨테이너만 있다.

| 용도 | 현재 사용 여부 | 설명 |
| --- | --- | --- |
| Postgres DB 실행 | 사용 | `ramen_dojang` 개발 DB를 로컬에서 띄운다. |
| PostGIS 포함 DB 제공 | 사용 | 라멘집 위치 검색과 거리 계산을 위해 필요하다. |
| API 서버 컨테이너화 | 아직 아님 | Spring Boot는 로컬 `./gradlew bootRun`으로 실행한다. |
| 웹 프론트 컨테이너화 | 아님 | Vite dev server와 Vercel 배포를 사용한다. |
| 운영 배포 | 아직 아님 | 서버 클라우드 배포 방식은 별도로 정한다. |

Docker를 두는 이유는 PostGIS 로컬 설치의 버전/권한 문제를 줄이기 위해서다. 혼자 개발 중이고 Homebrew PostgreSQL이 잘 돌아가면 필수는 아니지만, 새 컴퓨터에서 빠르게 DB를 띄우는 안전한 경로로 남긴다.

### PostgreSQL은 null query parameter 타입을 추론하지 못할 수 있다

증상:

- `POST /shops`는 성공했지만 `GET /shops`는 500을 냈다.
- 서버 로그에는 `could not determine data type of parameter`가 남았다.

원인:

- `WHERE (:name IS NULL OR ...)`처럼 nullable named parameter를 SQL에서 바로 검사했고, PostgreSQL이 null parameter의 타입을 결정하지 못했다.

해결:

- `CAST(:name AS text)`, `CAST(:visited AS boolean)`처럼 SQL에서 parameter 타입을 명시했다.

다음 예방책:

- nullable filter parameter를 SQL에 넣을 때는 타입 cast를 명시하거나, filter가 있을 때만 WHERE 절을 붙인다.

### Spring Boot Kotlin의 주류 ORM은 JPA/Hibernate다

ORM은 Object-Relational Mapping의 약자다. DB row와 table을 애플리케이션의 객체와 관계로 매핑해주고, insert/update/select 같은 반복적인 SQL과 객체 변환을 줄여준다. 보통 entity mapping, 변경 감지, relation loading, transaction 안의 persistence context, repository 패턴을 제공한다.

Kotlin Spring Boot 3에서 가장 주류인 선택지는 Spring Data JPA + Hibernate다. Spring 생태계 문서, 예제, 팀 경험, 라이브러리 호환성이 가장 넓다. 다만 Kotlin에서는 JPA proxy 때문에 `kotlin-jpa`/`all-open`/`no-arg` 설정, entity의 `data class` 사용 주의, lazy loading과 equals/hashCode 주의가 따라온다.

Exposed는 JetBrains의 Kotlin SQL/DAO 라이브러리라 Ktor와 함께 쓰는 경우가 많지만, Spring Boot의 주류 ORM 선택지는 아니다. jOOQ는 타입 안전 SQL DSL에 가깝고 ORM이라기보다 SQL을 명시적으로 쓰는 선택지다. Spring JDBC/JdbcClient는 지금 프로젝트처럼 SQL을 직접 쓰는 가장 얇은 선택지다.

이번 프로젝트는 아직 ORM을 쓰지 않는다. 현재는 Spring JDBC와 직접 SQL, Flyway migration으로 충분하다. PostGIS 쿼리와 catalog 검색처럼 SQL 모양이 중요한 부분이 있어, SQL 중복과 mapping 실수가 실제로 늘어나기 전까지 ORM은 보류한다.

### 앱인토스에서 Vite와 Granite는 양자택일이 아니다

앱인토스 미니앱을 만든다고 해서 기존 Vite 앱을 버릴 필요는 없다. Vite는 웹 개발 서버와 번들러 역할을 계속 맡고, Granite는 앱인토스용 설정, 빌드, 패키징 레이어로 얹는다.

공식 예시도 `granite.config.ts`의 `web.commands`에서 `vite dev`, `vite build`를 호출하는 구조다. 따라서 현재 `apps/web`은 유지하고, 앱인토스 spike는 Granite 설정을 얇게 추가해 기존 Vite 빌드를 감싸는 방식으로 시작한다.

출시 타겟이 앱인토스 WebView에 가까워지면 프론트 판단 기준도 바뀐다. 데스크톱 웹을 먼저 만들고 모바일을 맞추는 게 아니라, 모바일 앱 화면을 1순위로 두고 데스크톱 웹은 깨지지 않게 확장한다.

### `.ait`는 앱인토스 콘솔 업로드용 미니앱 패키지다

`.ait` 파일은 웹사이트 배포 산출물이 아니라 앱인토스 콘솔의 `앱 출시` 메뉴에 올리는 미니앱 패키지다. 공식 가이드도 앱 빌드 후 생성된 `ait` 파일을 콘솔에 업로드해 테스트한다고 설명한다.

이 프로젝트에서는 `pnpm --filter web build:ait`로 `apps/web/ramen-dojang.ait`를 만들고, Vercel 배포는 별도로 `apps/web/dist`를 사용한다. 즉 같은 Vite 앱을 쓰더라도 `dist`는 웹 호스팅용, `.ait`는 앱인토스 제출/샌드박스 확인용으로 역할이 다르다.

### 토스 로그인은 테스트와 운영 조건을 나눠 본다

앱인토스 토스 로그인은 테스트 앱에서는 사업자 인증 없이 개발과 연동 테스트를 진행할 수 있다. 다만 운영 배포에서 실제 사용자가 로그인을 쓰려면 개발자 센터 콘솔의 사업자 인증 또는 파트너 정보 등록이 필요하다.

이번 프로젝트에서는 방문 기록 소유권을 먼저 만들되, 단순 사용자 구분만 필요하면 앱인토스 `getAnonymousKey`를 먼저 검토한다. 토스 로그인은 테스트 앱으로 연동 가능성을 확인하고, 운영 배포 전 사업자 인증과 mTLS 서버 연동 요건을 따로 처리한다.

### 유저별 서버 저장에는 최소 익명 식별이 필요하다

localStorage만 쓰면 기기 변경, 브라우저 데이터 삭제, 앱 재설치에서 방문 기록이 이어지지 않는다. 개인 방문 기록과 위시리스트를 서버에 저장하려면 최소한의 사용자 식별자가 필요하다.

앱인토스 비게임 미니앱은 `getAnonymousKey`로 미니앱별 고유 hash를 받을 수 있다. 이 값은 토스 서버 API 호출용 키가 아니라 내부 사용자 식별과 데이터 관리용 키이므로, 라멘 도장깨기에서는 먼저 `getAnonymousKey`를 `users` 매핑 기준으로 쓰고 토스 로그인은 개인정보 조회나 결제 상태 조회가 필요할 때만 붙인다.

### 앱인토스 경험담은 로그인과 광고 범위를 줄이는 힌트로 쓴다

개발자 경험담 기준으로도 토스 로그인은 클라이언트 인가 코드만으로 끝나지 않고, 서버의 토큰 교환과 사용자 조회, mTLS 인증서, 콜백 처리가 붙는다. 그래서 로그인은 “있으면 좋음”이 아니라 방문 기록 소유권이나 개인화에 꼭 필요할 때만 세로 slice로 붙인다.

수익화는 앱인토스 콘솔에서 인앱 광고 그룹 ID를 만든 뒤 배너, 전면형, 리워드 중 맞는 형식을 붙이는 흐름으로 보인다. 라멘 도장깨기 MVP는 보상 재화가 없으므로 리워드 광고보다 배너나 전면형부터 검토한다.

비게임 미니앱은 TDS 사용을 우선한다. 자체 디자인 시스템을 새로 키우지 않고, TDS로 안 되는 라멘 기록 도메인 표현만 작게 직접 만든다.

참고: [앱인토스 찍먹해보기](https://velog.io/@dbwls/%EC%95%B1%EC%9D%B8%ED%86%A0%EC%8A%A4-%EC%B0%8D%EB%A8%B9%ED%95%B4%EB%B3%B4%EA%B8%B0)

### 첫 앱인토스 MVP도 catalog 서버는 필요하다

개인 기록 앱의 첫 검증 목표가 “사용감이 괜찮은가”라도 라멘집 catalog를 앱에 하드코딩하면 데이터 갱신과 검색 품질이 바로 막힌다. 앱 진입 때마다 많은 라멘집 데이터를 코드에 박아 배포할 수는 없으므로, 검수된 라멘집 목록과 검색은 서버가 맡아야 한다.

다만 토스 로그인은 여전히 1차 필수 조건이 아니다. 이번 프로젝트의 최소 구조는 공용 라멘집 catalog 서버와 localStorage 개인 기록이다. 서버는 `shops` 목록/상세/검색을 제공하고, 앱은 방문 기록과 위시리스트를 로컬에 저장한다. 개인 기록을 서버에 저장하거나 여러 기기에서 이어 쓰려면 먼저 `getAnonymousKey` 기반 익명 사용자 저장으로 간다.

### 초기에는 모니터링 툴보다 health와 로그면 충분하다

아직 운영 트래픽이 없는 단계에서는 Prometheus, Grafana 같은 모니터링 스택을 먼저 붙이지 않는다. 로컬 개발은 터미널 로그와 `/health` 확인으로 충분하고, 앱인토스 WebView 오류 추적은 Sentry DSN을 준비한 뒤 붙인다. 운영 전에는 최소 기준을 다시 정한다.

### Spring Boot는 내장 Tomcat이 WAS 역할을 한다

WAS는 Web Application Server다. HTTP 요청을 받아서 Java/Kotlin 서버 코드를 실행하고, DB 접근과 비즈니스 로직을 처리하는 런타임이다. 이 프로젝트에서는 Spring Boot가 내장 Tomcat을 띄우므로 별도 WAS를 설치하지 않아도 된다. 서버 로그의 `Tomcat started on port 8080`이 그 역할을 확인해준다.

WAR는 외부 Tomcat, WebLogic 같은 WAS에 올리는 Java 웹앱 패키지다. Spring Boot 기본 흐름은 실행 가능한 JAR 안에 Tomcat을 포함하고 `java -jar` 또는 `./gradlew bootRun`으로 실행하는 방식이라, 현재 라멘 도장깨기 API에는 WAR 배포가 필요 없다. 회사 표준 WAS에 얹어야 하는 상황이 생기면 그때 WAR 패키징을 검토한다.

### curl 성공과 브라우저 성공은 CORS 때문에 다르다

`curl http://localhost:8080/health`가 성공해도 Vite dev server(`localhost:5174`)에서 Spring API(`localhost:8080`)를 호출하면 브라우저의 CORS 정책을 통과해야 한다. API 서버가 살아 있는데 화면에 “API 서버 연결을 확인해주세요”가 뜨면 서버 health뿐 아니라 `Origin` 헤더를 포함한 응답의 `Access-Control-Allow-Origin`도 확인한다.

로컬 개발에서는 Spring `WebMvcConfigurer`로 `http://localhost:*`, `http://127.0.0.1:*`를 허용하면 충분하다. 운영에서는 Vercel 도메인과 앱인토스 도메인만 좁혀서 허용한다.

### Smoke test와 E2E test는 깊이가 다르다

Smoke test는 배포나 로컬 실행 직후 “불이 붙었는지” 빠르게 보는 최소 확인이다. E2E test는 사용자의 실제 흐름을 처음부터 끝까지 자동으로 검증한다.

| 구분 | Smoke test | E2E test |
| --- | --- | --- |
| 목적 | 핵심 경로가 죽지 않았는지 빠르게 확인 | 실제 사용자 시나리오가 끝까지 맞는지 확인 |
| 범위 | health, 주요 API 1~2개, 대표 화면 렌더링 | 화면 이동, 입력, 저장, 조회, 삭제 같은 전체 흐름 |
| 속도 | 빠름 | 상대적으로 느림 |
| 실패 의미 | 서버/DB/빌드/배포가 크게 깨졌을 가능성 | 기능 흐름이나 화면 계약이 깨졌을 가능성 |
| 예시 | `/health`, `GET /shops`, 기본 썸네일 렌더링 확인 | 라멘집 검색 → 방문 리뷰 작성 → 홈 기록 반영 확인 |

이번 프로젝트에서는 개발 중 빠른 확인은 smoke test로 충분하다. 출시 전 핵심 플로우가 고정되면 Playwright 같은 도구로 E2E test를 붙인다.

### `.d.ts`는 TypeScript용 API 계약서다

`.d.ts` 파일은 실행되는 코드가 아니라 TypeScript가 라이브러리의 함수, 컴포넌트, props 타입을 이해하기 위한 선언 파일이다. 실제 런타임 동작은 `.js`가 담당하고, `.d.ts`는 컴파일 타임에 “이 prop을 받을 수 있는가”를 확인하는 계약서 역할을 한다.

라이브러리 컴포넌트의 허용 props를 빠르게 확인할 때는 설치된 패키지의 `.d.ts`를 보는 것이 가장 싸다. 이번에는 `@toss/tds-mobile`의 `ButtonProps`, `BadgeProps`, `TDSMobileProvider` 타입을 확인해 색상 설정 범위를 판단했다.

### TDS는 blue만 강제하지 않는다

현재 앱은 Toss blue `#3182f6`를 primary로 쓰지만, TDS가 blue만 허용하는 구조는 아니다. 설치된 `@toss/tds-mobile@2.5.0` 기준으로 Button의 `color` prop은 `primary`, `danger`, `light`, `dark` semantic color를 받고, Badge는 `blue`, `teal`, `green`, `red`, `yellow`, `elephant`를 받는다.

앱 전체 primary는 앱인토스 환경에서는 `TDSMobileAITProvider`의 `brandPrimaryColor`, 웹 환경에서는 `TDSMobileProvider`의 `token.color.primary`로 바꿀 수 있다. 따라서 라멘 도메인과 Toss blue가 어색하면 TDS 구조와 토스다운 neutral surface는 유지하고, shoyu/amber 계열 primary를 CTA와 선택 상태 같은 작은 강조에만 제한적으로 쓰는 방향이 가능하다.

### 모바일 시안은 390px 대표, 360px 최소 검수로 본다

390px은 최근 iPhone 기본급 계열을 떠올리기 쉬운 대표 시안 폭이고, 360px은 Android와 작은 모바일에서 여전히 중요한 최소 검수 폭이다. 디자인 요청서에는 390px만 쓰면 기준이 바뀐 것처럼 보이므로, “390px 대표 시안, 360px 최소 검수”를 같이 적는다.

라멘 도장깨기처럼 토스 미니앱을 우선하는 앱은 모바일 1순위로 보되, 360px에서도 버튼 텍스트, 별점 입력, 라멘집 카드 정보가 줄바꿈으로 깨지지 않는지 확인한다.

### 배포 전 DB schema는 reset 중심이 더 싸다

아직 운영 배포 전이고 혼자 개발하는 단계라면 작은 migration을 계속 누적하기보다 V1 초기 schema에 합치고 로컬 DB를 reset하는 편이 더 단순하다. 이 프로젝트에서는 `shop_candidates`를 별도 V2로 두지 않고 V1에 합쳤다.

다만 Flyway 자체를 버리는 것은 아니다. Flyway는 깨끗한 DB에 schema가 재현되는지 확인하는 기준으로 계속 쓴다. 운영 배포 이후에는 기존 migration을 수정하지 않고 새 migration을 추가한다.

### Homebrew PostgreSQL과 PostGIS는 major version을 맞춘다

Homebrew로 PostgreSQL과 PostGIS를 설치하면 PostGIS extension 파일이 특정 PostgreSQL major version 경로에만 생길 수 있다. 이번 환경에서는 `postgresql@16` 서비스가 켜져 있었지만 `postgis.control`은 `postgresql@17` 경로에 있어 `CREATE EXTENSION postgis`가 실패했다.

해결은 실행 중인 PostgreSQL 서비스를 PostGIS가 설치된 major version으로 맞추는 것이다. 그 다음 앱 계정에 extension 생성 권한이 없으면 로컬 DB 생성 직후 superuser로 `CREATE EXTENSION IF NOT EXISTS postgis;`를 먼저 실행하고, 앱은 일반 계정으로 Flyway를 실행한다.

### 외부 장소 API seed는 후보 저장과 승격으로 나눈다

네이버 지역 검색 API 같은 외부 장소 검색은 초기 라멘집 데이터를 모으는 데 쓸 수 있지만, 결과를 곧바로 `shops`에 넣으면 라멘집이 아닌 장소나 품질 낮은 데이터가 섞인다. 그래서 API 결과는 `shop_candidates`에 저장하고, 검수 후 `shops`로 승격한다.

오늘 확인한 최소 흐름은 다음과 같다. Naver credentials가 있으면 `POST /admin/shop-candidates/sync`로 후보를 저장하고, `GET /admin/shop-candidates`로 확인한 뒤, 적합한 후보를 `POST /admin/shop-candidates/{candidateId}/promote`로 승격한다. credentials가 없을 때는 `NAVER_SEARCH_NOT_CONFIGURED` 503이 정상 실패다.

### 라멘집 후보 수집은 Kakao도 꽤 좋은 1차 선택지다

네이버 지역 검색 API만 고집할 필요는 없다. Kakao Local API는 장소 `id`, 음식점 카테고리 `FD6`, 위치 반경 검색, 카카오맵 place URL을 제공해서 `shop_candidates.source_place_id` 중복 제거가 네이버보다 쉽다.

공공데이터포털의 소상공인 상가정보와 행정안전부 일반음식점 데이터는 검색 API라기보다 대량 seed 원천이다. 앱에서 바로 검색할 데이터로 쓰지 말고, import job으로 후보를 만들고 Kakao/Naver로 place ID와 URL을 보강하는 흐름이 맞다.

### 외부 장소 sync는 queue와 backoff가 필요해지면 그때 붙인다

전국 라멘집 후보를 Naver로 빠르게 당겨오면 일일 한도보다 먼저 429 속도 제한을 만날 수 있다. MVP seed 단계에서는 수동 sync로 충분하지만, 지역 query가 늘어나면 `query`, `lastAttemptAt`, `status`, `retryAfter` 정도를 가진 작은 queue나 cron/scheduled job이 필요하다.

다만 scheduled job도 `shop_candidates`까지만 자동으로 채운다. `shops` 승격은 카테고리/중복 기준이 더 안정되기 전까지 수동 또는 제한된 rule로만 처리한다.

### seed JSON에는 DB id를 넣지 않는다

클라우드 DB를 아직 붙이지 않은 상태에서는 로컬 DB의 데이터가 다른 컴퓨터로 자동 공유되지 않는다. 지금 단계에서는 운영 DB를 먼저 만들기보다, 로컬에서 만든 seed를 JSON으로 export해 repo에 두는 방식이 더 가볍다.

로컬 DB에서 export한 라멘집 seed를 다른 DB에 꽂아 쓰려면 `id`를 빼는 편이 낫다. UUID는 import 시점에 새로 만들고, seed 파일은 `name`, `address`, `latitude`, `longitude`, `phone`, `placeUrl`, `thumbnailUrl`, `tags` 같은 이식 가능한 필드만 가진다.

이번 214건 catalog seed는 `server/api/src/main/resources/seed/shops.seed.json`에 둔다. GitHub에 올려도 되는 공개 후보 데이터지만, 운영에서 검수 완료된 canonical 데이터가 아니라 초기 seed 후보/검수 전 데이터라는 성격을 유지한다. export 후에는 JSON parse, row count, `id` 필드 미포함 여부를 확인한다.

seed import는 운영 API endpoint보다 Gradle task가 더 단순하다. `./gradlew importSeedShops`는 로컬 DB 기본값을 쓰고, AWS RDS에는 `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`만 바꿔 실행한다. importer는 `name + address`를 자연키처럼 써서 중복 생성 없이 update/insert한다.

### Vercel preview는 PR/브랜치용 임시 배포다

Vercel preview deployment는 production 도메인에 올리기 전, 커밋이나 브랜치 상태를 임시 URL로 확인하는 배포다. 실제 운영 배포가 아니라 QA, 모바일 실기기 확인, 공유 리뷰에 쓰기 좋다.

이 프로젝트처럼 API 서버를 아직 로컬에서 띄우는 단계라면 Vercel preview는 웹 정적 파일만 먼저 올려보는 용도다. `VITE_API_BASE_URL`을 `http://192.168.x.x:8080`처럼 로컬 LAN API로 잡으면 같은 Wi-Fi의 내 폰에서는 붙을 수 있지만, 외부 사람이 preview URL을 열면 그 사람의 네트워크에서 `192.168.x.x`를 찾게 되어 API가 붙지 않는다.

또한 Vercel preview는 HTTPS이고 로컬 API는 HTTP라서 브라우저 mixed content나 CORS에 막힐 수 있다. 막히면 Vercel을 억지로 고치기보다 HTTPS 터널이나 API 서버 배포로 넘어간다. 지금 단계에서는 “폰에서 실제 화면이 보이는지” 확인하는 가벼운 smoke test 용도로만 쓴다.

### 앱인토스 출시는 Vercel 호스팅이 필수가 아니다

앱인토스 미니앱은 일반 웹 URL을 등록해 열어두는 흐름보다, Granite 빌드로 만든 `.ait` 번들을 콘솔에 업로드하고 샌드박스/QR 테스트를 거쳐 출시하는 흐름에 가깝다. 기존 Vite 웹 프로젝트도 Granite 설정에서 `vite dev`, `vite build`를 호출해 이 흐름에 태울 수 있다.

실제 서비스 CORS origin은 `https://<appName>.apps.tossmini.com`, QR 테스트 origin은 `https://<appName>.private-apps.tossmini.com` 형태를 허용해야 한다. 따라서 앱인토스 안에서만 쓰는 프론트라면 별도 브랜드 도메인 구매는 보류해도 된다.

Vercel 연동은 그래도 버릴 필요는 없다. 공개 웹사이트를 같이 운영하거나, 브라우저/모바일 QA용 preview URL을 만들거나, 큰 정적 리소스를 웹/CDN 쪽으로 분리할 때 쓸 수 있다. 이 프로젝트에서는 앱인토스는 `.ait`, 일반 웹은 Vercel, API/DB는 Render/Railway/AWS 같은 서버 배포 후보로 나눈다.

### 앱인토스 TDS 패키지는 필수가 아니라 선택지다

`@toss/tds-mobile`은 앱인토스 WebView용 TDS 컴포넌트를 쉽게 쓰게 해주는 패키지지만, 일반 브라우저에서는 앱인토스 환경이 아니라는 runtime guard 때문에 흰 화면을 만들 수 있다. 일반 웹사이트와 앱인토스를 같은 번들로 배포하려면 TDS package 의존성보다 native HTML 기반 local component가 더 단순하다.

공식 가이드 기준으로 꼭 지켜야 하는 것은 TDS package 사용 여부가 아니라 비게임 출시 기준과 UI/UX 기준이다. 특히 탭바는 필수는 아니지만, 사용할 경우 TDS 미사용 시에도 토스에서 제공하는 플로팅 형태를 따라야 한다. 앱인토스 안에서는 자체 topbar가 공식 내비게이션 바와 중복되지 않게 하고, 일반 웹에서는 같은 화면을 Vercel에서 볼 수 있게 유지한다.

### RDS는 켜져 있는 시간 자체가 비용이다

AWS RDS는 DB에 요청이 없어도 인스턴스가 `available` 상태면 시간 요금이 발생한다. 스토리지와 백업도 별도 비용 항목이다. 따라서 아직 앱인토스 샌드박스/출시 전이고 24시간 API가 필요하지 않다면 RDS 인스턴스를 미리 켜두지 않는다.

최소 비용 모드에서는 AWS CLI, IAM 사용자, budget, security group, DB subnet group까지만 준비하고 RDS 생성은 출시 직전으로 미룬다. Secrets Manager managed password도 소액이지만 별도 비용이 생길 수 있으므로, 혼자 운영하는 MVP에서는 RDS master password를 직접 생성해 안전한 password manager에 저장한다. password 생성은 `/`, `@`, 따옴표 같은 문제 문자를 피하려고 `openssl rand -hex 24`처럼 hex 출력을 쓰면 편하다.

### smoke test는 최소 생존 확인이다

smoke test는 배포나 큰 변경 직후 “핵심 경로가 아예 죽지는 않았는지” 빠르게 보는 최소 테스트다. 이름은 전원을 켰을 때 연기가 나지 않는지 먼저 보는 하드웨어 검사에서 왔다.

이 프로젝트에서는 `GET /health`, `GET /openapi`, `GET /shops?name=멘야`, 프론트 dev server 200 응답 정도가 smoke test다. 라멘집 등록/방문 기록 작성/위시리스트 전체 케이스를 꼼꼼히 검증하는 것은 smoke test가 아니라 수동 QA나 E2E 테스트에 가깝다.

목적은 버그가 없다고 증명하는 것이 아니라, 다음 단계로 넘어가도 될 만큼 기본 연결이 살아 있는지 확인하는 것이다.
