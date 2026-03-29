import axios from "axios";

export type ExportReceiptStatus = "Pending" | "Approved";

// Interface matching C# ExportReceipt model
export interface ExportReceipt {
  id?: number;
  code: string;
  receiptNumber: string;
  exportDate: string;
  warehouseId: number;
  receiverName: string;
  reason: string;
  documentNo?: string;
  totalAmount?: number;
  status: ExportReceiptStatus;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  note?: string;
  createdAt: string;
  warehouse?: {
    id: number;
    name: string;
  };
  exportReceiptDetails?: ExportReceiptDetail[];
}

// Interface matching C# ExportReceiptDetail model
export interface ExportReceiptDetail {
  id?: number;
  exportReceiptId: number;
  materialId: number;
  unitId: number;
  quantity: number;
  unitPrice?: number;
  amount?: number;
  note?: string;
  exportReceipt?: {
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

// Sử dụng Vite proxy - request sẽ đi qua localhost:5173/api rồi proxy sang backend
const apiClient = axios.create({
  baseURL: "/api/ExportReceipt",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const exportService = {
  // GET all export receipts
  getAllExportReceipts: async (): Promise<ExportReceipt[]> => {
    try {
      const response = await apiClient.get<ExportReceipt[]>("/List");
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

  // GET export receipt by ID
  getExportReceiptById: async (id: number): Promise<ExportReceipt> => {
    try {
      const response = await apiClient.get<ExportReceipt>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching export receipt:", error.message);
      }
      throw error;
    }
  },

  // POST create new export receipt
  createExportReceipt: async (exportReceipt: Omit<ExportReceipt, "id" | "createdAt">): Promise<ExportReceipt> => {
    try {
      const response = await apiClient.post<ExportReceipt>("/Add", exportReceipt);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating export receipt:", error.response?.status, error.response?.data || error.message);
      }
      throw error;
    }
  },

  // PUT update export receipt
  updateExportReceipt: async (id: number, exportReceipt: Omit<ExportReceipt, "id" | "createdAt">): Promise<ExportReceipt> => {
    try {
      const response = await apiClient.put<ExportReceipt>(`/${id}`, exportReceipt);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error updating export receipt:", error.response?.status, error.response?.data || error.message);
      }
      throw error;
    }
  },

  // DELETE export receipt
  deleteExportReceipt: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error deleting export receipt:", error.message);
      }
      throw error;
    }
  },
};
