# 라멘 도장깨기 작업 TODO

문서 기반으로 진행하며, 완료한 항목은 작업 직후 체크한다.

## 확인 필요

- [x] `프론트 서버 분리`의 의미 확정: TODO/작업 범위를 Frontend와 Server로 분리하고, 실행도 `dev:web`과 `dev:api`로 분리한다.

## 공통 / 모노레포

- [x] 루트 모노레포 구조 생성
- [x] `pnpm-workspace.yaml` 작성
- [x] 루트 `package.json` 스크립트 작성
- [x] `.gitignore` 작성
- [x] 학습 기록 문서 `docs/LESSONS.md` 작성
- [x] `.env.example` 파일과 README 복사 절차 작성
- [x] `pnpm` 활성화 및 의존성 설치
- [x] 분리 실행 기준 스크립트 정리
- [x] README에 로컬 구동 순서 문서화
- [x] 다른 컴퓨터 작업용 인수인계 문서 작성
- [x] 새 컴퓨터 세팅 체크리스트 작성
- [x] README/AGENTS 문서 링크를 repo-relative로 정리
- [x] 날짜별 작업 기록 문서 `docs/WORKLOG.md` 작성
- [x] 기술 스택과 라이브러리 사용 목적 문서 작성
- [x] `mattpocock/skills` 기반 개발 FLOW 문서 작성
- [x] 프론트/백엔드 모듈 구조 문서 작성
- [x] React Native 웹뷰 래퍼 앱 `apps/mobile` 추가
- [x] 모바일 웹뷰 래퍼 기술 선택 문서화
- [x] Expo/Nitro 호환성 기준 문서화
- [x] TDD 작업 기준을 `AGENTS.md`에 명시
- [x] 루트 검증 하네스 `pnpm verify`, `pnpm test` 추가
- [x] `.githooks/pre-commit`으로 `pnpm verify` 실행
- [ ] lint 정책 결정: oxlint 단독 vs ESLint 병행
- [ ] oxlint trial: TS/TSX, React hooks, generated client 제외, mobile 파일 false positive 확인
- [ ] 기존 scaffold/API/frontend 작업의 테스트 부채 정리

## Server

- [x] DB ERD 문서 작성
- [ ] 로그인/사용자 소유권 반영 ERD 확정
- [ ] `users` 테이블 및 `visits.user_id`, `wishlist.user_id` migration 작성
- [ ] 인증 방식 결정: Google/Kakao/Naver/OAuth 우선순위
- [ ] 인증/사용자 소유권 behavior 목록 작성 후 TDD 첫 세로 slice 선택
- [ ] Spring Security/OAuth 로그인 최소 세로 slice 구현
- [ ] 현재 사용자 기준 shops visited/wishlisted/averageRating 계산으로 변경
- [ ] 외부 검색 결과를 `shop_candidates`로 저장하는 ERD 확정
- [x] Naver/Kakao/Google 장소 API 제공 필드와 한계 조사 문서 작성
- [ ] `shop_candidates` Flyway migration 작성
- [ ] 네이버 지역 검색 API 기반 후보 sync spike 작성
- [ ] 라멘집 후보 scoring/중복 제거 기준 정의
- [ ] 후보 검수 후 `shops`로 승격하는 admin flow 설계
- [ ] 메뉴 데이터 축적 방식 설계: 방문 기록 기반 후보화, 메뉴판 사진, 관리자 검수
- [ ] 수동 sync가 안정된 뒤 cron/scheduled job 도입 판단
- [x] Spring Boot Kotlin 프로젝트 생성
- [x] Gradle wrapper 포함 프로젝트 구성
- [x] Spring Web/JDBC/Flyway/PostgreSQL/Validation 의존성 구성
- [x] springdoc-openapi 의존성 추가
- [x] `/health` 엔드포인트 구현
- [x] DB 연결 설정 작성
- [x] Swagger UI `/swagger`, OpenAPI `/openapi` 경로 설정
- [x] Swagger/OpenAPI 문서 메타데이터 작성
- [x] Swagger operation summary/description 정리
- [x] Swagger request/response schema 확인
- [x] Swagger 공통 error response 문서화
- [x] OpenAPI Generator용 operationId 고정
- [x] OpenAPI license identifier 및 JSON media type 설정
- [x] PostGIS 기반 초기 Flyway migration 작성
- [x] `shops` CRUD API 구현
- [x] `visits` CRUD API 구현
- [x] `GET /shops/{shopId}/visits` 구현
- [x] `wishlist` 등록/목록/삭제 API 구현
- [x] 서버 컴파일 검증
- [ ] Flyway migration 검증
- [x] Swagger/OpenAPI 응답 검증
- [ ] Swagger UI에서 shops CRUD 수동 검증
- [ ] Swagger UI에서 visits CRUD 수동 검증
- [ ] Swagger UI에서 wishlist API 수동 검증
- [ ] API smoke test 작성 또는 수동 검증 기록
- [ ] shops/visits/wishlist API behavior test 보강

## Frontend

- [x] Vite React 앱 골격 생성
- [x] TanStack Router 수동 라우트 구성
- [x] TanStack Query 구성
- [x] API client package 초안 작성
- [x] 홈 화면 구현
- [x] 라멘집 목록/필터/등록 화면 구현
- [x] 라멘집 상세/수정/삭제/가고싶음/방문 기록 화면 구현
- [x] 방문 기록 상세/수정/삭제 화면 구현
- [x] About 화면 구현
- [x] `frontend-design` 기준 디자인 계획 작성
- [x] 디자인 계획에 맞춰 UI 톤 재정리
- [x] 프론트 타입체크 검증
- [x] 프론트 빌드 검증
- [ ] 브라우저 화면 검증
- [ ] 주요 화면 query/mutation behavior test 전략 결정
- [x] 모바일 Expo SDK 패키지 조합 `expo-doctor` 검증
- [ ] 모바일 웹뷰 래퍼 development build 검증
- [ ] `nitro-webview` iOS/Android native setup 검증

## API Client / Contract

- [x] 임시 TypeScript API client package 작성
- [x] OpenAPI Generator 설정 파일 작성
- [x] DB 없이 `/openapi`를 뽑는 `dev:api:docs` 스크립트 작성
- [x] 서버 `/openapi` 기준 generated client 생성
- [x] generated client를 wrapper에서 사용하도록 전환
- [x] API 변경 원칙 문서화

## 검증 메모

- [x] `pnpm typecheck` 통과
- [x] `pnpm --filter @ramen-dojang/api-client build` 통과
- [x] `pnpm --filter web build` 통과
- [x] `pnpm dev:web` 실행 및 `http://localhost:5173/` HTTP 200 확인
- [x] `http://localhost:5173/` 브라우저 열기 확인
- [x] `server/api ./gradlew compileKotlin` 통과
- [x] `server/api ./gradlew test` 통과
- [x] Swagger annotation 추가 후 `server/api ./gradlew compileKotlin` 통과
- [x] Swagger annotation 추가 후 `server/api ./gradlew test` 통과
- [x] `pnpm dev:api:docs` 실행 후 `http://127.0.0.1:8080/health` HTTP 200 확인
- [x] `http://127.0.0.1:8080/openapi` HTTP 200 확인
- [x] OpenAPI JSON에서 `license.identifier=MIT`, `operationId=listShops`, `application/json` response content 확인
- [x] `pnpm api:generate` 통과
- [x] `pnpm --filter mobile typecheck` 통과
- [x] `cd apps/mobile && pnpm dlx expo-doctor@latest` 통과
- [x] `pnpm --filter mobile exec expo config --type public` 통과
- [x] Expo SDK 56 기준 React Native/React/TypeScript 버전 정렬
- [x] `pnpm verify` 전체 하네스 통과
- [ ] Docker/Postgres 미설치로 `pnpm dev:api`는 `localhost:5432 refused`에서 실패, Flyway migration 검증 대기
