import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { notifStorage, type Notification } from "../../services/notificationService";
import { getStoredItemType } from "../../services/itemTypeService";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const IconBell = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IconBox = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const IconTruck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
  </svg>
);

const IconClipboard = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const IconWarning = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconArrowDown = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 17l-4 4m0 0l-4-4m4 4V3" />
  </svg>
);

const IconArrowUp = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7l4-4m0 0l4 4m-4-4v18" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ─── Resolve display text per item type ──────────────────────────────────────

/**
 * Rewrite LOW_STOCK notification title/message based on stored item type.
 * key format: "LOW_STOCK_<materialId>" or "LOW_STOCK_<materialId>_CRITICAL"
 */
function resolveNotifDisplay(n: Notification): { title: string; message: string } {
  if (n.type.toUpperCase() !== "LOW_STOCK") return { title: n.title, message: n.message };

  // Extract numeric material ID from the end of the key
  const segments = n.key.split("_");
  const numericSeg = [...segments].reverse().find((s: string) => /^\d+$/.test(s));
  const materialId = Number(numericSeg ?? segments[segments.length - 1]);
  if (!materialId || !Number.isFinite(materialId)) return { title: n.title, message: n.message };

  const itemType = getStoredItemType(materialId);
  if (itemType !== "asset") return { title: n.title, message: n.message };

  // Extract item name — backend titles are usually "Hết hàng: <name>" or just "<name>"
  const colonIdx = n.title.indexOf(":");
  const itemName = colonIdx >= 0 ? n.title.slice(colonIdx + 1).trim() : n.title.trim();

  // Determine urgency from priority or original title
  const isOutOfStock =
    n.priority === "critical" ||
    n.message.toLowerCase().includes("0") ||
    n.message.toLowerCase().includes("hết");

  const title = isOutOfStock
    ? `Tài sản đã hết trong kho: ${itemName}`
    : `Tài sản không đủ số lượng: ${itemName}`;

  const message = isOutOfStock
    ? `${itemName} hiện không còn trong kho để cấp phát. Vui lòng kiểm tra tình trạng tài sản.`
    : `${itemName} hiện không còn đủ số lượng khả dụng trong kho.`;

  return { title, message };
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabKey = "all" | "warehouse" | "purchase_order" | "stock_check" | "warning";

interface TabDef {
  key: TabKey;
  label: string;
  Icon: React.FC<{ className?: string }>;
  activeColor: string;
  badgeColor: string;
}

const TABS: TabDef[] = [
  {
    key: "all",
    label: "Tất cả",
    Icon: IconBell,
    activeColor: "bg-gray-800 text-white dark:bg-gray-100 dark:text-gray-900",
    badgeColor: "bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300",
  },
  {
    key: "warehouse",
    label: "Nhập/Xuất",
    Icon: IconBox,
    activeColor: "bg-emerald-600 text-white",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  {
    key: "purchase_order",
    label: "Đặt hàng",
    Icon: IconTruck,
    activeColor: "bg-blue-600 text-white",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  {
    key: "stock_check",
    label: "Kiểm kê",
    Icon: IconClipboard,
    activeColor: "bg-violet-600 text-white",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  },
  {
    key: "warning",
    label: "Cảnh báo",
    Icon: IconWarning,
    activeColor: "bg-amber-500 text-white",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
];

function getTab(type: string): TabKey {
  switch (type.toUpperCase()) {
    case "IMPORT":
    case "EXPORT":
      return "warehouse";
    case "PURCHASE_ORDER":
      return "purchase_order";
    case "STOCK_CHECK":
      return "stock_check";
    case "LOW_STOCK":
      return "warning";
    default:
      return "all";
  }
}

interface NotifStyle {
  Icon: React.FC<{ className?: string }>;
  bgClass: string;
  iconClass: string;
  borderClass: string;
  tagLabel: string;
  tagClass: string;
}

function getStyle(type: string): NotifStyle {
  switch (type.toUpperCase()) {
    case "IMPORT":
      return {
        Icon: IconArrowDown,
        bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
        iconClass: "text-emerald-600 dark:text-emerald-400",
        borderClass: "border-l-emerald-500",
        tagLabel: "Nhập kho",
        tagClass: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:ring-emerald-700",
      };
    case "EXPORT":
      return {
        Icon: IconArrowUp,
        bgClass: "bg-rose-50 dark:bg-rose-900/20",
        iconClass: "text-rose-600 dark:text-rose-400",
        borderClass: "border-l-rose-500",
        tagLabel: "Xuất kho",
        tagClass: "bg-rose-50 text-rose-600 ring-1 ring-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:ring-rose-700",
      };
    case "PURCHASE_ORDER":
      return {
        Icon: IconTruck,
        bgClass: "bg-blue-50 dark:bg-blue-900/20",
        iconClass: "text-blue-600 dark:text-blue-400",
        borderClass: "border-l-blue-500",
        tagLabel: "Đặt hàng",
        tagClass: "bg-blue-50 text-blue-600 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-700",
      };
    case "STOCK_CHECK":
      return {
        Icon: IconClipboard,
        bgClass: "bg-violet-50 dark:bg-violet-900/20",
        iconClass: "text-violet-600 dark:text-violet-400",
        borderClass: "border-l-violet-500",
        tagLabel: "Kiểm kê",
        tagClass: "bg-violet-50 text-violet-600 ring-1 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:ring-violet-700",
      };
    case "LOW_STOCK":
    default:
      return {
        Icon: IconWarning,
        bgClass: "bg-amber-50 dark:bg-amber-900/20",
        iconClass: "text-amber-600 dark:text-amber-400",
        borderClass: "border-l-amber-500",
        tagLabel: "Cảnh báo",
        tagClass: "bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-700",
      };
  }
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}

function getDayGroup(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hôm nay";
  if (d.toDateString() === yesterday.toDateString()) return "Hôm qua";
  const days = Math.floor((today.getTime() - d.getTime()) / 86400000);
  if (days < 7) return "Tuần này";
  return "Cũ hơn";
}

const GROUP_ORDER = ["Hôm nay", "Hôm qua", "Tuần này", "Cũ hơn"];

const PAGE_SIZE = 10;

// ─── NotificationTabs ─────────────────────────────────────────────────────────

interface NotificationTabsProps {
  tabCounts: Record<TabKey, number>;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

function NotificationTabs({ tabCounts, activeTab, onTabChange }: NotificationTabsProps) {
  return (
    <div className="grid grid-cols-5 gap-1 px-4 pt-3 pb-2">
      {TABS.map((tab) => {
        const count = tabCounts[tab.key];
        const isActive = activeTab === tab.key;
        const hasItems = tab.key === "all" || count > 0;
        return (
          <button
            key={tab.key}
            onClick={() => hasItems && onTabChange(tab.key)}
            className={`relative flex flex-col items-center gap-1 px-1 py-2 rounded-xl text-[10px] font-medium transition-all ${
              isActive
                ? `${tab.activeColor} shadow-sm`
                : hasItems
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  : "bg-gray-50 text-gray-300 dark:bg-gray-900/50 dark:text-gray-700 cursor-not-allowed"
            }`}
          >
            <tab.Icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="w-full text-center leading-tight line-clamp-1">{tab.label}</span>
            {tab.key !== "all" && count > 0 && (
              <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                isActive ? "bg-white/30 text-white" : tab.badgeColor
              }`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── NotificationItem ─────────────────────────────────────────────────────────

interface NotificationItemProps {
  n: Notification;
  isRead: boolean;
  onMarkRead: (e: React.MouseEvent, key: string) => void;
  onDismiss: (e: React.MouseEvent, key: string) => void;
  onNavigate: (targetUrl: string) => void;
}

function NotificationItem({ n, isRead, onMarkRead, onDismiss, onNavigate }: NotificationItemProps) {
  const { Icon, bgClass, iconClass, borderClass, tagLabel, tagClass } = getStyle(n.type);
  const { title, message } = resolveNotifDisplay(n);
  return (
    <li
      onClick={() => { if (n.targetUrl) onNavigate(n.targetUrl); }}
      className={`group relative flex items-start gap-3 px-3 py-3 rounded-xl border-l-[3px] ${borderClass} ${bgClass} transition-all ${
        isRead ? "opacity-50" : ""
      } ${n.targetUrl ? "cursor-pointer hover:brightness-[0.97] dark:hover:brightness-110" : "cursor-default"}`}
    >
      {!isRead && (
        <span className="absolute top-2.5 left-0.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
      )}
      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-900/60 shadow-sm">
        <Icon className={`w-4 h-4 ${iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-snug line-clamp-1 ${isRead ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}>
            {title}
          </p>
          <span className={`flex-shrink-0 inline-flex group-hover:hidden items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${tagClass}`}>
            {tagLabel}
          </span>
          <div className="flex-shrink-0 hidden group-hover:flex items-center gap-0.5">
            {!isRead && (
              <button onClick={(e) => onMarkRead(e, n.key)} title="Đánh dấu đã đọc"
                className="flex items-center justify-center w-6 h-6 rounded-md text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                <IconCheck className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={(e) => onDismiss(e, n.key)} title="Tắt thông báo này"
              className="flex items-center justify-center w-6 h-6 rounded-md text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
              <IconX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
          {message}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {formatRelativeTime(n.createdAt)}
          </span>
          {n.targetUrl && (
            <span className="flex items-center gap-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Xem chi tiết
              <IconChevronRight />
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

// ─── NotificationDropdown ─────────────────────────────────────────────────────

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { accessToken, logout } = useAuth();

  const fetchAbortRef = useRef<AbortController | null>(null);
  const pollAbortRef = useRef<AbortController | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [readKeys, setReadKeys] = useState<Set<string>>(() => notifStorage.getReadKeys());
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(() => notifStorage.getDismissedKeys());

  const computeNotifying = useCallback((data: Notification[], dismissed: Set<string>, read: Set<string>) =>
    data.some((n) => !dismissed.has(n.key) && !read.has(n.key)), []);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;
    setIsLoading(true);
    setFetchError(false);
    try {
      const res = await fetch("/api/Notification", {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      });
      if (res.status === 401 || res.status === 403) { logout(); navigate("/signin"); return; }
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data || []);
        const dismissed = notifStorage.getDismissedKeys();
        const read = notifStorage.getReadKeys();
        setNotifying(computeNotifying(data || [], dismissed, read));
      } else {
        setFetchError(true);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") setFetchError(true);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }, [accessToken, logout, navigate, computeNotifying]);

  const pollUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    pollAbortRef.current?.abort();
    const controller = new AbortController();
    pollAbortRef.current = controller;
    try {
      const res = await fetch("/api/Notification", {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: controller.signal,
      });
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifying(computeNotifying(data || [], notifStorage.getDismissedKeys(), notifStorage.getReadKeys()));
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") { /* silent */ }
    }
  }, [accessToken, computeNotifying]);

  useEffect(() => {
    if (isOpen) {
      setVisibleCount(PAGE_SIZE);
      fetchNotifications();
    } else {
      fetchAbortRef.current?.abort();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    pollUnreadCount();
    const interval = setInterval(pollUnreadCount, 30000);
    const handler = () => pollUnreadCount();
    window.addEventListener("notification:refresh", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notification:refresh", handler);
      pollAbortRef.current?.abort();
    };
  }, [pollUnreadCount]);

  const handleMarkRead = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    notifStorage.addReadKey(key);
    const updated = notifStorage.getReadKeys();
    setReadKeys(updated);
    setNotifying(computeNotifying(notifications, dismissedKeys, updated));
  };

  const handleMarkAllRead = () => {
    notifStorage.markAllRead(visibleNotifications.map((n) => n.key));
    const updated = notifStorage.getReadKeys();
    setReadKeys(updated);
    setNotifying(false);
  };

  const handleDismiss = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    notifStorage.addDismissedKey(key);
    const updated = notifStorage.getDismissedKeys();
    setDismissedKeys(updated);
    setNotifying(computeNotifying(notifications, updated, readKeys));
  };

  const handleNavigate = useCallback((targetUrl: string) => {
    setIsOpen(false);
    navigate(targetUrl);
  }, [navigate]);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const closeDropdown = () => setIsOpen(false);

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => !dismissedKeys.has(n.key)),
    [notifications, dismissedKeys],
  );

  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { all: 0, warehouse: 0, purchase_order: 0, stock_check: 0, warning: 0 };
    visibleNotifications.forEach((n) => { const tab = getTab(n.type); counts[tab]++; counts.all++; });
    return counts;
  }, [visibleNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return visibleNotifications;
    return visibleNotifications.filter((n) => getTab(n.type) === activeTab);
  }, [visibleNotifications, activeTab]);

  const paginatedNotifications = useMemo(
    () => filteredNotifications.slice(0, visibleCount),
    [filteredNotifications, visibleCount],
  );

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    paginatedNotifications.forEach((n) => {
      const g = getDayGroup(n.createdAt);
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    });
    return GROUP_ORDER.filter((g) => groups[g]?.length > 0).map((g) => ({ label: g, items: groups[g] }));
  }, [paginatedNotifications]);

  const hasMore = filteredNotifications.length > visibleCount;
  const remainingCount = filteredNotifications.length - visibleCount;

  const unreadCount = useMemo(
    () => visibleNotifications.filter((n) => !readKeys.has(n.key)).length,
    [visibleNotifications, readKeys],
  );

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setIsOpen((o) => !o)}
      >
        {notifying && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping" />
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[540px] w-[370px] flex-col rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-dark sm:w-[390px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30">
              <IconBell className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">Thông báo</h5>
              {visibleNotifications.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} chưa đọc` : "Đã đọc hết"}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 transition-colors">
                <IconCheck className="w-3.5 h-3.5" />
                Đọc hết
              </button>
            )}
            <button onClick={closeDropdown}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors">
              <IconX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {visibleNotifications.length > 0 && (
          <NotificationTabs
            tabCounts={tabCounts}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        )}

        {/* Error banner */}
        {fetchError && !isLoading && (
          <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 flex items-center justify-between gap-2">
            <p className="text-xs text-rose-600 dark:text-rose-400">Không tải được thông báo</p>
            <button onClick={fetchNotifications}
              className="text-xs font-medium text-rose-600 dark:text-rose-400 hover:underline flex-shrink-0">
              Thử lại
            </button>
          </div>
        )}

        {/* List */}
        <ul className="flex flex-col overflow-y-auto custom-scrollbar flex-1 px-3 pb-3 pt-1">
          {isLoading ? (
            <li className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-b-transparent animate-spin" />
            </li>
          ) : filteredNotifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <IconBell className="w-7 h-7 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Không có thông báo</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {activeTab === "all" ? "Mọi thứ đều ổn" : `Không có mục ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}`}
                </p>
              </div>
            </li>
          ) : (
            <>
              {groupedNotifications.map(({ label, items }) => (
                <li key={label}>
                  <p className="px-1 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {label}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {items.map((n) => (
                      <NotificationItem
                        key={n.key}
                        n={n}
                        isRead={readKeys.has(n.key)}
                        onMarkRead={handleMarkRead}
                        onDismiss={handleDismiss}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </ul>
                </li>
              ))}
              {hasMore && (
                <li className="pt-2">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="w-full py-2.5 rounded-xl text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors border border-dashed border-brand-200 dark:border-brand-800/40"
                  >
                    Xem thêm {remainingCount} thông báo
                  </button>
                </li>
              )}
            </>
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
