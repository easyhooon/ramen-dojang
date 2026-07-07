import {
  Configuration,
  HealthApi,
  ResponseError,
  ShopsApi,
  VisitsApi,
  WishlistApi,
} from "./generated";
import type {
  CreateShopRequest as GeneratedCreateShopRequest,
  CreateVisitRequest as GeneratedCreateVisitRequest,
  CreateWishlistRequest as GeneratedCreateWishlistRequest,
  ShopResponse as GeneratedShopResponse,
  UpdateShopRequest as GeneratedUpdateShopRequest,
  UpdateVisitRequest as GeneratedUpdateVisitRequest,
  VisitResponse as GeneratedVisitResponse,
  WishlistResponse as GeneratedWishlistResponse,
} from "./generated";

export * as Generated from "./generated";
export { Configuration, HealthApi, ShopsApi, VisitsApi, WishlistApi };

export type UUID = string;

export interface ShopResponse {
  id: UUID;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  placeUrl: string | null;
  thumbnailUrl: string;
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
  thumbnailUrl?: string | null;
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
  const configuration = new Configuration({ basePath: baseUrl });
  const healthApi = new HealthApi(configuration);
  const shopsApi = new ShopsApi(configuration);
  const visitsApi = new VisitsApi(configuration);
  const wishlistApi = new WishlistApi(configuration);

  return {
    health: () => call(() => healthApi.getHealth()),
    listShops: (params: ShopListParams = {}) =>
      call(() => shopsApi.listShops(params)).then((shops) => shops.map(fromGeneratedShop)),
    getShop: (shopId: UUID) => call(() => shopsApi.getShop({ shopId })).then(fromGeneratedShop),
    createShop: (body: CreateShopRequest) =>
      call(() => shopsApi.createShop({ createShopRequest: toGeneratedShopRequest(body) })).then(fromGeneratedShop),
    updateShop: (shopId: UUID, body: UpdateShopRequest) =>
      call(() => shopsApi.updateShop({ shopId, updateShopRequest: toGeneratedShopRequest(body) })).then(fromGeneratedShop),
    deleteShop: (shopId: UUID) => call(() => shopsApi.deleteShop({ shopId })),
    listVisits: () => call(() => visitsApi.listVisits()).then((visits) => visits.map(fromGeneratedVisit)),
    listShopVisits: (shopId: UUID) =>
      call(() => visitsApi.listShopVisits({ shopId })).then((visits) => visits.map(fromGeneratedVisit)),
    getVisit: (visitId: UUID) => call(() => visitsApi.getVisit({ visitId })).then(fromGeneratedVisit),
    createVisit: (body: CreateVisitRequest) =>
      call(() => visitsApi.createVisit({ createVisitRequest: toGeneratedVisitRequest(body) })).then(fromGeneratedVisit),
    updateVisit: (visitId: UUID, body: UpdateVisitRequest) =>
      call(() => visitsApi.updateVisit({ visitId, updateVisitRequest: toGeneratedVisitRequest(body) })).then(fromGeneratedVisit),
    deleteVisit: (visitId: UUID) => call(() => visitsApi.deleteVisit({ visitId })),
    listWishlist: () => call(() => wishlistApi.listWishlist()).then((items) => items.map(fromGeneratedWishlist)),
    addWishlist: (body: CreateWishlistRequest) =>
      call(() => wishlistApi.upsertWishlist({ createWishlistRequest: toGeneratedWishlistRequest(body) })).then(fromGeneratedWishlist),
    removeWishlist: (shopId: UUID) => call(() => wishlistApi.deleteWishlist({ shopId })),
  };
}

const call = async <T>(request: () => Promise<T>): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    return handleApiError(error);
  }
};

const handleApiError = async (error: unknown): Promise<never> => {
  if (error instanceof ResponseError) {
    const body = await error.response.clone().json().catch(() => undefined);
    throw new ApiError(body?.message ?? "API request failed.", error.response.status, body?.code);
  }

  throw error;
};

const toGeneratedShopRequest = (request: CreateShopRequest): GeneratedCreateShopRequest & GeneratedUpdateShopRequest => ({
  name: request.name,
  address: request.address,
  latitude: request.latitude,
  longitude: request.longitude,
  phone: request.phone || undefined,
  placeUrl: request.placeUrl || undefined,
  thumbnailUrl: request.thumbnailUrl || undefined,
  tagNames: request.tagNames ?? [],
});

const toGeneratedVisitRequest = (request: CreateVisitRequest): GeneratedCreateVisitRequest & GeneratedUpdateVisitRequest => ({
  shopId: request.shopId,
  visitedAt: toDate(request.visitedAt),
  menuName: request.menuName,
  brothRating: request.brothRating,
  noodleRating: request.noodleRating,
  toppingRating: request.toppingRating,
  overallRating: request.overallRating,
  revisitIntention: request.revisitIntention,
  memo: request.memo || undefined,
});

const toGeneratedWishlistRequest = (request: CreateWishlistRequest): GeneratedCreateWishlistRequest => ({
  shopId: request.shopId,
  note: request.note || undefined,
});

const fromGeneratedShop = (shop: GeneratedShopResponse): ShopResponse => ({
  id: shop.id,
  name: shop.name,
  address: shop.address,
  latitude: shop.latitude,
  longitude: shop.longitude,
  phone: shop.phone ?? null,
  placeUrl: shop.placeUrl ?? null,
  thumbnailUrl: shop.thumbnailUrl ?? "/assets/default-ramen.svg",
  tags: shop.tags,
  visited: shop.visited,
  wishlisted: shop.wishlisted,
  averageRating: shop.averageRating ?? null,
});

const fromGeneratedVisit = (visit: GeneratedVisitResponse): VisitResponse => ({
  id: visit.id,
  shopId: visit.shopId,
  shopName: visit.shopName,
  visitedAt: toDateString(visit.visitedAt),
  menuName: visit.menuName,
  brothRating: visit.brothRating,
  noodleRating: visit.noodleRating,
  toppingRating: visit.toppingRating,
  overallRating: visit.overallRating,
  revisitIntention: visit.revisitIntention,
  memo: visit.memo ?? null,
});

const fromGeneratedWishlist = (wishlist: GeneratedWishlistResponse): WishlistResponse => ({
  shopId: wishlist.shopId,
  shopName: wishlist.shopName,
  note: wishlist.note ?? null,
  createdAt: toDateTimeString(wishlist.createdAt),
});

const toDate = (date: string): Date => new Date(`${date}T00:00:00.000Z`);

const toDateString = (date: Date | string): string =>
  typeof date === "string" ? date.slice(0, 10) : date.toISOString().slice(0, 10);

const toDateTimeString = (date: Date | string): string =>
  typeof date === "string" ? date : date.toISOString();
