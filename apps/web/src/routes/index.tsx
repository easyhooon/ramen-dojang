import type { ShopResponse, VisitResponse } from "@ramen-dojang/api-client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { VisitCard } from "../features/visits/VisitCard";
import { api } from "../lib/api";

export function HomePage() {
  const shops = useQuery({ queryKey: ["shops"], queryFn: () => api.listShops() });
  const visits = useQuery({ queryKey: ["visits"], queryFn: () => api.listVisits() });
  const visitedCount = shops.data?.filter((shop) => shop.visited).length ?? 0;
  const tasteStats = getTasteStats(visits.data ?? [], shops.data ?? []);

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
          <h2>내 취향 요약</h2>
          <p className="muted">쌓인 방문 기록으로 보이는 라멘 취향입니다.</p>
        </div>
      </section>

      {tasteStats ? (
        <section className="taste-grid">
          <div className="taste-card">
            <span>평균 만족도</span>
            <strong>{tasteStats.averageRating}</strong>
          </div>
          <div className="taste-card">
            <span>재방문 의향</span>
            <strong>{tasteStats.revisitRate}%</strong>
          </div>
          <div className="taste-card">
            <span>자주 먹은 태그</span>
            <strong>{tasteStats.favoriteTag}</strong>
          </div>
          <div className="taste-card">
            <span>자주 간 곳</span>
            <strong>{tasteStats.favoriteShop}</strong>
          </div>
        </section>
      ) : (
        <div className="empty">방문 기록을 남기면 내 취향 요약이 생깁니다.</div>
      )}

      <section className="section-header">
        <div>
          <h2>방문한 라멘집</h2>
          <p className="muted">최근 등록한 방문 기록입니다.</p>
        </div>
        <div className="actions">
          <Link className="primary" to="/visits/new">방문 추가</Link>
          <Link className="button" to="/shops">라멘집 보기</Link>
        </div>
      </section>

      <div className="list">
        {visits.data?.slice(0, 5).map((visit) => <VisitCard key={visit.id} visit={visit} />)}
        {visits.data?.length === 0 ? <div className="empty">아직 방문 기록이 없습니다.</div> : null}
        {visits.isError ? <div className="empty error">API 서버 연결을 확인해주세요.</div> : null}
      </div>
    </div>
  );
}

function getTasteStats(visits: VisitResponse[], shops: ShopResponse[]) {
  if (visits.length === 0) return null;

  const shopById = new Map(shops.map((shop) => [shop.id, shop]));
  const shopCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const visit of visits) {
    shopCounts.set(visit.shopName, (shopCounts.get(visit.shopName) ?? 0) + 1);
    for (const tag of shopById.get(visit.shopId)?.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return {
    averageRating: average(visits.map((visit) => visit.overallRating)).toFixed(1),
    favoriteShop: topEntry(shopCounts) ?? "-",
    favoriteTag: topEntry(tagCounts) ?? "태그 없음",
    revisitRate: Math.round((visits.filter((visit) => visit.revisitIntention).length / visits.length) * 100),
  };
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const topEntry = (counts: Map<string, number>) =>
  [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0];
