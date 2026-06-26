import type { ShopResponse } from "@ramen-dojang/api-client";
import { Link } from "@tanstack/react-router";
import { Badge } from "@toss/tds-mobile";

export function ShopCard({ shop }: { shop: ShopResponse }) {
  return (
    <article className="card item-card">
      <div>
        <div className="item-title-row">
          <h3>{shop.name}</h3>
          <Badge size="small" variant="weak" color={shop.visited ? "green" : "elephant"}>
            {shop.visited ? "방문함" : "미방문"}
          </Badge>
        </div>
        <p className="muted">{shop.address}</p>
        <div className="tag-row">
          {shop.tags.length === 0 ? (
            <Badge size="small" variant="weak" color="elephant">
              태그 없음
            </Badge>
          ) : (
            shop.tags.map((tag) => (
              <Badge size="small" variant="weak" color="blue" key={tag}>
                {tag}
              </Badge>
            ))
          )}
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
