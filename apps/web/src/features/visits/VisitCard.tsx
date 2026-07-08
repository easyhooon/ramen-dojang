import type { VisitResponse } from "@ramen-dojang/api-client";
import { Link } from "@tanstack/react-router";
import { Icon } from "../../components/Icon";
import { Badge } from "../../components/ui";

export function VisitCard({ visit }: { visit: VisitResponse }) {
  return (
    <article className="card item-card">
      <div>
        <div className="item-title-row">
          <h3>{visit.menuName}</h3>
          <Badge color="green">{visit.overallRating}/5</Badge>
        </div>
        <p className="muted">{visit.shopName} · {visit.visitedAt}</p>
        {visit.memo ? <p>{visit.memo}</p> : null}
      </div>
      <Link className="icon-link" to="/visits/$visitId" params={{ visitId: visit.id }} aria-label={`${visit.menuName} 방문 상세`}>
        <Icon name="arrowRight" />
      </Link>
    </article>
  );
}
