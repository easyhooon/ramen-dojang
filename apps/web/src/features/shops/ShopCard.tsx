import type { ShopResponse } from "@ramen-dojang/api-client";
import { Link } from "@tanstack/react-router";

export function ShopCard({ shop }: { shop: ShopResponse }) {
  return (
    <article className="card item-card">
      <div>
        <div className="item-title-row">
          <h3>{shop.name}</h3>
          <span className={shop.visited ? "pill success" : "pill"}>{shop.visited ? "방문함" : "미방문"}</span>
        </div>
        <p className="muted">{shop.address}</p>
        <div className="tag-row">
          {shop.tags.length === 0 ? <span className="tag">태그 없음</span> : shop.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
        </div>
      </div>
      <div className="item-meta">
        <strong>{shop.averageRating ? shop.averageRating.toFixed(1) : "-"}</strong>
        <span>평균</span>
        <Link className="icon-link" to="/shops/$shopId" params={{ shopId: shop.id }} aria-label={`${shop.name} 상세`}>
          →
        </Link>
      </div>
    </article>
  );
}

