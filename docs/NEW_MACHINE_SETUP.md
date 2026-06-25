# 새 컴퓨터 작업 세팅

다른 컴퓨터에서 `ramen-dojang`을 바로 이어서 작업하기 위한 체크리스트다.

## 1. 저장소 받기

```bash
git clone https://github.com/easyhooon/ramen-dojang.git
cd ramen-dojang
git status --short --branch
```

깨끗한 상태에서 `## main...origin/main`처럼 보이면 좋다.

## 2. 준비물 확인

- Node.js 24 이상
- Corepack
- Java 17
- Docker Desktop 또는 Docker Engine
- Git

확인 명령:

```bash
node --version
corepack --version
java -version
docker --version
```

## 3. pnpm 준비와 의존성 설치

```bash
corepack prepare pnpm@10.12.1 --activate
corepack enable pnpm
pnpm install
```

## 4. 로컬 env 파일 만들기

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp server/api/.env.example server/api/.env
```

실제 `.env`, `.env.local`은 개인 컴퓨터 설정이다. git에 올리지 않는다.

기본 로컬 값:

```text
DATABASE_URL=jdbc:postgresql://localhost:5432/ramen_dojang
DATABASE_USERNAME=ramen
DATABASE_PASSWORD=ramen
VITE_API_BASE_URL=http://localhost:8080
```

## 5. DB 실행

```bash
pnpm infra:up
```

중지:

```bash
pnpm infra:down
```

## 6. 서버 실행

새 터미널에서:

```bash
pnpm dev:api
```

확인:

```bash
curl http://localhost:8080/health
```

Swagger:

```text
http://localhost:8080/swagger
http://localhost:8080/openapi
```

## 7. 프론트 실행

새 터미널에서:

```bash
pnpm dev:web
```

브라우저:

```text
http://localhost:5173
```

## 8. OpenAPI client 재생성

서버 DTO나 controller annotation을 바꾼 뒤에는 generated client를 갱신한다.

DB 없이 OpenAPI만 뽑는 서버를 실행:

```bash
pnpm dev:api:docs
```

다른 터미널에서:

```bash
pnpm api:generate
pnpm typecheck
```

주의:

- `packages/api-client/src/generated`는 생성물이므로 직접 수정하지 않는다.
- 앱에서 쓰는 타입 변환은 `packages/api-client/src/index.ts`에서 한다.

## 9. 검증

프론트와 API client:

```bash
pnpm typecheck
pnpm build
```

서버:

```bash
cd server/api
./gradlew compileKotlin
./gradlew test
```

## 10. 이어서 작업하기

작업 전에 확인:

```bash
git pull
git status --short --branch
```

읽을 문서:

- [인수인계](HANDOFF.md)
- [TODO](TODO.md)
- [LESSONS](LESSONS.md)
- [DB ERD](06-database-erd.md)
- [API 계약](04-api-contract.md)

작업 후:

1. `docs/TODO.md` 체크 상태 갱신
2. 새로 배운 점이 있으면 `docs/LESSONS.md` 기록
3. 검증 실행
4. 작업 단위별 commit/push
