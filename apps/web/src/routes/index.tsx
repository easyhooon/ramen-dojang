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
  const nextShop = shops.data?.find((shop) => !shop.visited) ?? shops.data?.[0] ?? null;

  return (
    <div className="stack">
      <div className="mobile-title">
        <h1>라멘 도장깨기</h1>
      </div>

      <section className="summary-band">
        <div className="summary-copy">
          <p className="eyebrow">라멘 기록장</p>
          <h1>다녀온 맛을 쌓고, 다음 한 그릇을 고릅니다.</h1>
        </div>
        <div className="metrics">
          <div><strong>{shops.data?.length ?? 0}</strong><span>라멘집</span></div>
          <div><strong>{visitedCount}</strong><span>방문</span></div>
          <div><strong>{visits.data?.length ?? 0}</strong><span>기록</span></div>
        </div>
      </section>

      <section className="section-label">
        <h2>내 라멘 프로필</h2>
      </section>

      <section className="profile-card">
        <div className="profile-avatar">🍜</div>
        <div>
          <div className="item-title-row">
            <h3>나의 취향 기록</h3>
            <span className="pill success">LEVEL {Math.max(1, Math.min(9, visitedCount))}</span>
          </div>
          <p>
            {tasteStats
              ? `${tasteStats.favoriteTag} 중심으로 ${visitedCount}곳을 기록했어요.`
              : "첫 방문 기록을 남기면 취향 프로필이 채워집니다."}
          </p>
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

      <Link className="hero-action" to="/visits/new">＋ 방문 기록하기</Link>

      <section className="section-header">
        <div>
          <h2>최근 방문한 곳</h2>
          <p className="muted">최근 등록한 방문 기록입니다.</p>
        </div>
        <div className="actions">
          <Link className="button" to="/shops">전체보기</Link>
        </div>
      </section>

      <div className="list">
        {visits.data?.slice(0, 5).map((visit) => <VisitCard key={visit.id} visit={visit} />)}
        {visits.data?.length === 0 ? <div className="empty">아직 방문 기록이 없습니다.</div> : null}
        {visits.isError ? <div className="empty error">API 서버 연결을 확인해주세요.</div> : null}
      </div>

      {nextShop ? (
        <Link className="recommend-card" to="/shops/$shopId" params={{ shopId: nextShop.id }}>
          <img src={nextShop.thumbnailUrl} alt="" />
          <span>다음 후보</span>
          <strong>{nextShop.name}</strong>
          <small>{nextShop.address}</small>
        </Link>
      ) : null}
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
