import axios from "axios";
import { createApiClient } from "./apiClient";

// Interface matching C# Supplier model
export interface Supplier {
  id?: number;
  code: string;
  type: string;
  name?: string;
  contactPerson?: string;
  title?: string;
  phone?: string;
  email?: string;
  role?: string;
  citizenId?: string;
  address?: string;
  status: string;
  createdTime?: string;
}

// Create axios instance with base configuration
// Sử dụng Vite proxy - request sẽ đi qua localhost:5173/api rồi proxy sang backend
const apiClient = createApiClient("/api/Supplier");

export const supplierService = {
  // GET all suppliers
  getAllSuppliers: async (): Promise<Supplier[]> => {
    try {
      const response = await apiClient.get<Supplier[]>("/List");
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

  // GET supplier by ID
  getSupplierById: async (id: number): Promise<Supplier> => {
    try {
      const response = await apiClient.get<Supplier>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching supplier:", error.message);
      }
      throw error;
    }
  },

  // POST create new supplier
  createSupplier: async (supplier: Omit<Supplier, "id" | "createdTime">): Promise<Supplier> => {
    try {
      const response = await apiClient.post<Supplier>("/Add", supplier);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating supplier:", error.message);
      }
      throw error;
    }
  },

  // PUT update supplier
  updateSupplier: async (id: number, supplier: Omit<Supplier, "id" | "createdTime">): Promise<Supplier> => {
    try {
      const response = await apiClient.put<Supplier>(`/${id}`, supplier);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating supplier:", error.message);
      }
      throw error;
    }
  },

  // DELETE supplier
  deleteSupplier: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting supplier:", error.message);
      }
      throw error;
    }
  },
};
