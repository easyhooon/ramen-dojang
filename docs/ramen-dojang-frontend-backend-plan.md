# 라멘 도장깨기 Frontend + Backend 설계 계획

## 1. 제품 방향

라멘집 방문 기록을 지도 기반으로 남기고, 도장깨기처럼 다녀온 곳과 가고 싶은 곳을 쌓아가는 웹사이트 + 토스 미니앱 서비스다.

초기 목표는 같은 웹 코어를 공개 웹사이트와 토스 미니앱으로 출시할 수 있는지 검증하는 것이다. Expo React Native WebView 래퍼는 스토어 앱 배포가 다시 필요해질 때까지 보류한다.

## 2. 핵심 컨셉

- 다녀온 라멘집을 지도에 남긴다.
- 어떤 메뉴를 먹었는지, 국물/면/토핑/재방문 의사는 어땠는지 기록한다.
- 가보고 싶은 라멘집을 저장한다.
- 지역, 스타일, 방문 여부 기준으로 내가 쌓은 라멘 도장을 돌아본다.
- 각 방문 기록과 라멘집 상세 페이지는 공유 가능해야 한다.

## 3. About 문구 초안

```text
라멘집 도장깨기를 위한 지도형 기록장입니다.

다녀온 곳을 지도에 찍고, 맛과 기억을 남기고, 언젠가 다시 가고 싶은 라멘집을 모아둡니다.
하나씩 찾아가며 나만의 라멘 지도를 채워보세요.
```

## 4. 확정 기술 스택

### Frontend

- Vite
- React
- TypeScript
- TanStack Router
- TanStack Query
- OpenAPI Generator 기반 API client
- Kakao Maps 또는 Naver Maps SDK
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

## 5. 모노레포 구조

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

## 7. OpenAPI / Swagger 전략

서버 DTO와 API 계약의 기준은 Spring Boot에서 생성되는 OpenAPI 스펙이다.

```text
Spring Boot
  -> /swagger
  -> /openapi
  -> OpenAPI Generator
  -> packages/api-client
  -> apps/web
  -> apps/mobile
```

Spring Boot 설정 방향:

```yaml
springdoc:
  swagger-ui:
    path: /swagger
  api-docs:
    path: /openapi
```

프론트에서는 DTO를 직접 중복 정의하지 않는다. `packages/api-client`에서 생성된 타입과 client를 TanStack Query queryFn/mutationFn에서 감싸 사용한다.

## 8. Backend 설계

### 8.1 패키지 구조 초안

```text
server/api/src/main/kotlin/com/ramendojang/
  RamenDojangApplication.kt

  shop/
    Shop.kt
    ShopController.kt
    ShopService.kt
    ShopRepository.kt
    dto/
      ShopResponse.kt
      CreateShopRequest.kt
      NearbyShopSearchRequest.kt

  visit/
    Visit.kt
    VisitController.kt
    VisitService.kt
    VisitRepository.kt
    dto/
      VisitResponse.kt
      CreateVisitRequest.kt

  wishlist/
    Wishlist.kt
    WishlistController.kt
    WishlistService.kt

  stamp/
    StampController.kt
    StampService.kt

  common/
    ApiError.kt
    ErrorResponse.kt
```

### 8.2 초기 도메인

```text
User
Shop
Visit
Rating
Photo
Tag
Wishlist
Stamp
```

초기 MVP에서는 인증을 늦추고 `Shop`, `Visit`, `Wishlist`를 먼저 구현한다. `User`는 추후 로그인 도입 시 연결한다.

### 8.3 주요 테이블 초안

#### shops

```text
id
name
address
latitude
longitude
location geography(Point, 4326)
phone
place_url
created_at
updated_at
```

`latitude`, `longitude`는 표시/디버깅 편의를 위해 유지하고, 주변 검색은 PostGIS `location`을 사용한다.

#### visits

```text
id
shop_id
visited_at
menu_name
broth_rating
noodle_rating
topping_rating
overall_rating
revisit_intention
memo
created_at
updated_at
```

#### tags

```text
id
name
```

예: 이에케이, 쇼유, 시오, 미소, 돈코츠, 츠케멘, 지로계

#### shop_tags

```text
shop_id
tag_id
```

#### wishlist

```text
id
shop_id
note
created_at
```

#### photos

```text
id
visit_id
url
created_at
```

파일 저장은 초기에 보류하거나 로컬 스토리지로 시작하고, 이후 S3 호환 스토리지로 확장한다.

### 8.4 초기 API

```text
GET    /health

POST   /shops
GET    /shops
GET    /shops/{shopId}
GET    /shops/nearby?lat=&lng=&radius=&visited=&tag=

POST   /visits
GET    /visits
GET    /visits/{visitId}
GET    /shops/{shopId}/visits

POST   /wishlist
GET    /wishlist
DELETE /wishlist/{shopId}

GET    /stamps
```

### 8.5 PostGIS 사용 범위

PostGIS는 PostgreSQL에 위치/지도 검색 기능을 붙이는 확장이다.

초기 사용 목적:

- 내 주변 n km 안의 라멘집 찾기
- 지도 화면 bounds 안의 라멘집 조회
- 가까운 순 정렬
- 지역별 도장깨기 통계 확장

예상 쿼리:

```sql
SELECT *
FROM shops
WHERE ST_DWithin(
  location,
  ST_MakePoint(:lng, :lat)::geography,
  :radius
)
ORDER BY ST_Distance(
  location,
  ST_MakePoint(:lng, :lat)::geography
);
```

## 9. Frontend 설계

### 9.1 앱 구조

```text
apps/web/src/
  main.tsx
  routeTree.gen.ts

  routes/
    __root.tsx
    index.tsx
    map.tsx
    shops.$shopId.tsx
    visits.$visitId.tsx
    me.index.tsx
    me.visits.tsx
    about.tsx

  lib/
    api.ts
    queryClient.ts
    map.ts

  features/
    map/
      RamenMap.tsx
      ShopMarker.tsx
      MapFilters.tsx

    shops/
      ShopCard.tsx
      ShopDetail.tsx
      ShopForm.tsx

    visits/
      VisitCard.tsx
      VisitDetail.tsx
      VisitForm.tsx

    wishlist/
      WishlistButton.tsx

    stamps/
      StampProgress.tsx
```

### 9.2 라우트

```text
/
  홈: 최근 방문, 지도 진입, 도장깨기 요약

/map
  지도 + 필터 + 라멘집 마커

/shops/$shopId
  라멘집 상세, 방문 기록, 가고싶음

/visits/$visitId
  방문 기록 상세

/me
  내 기록 요약

/me/visits
  내 방문 목록

/about
  도장깨기 컨셉 설명
```

### 9.3 지도 URL 설계

TanStack Router의 typed search params를 적극 사용한다.

예시:

```text
/map?lat=37.5665&lng=126.9780&zoom=14&tag=iekei&visited=false
```

검색 파라미터 후보:

```text
lat
lng
zoom
bounds
tag
visited
wishlist
minRating
```

장점:

- 필터가 걸린 지도를 그대로 공유 가능
- 뒤로가기/앞으로가기 동작이 자연스러움
- 지도 상태와 UI 상태가 분리되지 않음

### 9.4 TanStack Query 사용 기준

서버 상태는 TanStack Query가 관리한다.

Query key 예시:

```text
['shops', 'nearby', params]
['shops', shopId]
['shops', shopId, 'visits']
['visits', visitId]
['wishlist']
['stamps']
```

Mutation 예시:

```text
createShop
createVisit
addWishlist
removeWishlist
```

Mutation 성공 후 관련 query를 invalidate한다.

## 10. Mobile 전략

초기에는 모바일 앱을 별도 네이티브 앱으로 만들지 않는다.

1차는 반응형 웹/PWA를 완성한다.

2차에서 React Native WebView wrapper를 만든다.

```text
apps/mobile/
  React Native
  WebView: https://서비스도메인
  native bridges:
    push token
    camera/photo
    geolocation
    deep link
```

앱은 웹 코어를 유지하면서 스토어 배포와 네이티브 권한 브릿지 역할만 담당한다.

## 11. MVP 범위

### 포함

- 라멘집 등록
- 지도에서 라멘집 보기
- 주변 라멘집 조회
- 방문 기록 등록
- 방문 기록 상세
- 가고 싶은 라멘집 저장
- 도장깨기/About 페이지
- Swagger UI
- OpenAPI 기반 TS client 생성

### 제외

- 소셜 로그인
- 팔로우/피드
- 댓글
- 고급 추천 알고리즘
- 사진 저장소 연동
- 푸시 알림
- 앱스토어 배포

## 12. 1차 마일스톤

1. GitHub public repo 생성
2. 모노레포 기본 구조 생성
3. `pnpm-workspace.yaml` 작성
4. `infra/docker-compose.yml`로 Postgres/PostGIS 실행
5. `server/api` Spring Boot 프로젝트 생성
6. springdoc-openapi 연결
7. Swagger UI와 `/openapi` 확인
8. Flyway 마이그레이션 작성
9. `shops`, `visits`, `wishlist` 중심 API 구현
10. OpenAPI Generator로 `packages/api-client` 생성
11. `apps/web` Vite React 프로젝트 생성
12. TanStack Router 설정
13. TanStack Query 설정
14. 지도 화면 mock 구현
15. 실제 `/shops/nearby` API와 지도 마커 연결
16. 방문 기록 작성 폼 구현

## 13. 작업 시작 순서

```text
1. GitHub public repo 생성
2. 로컬 repo clone
3. 모노레포 디렉터리 생성
4. DB compose 작성
5. Spring Boot API 생성
6. Swagger/OpenAPI 확인
7. shops/visits 스키마 작성
8. API 구현
9. api-client 생성
10. Vite React 앱 생성
11. TanStack Router/Query 연결
12. 지도 MVP 구현
```

## 14. 의사결정 기록

### Next.js를 쓰지 않는다

Next.js의 서버 컴포넌트, SSR, 파일 기반 서버 기능은 현재 목표에 비해 무겁다. 초기 제품은 클라이언트 중심 지도 앱이므로 Vite React가 더 단순하고 빠르다.

### TanStack Router를 쓴다

지도 필터, 상세 페이지, 공유 가능한 URL, typed search params가 서비스 성격과 잘 맞는다.

### OpenAPI Generator를 쓴다

Kotlin DTO와 TypeScript 타입을 수동으로 중복 관리하지 않는다. 서버 OpenAPI 스펙을 기준으로 프론트 API client를 생성한다.

### Docker는 우선 DB에만 쓴다

개발 초반에는 API와 Web은 로컬에서 실행한다. PostGIS 설치/버전 관리를 단순화하기 위해 DB만 Docker로 띄운다.

### Web first, app later

바이럴과 공유를 위해 웹을 먼저 만든다. 앱은 React Native WebView wrapper로 추후 배포한다.
