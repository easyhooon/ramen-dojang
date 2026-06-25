# 라멘 도장깨기 Backend Plan

## 1. 목표

백엔드는 Kotlin Spring Boot로 직접 구축한다. 1차 목표는 라멘집과 방문 기록 CRUD, DB migration, Swagger/OpenAPI, 안정적인 로컬 서버 구동을 먼저 완성하는 것이다.

지도 기반 검색을 위해 PostgreSQL에 PostGIS 확장을 사용할 수 있도록 DB는 처음부터 PostGIS 이미지를 쓰되, 실제 주변 검색 API는 2차 기능으로 둔다.

## 2. 기술 스택

- Kotlin
- Spring Boot
- Spring Web
- springdoc-openapi
- PostgreSQL
- PostGIS
- Flyway
- Spring Security는 인증 도입 시점에 추가

## 3. 패키지 구조 초안

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

## 4. 초기 도메인

```text
User
Shop
ShopCandidate
Visit
Rating
Photo
Tag
Wishlist
Stamp
```

초기 MVP에서는 인증과 지도 검색을 늦추고 `Shop`, `Visit`, `Wishlist` CRUD를 먼저 구현한다. `User`는 추후 로그인 도입 시 연결한다.

`ShopCandidate`는 외부 검색 API나 사용자 제보로 들어온 검수 전 라멘집 후보이다. 기본 검색 결과에는 노출하지 않고, 검수 후 `Shop`으로 승격한다.

외부 장소 API에서 실제로 가져올 수 있는 최대 필드와 한계는 [Place Open API Data Research](13-place-open-api-research.md)를 기준으로 한다.

## 5. 주요 테이블 초안

### shops

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

### shop_candidates

```text
id
promoted_shop_id
source
source_place_id
raw_name
normalized_name
category
address
latitude
longitude
confidence_score
status
raw_payload jsonb
last_seen_at
reviewed_at
created_at
updated_at
```

네이버 지역 검색 API, 사용자 제보, 향후 다른 외부 provider에서 들어온 장소 후보를 보관한다. 이 테이블은 `shops`를 최신화하기 위한 staging area이며, 서비스 검색 결과로 바로 노출하지 않는다.
provider별로 제공 가능한 필드가 다르므로 `raw_payload`를 반드시 보관하고, 썸네일/전화번호/웹사이트/영업시간 같은 보조 필드는 nullable로 둔다.

### visits

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

### tags

```text
id
name
```

예: 이에케이, 쇼유, 시오, 미소, 돈코츠, 츠케멘, 지로계

### shop_tags

```text
shop_id
tag_id
```

### wishlist

```text
id
shop_id
note
created_at
```

### photos

```text
id
visit_id
url
created_at
```

파일 저장은 초기에 보류하거나 로컬 스토리지로 시작하고, 이후 S3 호환 스토리지로 확장한다.

## 6. 초기 API

```text
GET    /health

POST   /shops
GET    /shops
GET    /shops/{shopId}
PUT    /shops/{shopId}
DELETE /shops/{shopId}

POST   /visits
GET    /visits
GET    /visits/{visitId}
PUT    /visits/{visitId}
DELETE /visits/{visitId}
GET    /shops/{shopId}/visits

POST   /wishlist
GET    /wishlist
DELETE /wishlist/{shopId}
```

2차 지도 API:

```text
GET    /shops/nearby?lat=&lng=&radius=&visited=&tag=

GET    /stamps
```

후보 보강 API, later:

```text
POST   /admin/shop-candidates/sync
GET    /admin/shop-candidates?status=pending
POST   /admin/shop-candidates/{candidateId}/promote
POST   /admin/shop-candidates/{candidateId}/reject
```

운영자용 API가 생기기 전에는 DB seed 또는 내부 script로만 후보를 다룬다.

## 7. 서버 안정화 기준

1차 MVP에서 지도보다 먼저 확인할 서버 기준이다.

- `GET /health`가 정상 동작한다.
- 로컬 DB가 Docker Compose로 재현 가능하게 뜬다.
- Flyway migration이 빈 DB에서 끝까지 성공한다.
- Swagger UI가 열린다.
- `/openapi` JSON이 생성된다.
- Shop CRUD가 Swagger UI에서 정상 동작한다.
- Visit CRUD가 Swagger UI에서 정상 동작한다.
- 프론트 API client 생성이 성공한다.

## 8. PostGIS 사용 범위

PostGIS는 PostgreSQL에 위치/지도 검색 기능을 붙이는 확장이다.

초기에는 DB 이미지와 schema만 준비하고, 본격적인 활용은 2차 기능으로 둔다.

2차 사용 목적:

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

## 9. Swagger / OpenAPI

서버는 Swagger UI와 OpenAPI JSON을 제공한다.

```yaml
springdoc:
  swagger-ui:
    path: /swagger
  api-docs:
    path: /openapi
```

기본 목표:

- Swagger UI에서 API를 직접 테스트한다.
- `/openapi`를 OpenAPI Generator 입력으로 사용한다.
- DTO 이름이 프론트에서 자연스럽게 보이도록 `ShopResponse`, `CreateShopRequest`처럼 명확히 작성한다.

## 10. 로컬 인프라

초기 로컬 개발에서는 DB만 Docker로 실행한다.

```text
infra/docker-compose.yml
  postgres-postgis
```

API는 로컬 Gradle로 실행한다.

```text
cd server/api
./gradlew bootRun
```

## 11. 백엔드 의사결정

### 인증은 늦춘다

초기에는 기록 CRUD/API 구조/서버 구동 검증이 우선이다. 로그인은 MVP 동작이 확인된 뒤 Spring Security 기반으로 붙인다.

### Flyway를 사용한다

DB 스키마 변경을 코드와 함께 추적한다. 특히 PostGIS extension 생성과 `shops.location` 인덱스 생성을 명시적으로 관리한다.

### PostGIS를 사용한다

위도/경도 컬럼만으로는 주변 검색과 거리 정렬을 직접 처리해야 한다. PostGIS를 쓰면 거리 검색과 지도 bounds 조회를 DB 레벨에서 안정적으로 처리할 수 있다. 다만 1차 MVP에서는 CRUD 안정화가 먼저이며, PostGIS 쿼리는 2차로 구현한다.

### 외부 검색 결과는 후보로 저장한다

네이버 지역 검색 API 같은 외부 검색 결과는 `shops`에 바로 반영하지 않는다. 라멘집이 아닌 결과가 섞일 수 있고, 외부 응답만으로 메뉴/썸네일/영업 상태 같은 라멘 특화 정보를 신뢰하기 어렵기 때문이다.

대신 외부 검색은 `shop_candidates`를 보강하는 입력으로만 사용한다. 배치나 cron-like job은 주기적으로 “라멘”, “라멘집”, 지역명 조합을 검색해 후보를 갱신하고, score가 높은 후보만 운영자 검수 대상으로 올린다.

처음에는 Spring Scheduler나 외부 cron을 바로 붙이기보다 수동 sync command/API로 시작한다. 후보 scoring과 중복 제거 기준이 안정되면 scheduled job으로 승격한다.

메뉴 목록, 메뉴 가격, 대표 메뉴는 공개 장소 API에서 안정적으로 기대하지 않는다. 메뉴 데이터는 방문 기록의 `menu_name`, 메뉴판 사진, 사용자 제보, 관리자 검수로 별도 축적한다.

### CRUD first

첫 백엔드 성공 기준은 지도 검색이 아니라 `Shop`과 `Visit`의 CRUD, migration, Swagger/OpenAPI, local bootRun이 안정적으로 동작하는 것이다.
