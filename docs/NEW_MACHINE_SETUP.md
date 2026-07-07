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
cp apps/mobile/.env.example apps/mobile/.env.local
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

## 9. 모바일 웹뷰 래퍼 실행

모바일 래퍼는 `apps/web`을 WebView로 띄우는 Expo React Native 앱이다. 먼저 웹 서버를 실행한다.

```bash
pnpm dev:web
```

다른 터미널에서:

```bash
pnpm dev:mobile
```

기본 URL:

```text
EXPO_PUBLIC_WEB_URL=http://localhost:5173
```

실기기에서 확인할 때는 `localhost`가 컴퓨터가 아니라 기기 자신을 가리킬 수 있다. 이때는 `apps/mobile/.env.local`의 `EXPO_PUBLIC_WEB_URL`을 같은 네트워크의 LAN 주소로 바꾼다.

```text
EXPO_PUBLIC_WEB_URL=http://192.168.x.x:5173
```

폰과 개발 컴퓨터는 같은 Wi-Fi/LAN에 있어야 한다. 셀룰러, VPN, 게스트 Wi-Fi에서는 `192.168.x.x` 주소가 열리지 않을 수 있다. 먼저 폰 브라우저에서 `EXPO_PUBLIC_WEB_URL`과 `http://192.168.x.x:8080/health`를 직접 열어본다.

Expo Go는 로컬 UX smoke test 용도다. iOS/Android store build 검증은 development build 또는 prebuild 기반으로 진행한다.

```bash
pnpm --filter mobile ios
pnpm --filter mobile android
```

## 10. 검증

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

## 11. 이어서 작업하기

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
- [모바일 웹뷰 래퍼](09-mobile-webview-wrapper.md)

작업 후:

1. `docs/TODO.md` 체크 상태 갱신
2. 새로 배운 점이 있으면 `docs/LESSONS.md` 기록
3. 검증 실행
4. 작업 단위별 commit/push
