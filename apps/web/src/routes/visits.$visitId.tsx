import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visits"] }),
  });
  const deleteVisit = useMutation({
    mutationFn: () => api.deleteVisit(visitId),
    onSuccess: () => navigate({ to: "/" }),
  });

  if (visit.isLoading) return <div className="empty">불러오는 중입니다.</div>;
  if (!visit.data) return <div className="empty error">방문 기록을 찾을 수 없습니다.</div>;

  return (
    <div className="stack">
      <div className="section-header">
        <div>
          <Link className="back-link" to="/shops/$shopId" params={{ shopId: visit.data.shopId }}>← 라멘집</Link>
          <h1>{visit.data.menuName}</h1>
          <p className="muted">{visit.data.shopName} · {visit.data.visitedAt}</p>
        </div>
        <button className="danger" onClick={() => deleteVisit.mutate()}>삭제</button>
      </div>
      <section className="panel narrow">
        <h2>방문 기록 수정</h2>
        <VisitForm shops={shops.data ?? []} initial={visit.data} submitLabel="수정" onSubmit={(request) => updateVisit.mutate(request)} />
      </section>
    </div>
  );
}

