# 라멘 도장깨기 Frontend Design Direction

`frontend-design` 스킬 기준으로 먼저 디자인 계획을 고정하고 구현한다. 단, 일반 웹과 앱인토스를 같은 `apps/web`에서 배포하므로 앱인토스 전용 TDS runtime package에는 의존하지 않는다. 대신 비게임 내비게이션 바, 플로팅 탭바, UX writing, dark pattern 방지 기준은 앱인토스 공식 UI/UX 가이드를 따른다.

## Subject

- 대상: 라멘집 방문을 꾸준히 기록하는 웹사이트 + 토스 미니앱
- 사용자: 라멘집을 찾아다니고, 맛/메뉴/재방문 의사를 나중에 다시 보고 싶은 사람
- 첫 화면의 일: 최근 방문 기록과 전체 진행 상태를 빠르게 보여주고, 새 라멘집/방문 기록 작성으로 이어준다

## Current Direction

앱인토스 출시를 1차 목표로 두므로 토스다운 neutral surface, 간결한 리스트 구조, 예측 가능한 CTA를 우선한다. 라멘 고유의 시각 요소는 썸네일, 도장/기록 카피, 취향 요약에만 제한하고, primary color는 shoyu/amber 계열을 작게 사용한다.

Stitch나 Figma에서 만든 시안은 아래 원칙으로 이 문서에 옮긴다.

- 화면별 목적과 사용자가 끝내야 하는 일을 먼저 적는다.
- 시안 이미지는 링크 또는 경로로 붙이고, 중요한 결정만 텍스트로 요약한다.
- 앱인토스 가이드에 맞춰야 하는 요소와 라멘 도메인 표현을 위한 커스텀 요소를 나눈다.
- 구현 TODO는 [TODO](TODO.md)에 별도로 옮긴다.

## Stitch Archive

아직 확정된 Stitch 시안은 없다. 시안이 생기면 아래 템플릿으로 추가한다.

```text
### YYYY-MM-DD 화면명

- Source: Stitch 링크 또는 이미지 경로
- Prompt: 생성에 사용한 핵심 프롬프트
- Target: 웹 / 앱인토스 / 공통
- Screens: 홈, 라멘집 목록, 방문 추가, 방문 상세 등
- Keep: 실제 구현에 반영할 요소
- Drop: 과하거나 앱인토스 UI/UX 가이드와 맞지 않아 버릴 요소
- TODO: 구현 작업으로 옮길 항목
```

## Token Plan

### Color

- Bowl black `#231f1a`: 먹는 그릇과 카운터의 무게감
- Broth amber `#b86225`: 진한 국물 색, 주요 액션에 사용
- Nori green `#2f5b45`: 성공/방문 완료 상태
- Steam paper `#f6efe3`: 배경, 너무 순백으로 뜨지 않게 조정
- Pickled red `#c73e2f`: 위험/삭제와 작은 강조
- Soy line `#d8c9b8`: 경계선과 입력 테두리

### Type

- Display: 시스템 UI의 굵은 weight를 쓰되, hero와 핵심 수치에만 크게 사용한다.
- Body: 시스템 산세리프를 사용해 CRUD 도구의 반복 사용성을 우선한다.
- Utility: 작은 라벨, 상태 pill, 수치는 같은 family에서 weight와 크기로 위계를 만든다.

### Layout

라멘집 카운터처럼 긴 작업대와 옆 보조 패널을 둔다. 목록은 주문서처럼 빠르게 스캔되고, 작성 폼은 오른쪽에서 항상 접근 가능하다.

```text
Desktop
+------------------------------------------------+
| nav                                            |
+------------------------------------------------+
| status rail / hero                             |
+-----------------------------+------------------+
| shop or visit list           | create/edit form |
| shop or visit list           | create/edit form |
+-----------------------------+------------------+

Mobile
+------------------+
| nav              |
| status           |
| create/edit form |
| list             |
+------------------+
```

### Signature

방문 진행을 `도장`처럼 보이는 작은 원형 상태가 아니라, 라멘 카운터 위 주문표/시식 기록처럼 보이게 한다. 시그니처는 하나만 둔다: 홈 상단의 어두운 카운터 밴드와 큼직한 기록 수치.

## Self-Critique

초안 CSS는 크림 배경과 붉은 accent가 강해 generic warm-cream/terracotta 패턴으로 읽힐 위험이 있다. 이를 줄이기 위해 주 액션 색을 더 국물색에 가까운 amber로 바꾸고, 성공/방문 상태에 김색 green을 추가해 단색 테마를 피한다. 장식적 번호나 의미 없는 gradient는 넣지 않는다.
