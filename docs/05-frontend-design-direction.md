# 라멘 도장깨기 Frontend Design Direction

`frontend-design` 스킬 기준으로 먼저 디자인 계획을 고정하고 구현한다. 단, 앱인토스 비게임 앱은 Toss Design System을 우선하고, 앱 고유 컴포넌트는 TDS로 표현하기 어려운 라멘 기록 도메인 화면에만 둔다.

## Subject

- 대상: 라멘집 방문을 꾸준히 기록하는 웹사이트 + 토스 미니앱
- 사용자: 라멘집을 찾아다니고, 맛/메뉴/재방문 의사를 나중에 다시 보고 싶은 사람
- 첫 화면의 일: 최근 방문 기록과 전체 진행 상태를 빠르게 보여주고, 새 라멘집/방문 기록 작성으로 이어준다

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
