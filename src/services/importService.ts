import axios from "axios";

// Interface matching C# ImportReceipt model
export interface ImportReceipt {
  id?: number;
  code: string;
  receiptNumber: string;
  importTime: string;
  supplierId: number;
  warehouseId: number;
  supplierInvoiceNo?: string;
  documentNo?: string;
  totalAmount?: number;
  status: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
  createdAt: string;
  supplier?: {
    id: number;
    name: string;
  };
  warehouse?: {
    id: number;
    name: string;
  };
  importReceiptDetails?: ImportReceiptDetail[];
}

// Interface matching C# ImportReceiptDetail model
export interface ImportReceiptDetail {
  id?: number;
  importReceiptId: number;
  materialId: number;
  unitId: number;
  quantity: number;
  unitPrice: number;
  amount?: number;
  note?: string;
  importReceipt?: {
    id: number;
    code: string;
    receiptNumber: string;
  };
  material?: {
    id: number;
    name: string;
    code?: string;
  };
}

// Create axios instance with base configuration
// Sử dụng Vite proxy - request sẽ đi qua localhost:5173/api rồi proxy sang backend
const apiClient = axios.create({
  baseURL: "/api/ImportReceipt",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const importService = {
  // GET all import receipts
  getAllImportReceipts: async (): Promise<ImportReceipt[]> => {
    try {
      const response = await apiClient.get<ImportReceipt[]>("/List");
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


  // GET import receipt by ID
  getImportReceiptById: async (id: number): Promise<ImportReceipt> => {
    try {
      const response = await apiClient.get<ImportReceipt>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching import receipt:", error.message);
      }
      throw error;
    }
  },

  // POST create new import receipt
  createImportReceipt: async (importReceipt: Omit<ImportReceipt, "id" | "createdAt">): Promise<ImportReceipt> => {
    try {
      const response = await apiClient.post<ImportReceipt>("/Add", importReceipt);
      return response.  data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating import receipt:", error.message);
      }
      throw error;
    }
  },

  // PUT update import receipt
  updateImportReceipt: async (id: number, importReceipt: Omit<ImportReceipt, "id" | "createdAt">): Promise<ImportReceipt> => {
    try {
      const response = await apiClient.put<ImportReceipt>(`/${id}`, importReceipt);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating import receipt:", error.message);
      }
      throw error;
    }
  },

  // DELETE import receipt
  deleteImportReceipt: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting import receipt:", error.message);
      }
      throw error;
    }
  },
};
