import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TextField } from "../components/ui";
import { ShopCard } from "../features/shops/ShopCard";
import { api } from "../lib/api";

export function ShopsPage() {
  const [name, setName] = useState("");
  const [visited, setVisited] = useState<string>("");
  const params = { name, visited: visited === "" || visited === "wishlisted" ? undefined : visited === "true" };
  const shops = useQuery({ queryKey: ["shops", params], queryFn: () => api.listShops(params) });
  const visibleShops = visited === "wishlisted" ? shops.data?.filter((shop) => shop.wishlisted) : shops.data;

  return (
    <div className="stack">
      <section className="stack">
        <div className="mobile-title">
          <h1>라멘 맛집 탐색</h1>
          <p className="muted">다녀온 곳과 가볼 곳을 한 목록에서 관리합니다.</p>
        </div>
        <div className="search-panel">
          <TextField label="라멘집 이름" value={name} onChange={(event) => setName(event.target.value)} />
          <div className="filter-chips" role="group" aria-label="라멘집 필터">
            <button className={visited === "" ? "active" : ""} type="button" onClick={() => setVisited("")}>전체</button>
            <button className={visited === "true" ? "active" : ""} type="button" onClick={() => setVisited("true")}>방문한 곳</button>
            <button className={visited === "false" ? "active" : ""} type="button" onClick={() => setVisited("false")}>미방문</button>
            <button className={visited === "wishlisted" ? "active" : ""} type="button" onClick={() => setVisited("wishlisted")}>가보고 싶은 곳</button>
          </div>
        </div>
        <div className="list">
          {visibleShops?.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
          {visibleShops?.length === 0 ? <div className="empty">조건에 맞는 라멘집이 없습니다.</div> : null}
          {shops.isError ? <div className="empty error">목록을 불러오지 못했습니다.</div> : null}
        </div>
      </section>
    </div>
  );
}
