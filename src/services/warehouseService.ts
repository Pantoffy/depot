import axios from "axios";
import { createApiClient } from "./apiClient";

// Interface matching C# Warehouse model
export interface Warehouse {
  id?: number;
  code: string;
  name: string;
  typeId: number;
  address?: string;
  area?: number;
  managerName?: string;
  managerPhone?: string;
  status?: string;
  note?: string;
  createdTime?: string;
}

// Create axios instance with base configuration
// Sử dụng Vite proxy - request sẽ đi qua localhost:5173/api rồi proxy sang backend
const apiClient = createApiClient("/api/Warehouse");

export const warehouseService = {
  // GET all Warehouses
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    try {
      const response = await apiClient.get<Warehouse[]>("/List");
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

  // GET Warehouse by ID
  getWarehouseById: async (id: number): Promise<Warehouse> => {
    try {
      const response = await apiClient.get<Warehouse>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching warehouse:", error.message);
      }
      throw error;
    }
  },

  // POST create new Warehouse
  createWarehouse: async (warehouse: Omit<Warehouse, "id" | "createdTime">): Promise<Warehouse> => {
    try {
      const response = await apiClient.post<Warehouse>("/Add", warehouse);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating warehouse:", error.message);
      }
      throw error;
    }
  },

  // PUT update Warehouse
  updateWarehouse: async (id: number, warehouse: Omit<Warehouse, "id" | "createdTime">): Promise<Warehouse> => {
    try {
      const response = await apiClient.put<Warehouse>(`/${id}`, warehouse);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating warehouse:", error.message);
      }
      throw error;
    }
  },

  // DELETE Warehouse
  deleteWarehouse: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting warehouse:", error.message);
      }
      throw error;
    }
  },
};
