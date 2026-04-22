import axios from "axios";

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }

  const responseData = error.response?.data as any;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    if (typeof responseData.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    if (typeof responseData.title === "string" && responseData.title.trim()) {
      return responseData.title;
    }

    if (typeof responseData.detail === "string" && responseData.detail.trim()) {
      return responseData.detail;
    }

    if (responseData.errors && typeof responseData.errors === "object") {
      const firstErrorField = Object.keys(responseData.errors)[0];
      const firstErrorMessages = responseData.errors[firstErrorField];
      if (Array.isArray(firstErrorMessages) && firstErrorMessages.length > 0) {
        return String(firstErrorMessages[0]);
      }
    }
  }

  if (error.response?.status) {
    return `${fallback} (HTTP ${error.response.status})`;
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
};

export const getImportApiErrorMessage = (
  error: unknown,
  fallback = "Lỗi xử lý phiếu nhập",
) => extractErrorMessage(error, fallback);

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
      const message = extractErrorMessage(error, "Lỗi tải danh sách phiếu nhập");
      console.error("Error fetching import receipts:", message);
      throw new Error(message);
    }
  },


  // GET import receipt by ID
  getImportReceiptById: async (id: number): Promise<ImportReceipt> => {
    try {
      const response = await apiClient.get<ImportReceipt>(`/${id}`);
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error, "Lỗi tải chi tiết phiếu nhập");
      console.error("Error fetching import receipt:", message);
      throw new Error(message);
    }
  },

  // POST create new import receipt
  createImportReceipt: async (importReceipt: Omit<ImportReceipt, "id" | "createdAt">): Promise<ImportReceipt> => {
    try {
      const response = await apiClient.post<ImportReceipt>("/Add", importReceipt);
      return response.  data;
    } catch (error) {
      const message = extractErrorMessage(error, "Lỗi tạo phiếu nhập");
      console.error("Error creating import receipt:", message, {
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
      });
      throw new Error(message);
    }
  },

  // PUT update import receipt
  updateImportReceipt: async (id: number, importReceipt: Omit<ImportReceipt, "id" | "createdAt">): Promise<ImportReceipt> => {
    try {
      const response = await apiClient.put<ImportReceipt>(`/${id}`, importReceipt);
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error, "Lỗi cập nhật phiếu nhập");
      console.error("Error updating import receipt:", message, {
        receiptId: id,
        payload: importReceipt,
        response: axios.isAxiosError(error) ? error.response?.data : undefined,
      });
      throw new Error(message);
    }
  },

  // DELETE import receipt
  deleteImportReceipt: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error) {
      const message = extractErrorMessage(error, "Lỗi xóa phiếu nhập");
      console.error("Error deleting import receipt:", message);
      throw new Error(message);
    }
  },
};
