import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { materialService, Material } from "../../services/materialService";
import { supplierService, Supplier } from "../../services/supplierService";
import { warehouseService, Warehouse } from "../../services/warehouseService";
import { importService, ImportReceipt } from "../../services/importService";
import { exportService, ExportReceipt } from "../../services/exportService";
import { unitService, Unit, DEFAULT_UNITS } from "../../services/unitService";

// ========== COMPONENTS ==========

// Date Range Selector Component
const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}) => {
  return (
    <div className="dashboard-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Khoảng thời gian theo dõi</span>
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-900"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-cyan-900"
        />
        <button
          onClick={onReset}
          className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  onClick,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
  trend?: { value: number; isIncrease: boolean };
}) => {
  const colorMap: Record<string, { card: string; iconBg: string; trendUp: string; trendDown: string }> = {
    blue: {
      card: "border-cyan-200/70 bg-cyan-50/80 dark:border-cyan-800/60 dark:bg-cyan-900/20",
      iconBg: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300",
      trendUp: "text-cyan-700 dark:text-cyan-300",
      trendDown: "text-rose-600 dark:text-rose-300",
    },
    green: {
      card: "border-emerald-200/70 bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-emerald-900/20",
      iconBg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      trendUp: "text-emerald-700 dark:text-emerald-300",
      trendDown: "text-rose-600 dark:text-rose-300",
    },
    orange: {
      card: "border-amber-200/70 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-900/20",
      iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      trendUp: "text-amber-700 dark:text-amber-300",
      trendDown: "text-rose-600 dark:text-rose-300",
    },
    red: {
      card: "border-rose-200/70 bg-rose-50/80 dark:border-rose-800/60 dark:bg-rose-900/20",
      iconBg: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
      trendUp: "text-rose-700 dark:text-rose-300",
      trendDown: "text-rose-600 dark:text-rose-300",
    },
    purple: {
      card: "border-indigo-200/70 bg-indigo-50/80 dark:border-indigo-800/60 dark:bg-indigo-900/20",
      iconBg: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
      trendUp: "text-indigo-700 dark:text-indigo-300",
      trendDown: "text-rose-600 dark:text-rose-300",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${c.card} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/50 blur-2xl dark:bg-slate-200/10" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          <div className="mt-2 flex items-center gap-2">
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>
            )}
            {trend && (
              <span className={`text-xs font-semibold ${trend.isIncrease ? c.trendUp : c.trendDown}`}>
                {trend.isIncrease ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        <div className={`rounded-xl p-3 transition-transform group-hover:scale-110 ${c.iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const VerticalBarChart = ({
  data,
  unitLabel,
  valueFormatter,
}: {
  data: { label: string; value: number }[];
  unitLabel: string;
  valueFormatter: (value: number) => string;
}) => {
  if (data.length === 0) {
    return (
      <div className="h-56 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có dữ liệu trong khoảng thời gian đã chọn</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="h-64 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
      <p className="mb-2 text-[11px] text-gray-500 dark:text-gray-400">{unitLabel}</p>
      <div className="flex h-full items-end gap-2">
        {data.map((item) => {
          const height = Math.max(6, (item.value / maxValue) * 100);
          return (
            <div key={item.label} className="flex h-full flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                {valueFormatter(item.value)}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan-700 to-teal-400 transition-all hover:from-cyan-800 hover:to-teal-500"
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${valueFormatter(item.value)}`}
                />
              </div>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DonutChart = ({
  segments,
  total,
}: {
  segments: { label: string; value: number; color: string; textColor: string }[];
  total: number;
}) => {
  let accumulated = 0;
  const gradientStops = segments
    .map((segment) => {
      const start = accumulated;
      const ratio = total > 0 ? (segment.value / total) * 100 : 0;
      accumulated += ratio;
      return `${segment.color} ${start}% ${accumulated}%`;
    })
    .join(", ");

  const backgroundStyle = total > 0 ? `conic-gradient(${gradientStops})` : "conic-gradient(#d1d5db 0% 100%)";

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative h-44 w-44 rounded-full"
        style={{ background: backgroundStyle }}
        aria-label="Biểu đồ cơ cấu tồn kho"
      >
        <div className="absolute inset-6 rounded-full bg-white dark:bg-gray-900" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Nguyên liệu</p>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        {segments.map((segment) => {
          const percentage = total > 0 ? ((segment.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={segment.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{segment.label}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${percentage}%`, backgroundColor: segment.color }}
                    />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{segment.value} mục</span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">({percentage}%)</span>
                  </div>
                </div>
              </div>
              <div className="ml-2 flex-shrink-0 text-right">
                <p className={`text-sm font-bold ${segment.textColor}`}>{segment.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Alert Box Component
const AlertBox = ({
  type = "warning",
  title,
  message,
}: {
  type?: "warning" | "error" | "success" | "info";
  title: string;
  message: string;
}) => {
  const styles = {
    warning: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800/50",
      icon: "text-orange-600 dark:text-orange-400",
      title: "text-orange-900 dark:text-orange-200",
      message: "text-orange-700 dark:text-orange-300",
    },
    error: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800/50",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-900 dark:text-red-200",
      message: "text-red-700 dark:text-red-300",
    },
    success: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800/50",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-900 dark:text-green-200",
      message: "text-green-700 dark:text-green-300",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800/50",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-900 dark:text-blue-200",
      message: "text-blue-700 dark:text-blue-300",
    },
  };

  const s = styles[type];

  return (
    <div className={`${s.bg} border ${s.border} rounded-lg p-4 flex gap-3`}>
      <div className={`flex-shrink-0 ${s.icon} mt-0.5`}>
        {type === "warning" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {type === "error" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        {type === "success" && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div>
        <h4 className={`font-semibold ${s.title}`}>{title}</h4>
        <p className={`text-sm ${s.message} mt-1`}>{message}</p>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [importChartMode, setImportChartMode] = useState<"count" | "amount">("count");
  const [exportChartMode, setExportChartMode] = useState<"count" | "amount">("count");

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [imports, setImports] = useState<ImportReceipt[]>([]);
  const [exports, setExports] = useState<ExportReceipt[]>([]);
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mats, sups, whs, imps, exps] = await Promise.allSettled([
        materialService.getAllMaterials(),
        supplierService.getAllSuppliers(),
        warehouseService.getAllWarehouses(),
        importService.getAllImportReceipts(),
        exportService.getAllExportReceipts(),
      ]);

      if (mats.status === "fulfilled") setMaterials(mats.value);
      if (sups.status === "fulfilled") setSuppliers(sups.value);
      if (whs.status === "fulfilled") setWarehouses(whs.value);
      if (imps.status === "fulfilled") setImports(imps.value);
      if (exps.status === "fulfilled") setExports(exps.value);

      // Load units
      try {
        const u = await unitService.getAllUnits();
        if (u && u.length > 0) setUnits(u);
      } catch {
        // keep DEFAULT_UNITS
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    setStartDate(date.toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
  };

  // ========== Computed values ==========
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Filter imports by date range
  const filteredImports = useMemo(
    () =>
      imports.filter((imp) => {
        const importDate = new Date(imp.importTime || imp.createdAt);
        return importDate >= startDateObj && importDate <= endDateObj;
      }),
    [imports, startDate, endDate]
  );

  const filteredExports = useMemo(
    () =>
      exports.filter((receipt) => {
        const exportDate = new Date(receipt.exportDate || receipt.createdAt);
        return exportDate >= startDateObj && exportDate <= endDateObj;
      }),
    [exports, startDate, endDate]
  );

  const activeMaterials = materials.filter((m) => m.status === "Đang kinh doanh");
  const lowStockMaterials = materials
    .filter((m) => m.stockQuantity <= 10 && m.status === "Đang kinh doanh")
    .sort((a, b) => a.stockQuantity - b.stockQuantity);

  const activeSuppliers = suppliers.filter((s) => {
    const normalized = (s.status || "").trim().toLowerCase();
    return normalized === "đang kinh doanh" || normalized === "đang hoạt động";
  });
  const maintenanceWarehouses = warehouses.filter((w) => {
    const normalized = (w.status || "").trim().toLowerCase();
    return normalized === "bảo trì";
  });

  const pendingImports = filteredImports.filter((imp) => {
    const normalized = (imp.status || "").trim().toLowerCase();
    return normalized !== "approved" && normalized !== "đã xác nhận" && normalized !== "da xac nhan";
  }).length;
  const approvedImports = filteredImports.length - pendingImports;

  const outOfStockMaterials = materials.filter(
    (m) => m.stockQuantity <= 0 && m.status === "Đang kinh doanh"
  );
  const inventoryHealthRate =
    activeMaterials.length === 0
      ? 0
      : Math.round(
          (activeMaterials.filter((m) => m.stockQuantity > 10).length / activeMaterials.length) * 100
        );

  const totalStockQuantity = materials.reduce((sum, m) => sum + Number(m.stockQuantity || 0), 0);
  const totalWarehouseArea = warehouses.reduce((sum, w) => sum + Number(w.area || 0), 0);

  const recentImports = [...filteredImports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentMaterials = [...materials]
    .sort((a, b) => new Date(b.createdTime || "").getTime() - new Date(a.createdTime || "").getTime())
    .slice(0, 5);

  const monthlyImportSeries = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const key = `${date.getFullYear()}-${month}`;
      return {
        key,
        label: date.toLocaleDateString("vi-VN", { month: "2-digit" }),
        count: 0,
        amount: 0,
      };
    });

    const monthIndexMap = Object.fromEntries(months.map((month, idx) => [month.key, idx]));

    filteredImports.forEach((receipt) => {
      const rawDate = receipt.importTime || receipt.createdAt;
      const date = new Date(rawDate);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const key = `${date.getFullYear()}-${month}`;
      const index = monthIndexMap[key];

      if (index === undefined) {
        return;
      }

      months[index].count += 1;
      months[index].amount += Number(receipt.totalAmount || 0);
    });

    return months;
  }, [filteredImports]);

  const monthlyExportSeries = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const key = `${date.getFullYear()}-${month}`;
      return {
        key,
        label: date.toLocaleDateString("vi-VN", { month: "2-digit" }),
        count: 0,
        amount: 0,
      };
    });

    const monthIndexMap = Object.fromEntries(months.map((month, idx) => [month.key, idx]));

    filteredExports.forEach((receipt) => {
      const rawDate = receipt.exportDate || receipt.createdAt;
      const date = new Date(rawDate);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const key = `${date.getFullYear()}-${month}`;
      const index = monthIndexMap[key];

      if (index === undefined) {
        return;
      }

      months[index].count += 1;
      months[index].amount += Number(receipt.totalAmount || 0);
    });

    return months;
  }, [filteredExports]);

  const importChartData = useMemo(
    () =>
      monthlyImportSeries.map((month) => ({
        label: month.label,
        value: importChartMode === "count" ? month.count : Math.round(month.amount / 1000000),
      })),
    [monthlyImportSeries, importChartMode]
  );

  const exportChartData = useMemo(
    () =>
      monthlyExportSeries.map((month) => ({
        label: month.label,
        value: exportChartMode === "count" ? month.count : Math.round(month.amount / 1000000),
      })),
    [monthlyExportSeries, exportChartMode]
  );

  const totalImportAmountIn6Months = monthlyImportSeries.reduce((sum, month) => sum + month.amount, 0);
  const totalExportAmountIn6Months = monthlyExportSeries.reduce((sum, month) => sum + month.amount, 0);
  const peakImportMonth = monthlyImportSeries.reduce(
    (max, current) => (current.count > max.count ? current : max),
    monthlyImportSeries[0] || { key: "", label: "", count: 0, amount: 0 }
  );
  const peakExportMonth = monthlyExportSeries.reduce(
    (max, current) => (current.count > max.count ? current : max),
    monthlyExportSeries[0] || { key: "", label: "", count: 0, amount: 0 }
  );

  const healthyStockCount = activeMaterials.filter((m) => m.stockQuantity > 10).length;
  const warningStockCount = activeMaterials.filter((m) => m.stockQuantity > 0 && m.stockQuantity <= 10).length;
  const stockSegments = [
    {
      label: "Ổn định",
      value: healthyStockCount,
      color: "#10b981",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Sắp thiếu",
      value: warningStockCount,
      color: "#f59e0b",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Hết hàng",
      value: outOfStockMaterials.length,
      color: "#ef4444",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];
  const totalTrackedStock = stockSegments.reduce((sum, segment) => sum + segment.value, 0);

  const getUnitName = (material: Material) => {
    if (material.unitName) return material.unitName;
    const unit = units.find((u) => u.id === material.unitId);
    return unit?.name || "";
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "0đ";
    return amount.toLocaleString("vi-VN") + "đ";
  };

  // Total import value for filtered range
  const totalImportValue = filteredImports.reduce((sum, imp) => sum + (imp.totalAmount || 0), 0);
  const todayLabel = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (loading) {
    return (
      <>
        <PageMeta title="Tổng quan | Quản lý kho" description="Tổng quan hệ thống quản lý kho" />
        <PageBreadcrumb pageTitle="Tổng quan" />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Tổng quan | Quản lý kho" description="Tổng quan hệ thống quản lý kho" />
      <PageBreadcrumb pageTitle="Tổng quan" />

      <div className="dashboard-shell rounded-3xl p-3 sm:p-5">
      {/* Date Range Selector */}
      <div className="mb-6">
        <DateRangeSelector
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReset={handleResetDate}
        />
      </div>

      {/* Critical Alerts Section */}
      <div className="mb-6 space-y-4">
        {outOfStockMaterials.length > 0 && (
          <AlertBox
            type="error"
            title="Cảnh báo: Sản phẩm hết hàng"
            message={`Có ${outOfStockMaterials.length} sản phẩm đã hết hàng. Vui lòng kiểm tra và nhập bổ sung ngay.`}
          />
        )}
        {lowStockMaterials.length > 10 && (
          <AlertBox
            type="warning"
            title="Cảnh báo: Tồn kho thấp"
            message={`Có ${lowStockMaterials.length} sản phẩm tồn kho sắp thiếu. Khuyến nghị nhập bổ sung sớm.`}
          />
        )}
        {pendingImports > 5 && (
          <AlertBox
            type="info"
            title="Thông tin: Phiếu chờ xác nhận"
            message={`Hiện có ${pendingImports} phiếu nhập đang chờ xác nhận.`}
          />
        )}
        {maintenanceWarehouses.length > 0 && (
          <AlertBox
            type="warning"
            title="Cảnh báo: Kho đang bảo trì"
            message={`Có ${maintenanceWarehouses.length} kho đang được bảo trì. Sức chứa có thể bị hạn chế.`}
          />
        )}
      </div>

      {/* Hero overview */}
      <div className="mb-6 overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-700 via-cyan-600 to-teal-600 text-white shadow-xl dark:border-slate-800/70 dark:from-slate-900 dark:via-cyan-900 dark:to-teal-900">
        <div className="relative p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-teal-200/30 blur-2xl dark:bg-emerald-300/20" />

          <div className="relative z-10 grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/90">Warehouse Control Room</p>
              <h2 className="mt-2 text-2xl font-bold leading-tight lg:text-3xl">Tổng Quan Vận Hành Kho</h2>
              <p className="mt-2 max-w-2xl text-sm text-cyan-50/95">
                {todayLabel}. Hệ thống hiện có {materials.length} nguyên liệu, {filteredImports.length} phiếu nhập trong kỳ và {pendingImports} phiếu đang chờ xác nhận.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="dashboard-kpi-card p-3 dashboard-float">
                <p className="text-[11px] uppercase text-cyan-50">Sức khỏe tồn kho</p>
                <p className="mt-1 text-xl font-bold">{inventoryHealthRate}%</p>
                <p className="text-xs text-cyan-50/90">Mức tồn ổn định</p>
              </div>
              <div className="dashboard-kpi-card p-3" style={{ animationDelay: "0.3s" }}>
                <p className="text-[11px] uppercase text-cyan-50">Nguyên liệu tồn kho thấp</p>
                <p className="mt-1 text-xl font-bold">{lowStockMaterials.length}</p>
                <p className="text-xs text-cyan-50/90">Cần nhập bổ sung</p>
              </div>
              <div className="dashboard-kpi-card p-3" style={{ animationDelay: "0.15s" }}>
                <p className="text-[11px] uppercase text-cyan-50">Tổng tồn</p>
                <p className="mt-1 text-xl font-bold">{totalStockQuantity.toLocaleString("vi-VN")}</p>
                <p className="text-xs text-cyan-50/90">Đơn vị gộp</p>
              </div>
              <div className="dashboard-kpi-card p-3 dashboard-float" style={{ animationDelay: "0.4s" }}>
                <p className="text-[11px] uppercase text-cyan-50">Diện tích kho</p>
                <p className="mt-1 text-xl font-bold">{totalWarehouseArea.toLocaleString("vi-VN")}</p>
                <p className="text-xs text-cyan-50/90">m2</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
        <StatCard
          title="Nguyên Liệu"
          value={materials.length}
          subtitle={`${activeMaterials.length} đang kinh doanh`}
          color="blue"
          onClick={() => navigate("/quan-ly-nguyen-lieu")}
          icon={
            <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="Nhà cung cấp"
          value={suppliers.length}
          subtitle={`${activeSuppliers.length} đang hoạt động`}
          color="green"
          onClick={() => navigate("/quan-ly-nha-cung-cap")}
          icon={
            <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Kho"
          value={warehouses.length}
          subtitle={`${maintenanceWarehouses.length} đang bảo trì`}
          color="purple"
          onClick={() => navigate("/quan-ly-kho")}
          icon={
            <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="Phiếu nhập"
          value={filteredImports.length}
          subtitle={`${formatCurrency(totalImportValue)}`}
          color="orange"
          onClick={() => navigate("/nhap-kho")}
          icon={
            <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Tồn kho thấp"
          value={lowStockMaterials.length}
          subtitle={`${outOfStockMaterials.length} đã hết hàng`}
          color="red"
          onClick={() => navigate("/quan-ly-nguyen-lieu")}
          icon={
            <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          }
        />
      </div>

      {/* Biểu đồ tổng quan - Nhập & Xuất & Cơ Cấu */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        {/* Biểu đồ Nhập Kho */}
        <div className="dashboard-panel p-5 xl:col-span-2 row-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Biểu Đồ Nhập Kho 6 Tháng Gần Nhất</h3>
            <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
              <button
                onClick={() => setImportChartMode("count")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  importChartMode === "count"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Số phiếu
              </button>
              <button
                onClick={() => setImportChartMode("amount")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  importChartMode === "amount"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Giá trị (triệu)
              </button>
            </div>
          </div>

          <VerticalBarChart
            data={importChartData}
            unitLabel={importChartMode === "count" ? "Đơn vị: số phiếu" : "Đơn vị: triệu đồng"}
            valueFormatter={(value) => (importChartMode === "count" ? `${value}` : `${value}tr`)}
          />

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-3 border border-gray-200 dark:border-white/[0.05]">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tổng phiếu nhập</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{filteredImports.length}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-3 border border-gray-200 dark:border-white/[0.05]">
              <p className="text-xs text-gray-500 dark:text-gray-400">Đã xác nhận</p>
              <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{approvedImports}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-3 border border-gray-200 dark:border-white/[0.05]">
              <p className="text-xs text-gray-500 dark:text-gray-400">Chờ xác nhận</p>
              <p className="mt-1 text-lg font-semibold text-orange-600 dark:text-orange-400">{pendingImports}</p>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-white/[0.03] p-3 border border-gray-200 dark:border-white/[0.05]">
              <p className="text-xs text-gray-500 dark:text-gray-400">Giá trị trong kỳ</p>
              <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(totalImportAmountIn6Months)}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Tháng cao nhất: {peakImportMonth.label || "--"} ({peakImportMonth.count} phiếu)
          </p>

          {/* Xuất Kho ngay dưới */}
          {monthlyExportSeries.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Biểu Đồ Xuất Kho 6 Tháng Gần Nhất</h3>
                <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                  <button
                    onClick={() => setExportChartMode("count")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      exportChartMode === "count"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    Số phiếu
                  </button>
                  <button
                    onClick={() => setExportChartMode("amount")}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      exportChartMode === "amount"
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    Giá trị (triệu)
                  </button>
                </div>
              </div>

              <VerticalBarChart
                data={exportChartData}
                unitLabel={exportChartMode === "count" ? "Đơn vị: số phiếu" : "Đơn vị: triệu đồng"}
                valueFormatter={(value) => (exportChartMode === "count" ? `${value}` : `${value}tr`)}
              />

              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tổng phiếu xuất</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{filteredExports.length}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Giá trị trong kỳ</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-600 dark:text-cyan-400">{formatCurrency(totalExportAmountIn6Months)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tháng cao nhất</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{peakExportMonth.label || "--"}</p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.05] dark:bg-white/[0.03]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Số phiếu cao nhất</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">{peakExportMonth.count}</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Tháng cao nhất: {peakExportMonth.label || "--"} ({peakExportMonth.count} phiếu)
              </p>
            </div>
          )}
        </div>

        {/* Cơ Cấu Tồn Kho */}
        <div className="dashboard-panel p-5">
          <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Cơ Cấu Tồn Kho
          </h3>
          <DonutChart segments={stockSegments} total={totalTrackedStock} />
          
          {/* Detailed Metrics */}
          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-3">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase">Ổn định</p>
                <p className="mt-1.5 text-xl font-bold text-emerald-900 dark:text-emerald-200">
                  {totalTrackedStock > 0 ? ((healthyStockCount / totalTrackedStock) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{healthyStockCount} / {totalTrackedStock}</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase">Sắp Thiếu</p>
                <p className="mt-1.5 text-xl font-bold text-amber-900 dark:text-amber-200">
                  {totalTrackedStock > 0 ? ((warningStockCount / totalTrackedStock) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{warningStockCount} / {totalTrackedStock}</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-300 uppercase">Hết Hàng</p>
                <p className="mt-1.5 text-xl font-bold text-red-900 dark:text-red-200">
                  {totalTrackedStock > 0 ? ((outOfStockMaterials.length / totalTrackedStock) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{outOfStockMaterials.length} / {totalTrackedStock}</p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-3">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase">Sức Khỏe</p>
                <p className="mt-1.5 text-xl font-bold text-blue-900 dark:text-blue-200">{inventoryHealthRate}%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Mức tồn ổn định</p>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase">Thống Kê Chi Tiết</p>
              <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>Tổng số lượng tồn kho:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{totalStockQuantity.toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Số nguyên liệu đang kinh doanh:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{activeMaterials.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Trung bình tồn kho/sản phẩm:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeMaterials.length > 0 ? (totalStockQuantity / activeMaterials.length).toFixed(0) : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">

        {/* Nguyên liệu tồn kho thấp */}
        <div className="dashboard-panel lg:col-span-1 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Tồn Kho Thấp
            </h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {lowStockMaterials.length}
            </span>
          </div>
          <div className="p-5">
            {lowStockMaterials.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tồn kho ổn định</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockMaterials.slice(0, 8).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 bg-gray-50 dark:bg-gray-900/20 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{m.code}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        m.stockQuantity <= 0
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : m.stockQuantity <= 5
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      }`}
                    >
                      {m.stockQuantity} {getUnitName(m)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Phiếu nhập gần đây - redesigned */}
        <div className="dashboard-panel lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
              </svg>
              Phiếu Nhập Gần Đây
            </h3>
            <button
              onClick={() => navigate("/nhap-kho")}
              className="px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
            >
              Xem tất cả
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {recentImports.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có phiếu nhập nào</p>
              </div>
            ) : (
              recentImports.map((imp, idx) => (
                <div key={imp.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                          {(idx + 1).toString().padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {imp.code}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {imp.supplier?.name || `NCC #${imp.supplierId}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(imp.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(imp.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid - Redesigned */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        
        {/* Nguyên liệu mới thêm - Card Style */}
        <div className="dashboard-panel lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6H0m0 0h6" />
                </svg>
                Nguyên Liệu Mới Thêm
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{recentMaterials.length} sản phẩm</p>
            </div>
            <button
              onClick={() => navigate("/quan-ly-nguyen-lieu")}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              Xem tất cả
            </button>
          </div>

          <div className="p-5 lg:p-6">
            {recentMaterials.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có nguyên liệu mới</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentMaterials.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-gray-50 dark:bg-gray-900/30 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {m.code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.960 9H9a1 1 0 000-2H6.592l-.94-4.472A1 1 0 004.11 2H3z" />
                          <path fillRule="evenodd" d="M16 16V4h-1.05a2.5 2.5 0 00-4.9 0H10V2a2 2 0 10-4 0v1H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2zm-5.5-2.5a.5.5 0 11-1 0 .5.5 0 011 0zm4.5-.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                        </svg>
                        {m.stockQuantity} {getUnitName(m)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(m.createdTime)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Danh sách nhà cung cấp + kho */}
        <div className="space-y-6">
          {/* Nhà cung cấp */}
          <div className="dashboard-panel overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Nhà Cung Cấp
              </h3>
              <button
                onClick={() => navigate("/quan-ly-nha-cung-cap")}
                className="px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-100/50 dark:bg-green-900/20 rounded hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
              >
                Tất cả
              </button>
            </div>
            <div className="p-4 space-y-2">
              {suppliers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  Chưa có nhà cung cấp
                </p>
              ) : (
                suppliers.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                        {(s.name || s.code || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {s.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {s.phone || s.email}
                        </p>
                      </div>
                    </div>
                    <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${s.status === "Đang hoạt động" || s.status === "Đang kinh doanh" ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kho */}
          <div className="dashboard-panel overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Kho
              </h3>
              <button
                onClick={() => navigate("/quan-ly-kho")}
                className="px-2.5 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-100/50 dark:bg-purple-900/20 rounded hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
              >
                Tất cả
              </button>
            </div>
            <div className="p-4 space-y-2">
              {warehouses.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                  Chưa có kho nào
                </p>
              ) : (
                warehouses.slice(0, 5).map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {(w.name || "K")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {w.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {w.area ? `${w.area}m²` : w.address}
                        </p>
                      </div>
                    </div>
                    <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${w.status === "Đang hoạt động" || w.status === "Đang kinh doanh" ? "bg-green-500" : "bg-yellow-500"}`} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-panel mb-6 p-5 lg:p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">
          Thao Tác Nhanh
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => navigate("/nhap-kho")}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/70 dark:hover:border-cyan-700 sm:p-5"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhập kho</span>
          </button>
          <button
            onClick={() => navigate("/xuat-kho")}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/70 dark:hover:border-amber-700 sm:p-5"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Xuất kho</span>
          </button>
          <button
            onClick={() => navigate("/quan-ly-nguyen-lieu")}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/70 dark:hover:border-emerald-700 sm:p-5"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nguyên Liệu</span>
          </button>
          <button
            onClick={() => navigate("/don-dat-hang")}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:from-slate-900 dark:to-slate-900/70 dark:hover:border-indigo-700 sm:p-5"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đơn Đặt Hàng</span>
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
