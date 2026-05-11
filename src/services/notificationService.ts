import { createApiClient } from "./apiClient";

export interface Notification {
  id?: number;
  type: string;
  title: string;
  message: string;
  icon: string;
  createdAt?: string;
  priority?: string;
}

const apiClient = createApiClient("/api/Notification");

export const notificationService = {
  // GET all notifications
  getAllNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get<Notification[]>("/List");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  // POST create new notification
  createNotification: async (
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<Notification> => {
    try {
      const response = await apiClient.post<Notification>("/Add", notification);
      return response.data;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  // DELETE notification by ID
  deleteNotification: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/${id}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  // DELETE all notifications
  deleteAllNotifications: async (): Promise<void> => {
    try {
      await apiClient.delete("/DeleteAll");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  },
};
