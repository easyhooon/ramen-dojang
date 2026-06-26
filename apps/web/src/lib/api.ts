import type {
  CreateShopRequest,
  CreateVisitRequest,
  CreateWishlistRequest,
  ShopListParams,
  ShopResponse,
  UpdateShopRequest,
  UpdateVisitRequest,
  UUID,
  VisitResponse,
  WishlistResponse,
} from "@ramen-dojang/api-client";

const storageKey = "ramen-dojang:v1";

interface LocalData {
  shops: LocalShop[];
  visits: LocalVisit[];
  wishlist: LocalWishlist[];
}

interface LocalShop extends CreateShopRequest {
  id: UUID;
}

interface LocalVisit extends CreateVisitRequest {
  id: UUID;
}

interface LocalWishlist extends CreateWishlistRequest {
  createdAt: string;
}

export const api = {
  health: async () => ({ status: "ok" }),
  listShops: async (params: ShopListParams = {}) => toShopResponses(readData()).filter((shop) => matchesShop(shop, params)),
  getShop: async (shopId: UUID) => requireShop(readData(), shopId),
  createShop: async (body: CreateShopRequest) => {
    const data = readData();
    const shop: LocalShop = { ...body, id: createId(), tagNames: body.tagNames ?? [] };
    writeData({ ...data, shops: [...data.shops, shop] });
    return toShopResponse(readData(), shop);
  },
  updateShop: async (shopId: UUID, body: UpdateShopRequest) => {
    const data = readData();
    const shops = data.shops.map((shop) => (shop.id === shopId ? { ...body, id: shopId, tagNames: body.tagNames ?? [] } : shop));
    writeData({ ...data, shops });
    return requireShop(readData(), shopId);
  },
  deleteShop: async (shopId: UUID) => {
    const data = readData();
    writeData({
      shops: data.shops.filter((shop) => shop.id !== shopId),
      visits: data.visits.filter((visit) => visit.shopId !== shopId),
      wishlist: data.wishlist.filter((item) => item.shopId !== shopId),
    });
  },
  listVisits: async () => toVisitResponses(readData()),
  listShopVisits: async (shopId: UUID) => toVisitResponses(readData()).filter((visit) => visit.shopId === shopId),
  getVisit: async (visitId: UUID) => {
    const visit = toVisitResponses(readData()).find((item) => item.id === visitId);
    if (!visit) throw new Error("Visit not found.");
    return visit;
  },
  createVisit: async (body: CreateVisitRequest) => {
    const data = readData();
    const visit: LocalVisit = { ...body, id: createId() };
    writeData({ ...data, visits: [...data.visits, visit] });
    return toVisitResponse(readData(), visit);
  },
  updateVisit: async (visitId: UUID, body: UpdateVisitRequest) => {
    const data = readData();
    const visits = data.visits.map((visit) => (visit.id === visitId ? { ...body, id: visitId } : visit));
    writeData({ ...data, visits });
    const visit = readData().visits.find((item) => item.id === visitId);
    if (!visit) throw new Error("Visit not found.");
    return toVisitResponse(readData(), visit);
  },
  deleteVisit: async (visitId: UUID) => {
    const data = readData();
    writeData({ ...data, visits: data.visits.filter((visit) => visit.id !== visitId) });
  },
  listWishlist: async () => {
    const data = readData();
    return data.wishlist.map((item): WishlistResponse => ({
      shopId: item.shopId,
      shopName: data.shops.find((shop) => shop.id === item.shopId)?.name ?? "삭제된 라멘집",
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
      shops: parsed.shops ?? [],
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

const emptyData = (): LocalData => ({ shops: [], visits: [], wishlist: [] });

const getStorage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const createId = (): UUID => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const requireShop = (data: LocalData, shopId: UUID): ShopResponse => {
  const shop = data.shops.find((item) => item.id === shopId);
  if (!shop) throw new Error("Shop not found.");
  return toShopResponse(data, shop);
};

const toShopResponses = (data: LocalData): ShopResponse[] =>
  data.shops.map((shop) => toShopResponse(data, shop)).sort((left, right) => left.name.localeCompare(right.name, "ko"));

const toShopResponse = (data: LocalData, shop: LocalShop): ShopResponse => {
  const visits = data.visits.filter((visit) => visit.shopId === shop.id);
  const averageRating = visits.length === 0 ? null : visits.reduce((sum, visit) => sum + visit.overallRating, 0) / visits.length;

  return {
    id: shop.id,
    name: shop.name,
    address: shop.address,
    latitude: shop.latitude,
    longitude: shop.longitude,
    phone: shop.phone ?? null,
    placeUrl: shop.placeUrl ?? null,
    tags: shop.tagNames ?? [],
    visited: visits.length > 0,
    wishlisted: data.wishlist.some((item) => item.shopId === shop.id),
    averageRating,
  };
};

const matchesShop = (shop: ShopResponse, params: ShopListParams): boolean =>
  (!params.name || shop.name.toLowerCase().includes(params.name.toLowerCase())) &&
  (!params.tag || shop.tags.some((tag) => tag.toLowerCase().includes(params.tag!.toLowerCase()))) &&
  (params.visited === undefined || shop.visited === params.visited);

const toVisitResponses = (data: LocalData): VisitResponse[] =>
  data.visits
    .map((visit) => toVisitResponse(data, visit))
    .sort((left, right) => right.visitedAt.localeCompare(left.visitedAt));

const toVisitResponse = (data: LocalData, visit: LocalVisit): VisitResponse => ({
  id: visit.id,
  shopId: visit.shopId,
  shopName: data.shops.find((shop) => shop.id === visit.shopId)?.name ?? "삭제된 라멘집",
  visitedAt: visit.visitedAt,
  menuName: visit.menuName,
  brothRating: visit.brothRating,
  noodleRating: visit.noodleRating,
  toppingRating: visit.toppingRating,
  overallRating: visit.overallRating,
  revisitIntention: visit.revisitIntention,
  memo: visit.memo ?? null,
});
