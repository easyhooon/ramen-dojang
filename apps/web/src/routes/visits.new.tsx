import type { CreateVisitRequest } from "@ramen-dojang/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, TextField } from "../components/ui";
import { VisitForm } from "../features/visits/VisitForm";
import { api } from "../lib/api";

export function NewVisitPage() {
  const [name, setName] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const searchName = name.trim();
  const shops = useQuery({
    queryKey: ["shops", { name: searchName }],
    queryFn: () => api.listShops({ name: searchName || undefined }),
  });
  const selectedShop = shops.data?.find((shop) => shop.id === selectedShopId) ?? null;
  useEffect(() => {
    if (selectedShopId) window.scrollTo(0, 0);
  }, [selectedShopId]);

  const createVisit = useMutation({
    mutationFn: (request: CreateVisitRequest) => api.createVisit(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["visits"] }),
        queryClient.invalidateQueries({ queryKey: ["shops"] }),
      ]);
      await navigate({ to: "/" });
    },
  });

  return (
    <div className="stack">
      <div className="mobile-title title-row">
        <Link className="close-link" to="/">×</Link>
        <div>
          <h1>{selectedShop ? "리뷰 작성" : "방문 추가"}</h1>
          <p className="muted">
            {selectedShop ? `${selectedShop.name} 방문의 맛을 남깁니다.` : "저장된 라멘집을 검색해서 고릅니다."}
          </p>
        </div>
      </div>

      {selectedShop ? (
        <section className="panel narrow step-panel">
          <div className="select-card selected selected-shop-summary">
            <strong>{selectedShop.name}</strong>
            <span>{selectedShop.address}</span>
          </div>
          <Button type="button" variant="weak" display="full" onClick={() => setSelectedShopId(null)}>
            다른 라멘집 선택
          </Button>
          <VisitForm
            key={selectedShop.id}
            shops={[selectedShop]}
            shopId={selectedShop.id}
            submitLabel={createVisit.isPending ? "등록 중" : "방문 기록 등록"}
            onSubmit={(request) => createVisit.mutate(request)}
          />
          {createVisit.isError ? <p className="error">방문 기록을 등록하지 못했습니다.</p> : null}
        </section>
      ) : (
        <>
          <section className="photo-strip">
            <div className="photo-slot">
              <span>선택</span>
              <small>0/1</small>
            </div>
            <img src="/assets/default-ramen.png" alt="" />
          </section>

          <section className="panel step-panel">
            <p className="form-section-title">라멘집 선택</p>
            <div className="stack">
              <TextField
                label="라멘집 검색"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <div className="list">
                {shops.data?.map((shop) => (
                  <button
                    className="select-card"
                    key={shop.id}
                    type="button"
                    onClick={() => setSelectedShopId(shop.id)}
                  >
                    <strong>{shop.name}</strong>
                    <span>{shop.address}</span>
                  </button>
                ))}
                {shops.isLoading ? <div className="empty">라멘집을 불러오는 중입니다.</div> : null}
                {shops.data?.length === 0 ? <div className="empty">검색된 라멘집이 없습니다.</div> : null}
                {shops.isError ? <div className="empty error">라멘집 목록을 불러오지 못했습니다.</div> : null}
              </div>
            </div>
          </section>

          <Button type="button" variant="weak" display="full" onClick={() => navigate({ to: "/shops" })}>
            라멘집 목록에서 찾기
          </Button>
        </>
      )}
    </div>
  );
}
