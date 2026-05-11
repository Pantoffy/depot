import axios from "axios";
import { createApiClient } from "./apiClient";

export interface InventoryWarehouse {
  id: number;
  code: string;
  name: string;
}

export interface InventoryItem {
  id?: number;
  warehouseId: number;
  materialId: number;
  quantity: number;
  updatedDate?: string;
  warehouse?: InventoryWarehouse;
}

const toTimestamp = (value?: string) => {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const normalizeInventories = (items: InventoryItem[]): InventoryItem[] => {
  const grouped = new Map<string, InventoryItem>();

  for (const item of items || []) {
    if (!item || !item.warehouseId || !item.materialId) continue;

    const key = `${item.warehouseId}-${item.materialId}`;
    const existing = grouped.get(key);
    const quantity = Number(item.quantity || 0);

    if (!existing) {
      grouped.set(key, {
        ...item,
        quantity: Math.max(0, quantity),
      });
      continue;
    }

    const existingTimestamp = toTimestamp(existing.updatedDate);
    const currentTimestamp = toTimestamp(item.updatedDate);

    grouped.set(key, {
      ...existing,
      ...item,
      quantity: Math.max(0, Number(existing.quantity || 0) + quantity),
      updatedDate:
        currentTimestamp >= existingTimestamp
          ? item.updatedDate || existing.updatedDate
          : existing.updatedDate,
      warehouse: existing.warehouse || item.warehouse,
    });
  }

  return Array.from(grouped.values());
};

export const buildInventoryQuantityMap = (items: InventoryItem[] = []) => {
  return items.reduce((acc, item) => {
    if (!item || !item.materialId) return acc;

    acc[item.materialId] = (acc[item.materialId] || 0) + Number(item.quantity || 0);
    return acc;
  }, {} as Record<number, number>);
};

export const getInventoryQuantityForMaterial = (
  items: InventoryItem[] = [],
  materialId?: number,
) => {
  if (!materialId) return 0;

  return buildInventoryQuantityMap(items)[materialId] || 0;
};

const apiClient = createApiClient("/api/Inventory");

export const inventoryService = {
  getAllInventories: async (): Promise<InventoryItem[]> => {
    try {
      const response = await apiClient.get<InventoryItem[]>("/List");
      return normalizeInventories(response.data || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("API Error:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("Network Error: Cannot connect to server (CORS/SSL)");
        }
      }
      throw error;
    }
  },
};
