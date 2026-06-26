import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { Button } from "@toss/tds-mobile";
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
      <div className="section-header">
        <div>
          <Link className="back-link" to="/shops">← 목록</Link>
          <h1>{shop.data.name}</h1>
          <p className="muted">{shop.data.address}</p>
        </div>
        <div className="actions">
          <Button variant="weak" onClick={() => shop.data?.wishlisted ? removeWishlist.mutate() : addWishlist.mutate()}>
            {shop.data.wishlisted ? "가고싶음 해제" : "가고싶음"}
          </Button>
        </div>
      </div>

      <section className="panel">
        <h2>방문 기록 추가</h2>
        <VisitForm shops={shops.data ?? [shop.data]} shopId={shopId} submitLabel="기록" onSubmit={(request) => createVisit.mutate(request)} />
      </section>

      <section className="stack">
        <h2>방문 기록</h2>
        <div className="list">
          {visits.data?.map((visit) => <VisitCard key={visit.id} visit={visit} />)}
          {visits.data?.length === 0 ? <div className="empty">아직 기록이 없습니다.</div> : null}
        </div>
      </section>
    </div>
  );
}
