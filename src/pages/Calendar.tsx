import { useEffect, useMemo, useRef, useState } from "react";
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

const summaryGlyphs: Record<SummaryType, string> = {
  Import: "⇩",
  Export: "⇧",
  StockCheck: "▣",
  PurchaseOrder: "▤",
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
  const normalized = (status || "").toLowerCase();
  if (normalized === "approved") {
    return "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30";
  }
  if (normalized === "pending") {
    return "bg-amber-500/20 text-amber-300 border border-amber-400/30";
  }
  return "bg-gray-500/20 text-gray-300 border border-gray-400/30";
};

const statusLabel = (status?: string) => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "approved") return "Đã xác nhận";
  if (normalized === "pending") return "Chờ xác nhận";
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
        if (!grouped[selectedDateKey]) {
          const firstDate = Object.keys(grouped).sort()[0];
          if (firstDate) {
            setSelectedDateKey(firstDate);
          }
        }
      } catch (error) {
        console.error("Error loading calendar summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [selectedDateKey]);

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
      icon: summaryGlyphs.Import,
      className:
        "border border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    },
    {
      key: "Export",
      label: "Xuất kho",
      value: selectedDayDetail.exports.length,
      icon: summaryGlyphs.Export,
      className: "border border-red-400/20 bg-red-500/10 text-red-200",
    },
    {
      key: "StockCheck",
      label: "Kiểm kê",
      value: selectedDayDetail.stockChecks.length,
      icon: summaryGlyphs.StockCheck,
      className:
        "border border-amber-400/20 bg-amber-500/10 text-amber-200",
    },
    {
      key: "PurchaseOrder",
      label: "Đơn hàng",
      value: selectedDayDetail.purchaseOrders.length,
      icon: summaryGlyphs.PurchaseOrder,
      className:
        "border border-violet-400/20 bg-violet-500/10 text-violet-200",
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
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
            Chọn ngày để xem chi tiết theo nhóm
          </span>
        </div>

        <div className="flex flex-wrap gap-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-400">⇩ Nhập kho (summary)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-400">⇧ Xuất kho (summary)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-amber-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-400">▣ Kiểm kê (summary)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-violet-500"></div>
            <span className="text-sm text-gray-700 dark:text-gray-400">▤ Đơn hàng (summary)</span>
          </div>
          {isLoading && (
            <div className="ml-auto flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500 dark:border-gray-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-500">Đang tải dữ liệu...</span>
            </div>
          )}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_560px]">
          <div className="rounded-2xl border border-cyan-900/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-cyan-900/20">
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
                dayMaxEvents={4}
                dayMaxEventRows={4}
                moreLinkClick="popover"
                eventDisplay="block"
                height="auto"
                contentHeight="auto"
              />
            </div>
          </div>

          <div className="activity-drawer rounded-2xl border border-cyan-900/60 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-2xl shadow-cyan-900/20 lg:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Hoạt động ngày {formatViDate(selectedDateKey)}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Chi tiết theo loại chứng từ trong ngày đã chọn
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {summaryCards.map((card) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveTab(card.key as SummaryType)}
                  className={`rounded-xl px-3 py-2 text-left transition ${card.className} ${
                    activeTab === card.key ? "ring-1 ring-white/40" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="text-lg font-semibold">{card.icon} {card.value}</div>
                  <div className="text-xs">{card.label}</div>
                </button>
              ))}
            </div>

            <div className="mb-3 flex gap-2 border-b border-slate-800 pb-2 text-sm">
              <button
                type="button"
                onClick={() => setActiveTab("Import")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "Import"
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Nhập kho ({selectedDayDetail.imports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Export")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "Export"
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Xuất kho ({selectedDayDetail.exports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("StockCheck")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "StockCheck"
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Kiểm kê ({selectedDayDetail.stockChecks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PurchaseOrder")}
                className={`rounded-lg px-3 py-1.5 ${
                  activeTab === "PurchaseOrder"
                    ? "bg-cyan-500/15 text-cyan-300"
                    : "text-slate-300 hover:bg-slate-800"
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
                className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="custom-scrollbar max-h-[500px] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
              <div className="grid grid-cols-[120px_minmax(0,1.4fr)_72px_110px] gap-2 border-b border-slate-800 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <div>Mã</div>
                <div>Đối tượng</div>
                <div>Giờ</div>
                <div>Trạng thái</div>
              </div>

              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  Không có dữ liệu phù hợp.
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div
                    key={`${item.code}-${index}`}
                    className="grid grid-cols-[120px_minmax(0,1.4fr)_72px_110px] gap-2 border-b border-slate-900 px-3 py-2 text-sm text-slate-200"
                  >
                    <div className="font-semibold text-white">{item.code}</div>
                    <div className="min-w-0 text-slate-300">
                      <span className="block break-words leading-5">{item.title}</span>
                    </div>
                    <div className="text-slate-400">{item.time}</div>
                    <div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(item.status)}`}>
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
