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
      <div className="form-field full">
        <span className="field-label">메뉴</span>
        <TextField variant="box" label="메뉴" value={value.menuName} onChange={(event) => setValue({ ...value, menuName: event.target.value })} required />
      </div>
      {(["brothRating", "noodleRating", "toppingRating", "overallRating"] as const).map((key) => (
        <StarRating key={key} label={ratingLabel[key]} value={value[key]} onChange={(rating) => setValue({ ...value, [key]: rating })} />
      ))}
      <div className="revisit-card full">
        <div>
          <strong>다시 올 거예요?</strong>
          <p>이 가게에 대한 재방문 의사를 기록합니다.</p>
        </div>
        <div className="segmented-control" role="group" aria-label="재방문 의사">
          <button className={!value.revisitIntention ? "active" : ""} type="button" onClick={() => setValue({ ...value, revisitIntention: false })}>없음</button>
          <button className={value.revisitIntention ? "active" : ""} type="button" onClick={() => setValue({ ...value, revisitIntention: true })}>있음</button>
        </div>
      </div>
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

function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (rating: number) => void }) {
  return (
    <fieldset className="star-rating">
      <legend>{label}</legend>
      <div className="star-rating-options">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label className={rating <= value ? "selected" : ""} key={rating}>
            <input
              checked={value === rating}
              name={label}
              onChange={() => onChange(rating)}
              type="radio"
              value={rating}
            />
            <span aria-hidden="true">★</span>
            <span className="sr-only">{rating}점</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
