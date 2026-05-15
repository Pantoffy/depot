import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ClipboardList, ShoppingCart } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import viLocale from "@fullcalendar/core/locales/vi";
import { EventClickArg, EventInput } from "@fullcalendar/core";
import PageMeta from "../components/common/PageMeta";
import { exportService, ExportReceipt } from "../services/exportService";
import { importService, ImportReceipt } from "../services/importService";
import { stockService, StockCheck } from "../services/stockService";
import { purchaseOrderService, PurchaseOrder } from "../services/purchaseOrderService";

type SummaryType = "Import" | "Export" | "StockCheck" | "PurchaseOrder";

type DayDetail = {
  imports: ImportReceipt[];
  exports: ExportReceipt[];
  stockChecks: StockCheck[];
  purchaseOrders: PurchaseOrder[];
};

type ActivityItem = {
  code: string;
  title: string;
  time: string;
  status?: string;
};

const summaryIcons: Record<SummaryType, React.ReactNode> = {
  Import: <ArrowDownToLine size={16} />,
  Export: <ArrowUpFromLine size={16} />,
  StockCheck: <ClipboardList size={16} />,
  PurchaseOrder: <ShoppingCart size={16} />,
};

interface SummaryEvent extends EventInput {
  extendedProps: {
    summaryType: SummaryType;
    dateKey: string;
    count: number;
  };
}

const createEmptyDayDetail = (): DayDetail => ({
  imports: [],
  exports: [],
  stockChecks: [],
  purchaseOrders: [],
});

const toDateKey = (dateValue?: string) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const formatViDate = (dateKey: string) => {
  if (!dateKey) return "";
  const date = new Date(dateKey);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getTodayKey = () => new Date().toISOString().split("T")[0];

const formatTime = (dateValue?: string) => {
  if (!dateValue) return "--:--";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadgeClass = (status?: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "đã duyệt" || s === "approved" || s === "đã xác nhận" || s === "confirmed") {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-400/30";
  }
  if (s === "đã giao" || s === "đã giao hàng" || s === "delivered") {
    return "bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-400/30";
  }
  if (s === "chờ xác nhận" || s === "đã trình" || s === "pending") {
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-400/30";
  }
  if (s === "đã hủy" || s === "cancelled") {
    return "bg-red-100 text-red-700 ring-1 ring-red-300 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-400/30";
  }
  if (s === "nháp" || s === "đang soạn thảo" || s === "draft") {
    return "bg-gray-100 text-gray-500 ring-1 ring-gray-300 dark:bg-slate-500/20 dark:text-slate-400 dark:ring-slate-500/30";
  }
  return "bg-gray-100 text-gray-400 ring-1 ring-gray-200 dark:bg-gray-700/30 dark:text-gray-400 dark:ring-gray-600/30";
};

const statusLabel = (status?: string) => {
  const s = (status || "").toLowerCase().trim();
  if (s === "đã duyệt" || s === "approved" || s === "confirmed") return "Đã duyệt";
  if (s === "đã xác nhận") return "Đã xác nhận";
  if (s === "đã giao hàng") return "Đã giao hàng";
  if (s === "đã giao" || s === "delivered") return "Đã giao";
  if (s === "chờ xác nhận") return "Chờ xác nhận";
  if (s === "đã trình" || s === "pending") return "Đã trình";
  if (s === "đã hủy" || s === "cancelled") return "Đã hủy";
  if (s === "đang soạn thảo" || s === "draft") return "Đang soạn thảo";
  if (s === "nháp") return "Nháp";
  return status || "N/A";
};

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<SummaryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dayDetailsByDate, setDayDetailsByDate] = useState<Record<string, DayDetail>>({});
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey());
  const [activeTab, setActiveTab] = useState<SummaryType>("Import");
  const [searchTerm, setSearchTerm] = useState("");

  const calendarRef = useRef<FullCalendar>(null);
  const selectedDayDetail = dayDetailsByDate[selectedDateKey] || createEmptyDayDetail();

  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      try {
        const [exportReceipts, importReceipts, stockChecks, purchaseOrders] = await Promise.all([
          exportService.getAllExportReceipts().catch(() => []),
          importService.getAllImportReceipts().catch(() => []),
          stockService.getAllStockChecks().catch(() => []),
          purchaseOrderService.getAllPurchaseOrders().catch(() => []),
        ]);

        const grouped: Record<string, DayDetail> = {};

        const ensureDay = (dateKey: string) => {
          if (!grouped[dateKey]) {
            grouped[dateKey] = createEmptyDayDetail();
          }
          return grouped[dateKey];
        };

        exportReceipts.forEach((receipt) => {
          const dateKey = toDateKey(receipt.exportDate);
          if (!dateKey) return;
          ensureDay(dateKey).exports.push(receipt);
        });

        importReceipts.forEach((receipt) => {
          const dateKey = toDateKey(receipt.importTime);
          if (!dateKey) return;
          ensureDay(dateKey).imports.push(receipt);
        });

        stockChecks.forEach((check) => {
          const dateKey =
            toDateKey(check.startDate) ||
            toDateKey(check.checkTime) ||
            toDateKey(check.createdTime);
          if (!dateKey) return;
          ensureDay(dateKey).stockChecks.push(check);
        });

        purchaseOrders.forEach((order) => {
          const dateKey = toDateKey(order.orderDate) || toDateKey(order.createdAt);
          if (!dateKey) return;
          ensureDay(dateKey).purchaseOrders.push(order);
        });

        const summaryEvents: SummaryEvent[] = [];

        Object.entries(grouped).forEach(([dateKey, detail]) => {
          if (detail.imports.length > 0) {
            summaryEvents.push({
              id: `summary-import-${dateKey}`,
              start: dateKey,
              allDay: true,
              title: `Nhập: ${detail.imports.length}`,
              extendedProps: {
                summaryType: "Import",
                dateKey,
                count: detail.imports.length,
              },
            });
          }

          if (detail.exports.length > 0) {
            summaryEvents.push({
              id: `summary-export-${dateKey}`,
              start: dateKey,
              allDay: true,
              title: `Xuất: ${detail.exports.length}`,
              extendedProps: {
                summaryType: "Export",
                dateKey,
                count: detail.exports.length,
              },
            });
          }

          if (detail.stockChecks.length > 0) {
            summaryEvents.push({
              id: `summary-stock-${dateKey}`,
              start: dateKey,
              allDay: true,
              title: `Kiểm: ${detail.stockChecks.length}`,
              extendedProps: {
                summaryType: "StockCheck",
                dateKey,
                count: detail.stockChecks.length,
              },
            });
          }

          if (detail.purchaseOrders.length > 0) {
            summaryEvents.push({
              id: `summary-order-${dateKey}`,
              start: dateKey,
              allDay: true,
              title: `Đơn: ${detail.purchaseOrders.length}`,
              extendedProps: {
                summaryType: "PurchaseOrder",
                dateKey,
                count: detail.purchaseOrders.length,
              },
            });
          }
        });

        setDayDetailsByDate(grouped);
        setEvents(summaryEvents);
        setSelectedDateKey((prev) => {
          if (!grouped[prev]) {
            return Object.keys(grouped).sort().reverse()[0] || prev;
          }
          return prev;
        });
      } catch (error) {
        console.error("Error loading calendar summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectDate = (dateKey: string) => {
    if (!dateKey) return;
    setSelectedDateKey(dateKey);
    setSearchTerm("");
  };

  const handleDateClick = (clickInfo: any) => {
    const dateKey = clickInfo.dateStr?.split("T")[0] || "";
    selectDate(dateKey);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const dateKey =
      clickInfo.event.extendedProps.dateKey ||
      clickInfo.event.startStr?.split("T")[0] ||
      "";
    selectDate(dateKey);
  };

  const tabData: Record<SummaryType, ActivityItem[]> = useMemo(
    () => ({
      Import: selectedDayDetail.imports.map((item) => ({
        code: item.code,
        title: item.supplier?.name || "Nhà cung cấp chưa xác định",
        time: formatTime(item.importTime || item.createdAt),
        status: item.status,
      })),
      Export: selectedDayDetail.exports.map((item) => ({
        code: item.code,
        title: item.receiverName || "Người nhận chưa xác định",
        time: formatTime(item.exportDate || item.createdAt),
        status: item.status,
      })),
      StockCheck: selectedDayDetail.stockChecks.map((item) => ({
        code: item.code,
        title: item.name || "Phiếu kiểm kê",
        time: formatTime(item.checkTime || item.createdTime || item.startDate),
        status: item.status,
      })),
      PurchaseOrder: selectedDayDetail.purchaseOrders.map((item) => ({
        code: item.code,
        title: item.supplier?.name || "Nhà cung cấp chưa xác định",
        time: formatTime(item.orderDate || item.createdAt),
        status: item.status,
      })),
    }),
    [selectedDayDetail],
  );

  const filteredItems = useMemo(() => {
    const list = tabData[activeTab] || [];
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter(
      (item) =>
        item.code.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword),
    );
  }, [activeTab, searchTerm, tabData]);

  const summaryCards = [
    {
      key: "Import",
      label: "Nhập kho",
      value: selectedDayDetail.imports.length,
      icon: summaryIcons.Import,
      className:
        "border border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
    },
    {
      key: "Export",
      label: "Xuất kho",
      value: selectedDayDetail.exports.length,
      icon: summaryIcons.Export,
      className: "border border-red-400/30 bg-red-500/10 text-red-700 dark:text-red-200",
    },
    {
      key: "StockCheck",
      label: "Kiểm kê",
      value: selectedDayDetail.stockChecks.length,
      icon: summaryIcons.StockCheck,
      className:
        "border border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200",
    },
    {
      key: "PurchaseOrder",
      label: "Đơn hàng",
      value: selectedDayDetail.purchaseOrders.length,
      icon: summaryIcons.PurchaseOrder,
      className:
        "border border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200",
    },
  ];

  return (
    <>
      <PageMeta
        title="Calendar - Warehouse Management | WarehouseAPI"
        description="Summary lịch nhập xuất kiểm theo ngày"
      />

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lịch kho hàng
          </h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-300">
            Chọn ngày để xem chi tiết theo nhóm
          </span>
        </div>

        <div className="flex flex-wrap gap-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500"></div>
            <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400"><ArrowDownToLine size={14} /> Nhập kho</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500"></div>
            <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400"><ArrowUpFromLine size={14} /> Xuất kho</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-amber-500"></div>
            <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400"><ClipboardList size={14} /> Kiểm kê</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-violet-500"></div>
            <span className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400"><ShoppingCart size={14} /> Đơn hàng</span>
          </div>
          {isLoading && (
            <div className="ml-auto flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500 dark:border-gray-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-500">Đang tải dữ liệu...</span>
            </div>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_560px]">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-cyan-900/60 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:shadow-2xl dark:shadow-cyan-900/20">
            <div className="custom-calendar p-4 md:p-6">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={viLocale}
                headerToolbar={{
                  left: "today prev,next",
                  center: "title",
                  right: "dayGridMonth",
                }}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                dayCellClassNames={(arg) => {
                  const y = arg.date.getFullYear();
                  const m = String(arg.date.getMonth() + 1).padStart(2, "0");
                  const d = String(arg.date.getDate()).padStart(2, "0");
                  return `${y}-${m}-${d}` === selectedDateKey
                    ? ["fc-day-selected"]
                    : [];
                }}
                dayMaxEvents={4}
                dayMaxEventRows={4}
                moreLinkClick="popover"
                eventDisplay="block"
                height="auto"
                contentHeight="auto"
              />
            </div>
          </div>

          <div className="activity-drawer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-cyan-900/60 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-2xl dark:shadow-cyan-900/20 lg:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Hoạt động ngày {formatViDate(selectedDateKey)}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Chi tiết theo loại chứng từ trong ngày đã chọn
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {summaryCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveTab(card.key as SummaryType)}
                  className={`rounded-xl px-3 py-2 text-left transition ${card.className} ${
                    activeTab === card.key ? "ring-1 ring-black/20 dark:ring-white/40" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-lg font-semibold">{card.icon} {card.value}</div>
                  <div className="text-xs">{card.label}</div>
                </button>
              ))}
            </div>

            <div className="mb-3 flex gap-2 border-b border-gray-200 pb-2 text-sm dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("Import")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "Import"
                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Nhập kho ({selectedDayDetail.imports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Export")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "Export"
                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Xuất kho ({selectedDayDetail.exports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("StockCheck")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "StockCheck"
                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Kiểm kê ({selectedDayDetail.stockChecks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PurchaseOrder")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "PurchaseOrder"
                    ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Đơn hàng ({selectedDayDetail.purchaseOrders.length})
              </button>
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã phiếu hoặc tên..."
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            <div className="custom-scrollbar max-h-[500px] overflow-y-auto rounded-xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-950/60">
              <div className="sticky top-0 z-10 grid grid-cols-[130px_minmax(0,1fr)_64px_110px] border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-500">
                <div>Mã phiếu</div>
                <div>Đối tượng</div>
                <div>Giờ</div>
                <div>Trạng thái</div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-gray-400 dark:text-slate-500">
                  Không có dữ liệu phù hợp.
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div
                    key={`${item.code}-${index}`}
                    className="grid grid-cols-[130px_minmax(0,1fr)_64px_110px] items-center border-b border-gray-100 px-4 py-2.5 transition-colors hover:bg-gray-50 dark:border-slate-800/60 dark:hover:bg-slate-800/30"
                  >
                    <div className="truncate font-mono text-xs font-bold tracking-tight text-gray-800 dark:text-slate-100">{item.code}</div>
                    <div className="min-w-0 pr-2">
                      <span className="block truncate text-sm text-gray-600 dark:text-slate-300">{item.title}</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-slate-500">{item.time}</div>
                    <div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(item.status)}`}>
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
                        {statusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const summaryType = eventInfo.event.extendedProps.summaryType as SummaryType;

  let chipClass = "calendar-event-chip calendar-event-chip--default";
  if (summaryType === "Import") chipClass = "calendar-event-chip calendar-event-chip--import";
  if (summaryType === "Export") chipClass = "calendar-event-chip calendar-event-chip--export";
  if (summaryType === "StockCheck") chipClass = "calendar-event-chip calendar-event-chip--event";
  if (summaryType === "PurchaseOrder") chipClass = "calendar-event-chip calendar-event-chip--order";

  return (
    <div className={chipClass}>
      <span className="calendar-event-chip__title">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;
