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

## Server

- [x] DB ERD 문서 작성
- [ ] 로그인/사용자 소유권 반영 ERD 확정
- [ ] `users` 테이블 및 `visits.user_id`, `wishlist.user_id` migration 작성
- [ ] 인증 방식 결정: Google/Kakao/Naver/OAuth 우선순위
- [ ] Spring Security/OAuth 로그인 최소 세로 slice 구현
- [ ] 현재 사용자 기준 shops visited/wishlisted/averageRating 계산으로 변경
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
- [ ] Docker/Postgres 미설치로 `pnpm dev:api`는 `localhost:5432 refused`에서 실패, Flyway migration 검증 대기
