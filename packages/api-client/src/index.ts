export type UUID = string;

export interface ShopResponse {
  id: UUID;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  placeUrl: string | null;
  tags: string[];
  visited: boolean;
  wishlisted: boolean;
  averageRating: number | null;
}

export interface CreateShopRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  placeUrl?: string | null;
  tagNames?: string[];
}

export type UpdateShopRequest = CreateShopRequest;

export interface VisitResponse {
  id: UUID;
  shopId: UUID;
  shopName: string;
  visitedAt: string;
  menuName: string;
  brothRating: number;
  noodleRating: number;
  toppingRating: number;
  overallRating: number;
  revisitIntention: boolean;
  memo: string | null;
}

export interface CreateVisitRequest {
  shopId: UUID;
  visitedAt: string;
  menuName: string;
  brothRating: number;
  noodleRating: number;
  toppingRating: number;
  overallRating: number;
  revisitIntention: boolean;
  memo?: string | null;
}

export type UpdateVisitRequest = CreateVisitRequest;

export interface WishlistResponse {
  shopId: UUID;
  shopName: string;
  note: string | null;
  createdAt: string;
}

export interface CreateWishlistRequest {
  shopId: UUID;
  note?: string | null;
}

export interface ShopListParams {
  name?: string;
  tag?: string;
  visited?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export function createRamenApiClient(baseUrl = "http://localhost:8080") {
  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
      ...init,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => undefined);
      throw new ApiError(body?.message ?? "API request failed.", response.status, body?.code);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  };

  const withQuery = (path: string, params: Array<[string, string | boolean | undefined]>) => {
    const query = new URLSearchParams();
    params.forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
    const suffix = query.toString();
    return suffix ? `${path}?${suffix}` : path;
  };

  return {
    health: () => request<{ status: string }>("/health"),
    listShops: (params: ShopListParams = {}) =>
      request<ShopResponse[]>(
        withQuery("/shops", [
          ["name", params.name],
          ["tag", params.tag],
          ["visited", params.visited],
        ]),
      ),
    getShop: (shopId: UUID) => request<ShopResponse>(`/shops/${shopId}`),
    createShop: (body: CreateShopRequest) =>
      request<ShopResponse>("/shops", { method: "POST", body: JSON.stringify(body) }),
    updateShop: (shopId: UUID, body: UpdateShopRequest) =>
      request<ShopResponse>(`/shops/${shopId}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteShop: (shopId: UUID) => request<void>(`/shops/${shopId}`, { method: "DELETE" }),
    listVisits: () => request<VisitResponse[]>("/visits"),
    listShopVisits: (shopId: UUID) => request<VisitResponse[]>(`/shops/${shopId}/visits`),
    getVisit: (visitId: UUID) => request<VisitResponse>(`/visits/${visitId}`),
    createVisit: (body: CreateVisitRequest) =>
      request<VisitResponse>("/visits", { method: "POST", body: JSON.stringify(body) }),
    updateVisit: (visitId: UUID, body: UpdateVisitRequest) =>
      request<VisitResponse>(`/visits/${visitId}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteVisit: (visitId: UUID) => request<void>(`/visits/${visitId}`, { method: "DELETE" }),
    listWishlist: () => request<WishlistResponse[]>("/wishlist"),
    addWishlist: (body: CreateWishlistRequest) =>
      request<WishlistResponse>("/wishlist", { method: "POST", body: JSON.stringify(body) }),
    removeWishlist: (shopId: UUID) => request<void>(`/wishlist/${shopId}`, { method: "DELETE" }),
  };
}
