# Lessons

프로젝트를 진행하면서 배운 것, 질문하면서 정리된 개념, 문제를 해결하며 얻은 깨달음을 기록한다.

## 기록 규칙

- 날짜는 실제 작업일 기준으로 적는다.
- 단순 작업 로그가 아니라 다음에 다시 써먹을 수 있는 깨달음을 남긴다.
- 문제가 있었다면 “증상 → 원인 → 해결 → 다음 예방책” 순서로 적는다.
- 사용자가 물어본 개념은 짧은 설명과 이 프로젝트에서의 적용 방식을 같이 적는다.

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

처음 `pnpm api:generate`를 실행했을 때 `info.license.identifier is missing` 오류가 났다. `license.name = "MIT"`만으로는 부족했고, OpenAPI 3.1 기준으로 `identifier = "MIT"`까지 넣어야 generator validation을 통과했다.

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
