import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "../components/ui";
import { VisitForm } from "../features/visits/VisitForm";
import { api } from "../lib/api";

export function VisitDetailPage() {
  const { visitId } = useParams({ from: "/visits/$visitId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const visit = useQuery({ queryKey: ["visits", visitId], queryFn: () => api.getVisit(visitId) });
  const shops = useQuery({ queryKey: ["shops"], queryFn: () => api.listShops() });
  const updateVisit = useMutation({
    mutationFn: (request: Parameters<typeof api.updateVisit>[1]) => api.updateVisit(visitId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });
  const deleteVisit = useMutation({
    mutationFn: () => api.deleteVisit(visitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      navigate({ to: "/" });
    },
  });

  if (visit.isLoading) return <div className="empty">불러오는 중입니다.</div>;
  if (!visit.data) return <div className="empty error">방문 기록을 찾을 수 없습니다.</div>;

  return (
    <div className="stack">
      <section className="visit-hero">
        <Link className="back-link" to="/shops/$shopId" params={{ shopId: visit.data.shopId }}>← 라멘집</Link>
        <img src="/assets/default-ramen.png" alt="" />
        <div>
          <span className="pill success">{visit.data.revisitIntention ? "다시 올 거예요" : "재방문 없음"}</span>
          <h1>{visit.data.menuName}</h1>
          <p>{visit.data.shopName}</p>
        </div>
      </section>

      <section className="panel rating-summary">
        <div className="summary-row">
          <span>VISIT DATE</span>
          <strong>{visit.data.visitedAt}</strong>
        </div>
        <div className="summary-row">
          <span>REVISIT</span>
          <strong>{visit.data.revisitIntention ? "있음" : "없음"}</strong>
        </div>
        <div className="rating-rows">
          <RatingRow label="국물" value={visit.data.brothRating} />
          <RatingRow label="면" value={visit.data.noodleRating} />
          <RatingRow label="토핑" value={visit.data.toppingRating} />
          <RatingRow label="종합" value={visit.data.overallRating} />
        </div>
      </section>

      {visit.data.memo ? (
        <section className="panel memo-card">
          <p className="eyebrow">Review memo</p>
          <p>{visit.data.memo}</p>
        </section>
      ) : null}

      <div className="section-header">
        <h2>방문 기록 수정</h2>
        <Button color="danger" onClick={() => deleteVisit.mutate()}>삭제</Button>
      </div>
      <section className="panel narrow">
        <VisitForm shops={shops.data ?? []} initial={visit.data} submitLabel="수정" onSubmit={(request) => updateVisit.mutate(request)} />
      </section>
    </div>
  );
}

function RatingRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="rating-row">
      <span>{label}</span>
      <strong>{"★".repeat(value)}{"☆".repeat(5 - value)}</strong>
    </div>
  );
}
