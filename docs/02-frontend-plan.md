# 라멘 도장깨기 Frontend Plan

## 1. 목표

프론트엔드는 웹 우선으로 만든다. 1차 목표는 지도보다 라멘집과 방문 기록 CRUD를 안정적으로 다루는 화면을 만드는 것이다. 지도는 기록 데이터가 쌓인 뒤 시각화와 탐색을 강화하는 2차 기능으로 둔다.

초기 앱은 Vite React SPA로 시작하고, 이후 PWA와 React Native WebView wrapper로 확장한다.

## 2. 기술 스택

- Vite
- React
- TypeScript
- TanStack Router
- TanStack Query
- OpenAPI Generator 기반 API client
- Naver Maps JavaScript API
- PWA 대응

## 3. 앱 구조

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

## 4. 라우트 설계

```text
/
  홈: 최근 방문, 라멘집 목록 진입, 기록 요약

/map
  2차 기능: 지도 + 필터 + 라멘집 마커

/shops/$shopId
  라멘집 상세, 방문 기록, 수정/삭제, 가고싶음

/visits/$visitId
  방문 기록 상세, 수정/삭제

/me
  내 기록 요약

/me/visits
  내 방문 목록

/about
  도장깨기 컨셉 설명
```

## 5. CRUD 우선 화면 설계

1차 MVP의 중심 화면은 아래 세 가지다.

```text
/shops
  라멘집 목록
  이름/태그/방문 여부 기준 필터
  라멘집 등록 진입

/shops/$shopId
  라멘집 상세
  방문 기록 목록
  라멘집 수정/삭제
  방문 기록 작성 진입

/visits/$visitId
  방문 기록 상세
  방문 기록 수정/삭제
```

폼은 처음부터 과하게 만들지 않는다. 필수 필드와 기본 평점만 먼저 안정적으로 저장한다.

```text
Shop form:
  name
  address
  latitude
  longitude
  tags
  placeUrl

Visit form:
  shopId
  visitedAt
  menuName
  brothRating
  noodleRating
  toppingRating
  overallRating
  revisitIntention
  memo
```

## 6. 지도 URL 설계

지도는 2차 기능이다. 단, TanStack Router search params 설계는 미리 염두에 둔다.

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

## 7. TanStack Query 기준

서버 상태는 TanStack Query가 관리한다.

Query key 예시:

```text
['shops', params]
['shops', shopId]
['shops', shopId, 'visits']
['visits', visitId]
['wishlist']
['stamps']
```

2차 지도 기능에서 추가할 query key:

```text
['shops', 'nearby', params]
```

Mutation 예시:

```text
createShop
updateShop
deleteShop
createVisit
updateVisit
deleteVisit
addWishlist
removeWishlist
```

Mutation 성공 후 관련 query를 invalidate한다.

## 8. API Client 사용 방식

프론트에서는 DTO를 직접 만들지 않는다.

```text
server/api
  -> /openapi
  -> OpenAPI Generator
  -> packages/api-client
  -> apps/web
```

`packages/api-client`의 generated client를 바로 컴포넌트에서 쓰지 않고, feature별 query/mutation wrapper를 둔다.

예상 구조:

```text
features/shops/
  shopQueries.ts
  shopMutations.ts

features/visits/
  visitQueries.ts
  visitMutations.ts
```

## 9. 화면별 MVP

### Home

- 최근 방문 기록
- 라멘집 목록 진입
- 기록 요약

### Shops

- 라멘집 목록
- 라멘집 등록
- 이름/태그/방문 여부 필터

### Shop Detail

- 라멘집 정보
- 라멘집 수정/삭제
- 방문 기록 목록
- 가고싶음 버튼
- 방문 기록 작성 진입

### Visit Detail

- 방문일
- 메뉴
- 평점
- 메모
- 재방문 의사
- 방문 기록 수정/삭제

### Map, 2차

- 라멘집 마커 표시
- 현재 지도 중심/줌 URL 반영
- 방문/미방문/가고싶음 필터
- 태그 필터
- 마커 클릭 시 간단한 라멘집 카드 표시

### About

- 도장깨기 컨셉 설명
- 서비스가 무엇을 기록하는지 안내

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

## 11. 프론트 의사결정

### Next.js를 쓰지 않는다

Next.js의 서버 컴포넌트, SSR, 파일 기반 서버 기능은 현재 목표에 비해 무겁다. 초기 제품은 CRUD 중심 웹 앱이므로 Vite React가 더 단순하고 빠르다.

### TanStack Router를 쓴다

상세 페이지, CRUD 화면, 공유 가능한 URL, typed search params가 서비스 성격과 잘 맞는다. 지도 기능을 붙일 때도 같은 라우팅 모델을 유지할 수 있다.

### TanStack Query를 쓴다

지도/상세/방문 기록 화면은 서버 상태가 중심이다. 캐싱, refetch, mutation invalidate를 직접 구현하지 않고 TanStack Query에 맡긴다.

### CRUD first

프론트의 첫 성공 기준은 지도 렌더링이 아니라 라멘집과 방문 기록의 생성, 조회, 수정, 삭제가 API와 안정적으로 연결되는 것이다.
