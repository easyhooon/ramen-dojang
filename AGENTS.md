# AGENTS.md

이 저장소의 Codex 작업 규칙이다. 기본 작업 방식은 설치된 `mattpocock/skills` 계열 스킬을 기준으로 한다.

## 기본 원칙

- 문서 기반으로 작업한다.
- 애매한 부분은 구현 전에 먼저 묻는다.
- 작업 전후로 [docs/TODO.md](docs/TODO.md)를 갱신한다.
- 날짜별 작업 요약과 검증 기록은 [docs/WORKLOG.md](docs/WORKLOG.md)에 남긴다.
- 새로 배운 개념, 사용자가 물어본 개념, 문제 해결에서 얻은 깨달음은 [docs/LESSONS.md](docs/LESSONS.md)에 기록한다.
- DB/API 작업은 [docs/06-database-erd.md](docs/06-database-erd.md)의 ERD를 먼저 보고 진행한다.
- API DTO는 DB 테이블을 그대로 노출하지 않고, 화면/API 계약에 맞는 request/response로 설계한다.

## 사용할 스킬

- `implement`: 문서나 TODO 기반 구현 작업.
- `domain-modeling`: ERD, 도메인 용어, `CONTEXT.md` 변경.
- `tdd`: 기능 추가나 버그 수정 시 테스트 기준을 먼저 세울 때.
- `diagnosing-bugs`: 빌드, 런타임, DB, Swagger, CI 문제 진단.
- `teach`: 사용자가 개념 설명을 요청하거나 `LESSONS.md`에 학습 기록을 남길 때.
- `ponytail`: 과한 추상화, 불필요한 계층, speculative 작업을 줄일 때.
- `commit-push`: 작업 단위별로 변경을 검토하고 title/body를 붙여 커밋/푸시할 때.

프론트 UI 디자인은 별도로 설치된 `frontend-design` 스킬을 참고한다.

## 작업 진행

1. 관련 문서를 먼저 읽는다.
2. 필요하면 `docs/TODO.md`에 작업 항목을 추가한다.
3. 구현한다.
4. 가능한 최소 검증을 실행한다.
5. TODO, WORKLOG, LESSONS를 필요에 맞게 갱신한다.
6. 작업 단위가 끝나면 `commit-push` 기준으로 커밋을 나눈다.

## 하루 작업 정리

사용자가 “하루작업 정리해줘”, “오늘 작업 정리해줘”, “작업 일지 정리해줘”처럼 요청하면 [docs/WORKLOG.md](docs/WORKLOG.md)에 오늘 날짜 기준 작업 기록을 추가하거나 갱신한다.

작업 기록은 아래 틀을 따른다.

1. 한 줄 요약
2. 영역별 작업 내용: 공통/모노레포, Backend, API Client/Contract, Frontend, Mobile, 문서화/학습 기록 등 실제 작업한 영역만 사용
3. 검증한 것: 실행한 명령, 확인한 URL, 통과/실패 상태
4. 남은 일: 아직 검증하지 못한 것, 다음 작업 후보, 외부 환경이 필요한 것
5. 관련 커밋: 해당 날짜에 생성한 주요 커밋 해시와 제목

`WORKLOG.md`는 진행 상황을 사람이 읽는 일지이고, `TODO.md`는 체크리스트, `LESSONS.md`는 배운 점 기록이다. 세 문서의 역할을 섞지 않는다.

## 검증 기준

프론트/API client:

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

DB와 Swagger:

```bash
pnpm infra:up
pnpm dev:api
curl http://localhost:8080/health
```

Swagger UI와 OpenAPI는 아래 경로로 확인한다.

- `http://localhost:8080/swagger`
- `http://localhost:8080/openapi`

## 커밋 규칙

- 한 번에 너무 많은 변경을 올리지 않는다.
- 변경이 섞이면 커밋을 나눈다.
- 일반적인 분리 기준:
  - docs/domain/ERD/lessons
  - backend scaffold/API/schema
  - frontend scaffold/screens/API client
  - tooling/scripts/README
- 커밋 전 `git status --short --branch`와 `git diff --stat`를 확인한다.
- 빌드 산출물, `.DS_Store`, `node_modules`, 비밀값은 커밋하지 않는다.
