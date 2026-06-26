import type { VisitResponse } from "@ramen-dojang/api-client";
import { Link } from "@tanstack/react-router";
import { Badge } from "@toss/tds-mobile";

export function VisitCard({ visit }: { visit: VisitResponse }) {
  return (
    <article className="card item-card">
      <div>
        <div className="item-title-row">
          <h3>{visit.menuName}</h3>
          <Badge size="small" variant="weak" color="green">{visit.overallRating}/5</Badge>
        </div>
        <p className="muted">{visit.shopName} · {visit.visitedAt}</p>
        {visit.memo ? <p>{visit.memo}</p> : null}
      </div>
      <Link className="icon-link" to="/visits/$visitId" params={{ visitId: visit.id }} aria-label={`${visit.menuName} 방문 상세`}>
        →
      </Link>
    </article>
  );
}
