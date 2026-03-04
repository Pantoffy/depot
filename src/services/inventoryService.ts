import axios from "axios";

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

const apiClient = axios.create({
  baseURL: "/api/Inventory",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const inventoryService = {
  getAllInventories: async (): Promise<InventoryItem[]> => {
    try {
      const response = await apiClient.get<InventoryItem[]>("/List");
      return response.data;
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
