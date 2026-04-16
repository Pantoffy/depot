import axios from "axios";

// Interface matching C# StockCheckDetail model
export interface StockCheckDetail {
    id?: number;
    stockCheckId: number;
    materialId: number;
    systemQuantity: number;
    actualQuantity: number;
    difference: number;
    warehouseId?: number;
    handlingProposal?: string;
    recordedCheck?: boolean;
    reason?: string;
    status?: string;
    stockCheck?: StockCheck;
    material?: {
        id: number;
        code?: string;
        name: string;
    };
    warehouse?: {
        id: number;
        name: string;
    };
}

// Interface matching C# StockCheck model
export interface StockCheck {
    id?: number;
    code: string;
    name: string;
    warehouseId: number;
    startDate?: string;
    endDate?: string;
    closingDate?: string;
    checkTime?: string;
    createdBy?: string;
    approvedBy?: string;
    approvedAt?: string;
    status: string;
    note?: string;
    createdTime?: string;
    warehouse?: {
        id: number;
        name: string;
    };
    stockCheckDetails?: StockCheckDetail[];
}

// Interface matching C# StockCheckTeam model
export interface StockCheckTeam {
    id?: number;
    stockCheckId: number;
    name: string;
    role: string;
    note?: string;
    stockCheck?: StockCheck;
}

// Create axios instance with base configuration
// Sử dụng Vite proxy - request sẽ đi qua localhost:5173/api rồi proxy sang backend
const apiClient = axios.create({
    baseURL: "/api/Stock",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

export const stockService = {
    // ==================== StockCheck Methods ====================
    
    // GET all stock checks
    getAllStockChecks: async (): Promise<StockCheck[]> => {
        try {
            const response = await apiClient.get<StockCheck[]>("/List");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("API Error:", error.response?.status, error.response?.data);
            }
            throw error;
        }
    },

    // GET stock check by ID
    getStockCheckById: async (id: number): Promise<StockCheck> => {
        try {
            const response = await apiClient.get<StockCheck>(`/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching stock check:", error.message);
            }
            throw error;
        }
    },

    // POST create new stock check
    createStockCheck: async (
        stockCheck: Omit<StockCheck, "id" | "createdTime">
    ): Promise<StockCheck> => {
        try {
            const response = await apiClient.post<StockCheck>("/Add", stockCheck);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error creating stock check:", error.response?.status, error.response?.data);
            }
            throw error;
        }
    },

    // PUT update stock check
    updateStockCheck: async (
        id: number,
        stockCheck: Omit<StockCheck, "id" | "createdTime">
    ): Promise<StockCheck> => {
        try {
            const response = await apiClient.put<StockCheck>(`/${id}`, stockCheck);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error updating stock check:", error.message);
            }
            throw error;
        }
    },

    // DELETE stock check
    deleteStockCheck: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error deleting stock check:", error.message);
            }
            throw error;
        }
    },

    // ==================== StockCheckDetail Methods ====================

    // GET all stock details by stock check ID
    getStockDetailsByStockCheckId: async (stockCheckId: number): Promise<StockCheckDetail[]> => {
        try {
            const response = await apiClient.get<StockCheckDetail[]>(`/Details/${stockCheckId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching stock details:", error.message);
            }
            throw error;
        }
    },

    // POST create new stock detail
    createStockDetail: async (
        stockDetail: Omit<StockCheckDetail, "id" | "difference">
    ): Promise<StockCheckDetail> => {
        try {
            const response = await apiClient.post<StockCheckDetail>("/Detail/Add", stockDetail);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error creating stock detail:", error.response?.status, error.response?.data);
            }
            throw error;
        }
    },

    // PUT update stock detail
    updateStockDetail: async (
        id: number,
        stockDetail: Omit<StockCheckDetail, "id" | "difference">
    ): Promise<StockCheckDetail> => {
        try {
            const response = await apiClient.put<StockCheckDetail>(`/Detail/${id}`, stockDetail);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error updating stock detail:", error.message);
            }
            throw error;
        }
    },

    // DELETE stock detail
    deleteStockDetail: async (id: number): Promise<void> => {
        try {
            await apiClient.delete(`/Detail/${id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error deleting stock detail:", error.message);
            }
            throw error;
        }
    },

    // GET stock checks by warehouse ID
    getStockChecksByWarehouseId: async (warehouseId: number): Promise<StockCheck[]> => {
        try {
            const response = await apiClient.get<StockCheck[]>(`/${warehouseId}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching stock checks by warehouse:", error.message);
            }
            throw error;
        }
    },

    // ==================== StockTeam Methods ====================

    // GET all stock teams by stock check ID
    getStockTeamsByStockCheckId: async (stockCheckId: number): Promise<StockCheckTeam[]> => {
        try {
            const response = await apiClient.get<StockCheckTeam[]>(`/${stockCheckId}/teams`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching stock teams:", error.message);
            }
            throw error;
        }
    },

    // POST create new stock team
    createStockTeam: async (
        stockCheckId: number,
        stockTeam: Omit<StockCheckTeam, "id" | "stockCheckId">
    ): Promise<StockCheckTeam> => {
        try {
            const response = await apiClient.post<StockCheckTeam>(`/${stockCheckId}/teams`, {
                ...stockTeam,
                stockCheckId,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error creating stock team:", error.response?.status, error.response?.data);
            }
            throw error;
        }
    },

    // PUT update stock team
    updateStockTeam: async (
        stockCheckId: number,
        teamId: number,
        stockTeam: Omit<StockCheckTeam, "id" | "stockCheckId">
    ): Promise<StockCheckTeam> => {
        try {
            const response = await apiClient.put<StockCheckTeam>(`/${stockCheckId}/teams/${teamId}`, stockTeam);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error updating stock team:", error.message);
            }
            throw error;
        }
    },

    // DELETE stock team
    deleteStockTeam: async (stockCheckId: number, teamId: number): Promise<void> => {
        try {
            await apiClient.delete(`/${stockCheckId}/teams/${teamId}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error deleting stock team:", error.message);
            }
            throw error;
        }
    },

    // GET all available staff for team selection
    getAllAvailableStaff: async (): Promise<StockCheckTeam[]> => {
        try {
            // This endpoint is not yet implemented in the backend
            // For now, return empty array to avoid 404 errors
            return [];
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching available staff:", error.message);
            }
            // Return empty array as fallback instead of throwing
            return [];
        }
    },
};