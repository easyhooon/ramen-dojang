# AWS Setup

이 문서는 현재 라멘 도장깨기 MVP 스펙을 AWS에 올릴 때 설정해야 할 항목을 정리한다.

## 목표

- 프론트엔드는 Vercel에 둔다.
- 앱인토스 미니앱은 Granite `.ait` 번들을 앱인토스 콘솔에 업로드한다.
- AWS에는 API 서버와 공용 라멘집 catalog DB만 둔다.
- 첫 AWS 구성은 Elastic Beanstalk + RDS PostgreSQL/PostGIS로 시작한다.
- ECS, EKS, Terraform, custom VPC, Route 53, WAF는 MVP 배포 이후 필요가 생기면 검토한다.

## 현재 앱 스펙

| 항목 | 현재 상태 |
| --- | --- |
| API | Spring Boot 3.5, Kotlin, Java 17 |
| 실행 산출물 | Gradle `bootJar` |
| DB | PostgreSQL + PostGIS |
| schema | Flyway migration |
| health check | `GET /health` |
| OpenAPI | `GET /openapi`, Swagger UI `/swagger` |
| 프론트 API URL | Vercel 환경변수 `VITE_API_BASE_URL`로 주입 |
| 개인 기록 | MVP는 localStorage, 서버 저장은 앱인토스 `getAnonymousKey` 도입 후 |
| 초기 라멘집 데이터 | `server/api/src/main/resources/seed/shops.seed.json` |

API 서버 환경변수:

| 환경변수 | 용도 | 예시 |
| --- | --- | --- |
| `SERVER_PORT` | Elastic Beanstalk Java SE reverse proxy가 물릴 앱 포트 | `5000` |
| `DATABASE_URL` | Spring datasource JDBC URL | `jdbc:postgresql://<rds-endpoint>:5432/ramen_dojang` |
| `DATABASE_USERNAME` | DB 사용자 | `ramen_app` |
| `DATABASE_PASSWORD` | DB 비밀번호 | AWS 콘솔에서 직접 입력 |
| `NAVER_SEARCH_CLIENT_ID` | 네이버 지역 검색 sync용, 운영 sync를 켤 때만 | optional |
| `NAVER_SEARCH_CLIENT_SECRET` | 네이버 지역 검색 sync용, 운영 sync를 켤 때만 | optional |

주의:

- 현재 `WebConfig.kt`의 CORS 허용 origin은 로컬 개발용이다. 운영 배포 전 Vercel, 앱인토스 실제 origin, 앱인토스 QR 테스트 origin만 허용하도록 바꿔야 한다.
- `V1__create_initial_schema.sql`은 `CREATE EXTENSION IF NOT EXISTS postgis;`를 실행한다. RDS에서 Flyway 사용자가 extension 생성 권한을 가지지 못하면 `rds_superuser` 권한 사용자로 PostGIS를 한 번 수동 생성해야 한다.
- seed JSON은 repo에 있지만, AWS DB에 넣는 import script 또는 admin endpoint는 아직 필요하다.

## 0. 계정 안전 설정

AWS 리소스를 만들기 전에 비용 사고를 막는 설정부터 한다.

- [x] root 계정 MFA 등록
- [ ] root 계정은 결제/계정 설정에만 사용하고, 개발 작업용 IAM 사용자를 분리
- [ ] Billing and Cost Management에서 월 예산 알림 생성
- [ ] 예상 예산은 처음에는 USD 10 또는 USD 20로 낮게 잡고, 알림 수신 이메일 확인
- [ ] 리전은 우선 `ap-northeast-2` 서울로 둔다

Free Tier 주의:

- AWS Free Tier와 Free Plan credit은 신규 고객 기준이다.
- 기존 AWS 계정이 있거나 과거에 보유한 적이 있으면 free plan 또는 Free Tier credit 대상이 아닐 수 있다.
- 따라서 이 프로젝트에서는 무료 계정 전제를 두지 않고, 유료 과금 가능성을 기준으로 배포한다.

## 1. RDS PostgreSQL/PostGIS

첫 DB는 운영형 고가 구성이 아니라 작은 단일 DB로 시작한다.

권장 설정:

| 항목 | MVP 설정 |
| --- | --- |
| Engine | PostgreSQL |
| Version | 가능하면 로컬과 맞춰 PostgreSQL 17 계열 |
| Template | Production 대신 Dev/Test에 가까운 최소 구성. 실제 과금 여부는 계정 상태 확인 |
| Availability | Single-AZ |
| Instance | `db.t4g.micro` 또는 메모리 부족 시 `db.t4g.small` |
| Storage | gp3 20GB부터 시작 |
| Storage autoscaling | 처음에는 off 또는 낮은 상한 |
| DB name | `ramen_dojang` |
| Master username | `postgres` 대신 별도 이름 권장 |
| Public access | 기본은 off. 로컬 import가 꼭 필요하면 임시로 current IP만 허용 후 닫기 |
| Backup retention | MVP는 1~3일 |
| Deletion protection | 실제 데이터를 넣기 시작하면 on |

Security group:

- RDS inbound `5432`는 Elastic Beanstalk instance security group에서만 허용한다.
- 로컬에서 DBeaver/psql로 접속해야 할 때만 내 현재 IP를 임시로 허용하고, 작업 후 제거한다.

PostGIS:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Flyway가 위 문장을 실행하지 못하면 RDS 관리자 권한 사용자로 한 번 실행한 뒤 API를 다시 배포한다.

## 2. Elastic Beanstalk API

Spring Boot API는 첫 배포에서 container로 감싸지 않고 Java 17 JAR로 올린다.

권장 설정:

| 항목 | MVP 설정 |
| --- | --- |
| Platform | Java 17 / Corretto 17 Java SE |
| Environment type | Single instance |
| Load balancer | 처음에는 생략 |
| Instance | `t3.micro`, `t4g.micro`, 또는 Java heap이 부족하면 한 단계 상향 |
| Health check path | `/health` |
| Logs | 기본 CloudWatch/Elastic Beanstalk logs 확인 |

배포 산출물:

```bash
cd server/api
./gradlew clean bootJar
```

Elastic Beanstalk 환경변수:

```bash
SERVER_PORT=5000
DATABASE_URL=jdbc:postgresql://<rds-endpoint>:5432/ramen_dojang
DATABASE_USERNAME=<db-user>
DATABASE_PASSWORD=<db-password>
NAVER_SEARCH_CLIENT_ID=<optional>
NAVER_SEARCH_CLIENT_SECRET=<optional>
```

주의:

- Spring Boot는 `SERVER_PORT` 환경변수를 `server.port`로 매핑할 수 있다.
- `DATABASE_PASSWORD`, 네이버 secret은 repo, Vercel public env, 문서에 기록하지 않는다.
- 첫 배포에서 EB가 JAR 실행을 자동으로 못 잡으면 `Procfile` 추가를 검토한다.

## 3. CORS와 프론트 연결

AWS API URL이 생기면 프론트는 Vercel 환경변수만 바꾸면 된다.

Vercel:

```bash
VITE_API_BASE_URL=https://<elastic-beanstalk-env-domain>
```

운영 CORS에 허용할 origin:

| Origin | 용도 |
| --- | --- |
| `https://<vercel-project>.vercel.app` | 일반 웹/브라우저 QA |
| `https://<appName>.apps.tossmini.com` | 앱인토스 실제 서비스 |
| `https://<appName>.private-apps.tossmini.com` | 앱인토스 QR/샌드박스 테스트 |

현재 코드 작업 TODO:

- CORS origin을 hard-code local list에서 환경변수 기반으로 바꾼다.
- 예: `CORS_ALLOWED_ORIGIN_PATTERNS=https://*.vercel.app,https://ramen-dojang.apps.tossmini.com,https://ramen-dojang.private-apps.tossmini.com`

## 4. Seed 데이터 적재

현재 seed JSON은 GitHub에 올려도 되는 검수 전 초기 후보 데이터다. ID는 제외되어 있어 다른 DB에 넣을 때 새 UUID를 만들 수 있다.

AWS DB에 넣는 방식은 아직 결정해야 한다.

1. 가장 빠른 방식: seed JSON import script 작성 후 로컬에서 RDS에 1회 적재
2. 운영 친화 방식: 관리자용 import endpoint를 만들고 인증/권한을 붙인다
3. 가장 게으른 MVP 방식: 서버 배포 전까지 seed JSON을 프론트에 포함해 검색만 먼저 검증한다

현재 목표는 API 서버 catalog를 쓰는 방향이므로, AWS 배포 전 `shops.seed.json` import script를 먼저 만드는 것이 좋다.

## 5. 배포 후 smoke test

API:

```bash
curl https://<api-domain>/health
curl https://<api-domain>/openapi
curl "https://<api-domain>/shops?name=멘야"
```

프론트:

- Vercel 배포본에서 네트워크 탭에 API 호출이 보이는지 확인
- CORS error가 없는지 확인
- 라멘집 목록이 AWS DB seed 데이터로 렌더링되는지 확인
- 방문 기록 추가가 localStorage에 저장되는지 확인

앱인토스:

- 샌드박스/QR에서 API 호출이 성공하는지 확인
- 앱인토스 실제 origin이 CORS에 막히지 않는지 확인
- 비게임 내비게이션 바와 플로팅 탭바가 중복되지 않는지 확인

AWS:

- Elastic Beanstalk logs에 Flyway/PostGIS 오류가 없는지 확인
- RDS CPU, connection, storage 지표 확인
- Budget alert가 설정되어 있는지 확인

## 6. 지금 하지 않을 것

- ECS/Fargate 전환
- Kubernetes/EKS
- Terraform
- custom VPC/subnet 설계
- Route 53 브랜드 도메인
- ACM custom certificate
- Secrets Manager 강제 적용
- Multi-AZ RDS
- read replica
- auto scaling
- WAF
- CloudFront/S3 asset 분리

위 항목들은 실사용자 증가, 장애 대응, 보안 심사, 비용 최적화가 실제 문제가 될 때 도입한다.

## 참고

- [AWS Elastic Beanstalk Java applications](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_Java.html)
- [Elastic Beanstalk environment variables](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/environments-cfg-softwaresettings.html)
- [Amazon RDS for PostgreSQL PostGIS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Appendix.PostgreSQL.CommonDBATasks.PostGIS.html)
- [AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/)
