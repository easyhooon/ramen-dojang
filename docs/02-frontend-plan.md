# 라멘 도장깨기 Frontend Plan

## 1. 목표

프론트엔드는 웹사이트와 토스 미니앱을 함께 출시할 수 있는 웹 앱으로 만든다. 1차 목표는 로그인과 서버 없이 라멘집과 방문 기록을 로컬에 저장하는 개인 기록 앱을 앱인토스 샌드박스에 올려보는 것이다. 지도와 서버 동기화는 기록 경험이 쓸 만해진 뒤 붙이는 2차 기능으로 둔다.

초기 앱은 Vite React SPA 구조를 유지하되, 공개 웹사이트 배포와 토스 미니앱 등록을 함께 고려한다. PWA와 React Native WebView wrapper 확장은 보류한다.

## 2. 기술 스택

- Vite
- React
- TypeScript
- TanStack Router
- localStorage 기반 local repository
- TanStack Query, 서버 모드 재개 시
- OpenAPI Generator 기반 API client, 서버 모드 재개 시
- Toss Mini App SDK, 공식 문서 확인 후 적용
- Toss Design System, 공식 문서 확인 후 적용
- Naver Maps JavaScript API

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
    localStore.ts
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

## 7. 저장 방식

1차 MVP는 `localStorage`에 저장한다. 서버가 없으므로 TanStack Query와 generated API client는 2차 서버 모드에서 다시 연결한다.

Local repository 함수 예시:

```text
listShops
saveShop
deleteShop
listVisits
saveVisit
deleteVisit
toggleWishlist
```

## 8. TanStack Query 기준, 서버 모드

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

## 9. API Client 사용 방식, 서버 모드

서버 모드에서는 DTO를 직접 만들지 않는다.

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

## 10. 화면별 MVP

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

## 11. Mobile 전략

초기에는 모바일 앱을 별도 네이티브 앱으로 만들지 않는다.

1차는 웹사이트 배포와 토스 미니앱 등록 가능성을 함께 확인한다.

React Native WebView wrapper는 스토어 배포가 다시 목표가 될 때까지 보류한다.

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

앱 shell은 토스 미니앱 환경이 제공하는 기능을 먼저 사용한다. 독립 스토어 앱과 네이티브 권한 브릿지는 웹사이트와 토스 미니앱으로 해결할 수 없는 요구가 생길 때만 재검토한다.

## 12. 프론트 의사결정

### Next.js를 쓰지 않는다

Next.js의 서버 컴포넌트, SSR, 파일 기반 서버 기능은 현재 목표에 비해 무겁다. 초기 제품은 CRUD 중심 웹 앱이므로 Vite React가 더 단순하고 빠르다.

### TanStack Router를 쓴다

상세 페이지, CRUD 화면, 공유 가능한 URL, typed search params가 서비스 성격과 잘 맞는다. 지도 기능을 붙일 때도 같은 라우팅 모델을 유지할 수 있다.

### TanStack Query는 서버 모드에서 쓴다

서버 모드로 돌아가면 지도/상세/방문 기록 화면은 서버 상태가 중심이다. 그때 캐싱, refetch, mutation invalidate를 직접 구현하지 않고 TanStack Query에 맡긴다.

### Local CRUD first

프론트의 첫 성공 기준은 지도 렌더링이나 API 연결이 아니라 라멘집과 방문 기록의 생성, 조회, 수정, 삭제가 앱인토스 WebView 안에서 로컬 저장으로 안정적으로 동작하는 것이다.
