import type { CreateVisitRequest } from "@ramen-dojang/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button, TextField } from "@toss/tds-mobile";
import { useState } from "react";
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
      <Link className="back-link" to="/">← 홈</Link>
      <div className="section-header">
        <div>
          <h1>방문 추가</h1>
          <p className="muted">저장된 라멘집을 검색해서 고른 뒤, 이번 방문의 맛을 남깁니다.</p>
        </div>
      </div>

      <section className="panel">
        <div className="stack">
          <TextField
            variant="box"
            label="라멘집 검색"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSelectedShopId(null);
            }}
          />
          <div className="list">
            {shops.data?.map((shop) => (
              <button
                className={`select-card${selectedShopId === shop.id ? " selected" : ""}`}
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

      {selectedShop ? (
        <section className="panel narrow">
          <h2>리뷰 작성</h2>
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
        <div className="empty">리뷰를 작성할 라멘집을 먼저 선택해주세요.</div>
      )}

      <Button type="button" variant="weak" display="full" onClick={() => navigate({ to: "/shops" })}>
        라멘집 목록에서 찾기
      </Button>
    </div>
  );
}
