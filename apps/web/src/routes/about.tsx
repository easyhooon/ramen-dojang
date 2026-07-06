export function AboutPage() {
  return (
    <div className="stack about-page">
      <section className="about-hero">
        <div className="app-icon">🍜</div>
        <h1>라멘 도장깨기</h1>
        <p>나만의 라멘 지도를 만들어가는 서비스입니다. 방문 기록을 남기고 취향을 발견해보세요.</p>
      </section>

      <section className="feature-grid">
        <div className="panel feature-card wide">
          <strong>나만의 지도</strong>
          <p>다녀온 곳과 가보고 싶은 라멘집을 한 목록에서 관리합니다.</p>
        </div>
        <div className="panel feature-card">
          <strong>방문 기록 통계</strong>
          <p>국물, 면, 토핑, 종합 평점으로 취향을 쌓습니다.</p>
        </div>
        <div className="panel feature-card">
          <strong>도장 감각</strong>
          <p>맥스 없는 누적 기록으로 내 라멘 취향을 넓혀갑니다.</p>
        </div>
      </section>

      <section className="panel info-list">
        <div><span>버전 정보</span><strong>0.1.0</strong></div>
        <div><span>서비스 이용약관</span><strong>›</strong></div>
        <div><span>개인정보 처리방침</span><strong>›</strong></div>
      </section>

      <a className="hero-action" href="mailto:hello@example.com">문의 및 피드백 보내기</a>
    </div>
  );
}
