# 라멘 도장깨기 API Contract Plan

## 1. 목표

API 계약의 기준은 Spring Boot가 생성하는 OpenAPI 스펙이다. 프론트와 모바일은 OpenAPI Generator로 생성된 TypeScript DTO/client를 사용한다.

Kotlin DTO와 TypeScript 타입을 수동으로 중복 관리하지 않는다. 1차 API 계약은 지도보다 라멘집과 방문 기록 CRUD를 우선한다.

## 2. 흐름

```text
server/api
  Spring Boot + springdoc-openapi
  /openapi
  OpenAPI Generator
  packages/api-client
  apps/web
  apps/mobile
```

## 3. Springdoc 설정

```yaml
springdoc:
  swagger-ui:
    path: /swagger
  api-docs:
    path: /openapi
```

예상 경로:

```text
Swagger UI: /swagger
OpenAPI JSON: /openapi
OpenAPI YAML: /openapi.yaml 또는 기본 YAML 경로 확인 후 결정
```

## 4. API Client 생성

OpenAPI Generator의 `typescript-fetch`를 기본 후보로 둔다.

예상 명령:

```bash
openapi-generator-cli generate \
  -i http://localhost:8080/openapi \
  -g typescript-fetch \
  -o packages/api-client/src/generated
```

루트 스크립트:

```json
{
  "scripts": {
    "api:generate": "openapi-generator-cli generate -i http://localhost:8080/openapi -g typescript-fetch -o packages/api-client/src/generated"
  }
}
```

## 5. DTO 명명 규칙

서버 DTO 이름은 프론트 생성 결과를 고려해 명확히 작성한다.

권장:

```text
ShopResponse
ShopSummaryResponse
CreateShopRequest
UpdateShopRequest
NearbyShopSearchRequest

VisitResponse
CreateVisitRequest
UpdateVisitRequest

WishlistResponse
CreateWishlistRequest

StampProgressResponse
```

피할 이름:

```text
ShopDto
Result
Command
Data
Response
Request
```

이름이 모호하면 generated TypeScript 타입도 모호해진다.

## 6. 초기 Endpoint

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

2차 Endpoint:

```text
GET    /shops/nearby?lat=&lng=&radius=&visited=&tag=
GET    /stamps
```

## 7. Response 초안

### CreateShopRequest

```json
{
  "name": "라멘집 이름",
  "address": "주소",
  "latitude": 37.5665,
  "longitude": 126.978,
  "phone": "string | null",
  "placeUrl": "string | null",
  "tagNames": ["이에케이", "쇼유"]
}
```

### ShopResponse

```json
{
  "id": "uuid",
  "name": "라멘집 이름",
  "address": "주소",
  "latitude": 37.5665,
  "longitude": 126.978,
  "phone": "string | null",
  "placeUrl": "string | null",
  "tags": ["이에케이", "쇼유"],
  "visited": true,
  "wishlisted": false,
  "averageRating": 4.3
}
```

### CreateVisitRequest

```json
{
  "shopId": "uuid",
  "visitedAt": "2026-06-25",
  "menuName": "쇼유라멘",
  "brothRating": 4,
  "noodleRating": 5,
  "toppingRating": 4,
  "overallRating": 4,
  "revisitIntention": true,
  "memo": "string | null"
}
```

### VisitResponse

```json
{
  "id": "uuid",
  "shopId": "uuid",
  "shopName": "라멘집 이름",
  "visitedAt": "2026-06-25",
  "menuName": "쇼유라멘",
  "brothRating": 4,
  "noodleRating": 5,
  "toppingRating": 4,
  "overallRating": 4,
  "revisitIntention": true,
  "memo": "string | null"
}
```

### StampProgressResponse, 2차

```json
{
  "totalVisited": 12,
  "totalWishlisted": 8,
  "byTag": [
    {
      "tag": "이에케이",
      "visited": 3
    }
  ],
  "byArea": [
    {
      "area": "홍대",
      "visited": 5
    }
  ]
}
```

## 8. Error Response

공통 에러 형식은 초기에 단순하게 시작한다.

```json
{
  "code": "SHOP_NOT_FOUND",
  "message": "라멘집을 찾을 수 없습니다."
}
```

추후 validation error가 필요해지면 field errors를 추가한다.

```json
{
  "code": "VALIDATION_ERROR",
  "message": "요청 값이 올바르지 않습니다.",
  "fieldErrors": [
    {
      "field": "name",
      "message": "이름은 필수입니다."
    }
  ]
}
```

## 9. Frontend 사용 규칙

- generated client를 컴포넌트에서 직접 호출하지 않는다.
- feature별 query/mutation wrapper를 둔다.
- DTO 타입은 generated 타입을 re-export하거나 그대로 사용한다.
- API 변경은 서버 DTO/OpenAPI 변경 후 `api:generate`로 반영한다.

예상 구조:

```text
packages/api-client/
  src/
    generated/
    index.ts

apps/web/src/features/shops/
  shopQueries.ts
  shopMutations.ts
```

## 10. 계약 변경 원칙

- endpoint path 변경은 breaking change로 본다.
- response field 삭제/이름 변경은 breaking change로 본다.
- nullable 여부 변경도 프론트 영향이 크므로 명시적으로 처리한다.
- 새 필드 추가는 가능하면 optional 또는 nullable로 시작한다.
- API 변경 후 Swagger UI와 generated client 빌드를 확인한다.

## 11. 1차 API 안정화 기준

- `GET /health`가 Swagger UI와 브라우저에서 동작한다.
- `POST /shops`로 라멘집을 생성할 수 있다.
- `GET /shops`로 목록을 조회할 수 있다.
- `GET /shops/{shopId}`로 상세를 조회할 수 있다.
- `PUT /shops/{shopId}`로 수정할 수 있다.
- `DELETE /shops/{shopId}`로 삭제할 수 있다.
- `POST /visits`로 방문 기록을 생성할 수 있다.
- `GET /shops/{shopId}/visits`로 특정 라멘집 방문 기록을 조회할 수 있다.
- `PUT /visits/{visitId}`로 방문 기록을 수정할 수 있다.
- `DELETE /visits/{visitId}`로 방문 기록을 삭제할 수 있다.
- OpenAPI Generator가 TypeScript client를 생성한다.
