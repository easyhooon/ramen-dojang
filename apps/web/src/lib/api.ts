import type {
  CreateVisitRequest,
  CreateWishlistRequest,
  ShopListParams,
  ShopResponse,
  UpdateVisitRequest,
  UUID,
  VisitResponse,
  WishlistResponse,
} from "@ramen-dojang/api-client";
import { createRamenApiClient } from "@ramen-dojang/api-client";

const storageKey = "ramen-dojang:v1";
const catalogApi = createRamenApiClient(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080");

interface LocalData {
  visits: LocalVisit[];
  wishlist: LocalWishlist[];
}

interface LocalVisit extends CreateVisitRequest {
  id: UUID;
}

interface LocalWishlist extends CreateWishlistRequest {
  createdAt: string;
}

export const api = {
  health: catalogApi.health,
  listShops: async (params: ShopListParams = {}) =>
    (await catalogApi.listShops({ name: optionalText(params.name) }))
      .map((shop) => withLocalShopState(shop, readData()))
      .filter((shop) => params.visited === undefined || shop.visited === params.visited),
  getShop: async (shopId: UUID) => withLocalShopState(await catalogApi.getShop(shopId), readData()),
  createShop: catalogApi.createShop,
  updateShop: catalogApi.updateShop,
  deleteShop: async (shopId: UUID) => {
    const data = readData();
    await catalogApi.deleteShop(shopId);
    writeData({
      visits: data.visits.filter((visit) => visit.shopId !== shopId),
      wishlist: data.wishlist.filter((item) => item.shopId !== shopId),
    });
  },
  listVisits: async () => toVisitResponses(readData(), await listCatalogShops()),
  listShopVisits: async (shopId: UUID) => (await toVisitResponses(readData(), await listCatalogShops())).filter((visit) => visit.shopId === shopId),
  getVisit: async (visitId: UUID) => {
    const visit = (await toVisitResponses(readData(), await listCatalogShops())).find((item) => item.id === visitId);
    if (!visit) throw new Error("Visit not found.");
    return visit;
  },
  createVisit: async (body: CreateVisitRequest) => {
    const data = readData();
    const visit: LocalVisit = { ...body, id: createId() };
    writeData({ ...data, visits: [...data.visits, visit] });
    return toVisitResponse(visit, await listCatalogShops());
  },
  updateVisit: async (visitId: UUID, body: UpdateVisitRequest) => {
    const data = readData();
    const visits = data.visits.map((visit) => (visit.id === visitId ? { ...body, id: visitId } : visit));
    writeData({ ...data, visits });
    const visit = readData().visits.find((item) => item.id === visitId);
    if (!visit) throw new Error("Visit not found.");
    return toVisitResponse(visit, await listCatalogShops());
  },
  deleteVisit: async (visitId: UUID) => {
    const data = readData();
    writeData({ ...data, visits: data.visits.filter((visit) => visit.id !== visitId) });
  },
  listWishlist: async () => {
    const data = readData();
    const shops = await listCatalogShops();
    return data.wishlist.map((item): WishlistResponse => ({
      shopId: item.shopId,
      shopName: shops.find((shop) => shop.id === item.shopId)?.name ?? "삭제된 라멘집",
      note: item.note ?? null,
      createdAt: item.createdAt,
    }));
  },
  addWishlist: async (body: CreateWishlistRequest) => {
    const data = readData();
    const next = data.wishlist.filter((item) => item.shopId !== body.shopId);
    const item: LocalWishlist = { ...body, createdAt: new Date().toISOString() };
    writeData({ ...data, wishlist: [...next, item] });
    return (await api.listWishlist()).find((wishlist) => wishlist.shopId === body.shopId)!;
  },
  removeWishlist: async (shopId: UUID) => {
    const data = readData();
    writeData({ ...data, wishlist: data.wishlist.filter((item) => item.shopId !== shopId) });
  },
};

const readData = (): LocalData => {
  const storage = getStorage();
  if (!storage) return emptyData();

  const raw = storage.getItem(storageKey);
  if (!raw) return emptyData();

  try {
    const parsed = JSON.parse(raw) as Partial<LocalData>;
    return {
      visits: parsed.visits ?? [],
      wishlist: parsed.wishlist ?? [],
    };
  } catch {
    return emptyData();
  }
};

const writeData = (data: LocalData) => {
  getStorage()?.setItem(storageKey, JSON.stringify(data));
};

const emptyData = (): LocalData => ({ visits: [], wishlist: [] });

const optionalText = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const getStorage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const createId = (): UUID => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const withLocalShopState = (shop: ShopResponse, data: LocalData): ShopResponse => {
  const visits = data.visits.filter((visit) => visit.shopId === shop.id);
  const averageRating = visits.length === 0 ? null : visits.reduce((sum, visit) => sum + visit.overallRating, 0) / visits.length;

  return {
    ...shop,
    visited: visits.length > 0,
    wishlisted: data.wishlist.some((item) => item.shopId === shop.id),
    averageRating,
  };
};

const listCatalogShops = () => catalogApi.listShops();

const toVisitResponses = (data: LocalData, shops: ShopResponse[]): VisitResponse[] =>
  data.visits
    .map((visit) => toVisitResponse(visit, shops))
    .sort((left, right) => right.visitedAt.localeCompare(left.visitedAt));

const toVisitResponse = (visit: LocalVisit, shops: ShopResponse[]): VisitResponse => ({
  id: visit.id,
  shopId: visit.shopId,
  shopName: shops.find((shop) => shop.id === visit.shopId)?.name ?? "삭제된 라멘집",
  visitedAt: visit.visitedAt,
  menuName: visit.menuName,
  brothRating: visit.brothRating,
  noodleRating: visit.noodleRating,
  toppingRating: visit.toppingRating,
  overallRating: visit.overallRating,
  revisitIntention: visit.revisitIntention,
  memo: visit.memo ?? null,
});
