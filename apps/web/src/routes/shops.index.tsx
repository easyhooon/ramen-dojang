import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ShopCard } from "../features/shops/ShopCard";
import { ShopForm } from "../features/shops/ShopForm";
import { api } from "../lib/api";

export function ShopsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [visited, setVisited] = useState<string>("");
  const params = { name, tag, visited: visited === "" ? undefined : visited === "true" };
  const shops = useQuery({ queryKey: ["shops", params], queryFn: () => api.listShops(params) });
  const createShop = useMutation({
    mutationFn: api.createShop,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shops"] }),
  });

  return (
    <div className="two-column">
      <section className="stack">
        <div className="section-header">
          <div>
            <h1>라멘집</h1>
            <p className="muted">다녀온 곳과 가볼 곳을 한 목록에서 관리합니다.</p>
          </div>
        </div>
        <div className="toolbar">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="이름 검색" />
          <input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="태그" />
          <select value={visited} onChange={(event) => setVisited(event.target.value)}>
            <option value="">전체</option>
            <option value="true">방문함</option>
            <option value="false">미방문</option>
          </select>
        </div>
        <div className="list">
          {shops.data?.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
          {shops.data?.length === 0 ? <div className="empty">조건에 맞는 라멘집이 없습니다.</div> : null}
          {shops.isError ? <div className="empty error">목록을 불러오지 못했습니다.</div> : null}
        </div>
      </section>
      <aside className="panel">
        <h2>라멘집 등록</h2>
        <ShopForm submitLabel={createShop.isPending ? "저장 중" : "등록"} onSubmit={(request) => createShop.mutate(request)} />
      </aside>
    </div>
  );
}

