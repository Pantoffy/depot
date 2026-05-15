import { createApiClient } from "./apiClient";

/** Shape returned by GET /api/Notification */
export interface Notification {
  key: string;        // stable composite key, e.g. "IMPORT_12"
  id: number;
  type: string;       // IMPORT | EXPORT | PURCHASE_ORDER | STOCK_CHECK | LOW_STOCK
  title: string;
  message: string;
  targetUrl: string;  // route to navigate on click
  createdAt: string;
  priority: string;   // normal | high | critical
}

const STORAGE_READ_KEY = "notif_read_keys";
const STORAGE_DISMISS_KEY = "notif_dismissed_keys";

function loadSet(storageKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSet(storageKey: string, set: Set<string>): void {
  localStorage.setItem(storageKey, JSON.stringify([...set]));
}

export const notifStorage = {
  getReadKeys: () => loadSet(STORAGE_READ_KEY),
  addReadKey: (key: string) => {
    const s = loadSet(STORAGE_READ_KEY);
    s.add(key);
    saveSet(STORAGE_READ_KEY, s);
  },
  markAllRead: (keys: string[]) => {
    const s = loadSet(STORAGE_READ_KEY);
    keys.forEach((k) => s.add(k));
    saveSet(STORAGE_READ_KEY, s);
  },

  getDismissedKeys: () => loadSet(STORAGE_DISMISS_KEY),
  addDismissedKey: (key: string) => {
    const s = loadSet(STORAGE_DISMISS_KEY);
    s.add(key);
    saveSet(STORAGE_DISMISS_KEY, s);
  },
};

const apiClient = createApiClient("/api/Notification");

export const notificationService = {
  /** GET /api/Notification — notifications generated dynamically from DB state (no DB table) */
  getAllNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get<Notification[]>("");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },
};

