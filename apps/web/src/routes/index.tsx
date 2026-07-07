import type { ShopResponse, VisitResponse } from "@ramen-dojang/api-client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { VisitCard } from "../features/visits/VisitCard";
import { api } from "../lib/api";

export function HomePage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState("");
  const shops = useQuery({ queryKey: ["shops"], queryFn: () => api.listShops() });
  const visits = useQuery({ queryKey: ["visits"], queryFn: () => api.listVisits() });
  const visitedCount = shops.data?.filter((shop) => shop.visited).length ?? 0;
  const ramenLevel = Math.max(1, Math.min(9, visitedCount));
  const tasteStats = getTasteStats(visits.data ?? [], shops.data ?? []);
  const nextCandidate = getNextCandidate(shops.data ?? [], userLocation);
  const nextShop = nextCandidate?.shop ?? null;
  const recommendRule = userLocation
    ? `기준: 현재 위치에서 가까운 미방문 라멘집${nextCandidate?.distanceKm ? ` · 약 ${formatDistance(nextCandidate.distanceKm)}` : ""}`
    : "기준: 미방문 라멘집 중 목록 첫 번째";

  const requestLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("이 브라우저에서는 위치 정보를 사용할 수 없어요.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setLocationError("위치 권한을 허용하면 근처 미방문 라멘집으로 추천해요."),
      { maximumAge: 300000, timeout: 8000 },
    );
  };

  return (
    <div className="stack">
      <section className="summary-band">
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
        <img className="profile-avatar" src="/assets/default-ramen.png" alt="" />
        <div>
          <div className="item-title-row">
            <h3>나의 취향 기록</h3>
            <div className="level-help">
              <span className="pill success">LEVEL {ramenLevel}</span>
              <details>
                <summary aria-label="레벨 설명">?</summary>
                <p>방문한 라멘집 수로 올라가요. 1곳부터 LEVEL 1이고, 9곳 이상은 LEVEL 9로 표시합니다.</p>
              </details>
            </div>
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
        <section className="recommend-block">
          <div className="recommend-actions">
            <span>{userLocation ? "내 주변 기준" : "위치 기준 추천"}</span>
            <button className="button" type="button" onClick={requestLocation}>내 주변으로 찾기</button>
          </div>
          {locationError ? <p className="muted">{locationError}</p> : null}
          <Link className="recommend-card" to="/shops/$shopId" params={{ shopId: nextShop.id }}>
            <img src={nextShop.thumbnailUrl} alt="" />
            <span>다음 후보</span>
            <strong>{nextShop.name}</strong>
            <small>{nextShop.address}</small>
            <small className="recommend-rule">{recommendRule}</small>
          </Link>
        </section>
      ) : null}
    </div>
  );
}

type UserLocation = {
  latitude: number;
  longitude: number;
};

type NextCandidate = {
  shop: ShopResponse;
  distanceKm?: number;
};

function getNextCandidate(shops: ShopResponse[], userLocation: UserLocation | null): NextCandidate | null {
  const candidates = shops.filter((shop) => !shop.visited);
  const fallback = candidates[0] ?? shops[0] ?? null;
  if (!fallback) return null;
  if (!userLocation || candidates.length === 0) return { shop: fallback };

  return candidates
    .map((shop) => ({ shop, distanceKm: distanceKm(userLocation, shop) }))
    .sort((left, right) => left.distanceKm - right.distanceKm)[0];
}

function distanceKm(from: UserLocation, shop: ShopResponse) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(shop.latitude - from.latitude);
  const deltaLng = toRadians(shop.longitude - from.longitude);
  const fromLat = toRadians(from.latitude);
  const shopLat = toRadians(shop.latitude);
  const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(fromLat) * Math.cos(shopLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

const toRadians = (degree: number) => (degree * Math.PI) / 180;

const formatDistance = (distanceKm: number) => (distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`);

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
