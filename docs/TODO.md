# 라멘 도장깨기 작업 TODO

문서 기반으로 진행하며, 완료한 항목은 작업 직후 체크한다.

## 확인 필요

- [x] `프론트 서버 분리`의 의미 확정: TODO/작업 범위를 Frontend와 Server로 분리하고, 실행도 `dev:web`과 `dev:api`로 분리한다.
- [x] 웹사이트 hosting, 배포 방식 후보 결정: Vercel은 일반 웹사이트/브라우저 QA용으로 유지
- [x] Vercel 프로젝트 생성: Root Directory `apps/web`, Framework Preset `Vite`, Output Directory `dist`
- [x] 프론트용 별도 브랜드 도메인 구매 보류: 앱인토스는 `.ait` 업로드 후 tossmini 도메인에서 실행, 일반 웹은 Vercel 도메인 우선
- [x] 앱인토스 콘솔 앱 만들기 완료
- [x] 1차 MVP 방향 결정: 로그인 없이 서버 catalog + 로컬 개인 기록 기반 토스 미니앱으로 먼저 출시 시도
- [ ] 앱인토스 앱 정보 등록하기
- [ ] 앱인토스 약관 등록하기
- [ ] 앱인토스 `.ait` 업로드 후 샌드박스 실행 확인
- [x] 토스 미니앱 등록 요건과 공식 개발 문서 확인
- [x] Toss Mini App SDK 적용 방식 확인
- [x] Toss Design System 사용 가능 범위와 설치 방식 확인
- [x] 일반 웹 배포를 위해 `@toss/tds-mobile` 런타임 의존성 제거 결정 및 local UI component로 대체
- [x] 앱인토스 Tabbar 가이드 확인: 탭바는 필수가 아니지만 사용할 경우 TDS 미사용 시에도 토스 플로팅 형태를 따라야 함
- [ ] 앱인토스 인앱 광고 적용 시 콘솔 광고 그룹 ID 발급, 배너/전면형/리워드 중 MVP에 맞는 형식, 광고 수익 수령을 위한 사업자/정산 정보 등록 필요사항 확인
- [x] MVP 사용자 식별은 앱인토스 `getAnonymousKey`로 가능한지 확인
- [ ] 토스 로그인 테스트 앱 개발 가능 범위와 운영 배포 전 사업자 인증, 앱인토스 서버 API용 mTLS 인증서/방화벽/secret 관리 필요사항 확인
- [ ] Sentry 프로젝트/DSN/API key 발급 후 앱인토스 WebView JS 오류 추적 설정
- [ ] 운영 전 최소 모니터링 기준 결정: 현재는 별도 모니터링 툴 없이 터미널 로그, `/health`, Sentry 예정만 사용
- [ ] 앱인토스 미니앱 정식 배포 전 보안 체크 절차 확인: OMC처럼 별도 보안 점검/체크리스트/제출 항목이 있는지 공식 문서와 콘솔에서 확인
- [ ] 앱인토스 미니앱 정식 제출 전 UI/UX 체크: 비게임 내비게이션 바, 중복 뒤로가기 없음, 플로팅 탭바, 2초 이내 반응, CTA 예측 가능성, 진입 즉시 바텀시트/광고 없음, 해요체 문구 확인
- [x] 기존 Expo/~~Nitro~~ WebView wrapper는 스토어 출시용 보류 자산으로 유지
- [ ] PR 전환 전 Gemini review bot 공식 설치 방식과 GitHub secret 요구사항 확인
- [ ] 운영 배포 전 CORS 허용 origin을 Vercel 도메인, `https://<appName>.apps.tossmini.com`, `https://<appName>.private-apps.tossmini.com`으로 제한
- [ ] API 서버 운영 배포 시 HTTPS/TLS 적용 방식 확인: Vercel 프론트는 자동 HTTPS, 별도 API 도메인은 Let's Encrypt/클라우드 로드밸런서/배포 플랫폼 제공 무료 인증서 중 선택

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
- [x] ponytail 기준 dependency 추가 문서화 gate를 `pnpm verify`에 연결
- [ ] pnpm 11 minimum release age / approve-builds 정책에 맞춰 Granite/Sentry 계열 의존성 설치 절차 정리
- [ ] lint 정책 결정: oxlint 단독 vs ESLint 병행
- [ ] oxlint trial: TS/TSX, React hooks, generated client 제외, mobile 파일 false positive 확인
- [ ] 기존 scaffold/API/frontend 작업의 테스트 부채 정리
- [ ] Gemini review bot 또는 GitHub Actions 기반 PR review 자동화 추가

## Server

1차 앱인토스 MVP에서도 서버는 공용 라멘집 catalog 용도로 필요하다. 아래 개인 기록 동기화/로그인 항목은 필요해질 때 재개한다.

- [ ] API 서버 1차 배포 후보 결정: MVP/개인 개발 단계는 Render Web Service + Render Postgres(PostGIS)를 우선 검토하고, Railway는 PostGIS 템플릿/백업/운영 책임을 확인한 뒤 대안으로 둔다.
- [ ] AWS 전환 기준 정리: 장기 운영이나 트래픽/권한/네트워크 요구가 커지면 Elastic Beanstalk + RDS PostgreSQL 또는 ECS Fargate + RDS PostgreSQL로 이전을 검토한다. 신규 고객 대상 App Runner는 제외한다.
- [ ] API 서버 배포 전 체크리스트 작성: 실행 방식(JAR 또는 container), 환경변수, seed import, Flyway 적용, CORS origin, HTTPS/TLS, `/health`, 로그 확인, DB 백업 기준.
- [x] DB ERD 문서 작성
- [ ] `getAnonymousKey` 기반 익명 사용자 소유권 ERD 확정
- [ ] `users` 테이블 및 `visits.user_id`, `wishlist.user_id` migration 작성
- [x] 인증 방식 결정: 유저별 서버 저장은 `getAnonymousKey` 기반 익명 식별을 우선하고, 토스 로그인은 개인정보/결제 상태 조회가 필요할 때 재검토
- [ ] 익명 사용자 세로 slice 구현: 앱인토스 `getAnonymousKey` 조회, 서버 `users` 매핑, visits/wishlist 사용자별 저장
- [ ] 인증/사용자 소유권 behavior 목록 작성 후 TDD 첫 세로 slice 선택
- [ ] Spring Security/OAuth 로그인 최소 세로 slice 구현
- [ ] 토스 로그인 도입 시 테스트 앱 연동 후 운영 배포 전 사업자 인증과 mTLS 기반 token exchange/login-me 연동 설계
- [ ] 현재 사용자 기준 shops visited/wishlisted/averageRating 계산으로 변경
- [x] 외부 검색 결과를 `shop_candidates`로 저장하는 ERD 확정
- [x] Naver/Kakao/Google 장소 API 제공 필드와 한계 조사 문서 작성
- [x] `shop_candidates`를 V1 초기 schema에 포함
- [x] 네이버 지역 검색 API 기반 후보 sync spike 작성
- [ ] Kakao Local API 기반 후보 sync spike 작성
- [ ] 공공데이터포털 상가/일반음식점 데이터 import 가능성 spike 작성
- [ ] 라멘집 후보 scoring/중복 제거 기준 정의
- [x] 후보 검수 후 `shops`로 승격하는 admin API 초안 구현
- [ ] 후보 검수 UI 또는 Swagger 수동 운영 흐름 정리
- [ ] 메뉴 데이터 축적 방식 설계: 방문 기록 기반 후보화, 메뉴판 사진, 관리자 검수
- [ ] Naver sync 429 속도 제한 대응: 지역 query queue, delay, retry/backoff, 마지막 성공 query 저장 방식 결정
- [ ] 미수집 전국 query 재개 작업: 아직 안 태운 국내 지역/상권 후보 sync
- [ ] 수동 sync가 안정된 뒤 cron/scheduled job 도입 판단: 주기적 후보 수집은 `shop_candidates`까지만, 검수 없는 `shops` 자동 변경은 금지
- [x] 앱 출시 전 초기 라멘집 seed 데이터 투입 방식 결정: Naver 후보 sync + admin 승격으로 214건 seed JSON 보관
- [ ] `server/api/src/main/resources/seed/shops.seed.json` import script 또는 admin endpoint 작성
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
- [x] OpenAPI metadata 및 JSON media type 설정
- [x] PostGIS 기반 초기 Flyway migration 작성
- [x] `shops` CRUD API 구현
- [x] `visits` CRUD API 구현
- [x] `GET /shops/{shopId}/visits` 구현
- [x] `wishlist` 등록/목록/삭제 API 구현
- [x] 서버 컴파일 검증
- [x] Flyway migration 검증
- [x] Swagger/OpenAPI 응답 검증
- [ ] Swagger UI에서 shops catalog CRUD 수동 검증
- [ ] Swagger UI에서 visits CRUD 수동 검증, 개인 기록 서버 동기화 재개 시
- [ ] Swagger UI에서 wishlist API 수동 검증, 개인 기록 서버 동기화 재개 시
- [x] API smoke test 작성 또는 수동 검증 기록
- [ ] shops/visits/wishlist API behavior test 보강

## Frontend

- [x] Vite React 앱 골격 생성
- [x] TanStack Router 수동 라우트 구성
- [x] TanStack Query 구성
- [x] API client package 초안 작성
- [x] 홈 화면 구현
- [x] 라멘집 목록/필터/등록 화면 구현
- [x] 라멘집 기본 썸네일 asset과 `shops.thumbnail_url` 연결
- [x] 라멘집 상세/수정/삭제/가고싶음/방문 기록 화면 구현
- [x] 방문 기록 상세/수정/삭제 화면 구현
- [x] DB 라멘집 검색 기반 방문 추가 화면 구현
- [x] 방문 기록 기반 내 취향 요약 MVP 구현
- [x] About 화면 구현
- [x] `frontend-design` 기준 디자인 계획 작성
- [x] 디자인 계획에 맞춰 UI 톤 재정리
- [x] 프론트 타입체크 검증
- [x] 프론트 빌드 검증
- [x] 브라우저 화면 검증
- [x] Stitch 디자인 생성을 위한 화면별 요구사항 brief 작성
- [ ] Stitch 시안을 `docs/05-frontend-design-direction.md`에 화면별로 옮기기
- [x] Stitch 시안 기준으로 홈/라멘집 목록/방문 추가 IA와 카피 재정리
- [ ] 웹사이트 + 토스 미니앱 공통 UX로 프론트 IA/화면 범위 재정리
- [x] 1차 MVP를 서버 catalog + 로컬 개인 기록 모드로 전환
- [x] 방문 기록/위시리스트 local repository 작성
- [x] 라멘집 목록/상세를 서버 catalog API로 재연결
- [ ] 앱인토스 샌드박스에서 서버 catalog 조회와 로컬 방문 기록/위시리스트 수동 테스트
- [ ] 홈 다음 후보의 위치 기반 추천을 localhost/HTTPS/앱인토스 샌드박스에서 수동 테스트
- [x] 설정 화면에 이용약관, 개인정보 처리방침, 문의/피드백 링크 추가
- [ ] 다국어 지원 설계: 기본은 시스템 언어를 따르고, 설정에서 한국어/영어/일본어 중 하나로 고정할 수 있게 하기
- [ ] 다국어 문구 리소스 분리: MVP 문구 범위 확정 후 `Intl`/간단 dictionary 우선 검토, 복잡해질 때 i18n 라이브러리 도입 판단
- [x] 실제 피드백 수집 URL 결정: MVP는 Google Form `https://forms.gle/Mz3Ght8TUQuwdPYi9`을 사용하고, 관리자페이지/DB 저장은 제보량이 생긴 뒤 검토
- [ ] 앱인토스 제출 전 개인정보 처리방침의 운영자/CPO/문의처와 실제 수집 항목을 최종 확정하고 법률 검토
- [x] TDS Provider 연결 및 핵심 액션 버튼 1차 치환
- [x] TDS 컴포넌트 기준으로 기존 UI 치환 범위 산정
- [x] TDS TextField/TextArea/Badge 1차 치환
- [x] TDS primary color와 앱 CSS를 Toss neutral/shoyu amber 톤으로 정리
- [x] 일반 웹 배포 호환을 위해 TDS Provider와 TDS 컴포넌트를 제거하고 local UI component로 대체
- [x] 하단 탭바를 앱인토스 가이드의 플로팅 형태에 맞게 조정
- [x] Stitch Shoyu Amber 시안 기준으로 홈/목록/폼 공통 화면 톤 1차 반영
- [x] Stitch Shoyu Amber 시안 기준으로 주요 화면 레이아웃 반영
- [ ] 앱인토스 사용자 안내/확인 flow가 필요한 화면에서 공식 가이드에 맞는 dialog/bottom sheet 적용 범위 산정
- [x] `pnpm --filter web build:ait`로 앱인토스 Granite 산출물 생성 확인
- [ ] Sentry 초기화 시 `enableNative: false` 적용 및 sourcemap upload 절차 확인
- [ ] 주요 화면 query/mutation behavior test 전략 결정
- [x] 모바일 Expo SDK 패키지 조합 `expo-doctor` 검증
- [ ] 스토어 앱 출시 목표 재개 시 모바일 웹뷰 래퍼 development build 검증
- [ ] 스토어 앱 출시 목표 재개 시 ~~`nitro-webview`~~ iOS/Android native setup 재검토

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
- [x] Stitch Shoyu Amber 1차 반영 후 `tsc -p apps/web/tsconfig.json --noEmit` 통과
- [x] Stitch Shoyu Amber 1차 반영 후 `http://localhost:5173/` HTTP 200 확인
- [x] `http://localhost:5173/` 브라우저 열기 확인
- [x] `server/api ./gradlew compileKotlin` 통과
- [x] `server/api ./gradlew test` 통과
- [x] Swagger annotation 추가 후 `server/api ./gradlew compileKotlin` 통과
- [x] Swagger annotation 추가 후 `server/api ./gradlew test` 통과
- [x] `pnpm dev:api:docs` 실행 후 `http://127.0.0.1:8080/health` HTTP 200 확인
- [x] `http://127.0.0.1:8080/openapi` HTTP 200 확인
- [x] OpenAPI JSON에서 `operationId=listShops`, `application/json` response content 확인
- [x] `pnpm api:generate` 통과
- [x] `pnpm --filter mobile typecheck` 통과
- [x] `cd apps/mobile && pnpm dlx expo-doctor@latest` 통과
- [x] `pnpm --filter mobile exec expo config --type public` 통과
- [x] Expo SDK 56 기준 React Native/React/TypeScript 버전 정렬
- [x] `pnpm verify` 전체 하네스 통과
- [x] `pnpm dev:api:docs` 실행 후 `http://127.0.0.1:8080/swagger-ui/index.html` HTTP 200 확인
- [x] `http://127.0.0.1:8080/openapi` HTTP 200 확인
- [x] `http://127.0.0.1:8080/health` 응답 `{"status":"ok"}` 확인
- [x] Homebrew PostgreSQL 17/PostGIS 설치 후 `pnpm dev:api` 실제 DB 모드 실행 확인
- [x] Flyway V1 단일 migration 적용 확인
- [x] 로컬 DB reset 후 `POST /shops` 기본 썸네일 저장과 `GET /shops` 응답 확인
- [x] PostgreSQL 17/PostGIS 로컬 DB reset 후 Flyway V1 단일 migration 적용 확인
- [x] API `POST /shops`로 테스트 라멘집 등록 후 DB `shops`, `tags`, `shop_tags` 저장 확인
- [x] 네이버 후보 sync API가 credentials 미설정 시 `NAVER_SEARCH_NOT_CONFIGURED` 503을 반환하는 것 확인
- [x] 인앱 브라우저에서 `/shops` 라멘집 카드 기본 썸네일 렌더링 확인
- [x] 인앱 브라우저에서 홈/목록/검색/상세 화면이 서버 catalog API 데이터로 렌더링되는 것 확인
- [ ] Swagger UI API별 수동 smoke 확인
