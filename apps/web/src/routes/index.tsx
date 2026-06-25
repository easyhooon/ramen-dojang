import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { VisitCard } from "../features/visits/VisitCard";
import { api } from "../lib/api";

export function HomePage() {
  const shops = useQuery({ queryKey: ["shops"], queryFn: () => api.listShops() });
  const visits = useQuery({ queryKey: ["visits"], queryFn: () => api.listVisits() });
  const visitedCount = shops.data?.filter((shop) => shop.visited).length ?? 0;

  return (
    <div className="stack">
      <section className="summary-band">
        <div>
          <p className="eyebrow">라멘 기록장</p>
          <h1>다녀온 맛을 쌓고, 다음 한 그릇을 고릅니다.</h1>
        </div>
        <div className="metrics">
          <div><strong>{shops.data?.length ?? 0}</strong><span>라멘집</span></div>
          <div><strong>{visitedCount}</strong><span>방문</span></div>
          <div><strong>{visits.data?.length ?? 0}</strong><span>기록</span></div>
        </div>
      </section>

      <section className="section-header">
        <div>
          <h2>최근 방문</h2>
          <p className="muted">가장 최근에 남긴 방문 기록입니다.</p>
        </div>
        <Link className="button" to="/shops">라멘집 관리</Link>
      </section>

      <div className="list">
        {visits.data?.slice(0, 5).map((visit) => <VisitCard key={visit.id} visit={visit} />)}
        {visits.data?.length === 0 ? <div className="empty">아직 방문 기록이 없습니다.</div> : null}
        {visits.isError ? <div className="empty error">API 서버 연결을 확인해주세요.</div> : null}
      </div>
    </div>
  );
}

