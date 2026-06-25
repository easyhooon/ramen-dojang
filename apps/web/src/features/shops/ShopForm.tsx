import type { CreateShopRequest, ShopResponse } from "@ramen-dojang/api-client";
import { useState } from "react";

const defaultValue: CreateShopRequest = {
  name: "",
  address: "",
  latitude: 37.5665,
  longitude: 126.978,
  phone: "",
  placeUrl: "",
  tagNames: [],
};

export function ShopForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: ShopResponse;
  submitLabel: string;
  onSubmit: (request: CreateShopRequest) => void;
}) {
  const [value, setValue] = useState<CreateShopRequest>(() =>
    initial
      ? {
          name: initial.name,
          address: initial.address,
          latitude: initial.latitude,
          longitude: initial.longitude,
          phone: initial.phone ?? "",
          placeUrl: initial.placeUrl ?? "",
          tagNames: initial.tags,
        }
      : defaultValue,
  );
  const [tags, setTags] = useState(value.tagNames?.join(", ") ?? "");

  return (
    <form
      className="form-grid"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...value,
          phone: value.phone || null,
          placeUrl: value.placeUrl || null,
          tagNames: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        });
        if (!initial) {
          setValue(defaultValue);
          setTags("");
        }
      }}
    >
      <label>
        이름
        <input value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} required />
      </label>
      <label>
        주소
        <input value={value.address} onChange={(event) => setValue({ ...value, address: event.target.value })} required />
      </label>
      <label>
        위도
        <input type="number" step="0.000001" value={value.latitude} onChange={(event) => setValue({ ...value, latitude: Number(event.target.value) })} required />
      </label>
      <label>
        경도
        <input type="number" step="0.000001" value={value.longitude} onChange={(event) => setValue({ ...value, longitude: Number(event.target.value) })} required />
      </label>
      <label>
        전화번호
        <input value={value.phone ?? ""} onChange={(event) => setValue({ ...value, phone: event.target.value })} />
      </label>
      <label>
        장소 URL
        <input value={value.placeUrl ?? ""} onChange={(event) => setValue({ ...value, placeUrl: event.target.value })} />
      </label>
      <label className="full">
        태그
        <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="쇼유, 이에케이" />
      </label>
      <button className="primary" type="submit">{submitLabel}</button>
    </form>
  );
}

