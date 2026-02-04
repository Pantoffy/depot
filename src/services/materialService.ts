import axios from "axios";

// Interface matching C# Material model
export interface Material {
  id?: number;
  code: string;
  name: string;
  categoryId: number;
  unitId: number;
  supplierId: number;
  stockQuantity: number;
  note?: string;
  status?: string;
  createdTime?: string;
  supplier?: {
    id: number;
    name: string;
  };
}

// Create axios instance with base configuration
// Sử dụng Vite proxy - request sẽ đi qua localhost:5173/api rồi proxy sang backend
const apiClient = axios.create({
  baseURL: "/api/Material/api/materials",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const materialService = {
  // GET all materials
  getAllMaterials: async (): Promise<Material[]> => {
    try {
      const response = await apiClient.get<Material[]>("");
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

  // GET material by ID
  getMaterialById: async (id: number): Promise<Material> => {
    try {
      const response = await apiClient.get<Material>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching material:", error.message);
      }
      throw error;
    }
  },

  // POST create new material
  createMaterial: async (material: Omit<Material, "id" | "createdTime">): Promise<Material> => {
    try {
      const response = await apiClient.post<Material>("", material);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating material:", error.message);
      }
      throw error;
    }
  },

  // PUT update material
  updateMaterial: async (id: number, material: Omit<Material, "id" | "createdTime">): Promise<Material> => {
    try {
      const response = await apiClient.put<Material>(`/${id}`, material);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating material:", error.message);
      }
      throw error;
    }
  },

  // DELETE material
  deleteMaterial: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting material:", error.message);
      }
      throw error;
    }
  },
};
