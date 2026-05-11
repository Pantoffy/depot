export type ItemType = "material" | "asset" | "goods";

const STORAGE_KEY = "warehouse_material_item_types";

const isBrowser = () => typeof window !== "undefined";

const normalizeValue = (value?: string | null): ItemType => {
  const normalized = (value || "").trim().toLowerCase();

  if (!normalized) return "material";

  // Recognize English and Vietnamese labels returned by backend
  if (normalized.includes("asset") || normalized.includes("tài sản") || normalized.includes("tai san")) {
    return "asset";
  }

  // Recognize goods (hàng hóa) distinct from raw materials — include many backend variants
  const goodsKeywords = [
    "hàng",
    "hàng hóa",
    "hang hoa",
    "hanghoa",
    "hang-hoa",
    "goods",
    "good",
    "product",
    "products",
    "merch",
    "merchandise",
    "commodity",
  ];

  for (const kw of goodsKeywords) {
    if (normalized.includes(kw)) return "goods";
  }

  // Treat "nguyên liệu" as material
  if (normalized.includes("nguyên") || normalized.includes("nguyên liệu") || normalized.includes("nguyen lieu")) {
    return "material";
  }

  // Fallback to material for unknown values
  return "material";
};

const readMap = (): Record<number, ItemType> => {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, string>;
    const result: Record<number, ItemType> = {};

    Object.entries(parsed || {}).forEach(([key, value]) => {
      const id = Number(key);
      if (!Number.isFinite(id) || id <= 0) return;
      result[id] = normalizeValue(value);
    });

    return result;
  } catch {
    return {};
  }
};

const writeMap = (value: Record<number, ItemType>) => {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore localStorage write errors in private mode or storage limits.
  }
};

export const getStoredItemType = (materialId?: number): ItemType | undefined => {
  if (!materialId) return undefined;
  const map = readMap();
  return map[materialId];
};

export const setStoredItemType = (materialId: number, itemType: ItemType) => {
  if (!materialId) return;
  const map = readMap();
  map[materialId] = normalizeValue(itemType);
  writeMap(map);
};

export const resolveMaterialItemType = (material?: {
  id?: number;
  itemType?: string;
}): ItemType => {
  const apiType = normalizeValue(material?.itemType);
  if (material?.itemType && apiType) {
    return apiType;
  }

  if (!material?.id) return "material";
  return getStoredItemType(material.id) || "material";
};

export const hydrateMaterialsItemType = <T extends { id?: number; itemType?: string }>(
  materials: T[],
): Array<T & { itemType: ItemType }> => {
  return (materials || []).map((material) => ({
    ...material,
    itemType: resolveMaterialItemType(material),
  }));
};
