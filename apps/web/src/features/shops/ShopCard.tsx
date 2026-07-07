import type { ShopResponse } from "@ramen-dojang/api-client";
import { Link } from "@tanstack/react-router";
import { Badge } from "@toss/tds-mobile";
import { Icon } from "../../components/Icon";

export function ShopCard({ shop }: { shop: ShopResponse }) {
  return (
    <article className="card item-card shop-card">
      <img
        className="shop-thumbnail"
        src={shop.thumbnailUrl}
        alt=""
        onError={(event) => {
          event.currentTarget.src = defaultThumbnailUrl;
        }}
      />
      <div>
        <div className="item-title-row">
          <h3>{shop.name}</h3>
          <Badge size="small" variant="weak" color={shop.visited ? "green" : "elephant"}>
            {shop.visited ? "방문함" : "미방문"}
          </Badge>
        </div>
        <p className="muted">{shop.address}</p>
        <p className="rating-line">★ {shop.averageRating ? shop.averageRating.toFixed(1) : "-"} <span>평균</span></p>
        <div className="tag-row">
          {shop.tags.length === 0 ? (
            <Badge size="small" variant="weak" color="elephant">
              태그 없음
            </Badge>
          ) : (
            shop.tags.map((tag) => (
              <Badge size="small" variant="weak" color="yellow" key={tag}>
                {tag}
              </Badge>
            ))
          )}
        </div>
      </div>
      <div className="item-meta">
        <span className="bookmark" aria-label={shop.wishlisted ? "가고 싶은 곳" : "가고 싶은 곳 아님"}>
          <Icon name={shop.wishlisted ? "starFilled" : "star"} />
        </span>
        <Link className="icon-link" to="/shops/$shopId" params={{ shopId: shop.id }} aria-label={`${shop.name} 상세`}>
          <Icon name="arrowRight" />
        </Link>
      </div>
    </article>
  );
}

const defaultThumbnailUrl = "/assets/default-ramen.png";
