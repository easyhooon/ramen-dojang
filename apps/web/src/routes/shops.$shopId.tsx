import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "../components/ui";
import { VisitCard } from "../features/visits/VisitCard";
import { VisitForm } from "../features/visits/VisitForm";
import { api } from "../lib/api";

export function ShopDetailPage() {
  const { shopId } = useParams({ from: "/shops/$shopId" });
  const queryClient = useQueryClient();
  const shop = useQuery({ queryKey: ["shops", shopId], queryFn: () => api.getShop(shopId) });
  const shops = useQuery({ queryKey: ["shops"], queryFn: () => api.listShops() });
  const visits = useQuery({ queryKey: ["shops", shopId, "visits"], queryFn: () => api.listShopVisits(shopId) });
  const createVisit = useMutation({
    mutationFn: api.createVisit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["shops", shopId, "visits"] });
    },
  });
  const addWishlist = useMutation({
    mutationFn: () => api.addWishlist({ shopId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shops"] }),
  });
  const removeWishlist = useMutation({
    mutationFn: () => api.removeWishlist(shopId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shops"] }),
  });

  if (shop.isLoading) return <div className="empty">불러오는 중입니다.</div>;
  if (!shop.data) return <div className="empty error">라멘집을 찾을 수 없습니다.</div>;

  return (
    <div className="stack">
      <section className="shop-hero">
        <Link className="back-link" to="/shops">← 목록</Link>
        <img src={shop.data.thumbnailUrl} alt="" />
        <div className="shop-hero-copy">
          <span className="pill success">{shop.data.tags[0] ?? "라멘집"}</span>
          <h1>{shop.data.name}</h1>
        </div>
      </section>

      <section className="panel shop-info-card">
        <p className="rating-line">★ {shop.data.averageRating ? shop.data.averageRating.toFixed(1) : "-"} <span>평균 평점</span></p>
        <p>{shop.data.address}</p>
        <div className="actions two-actions">
          <Button variant="weak" onClick={() => shop.data?.wishlisted ? removeWishlist.mutate() : addWishlist.mutate()}>
            {shop.data.wishlisted ? "가고싶음 해제" : "♡ 가고싶어요"}
          </Button>
          {shop.data.placeUrl ? <a className="button" href={shop.data.placeUrl} target="_blank" rel="noreferrer">장소 보기</a> : null}
        </div>
      </section>

      <section className="stack">
        <div className="section-header">
          <h2>나의 방문 기록</h2>
          <span className="pill success">총 {visits.data?.length ?? 0}회 방문</span>
        </div>
        <div className="list">
          {visits.data?.map((visit) => <VisitCard key={visit.id} visit={visit} />)}
          {visits.data?.length === 0 ? <div className="empty">아직 기록이 없습니다.</div> : null}
        </div>
      </section>

      <section className="panel">
        <h2>방문 기록 추가</h2>
        <VisitForm shops={shops.data ?? [shop.data]} shopId={shopId} submitLabel="방문 기록 추가하기" onSubmit={(request) => createVisit.mutate(request)} />
      </section>
    </div>
  );
}
