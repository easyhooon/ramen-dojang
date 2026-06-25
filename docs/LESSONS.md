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

이 프로젝트에서는 [docs/06-database-erd.md](/Users/yijihun/ramen-dojang/docs/06-database-erd.md)를 API 계약보다 먼저 보는 문서로 둔다.

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
