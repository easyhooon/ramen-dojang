import type { CreateShopRequest, ShopResponse } from "@ramen-dojang/api-client";
import { Button, TextField } from "@toss/tds-mobile";
import { useState } from "react";

const defaultValue: CreateShopRequest = {
  name: "",
  address: "",
  latitude: 37.5665,
  longitude: 126.978,
  phone: "",
  placeUrl: "",
  thumbnailUrl: "/assets/default-ramen.svg",
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
          thumbnailUrl: initial.thumbnailUrl,
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
          thumbnailUrl: value.thumbnailUrl || null,
          tagNames: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        });
        if (!initial) {
          setValue(defaultValue);
          setTags("");
        }
      }}
    >
      <TextField variant="box" label="이름" value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} required />
      <TextField variant="box" label="주소" value={value.address} onChange={(event) => setValue({ ...value, address: event.target.value })} required />
      <TextField variant="box" label="위도" type="number" step="0.000001" value={value.latitude} onChange={(event) => setValue({ ...value, latitude: Number(event.target.value) })} required />
      <TextField variant="box" label="경도" type="number" step="0.000001" value={value.longitude} onChange={(event) => setValue({ ...value, longitude: Number(event.target.value) })} required />
      <TextField variant="box" label="전화번호" value={value.phone ?? ""} onChange={(event) => setValue({ ...value, phone: event.target.value })} />
      <TextField variant="box" label="장소 URL" value={value.placeUrl ?? ""} onChange={(event) => setValue({ ...value, placeUrl: event.target.value })} />
      <TextField className="full" variant="box" label="썸네일 URL" value={value.thumbnailUrl ?? ""} onChange={(event) => setValue({ ...value, thumbnailUrl: event.target.value })} />
      <TextField className="full" variant="box" label="태그" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="쇼유, 이에케이" />
      <Button type="submit" display="full">{submitLabel}</Button>
    </form>
  );
}
