# Deployment Cost Candidates

이 문서는 MVP 배포 후보의 월 비용 감각을 정리한다. 가격은 변동될 수 있으므로 실제 결제 전 공식 가격표를 다시 확인한다. 원화 비용은 결제 시점 환율과 카드 수수료에 따라 달라진다.

## 현재 전제

- 프론트엔드: Vercel 무료 배포 유지
- 앱인토스: Granite `.ait` 번들 업로드
- 필요한 유료 인프라: API 서버, PostgreSQL/PostGIS DB
- 목표: 완벽한 운영 인프라가 아니라 MVP가 외부에서 안정적으로 열리는 상태

## 후보별 비용

| 후보 | 예상 월비용 | 구성 | 장점 | 단점 |
| --- | ---: | --- | --- | --- |
| Render 최소 유료 | $13/mo | Web Service Starter $7 + Postgres Basic-256mb $6 | 설정이 가장 단순하고 비용 예측이 쉽다 | DB RAM이 작다 |
| Render 여유형 | $26/mo | Web Service Starter $7 + Postgres Basic-1gb $19 | MVP catalog DB에는 더 안전하다 | 개인 프로젝트 기준 원화 부담이 커진다 |
| Railway | $5~20/mo | usage 기반 API + Postgres | 작게 쓰면 싸게 시작할 수 있다 | 사용량 기반이라 Render보다 비용 예측이 덜 직관적이다 |
| Render API + Neon DB | $7~22/mo | Render Web Service + Neon Postgres | Neon DB가 scale-to-zero와 PostGIS를 지원한다 | API와 DB 플랫폼이 나뉘어 설정이 조금 늘어난다 |
| Fly.io | $10~20/mo | Fly Machine API + Postgres/volume | 작은 VM 비용은 낮다 | DB 운영 감각과 Fly 설정 이해가 더 필요하다 |
| AWS 최소 | $25~45/mo | EC2 또는 Elastic Beanstalk + RDS PostgreSQL | 나중에 운영 표준으로 확장하기 좋다 | MVP에는 설정 공수와 기본 비용이 과하다 |
| AWS 운영형 | $50+/mo | 여유 RDS, 로그, 백업, 모니터링 포함 | 운영 안정성, 권한, 네트워크 제어가 좋다 | 지금 단계에서는 돈과 시간이 모두 과하다 |

## 결정

비용과 설정 단순성만 보면 Render 최소 유료 구성이 가장 낫다. 월 $13로 API와 DB를 모두 외부에 열 수 있고, 비용 예측도 쉽다.

원화 부담이 아깝거나 앱인토스 심사 전 smoke test만 필요하면 서버 배포를 잠시 미루고 seed JSON을 프론트에 포함하는 선택지도 있다. 라멘집 seed가 200여 건 수준이면 클라이언트 검색으로도 MVP 확인은 가능하다. 다만 이 경우 catalog 갱신은 앱 재배포가 필요하다.

현재 프로젝트 결정은 AWS 최소 구성으로 진행한다. 이유는 장기적으로 AWS에 올 가능성이 높고, 자료와 운영 표준이 많아 나중에 다시 옮기는 공수를 줄일 수 있기 때문이다. 단, MVP에는 Render보다 비싸고 설정이 많으므로 [AWS Setup](16-aws-setup.md)의 Elastic Beanstalk + RDS PostgreSQL/PostGIS 범위 밖으로 넓히지 않는다.

## 마이그레이션 부담

Render에서 시작해도 다음 원칙을 지키면 AWS 이전 공수는 작다.

- Spring Boot는 JAR 또는 container로 실행한다.
- DB는 PostgreSQL/PostGIS만 쓴다.
- 설정은 환경변수로만 주입한다.
- schema는 Flyway로 재현한다.
- seed는 JSON/import script로 재현한다.
- 프론트는 `VITE_API_BASE_URL`만 바꾸면 되게 유지한다.

예상 이전 공수:

| 범위 | 공수 |
| --- | ---: |
| API 서버만 이전 | 반나절~1일 |
| DB까지 안전하게 이전 | 1~2일 |
| CORS, env, Vercel/앱인토스 API URL 교체 | 1~2시간 |
| 로그, 모니터링, 백업까지 AWS식으로 정리 | 2~4일 |

## 공식 가격표

- [Render Pricing](https://render.com/pricing)
- [Railway Pricing](https://railway.com/pricing)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [Neon Pricing](https://neon.com/pricing)
- [AWS RDS PostgreSQL Pricing](https://aws.amazon.com/rds/postgresql/pricing/)
- [AWS EC2 On-Demand Pricing](https://aws.amazon.com/ec2/pricing/on-demand/)
