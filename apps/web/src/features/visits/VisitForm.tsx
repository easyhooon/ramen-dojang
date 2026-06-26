import type { CreateVisitRequest, ShopResponse, VisitResponse } from "@ramen-dojang/api-client";
import { Button, TextArea, TextField } from "@toss/tds-mobile";
import { useState } from "react";

export function VisitForm({
  shops,
  initial,
  shopId,
  submitLabel,
  onSubmit,
}: {
  shops: ShopResponse[];
  initial?: VisitResponse;
  shopId?: string;
  submitLabel: string;
  onSubmit: (request: CreateVisitRequest) => void;
}) {
  const [value, setValue] = useState<CreateVisitRequest>(() => ({
    shopId: initial?.shopId ?? shopId ?? shops[0]?.id ?? "",
    visitedAt: initial?.visitedAt ?? new Date().toISOString().slice(0, 10),
    menuName: initial?.menuName ?? "",
    brothRating: initial?.brothRating ?? 3,
    noodleRating: initial?.noodleRating ?? 3,
    toppingRating: initial?.toppingRating ?? 3,
    overallRating: initial?.overallRating ?? 3,
    revisitIntention: initial?.revisitIntention ?? true,
    memo: initial?.memo ?? "",
  }));

  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ ...value, memo: value.memo || null });
        if (!initial) setValue({ ...value, menuName: "", memo: "" });
      }}
    >
      <label>
        라멘집
        <select value={value.shopId} onChange={(event) => setValue({ ...value, shopId: event.target.value })} disabled={Boolean(shopId)} required>
          {shops.map((shop) => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
        </select>
      </label>
      <TextField variant="box" label="방문일" type="date" value={value.visitedAt} onChange={(event) => setValue({ ...value, visitedAt: event.target.value })} required />
      <TextField className="full" variant="box" label="메뉴" value={value.menuName} onChange={(event) => setValue({ ...value, menuName: event.target.value })} required />
      {(["brothRating", "noodleRating", "toppingRating", "overallRating"] as const).map((key) => (
        <TextField key={key} variant="box" label={ratingLabel[key]} type="number" min="1" max="5" value={value[key]} onChange={(event) => setValue({ ...value, [key]: Number(event.target.value) })} required />
      ))}
      <label>
        재방문
        <select value={String(value.revisitIntention)} onChange={(event) => setValue({ ...value, revisitIntention: event.target.value === "true" })}>
          <option value="true">예</option>
          <option value="false">아니오</option>
        </select>
      </label>
      <TextArea className="full" variant="box" label="메모" value={value.memo ?? ""} onChange={(event) => setValue({ ...value, memo: event.target.value })} minHeight={120} />
      <Button type="submit" display="full" disabled={!value.shopId}>{submitLabel}</Button>
    </form>
  );
}

const ratingLabel = {
  brothRating: "국물",
  noodleRating: "면",
  toppingRating: "토핑",
  overallRating: "종합",
};
