import type { VisitResponse } from "@ramen-dojang/api-client";
import { Link } from "@tanstack/react-router";

export function VisitCard({ visit }: { visit: VisitResponse }) {
  return (
    <article className="card item-card">
      <div>
        <div className="item-title-row">
          <h3>{visit.menuName}</h3>
          <span className="pill success">{visit.overallRating}/5</span>
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

