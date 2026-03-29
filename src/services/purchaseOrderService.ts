import axios from "axios";

export interface PurchaseOrderDetail {
  id?: number;
  purchaseOrderId: number;
  materialId: number;
  unitId: number;
  quantity: number;
  unitPrice: number;
  amount?: number;
  note?: string;
  material?: {
    id: number;
    code?: string;
    name: string;
  };
}

export interface PurchaseOrder {
  id?: number;
  code: string;
  poNumber: string;
  orderDate: string;
  supplierId: number;
  expectedDeliveryDate?: string | null;
  totalAmount?: number;
  status: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string | null;
  note?: string;
  createdAt?: string;
  supplier?: {
    id: number;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  purchaseOrderDetails?: PurchaseOrderDetail[];
}

const apiClient = axios.create({
  baseURL: "/api/PurchaseOrder",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const purchaseOrderService = {
  getAllPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<PurchaseOrder[]>("/List");
    return response.data;
  },

  getPurchaseOrderById: async (id: number): Promise<PurchaseOrder> => {
    const response = await apiClient.get<PurchaseOrder>(`/${id}`);
    return response.data;
  },

  createPurchaseOrder: async (
    purchaseOrder: Omit<PurchaseOrder, "id" | "createdAt">
  ): Promise<PurchaseOrder> => {
    const response = await apiClient.post<PurchaseOrder>("/Add", purchaseOrder);
    return response.data;
  },

  updatePurchaseOrder: async (
    id: number,
    purchaseOrder: Omit<PurchaseOrder, "id" | "createdAt">
  ): Promise<PurchaseOrder> => {
    const response = await apiClient.put<PurchaseOrder>(`/${id}`, purchaseOrder);
    return response.data;
  },

  deletePurchaseOrder: async (id: number): Promise<void> => {
    await apiClient.delete(`/${id}`);
  },
};
