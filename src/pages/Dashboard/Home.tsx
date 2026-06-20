import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { materialService, Material } from "../../services/materialService";
import { resolveMaterialItemType } from "../../services/itemTypeService";
import { supplierService, Supplier } from "../../services/supplierService";
import { warehouseService, Warehouse } from "../../services/warehouseService";
import { importService, ImportReceipt } from "../../services/importService";
import { exportService, ExportReceipt } from "../../services/exportService";
import { unitService, Unit, DEFAULT_UNITS } from "../../services/unitService";
import { buildInventoryQuantityMap, inventoryService, InventoryItem } from "../../services/inventoryService";
import { purchaseOrderService, PurchaseOrder } from "../../services/purchaseOrderService";
import { stockService, StockCheck } from "../../services/stockService";
import ReactApexChart from "react-apexcharts";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";

// ── helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (v?: number) => {
  if (!v) return "0";
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  return v.toLocaleString("vi-VN");
};

const fmtDate = (d?: string) => {
  if (!d) return "–";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "–" : dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const fmtRelative = (d?: string) => {
  if (!d) return "–";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "–";
  const diff = Date.now() - dt.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return fmtDate(d);
};

const monthKey = (d?: string) => {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 7);
};

// ── KPI Stat Card ─────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub: string;
  badge?: { text: string; color: string };
  onClick?: () => void;
}> = ({ icon, iconBg, label, value, sub, badge, onClick }) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${onClick ? "cursor-pointer" : ""}`}
  >
    <div className="flex items-start justify-between">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      {badge && (
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.color}`}>{badge.text}</span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
    </div>
    <div className={`absolute bottom-0 left-0 h-0.5 w-full ${iconBg} opacity-60 group-hover:opacity-100 transition-opacity`} />
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────

const scBadge = (s: string) => {
  const base = "inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold";
  if (s === "Đã duyệt") return <span className={`${base} bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400`}>{s}</span>;
  if (s === "Đã trình") return <span className={`${base} bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400`}>{s}</span>;
  if (s === "Đã hủy")   return <span className={`${base} bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400`}>{s}</span>;
  return <span className={`${base} bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400`}>{s || "Nháp"}</span>;
};

const poBadge = (s: string) => {
  const n = (s || "").toLowerCase();
  const base = "inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold";
  if (n === "đã duyệt" || n === "approved")   return <span className={`${base} bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400`}>{s}</span>;
  if (n === "chờ duyệt" || n === "pending")   return <span className={`${base} bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400`}>{s}</span>;
  if (n === "đã hủy"    || n === "cancelled") return <span className={`${base} bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400`}>{s}</span>;
  return <span className={`${base} bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}>{s}</span>;
};

// ── Line chart custom tooltip ────────────────────────────────────────────────

interface ChartTooltipEntry {
  name: string;
  value: number;
  color: string;
}

const LineChartTooltip = ({
  active,
  payload,
  label,
  isDark,
}: {
  active?: boolean;
  payload?: ChartTooltipEntry[];
  label?: string;
  isDark: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-sm ${
        isDark ? "border-gray-700/80 bg-gray-800/95" : "border-gray-100 bg-white/95"
      }`}
    >
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${
        isDark ? "text-gray-400" : "text-gray-400"
      }`}>
        {label}
      </p>
      {payload.map((p) => {
        const isValue = p.name.startsWith("Giá trị");
        return (
          <div key={p.name} className="flex items-center gap-2.5 py-0.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
            <span className={`text-xs ${ isDark ? "text-gray-300" : "text-gray-600" }`}>{p.name}</span>
            <span className={`ml-4 text-xs font-bold ${ isDark ? "text-white" : "text-gray-900" }`}>
              {isValue
                ? p.value.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                : p.value}{" "}
              <span className="font-normal opacity-60">{isValue ? "triệu đ" : "phiếu"}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Card shell ────────────────────────────────────────────────────────────────

const Card: React.FC<{
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, footer, children, action, className = "" }) => (
  <div className={`flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 ${className}`}>
    <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="flex flex-col flex-1 px-5 py-4">{children}</div>
    {footer && <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800">{footer}</div>}
  </div>
);

// ── Timeline item ─────────────────────────────────────────────────────────────

const TimelineItem: React.FC<{
  dot: string;
  title: string;
  sub: string;
  right: React.ReactNode;
  isLast?: boolean;
}> = ({ dot, title, sub, right, isLast }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot} ring-2 ring-white dark:ring-gray-900`} />
      {!isLast && <span className="mt-1 flex-1 w-px bg-gray-100 dark:bg-gray-800" />}
    </div>
    <div className={`flex w-full items-start justify-between gap-2 ${isLast ? "pb-0" : "pb-3"}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-800 dark:text-white">{title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>
      </div>
      <div className="shrink-0 text-right">{right}</div>
    </div>
  </div>
);

// ── main ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<"count" | "value">("count");

  const [materials,      setMaterials]      = useState<Material[]>([]);
  const [suppliers,      setSuppliers]      = useState<Supplier[]>([]);
  const [warehouses,     setWarehouses]     = useState<Warehouse[]>([]);
  const [imports,        setImports]        = useState<ImportReceipt[]>([]);
  const [exports,        setExports]        = useState<ExportReceipt[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [stockChecks,    setStockChecks]    = useState<StockCheck[]>([]);
  const [inventories,    setInventories]    = useState<InventoryItem[]>([]);
  const [units,          setUnits]          = useState<Unit[]>(DEFAULT_UNITS);

  const qtyMap = useMemo(() => buildInventoryQuantityMap(inventories), [inventories]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const rs = await Promise.allSettled([
        materialService.getAllMaterials(),
        supplierService.getAllSuppliers(),
        warehouseService.getAllWarehouses(),
        importService.getAllImportReceipts(),
        exportService.getAllExportReceipts(),
        inventoryService.getAllInventories(),
        purchaseOrderService.getAllPurchaseOrders(),
        stockService.getAllStockChecks(),
        unitService.getAllUnits(),
      ]);
      if (rs[0].status === "fulfilled") setMaterials(rs[0].value);
      if (rs[1].status === "fulfilled") setSuppliers(rs[1].value);
      if (rs[2].status === "fulfilled") setWarehouses(rs[2].value);
      if (rs[3].status === "fulfilled") setImports(rs[3].value);
      if (rs[4].status === "fulfilled") setExports(rs[4].value);
      if (rs[5].status === "fulfilled") setInventories(rs[5].value);
      if (rs[6].status === "fulfilled") setPurchaseOrders(rs[6].value);
      if (rs[7].status === "fulfilled") setStockChecks(rs[7].value);
      if (rs[8].status === "fulfilled" && (rs[8].value as Unit[]).length) setUnits(rs[8].value as Unit[]);
    } finally {
      setLoading(false);
    }
  };

  const qty   = (id?: number) => id ? Number(qtyMap[id] || 0) : 0;
  const uname = (m: Material) => m.unitName || units.find((u) => u.id === m.unitId)?.name || "";

  // ── derived ──────────────────────────────────────────────────────────────────

  const now   = new Date();
  const thisM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const maintenance = useMemo(() => warehouses.filter((w) => (w.status || "").toLowerCase() === "bảo trì"), [warehouses]);
  const totalStock  = useMemo(() => Object.values(qtyMap).reduce((s, v) => s + Number(v || 0), 0), [qtyMap]);

  const stockSegs = useMemo(() => ({
    healthy: materials.filter((m) => qty(m.id) > 10).length,
    warn:    materials.filter((m) => { const q = qty(m.id); return resolveMaterialItemType(m) !== "asset" && q > 0 && q <= 10; }).length,
    empty:   materials.filter((m) => resolveMaterialItemType(m) !== "asset" && qty(m.id) <= 0).length,
  }), [materials, qtyMap]);

  const lowStock = useMemo(() =>
    materials
      .filter((m) => resolveMaterialItemType(m) !== "asset")
      .map((m) => ({ ...m, stock: qty(m.id) }))
      .filter((m) => m.stock <= 10)
      .sort((a, b) => a.stock - b.stock),
  [materials, qtyMap]);

  const importsM  = useMemo(() => imports.filter((r) => monthKey(r.importTime || r.createdAt) === thisM), [imports, thisM]);
  const exportsM  = useMemo(() => exports.filter((r) => monthKey(r.exportDate  || r.createdAt) === thisM), [exports, thisM]);
  const importVal = useMemo(() => importsM.reduce((s, r) => s + (r.totalAmount || 0), 0), [importsM]);
  const exportVal = useMemo(() => exportsM.reduce((s, r) => s + (r.totalAmount || 0), 0), [exportsM]);

  const pendingPOs = useMemo(() => purchaseOrders.filter((p) => { const s = (p.status || "").toLowerCase(); return s === "chờ xác nhận" || s === "pending"; }), [purchaseOrders]);
  const pendingSC  = useMemo(() => stockChecks.filter((s) => s.status === "Đã trình"), [stockChecks]);

  // 6-month series
  const months6 = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `T${d.getMonth() + 1}` };
  }), []);

  const importSeries = useMemo(() => months6.map((m) => imports.filter((r) => monthKey(r.importTime || r.createdAt) === m.key).length), [imports, months6]);
  const exportSeries = useMemo(() => months6.map((m) => exports.filter((r) => monthKey(r.exportDate  || r.createdAt) === m.key).length), [exports, months6]);

  const importValSeries = useMemo(() => months6.map((m) =>
    imports.filter((r) => monthKey(r.importTime || r.createdAt) === m.key)
      .reduce((s, r) => s + (r.totalAmount || 0), 0) / 1_000_000
  ), [imports, months6]);
  const exportValSeries = useMemo(() => months6.map((m) =>
    exports.filter((r) => monthKey(r.exportDate || r.createdAt) === m.key)
      .reduce((s, r) => s + (r.totalAmount || 0), 0) / 1_000_000
  ), [exports, months6]);

  // prev month delta
  const prevM = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);
  const importsPrev = useMemo(() => imports.filter((r) => monthKey(r.importTime || r.createdAt) === prevM).length, [imports, prevM]);
  const exportsPrev = useMemo(() => exports.filter((r) => monthKey(r.exportDate  || r.createdAt) === prevM).length, [exports, prevM]);

  // unified recent activity feed (imports + exports merged, sorted by date)
  const recentActivity = useMemo(() => {
    const imp = [...imports]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5)
      .map((r) => ({ type: "import" as const, id: r.id, code: r.code, sub: r.supplier?.name || `NCC #${r.supplierId}`, amount: r.totalAmount, date: r.importTime || r.createdAt }));
    const exp = [...exports]
      .sort((a, b) => +new Date(b.createdAt ?? "") - +new Date(a.createdAt ?? ""))
      .slice(0, 5)
      .map((r) => ({ type: "export" as const, id: r.id, code: r.code, sub: r.receiverName || "–", amount: r.totalAmount, date: r.exportDate || r.createdAt }));
    return [...imp, ...exp].sort((a, b) => +new Date(b.date ?? "") - +new Date(a.date ?? "")).slice(0, 8);
  }, [imports, exports]);

  const recentPOs = useMemo(() => [...purchaseOrders].sort((a, b) => +new Date(b.createdAt ?? b.orderDate) - +new Date(a.createdAt ?? a.orderDate)).slice(0, 5), [purchaseOrders]);
  const recentSC  = useMemo(() => [...stockChecks].sort((a, b) => +new Date(b.createdTime ?? b.startDate ?? "") - +new Date(a.createdTime ?? a.startDate ?? "")).slice(0, 5), [stockChecks]);

  // ── loading ──────────────────────────────────────────────────────────────────

  if (loading) return (
    <>
      <PageMeta title="Tổng quan | Quản lý kho" description="Tổng quan hệ thống" />
      <PageBreadcrumb pageTitle="Tổng quan" />
      <div className="flex flex-col items-center justify-center py-40">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-cyan-500 dark:border-gray-800" />
        <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">Đang tải dữ liệu…</p>
      </div>
    </>
  );

  // ── render ───────────────────────────────────────────────────────────────────

  const deltaSign = (curr: number, prev: number) => {
    if (prev === 0) return null;
    const pct = Math.round(((curr - prev) / prev) * 100);
    const up = pct >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
        {up ? "↑" : "↓"} {Math.abs(pct)}%
      </span>
    );
  };

  return (
    <>
      <PageMeta title="Tổng quan | Quản lý kho" description="Tổng quan hệ thống" />
      <PageBreadcrumb pageTitle="Tổng quan" />

      <div className="space-y-6">

        {/* ── Hero header ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-5 shadow-sm dark:border-gray-800">
          <p className="text-sm font-medium text-cyan-100">
            {now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">Tổng quan hệ thống kho</h2>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-cyan-100">
            <span>{warehouses.length} kho{maintenance.length > 0 ? ` · ${maintenance.length} bảo trì` : " · Tất cả hoạt động"}</span>
            <span>{suppliers.length} nhà cung cấp</span>
            {lowStock.filter(m => m.stock <= 0).length > 0 && (
              <span className="font-semibold text-white">{lowStock.filter(m => m.stock <= 0).length} nguyên liệu hết hàng ⚠</span>
            )}
          </div>
        </div>

        {/* ── 4 KPI cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<svg className="h-5 w-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            iconBg="bg-cyan-50 dark:bg-cyan-900/30"
            label="Nguyên liệu"
            value={materials.length}
            sub={`${materials.filter(m => qty(m.id) > 0).length} còn hàng`}
            onClick={() => navigate("/quan-ly-nguyen-lieu")}
          />
          <StatCard
            icon={<svg className="h-5 w-5 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            iconBg="bg-rose-50 dark:bg-rose-900/30"
            label="Tồn kho thấp"
            value={lowStock.length}
            sub={`${lowStock.filter(m => m.stock <= 0).length} hết hàng · ${lowStock.filter(m => m.stock > 0).length} sắp hết hàng`}
            badge={lowStock.filter(m => m.stock <= 0).length > 0 ? { text: "Cần xử lý", color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" } : undefined}
            onClick={() => navigate("/quan-ly-nguyen-lieu")}
          />
          <StatCard
            icon={<svg className="h-5 w-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            iconBg="bg-cyan-50 dark:bg-cyan-900/30"
            label="Nhập tháng này"
            value={importsM.length}
            sub={`Tổng ${fmtMoney(importVal)}đ`}
            badge={importsPrev > 0 ? { text: `${importsM.length >= importsPrev ? "+" : ""}`, color: importsM.length >= importsPrev ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400" } : undefined}
            onClick={() => navigate("/nhap-kho")}
          />
          <StatCard
            icon={<svg className="h-5 w-5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            iconBg="bg-amber-50 dark:bg-amber-900/30"
            label="Đơn chờ duyệt"
            value={pendingPOs.length}
            sub={`${purchaseOrders.length} đơn tổng cộng`}
            badge={pendingPOs.length > 0 ? { text: "Chờ xử lý", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" } : undefined}
            onClick={() => navigate("/don-dat-hang")}
          />
        </div>

        {/* ── Chart + Summary ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* Activity chart — col-span-2 */}
          <Card
            className="xl:col-span-2"
            title="Hoạt Động Nhập Xuất"
            subtitle={chartTab === "count" ? "Số phiếu mỗi tháng trong 6 tháng qua" : "Giá trị nhập xuất mỗi tháng trong 6 tháng qua"}
            action={
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs font-medium">
                <button
                  onClick={() => setChartTab("count")}
                  className={`px-3 py-1.5 transition-colors ${
                    chartTab === "count"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Số phiếu
                </button>
                <button
                  onClick={() => setChartTab("value")}
                  className={`px-3 py-1.5 border-l border-gray-200 dark:border-gray-700 transition-colors ${
                    chartTab === "value"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  Giá trị
                </button>
              </div>
            }
            footer={
              chartTab === "count" ? (
                <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_0_3px_rgba(8,145,178,0.15)]" />
                    <span className="text-gray-600 dark:text-gray-300">Nhập kho</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{importsM.length}</span>
                    <span>phiếu tháng này</span>
                    {deltaSign(importsM.length, importsPrev)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                    <span className="text-gray-600 dark:text-gray-300">Xuất kho</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{exportsM.length}</span>
                    <span>phiếu tháng này</span>
                    {deltaSign(exportsM.length, exportsPrev)}
                  </span>
                  <span className="ml-auto text-gray-400 dark:text-gray-500">
                    Tổng tồn: <span className="font-semibold text-gray-600 dark:text-gray-300">{totalStock.toLocaleString("vi-VN")}</span>
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]" />
                    <span className="text-gray-600 dark:text-gray-300">Giá trị nhập</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{fmtMoney(importVal)}</span>
                    <span>đ tháng này</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]" />
                    <span className="text-gray-600 dark:text-gray-300">Giá trị xuất</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">{fmtMoney(exportVal)}</span>
                    <span>đ tháng này</span>
                  </span>
                  <span className="ml-auto text-gray-400 dark:text-gray-500">
                    Tổng tồn: <span className="font-semibold text-gray-600 dark:text-gray-300">{totalStock.toLocaleString("vi-VN")}</span>
                  </span>
                </div>
              )
            }
          >
            <div className="-mx-2 mt-1 flex flex-1 flex-col min-h-0">
              {(() => {
                const gridColor = isDark ? "#1f2937" : "#cbd5e1";
                const tickColor = isDark ? "#6b7280" : "#9ca3af";

                if (chartTab === "count") {
                  const chartData = months6.map((m, i) => ({
                    label: m.label,
                    "Nhập kho": importSeries[i],
                    "Xuất kho": exportSeries[i],
                  }));
                  return (
                    <ResponsiveContainer width="100%" height="100%" minHeight={248}>
                      <ComposedChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="gradImport" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0891b2" stopOpacity={0.35} />
                            <stop offset="60%" stopColor="#0891b2" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="#0891b2" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradExport" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="60%" stopColor="#10b981" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <filter id="shadowImport">
                            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0891b2" floodOpacity="0.25" />
                          </filter>
                          <filter id="shadowExport">
                            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#10b981" floodOpacity="0.25" />
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" stroke={gridColor} vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} dy={6} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} allowDecimals={false} width={30} tickFormatter={(v: number) => String(Math.round(v))} />
                        <Tooltip
                          content={({ active, payload, label }) => (
                            <LineChartTooltip active={active} payload={payload as unknown as ChartTooltipEntry[]} label={String(label ?? "")} isDark={isDark} />
                          )}
                          cursor={{ stroke: isDark ? "#374151" : "#e2e8f0", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                        />
                        <Area type="linear" dataKey="Nhập kho" stroke="#0891b2" strokeWidth={2.5} fill="url(#gradImport)"
                          dot={{ r: 4, fill: "#0891b2", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5 }}
                          activeDot={{ r: 7, fill: "#0891b2", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5, filter: "url(#shadowImport)" }}
                          strokeLinecap="round" strokeLinejoin="round"
                        />
                        <Area type="linear" dataKey="Xuất kho" stroke="#10b981" strokeWidth={2.5} fill="url(#gradExport)"
                          dot={{ r: 4, fill: "#10b981", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5 }}
                          activeDot={{ r: 7, fill: "#10b981", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5, filter: "url(#shadowExport)" }}
                          strokeLinecap="round" strokeLinejoin="round"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  );
                }

                // Value tab
                const chartData = months6.map((m, i) => ({
                  label: m.label,
                  "Giá trị nhập": Math.round(importValSeries[i] * 10) / 10,
                  "Giá trị xuất": Math.round(exportValSeries[i] * 10) / 10,
                }));
                return (
                  <ResponsiveContainer width="100%" height="100%" minHeight={248}>
                    <ComposedChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="gradValImport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="60%" stopColor="#6366f1" stopOpacity={0.08} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradValExport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                          <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.08} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <filter id="shadowValImport">
                          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.25" />
                        </filter>
                        <filter id="shadowValExport">
                          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.25" />
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" stroke={gridColor} vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} dy={6} />
                      <YAxis
                        axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 10 }} width={42}
                        tickFormatter={(v: number) =>
                          v >= 1000 ? `${(v / 1000).toFixed(0)}B` : v >= 1 ? `${v.toFixed(0)}M` : v > 0 ? `${(v * 1000).toFixed(0)}K` : "0"
                        }
                      />
                      <Tooltip
                        content={({ active, payload, label }) => (
                          <LineChartTooltip active={active} payload={payload as unknown as ChartTooltipEntry[]} label={String(label ?? "")} isDark={isDark} />
                        )}
                        cursor={{ stroke: isDark ? "#374151" : "#e2e8f0", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                      />
                      <Area type="linear" dataKey="Giá trị nhập" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradValImport)"
                        dot={{ r: 4, fill: "#6366f1", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5 }}
                        activeDot={{ r: 7, fill: "#6366f1", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5, filter: "url(#shadowValImport)" }}
                        strokeLinecap="round" strokeLinejoin="round"
                      />
                      <Area type="linear" dataKey="Giá trị xuất" stroke="#f59e0b" strokeWidth={2.5} fill="url(#gradValExport)"
                        dot={{ r: 4, fill: "#f59e0b", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5 }}
                        activeDot={{ r: 7, fill: "#f59e0b", stroke: isDark ? "#111827" : "#ffffff", strokeWidth: 2.5, filter: "url(#shadowValExport)" }}
                        strokeLinecap="round" strokeLinejoin="round"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </Card>

          {/* Stock health summary */}
          <Card title="Cơ Cấu Tồn Kho" subtitle={`${materials.length} nguyên liệu`}>
            {(() => {
              const segs = [
                { label: "Ổn định",    sub: ">10",  value: stockSegs.healthy, color: "#10b981", text: "text-emerald-600 dark:text-emerald-400" },
                { label: "Sắp thiếu", sub: "1–10", value: stockSegs.warn,    color: "#f59e0b", text: "text-amber-600 dark:text-amber-400"   },
                { label: "Hết hàng",  sub: "0",    value: stockSegs.empty,   color: "#ef4444", text: "text-rose-600 dark:text-rose-400"     },
              ];
              const total = stockSegs.healthy + stockSegs.warn + stockSegs.empty;
              return (
                <div className="space-y-4">
                  {/* Donut chart */}
                  <ReactApexChart
                    type="donut"
                    height={180}
                    series={[stockSegs.healthy, stockSegs.warn, stockSegs.empty]}
                    options={{
                      chart: { type: "donut", background: "transparent", fontFamily: "inherit", animations: { enabled: true, speed: 600 }, offsetY: -6 },
                      colors: ["#10b981", "#f59e0b", "#ef4444"],
                      labels: ["Ổn định", "Sắp thiếu", "Hết hàng"],
                      legend: { show: false },
                      dataLabels: { enabled: false },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: "68%",
                            labels: {
                              show: true,
                              total: {
                                show: true,
                                label: "Tổng tồn",
                                color: isDark ? "#9ca3af" : "#6b7280",
                                fontSize: "11px",
                                fontWeight: "500",
                                formatter: () =>
                                  totalStock >= 10000
                                    ? `${(totalStock / 1000).toFixed(1)}K`
                                    : totalStock.toLocaleString("vi-VN"),
                              },
                              value: {
                                show: true,
                                fontSize: "22px",
                                fontWeight: "700",
                                color: isDark ? "#f9fafb" : "#111827",
                                offsetY: 4,
                                formatter: (v: string) => v,
                              },
                              name: {
                                show: true,
                                fontSize: "11px",
                                color: isDark ? "#9ca3af" : "#6b7280",
                                offsetY: -4,
                              },
                            },
                          },
                        },
                      },
                      tooltip: { y: { formatter: (v: number) => `${v} loại` }, theme: isDark ? "dark" : "light" },
                      theme: { mode: isDark ? "dark" : "light" },
                      stroke: { width: 2, colors: [isDark ? "#111827" : "#ffffff"] },
                    }}
                  />

                  {/* Legend rows */}
                  <div className="space-y-2">
                    {segs.map((seg) => (
                      <div key={seg.label} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: seg.color }} />
                        <span className="flex-1 text-sm text-gray-600 dark:text-gray-300">
                          {seg.label} <span className="text-gray-400">({seg.sub})</span>
                        </span>
                        <span className={`text-sm font-bold ${seg.text}`}>{seg.value}</span>
                        <span className="w-10 text-right text-xs text-gray-400">
                          {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Month summary mini */}
                  <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Tháng này</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Phiếu nhập",  value: importsM.length,    sub: fmtMoney(importVal) + "đ", color: "text-cyan-600 dark:text-cyan-400" },
                        { label: "Phiếu xuất",  value: exportsM.length,    sub: fmtMoney(exportVal) + "đ", color: "text-emerald-600 dark:text-emerald-400" },
                        { label: "Chờ kiểm kê", value: pendingSC.length,   sub: "phiếu",                   color: pendingSC.length   > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-400" },
                        { label: "Kho bảo trì", value: maintenance.length, sub: "kho",                     color: maintenance.length > 0 ? "text-rose-500 dark:text-rose-400"  : "text-gray-400" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                          <p className="text-[10px] text-gray-400">{item.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>

        {/* ── Activity feed + POs + Stock checks ──────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Unified activity timeline */}
          <Card
            className="lg:col-span-1"
            title="Hoạt Động Gần Đây"
            subtitle="Nhập & xuất kho mới nhất"
            action={<button onClick={() => navigate("/nhap-kho")} className="text-xs text-cyan-600 hover:underline dark:text-cyan-400">Xem thêm</button>}
          >
            {recentActivity.length === 0
              ? <p className="py-6 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
              : <div className="space-y-0">
                  {recentActivity.map((item, idx) => (
                    <TimelineItem
                      key={`${item.type}-${item.id}`}
                      dot={item.type === "import" ? "bg-cyan-500" : "bg-emerald-500"}
                      title={item.code || `#${item.id}`}
                      sub={item.sub}
                      isLast={idx === recentActivity.length - 1}
                      right={
                        <div>
                          <p className={`text-xs font-semibold ${item.type === "import" ? "text-cyan-600 dark:text-cyan-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {item.type === "import" ? "Nhập" : "Xuất"} · {fmtMoney(item.amount)}đ
                          </p>
                          <p className="text-[11px] text-gray-400">{fmtRelative(item.date)}</p>
                        </div>
                      }
                    />
                  ))}
                </div>
            }
          </Card>

          {/* Purchase orders */}
          <Card
            title="Đơn Đặt Hàng"
            subtitle={`${purchaseOrders.length} tổng · ${pendingPOs.length} chờ duyệt`}
            action={<button onClick={() => navigate("/don-dat-hang")} className="text-xs text-cyan-600 hover:underline dark:text-cyan-400">Xem tất cả</button>}
          >
            {recentPOs.length === 0
              ? <p className="py-6 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
              : <div className="space-y-0">
                  {recentPOs.map((po, idx) => (
                    <TimelineItem
                      key={po.id}
                      dot={(po.status || "").toLowerCase() === "chờ duyệt" || (po.status || "").toLowerCase() === "pending" ? "bg-amber-400" : "bg-gray-300 dark:bg-gray-600"}
                      title={po.code || po.poNumber || `#${po.id}`}
                      sub={po.supplier?.name || `NCC #${po.supplierId}`}
                      isLast={idx === recentPOs.length - 1}
                      right={
                        <div className="text-right">
                          {poBadge(po.status)}
                          <p className="mt-0.5 text-[11px] text-gray-400">{fmtDate(po.orderDate)}</p>
                        </div>
                      }
                    />
                  ))}
                </div>
            }
          </Card>

          {/* Stock checks */}
          <Card
            title="Phiếu Kiểm Kê"
            subtitle={`${stockChecks.length} tổng · ${pendingSC.length} chờ duyệt`}
            action={<button onClick={() => navigate("/kiem-ke")} className="text-xs text-cyan-600 hover:underline dark:text-cyan-400">Xem tất cả</button>}
          >
            {recentSC.length === 0
              ? <p className="py-6 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
              : <div className="space-y-0">
                  {recentSC.map((sc, idx) => (
                    <TimelineItem
                      key={sc.id}
                      dot={sc.status === "Đã trình" ? "bg-amber-400" : sc.status === "Đã duyệt" ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}
                      title={sc.code}
                      sub={sc.name || sc.warehouse?.name || "–"}
                      isLast={idx === recentSC.length - 1}
                      right={
                        <div className="text-right">
                          {scBadge(sc.status)}
                          <p className="mt-0.5 text-[11px] text-gray-400">{fmtDate(sc.startDate || sc.createdTime)}</p>
                        </div>
                      }
                    />
                  ))}
                </div>
            }
          </Card>
        </div>

        {/* ── Low stock + Quick actions ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Low stock OR Warehouse status — always 2/3 */}
          <div className="lg:col-span-2">
            {lowStock.length > 0 ? (
              <Card
                title="Nguyên Liệu Tồn Kho Thấp"
                subtitle={`${lowStock.length} cần chú ý · ${lowStock.filter(m => m.stock <= 0).length} hết hàng`}
                action={<button onClick={() => navigate("/quan-ly-nguyen-lieu")} className="text-xs text-rose-500 hover:underline dark:text-rose-400">Xem tất cả</button>}
              >
                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {lowStock.slice(0, 20).map((m) => {
                    const maxRef = 50;
                    const pct = Math.min((m.stock / maxRef) * 100, 100);
                    const barColor = m.stock <= 0 ? "bg-rose-500" : m.stock <= 5 ? "bg-orange-400" : "bg-amber-400";
                    const textColor = m.stock <= 0 ? "text-rose-600 dark:text-rose-400" : m.stock <= 5 ? "text-orange-600 dark:text-orange-400" : "text-amber-600 dark:text-amber-400";
                    return (
                      <div key={m.id}>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800 dark:text-white">{m.name}</p>
                            <p className="text-xs text-gray-400">{m.code} · {m.categoryName}</p>
                          </div>
                          <span className={`ml-3 shrink-0 text-sm font-bold ${textColor}`}>
                            {m.stock} {uname(m)}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                          <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <Card
                title="Tình Trạng Kho"
                subtitle={`${warehouses.length} kho · ${warehouses.filter(w => w.status === "Hoạt động").length} đang hoạt động`}
                action={<button onClick={() => navigate("/quan-ly-kho")} className="text-xs text-cyan-600 hover:underline dark:text-cyan-400">Quản lý kho</button>}
              >
                <div className="space-y-2">
                  {warehouses.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
                  ) : (
                    warehouses.map((w) => {
                      const isActive = w.status === "Hoạt động";
                      const isMaint  = w.status === "Bảo trì";
                      const dotColor  = isActive ? "bg-emerald-500" : isMaint ? "bg-amber-400" : "bg-red-400";
                      const tagColor  = isActive
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : isMaint
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400";
                      const warehouseItems = inventories.filter(inv => inv.warehouseId === w.id).length;
                      const warehouseQty   = inventories.filter(inv => inv.warehouseId === w.id).reduce((s, inv) => s + Number(inv.quantity || 0), 0);
                      return (
                        <div key={w.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{w.name}</p>
                            <p className="text-xs text-gray-400">{w.code}{w.managerName ? ` · ${w.managerName}` : ""}</p>
                          </div>
                          <div className="shrink-0 text-right mr-3">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{warehouseQty.toLocaleString("vi-VN")}</p>
                            <p className="text-[10px] text-gray-400">{warehouseItems} loại</p>
                          </div>
                          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${tagColor}`}>{w.status || "–"}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Quick actions — icon tiles */}
          <Card title="Thao Tác Nhanh" subtitle="Truy cập nhanh">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Nhập kho",    path: "/nhap-kho",             icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>, bg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400", border: "hover:border-cyan-200 dark:hover:border-cyan-800" },
                { label: "Xuất kho",    path: "/xuat-kho",             icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16V4m0 0l4 4m-4-4l-4 4M7 8v12m0 0L3 16m4 4l4-4" /></svg>, bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", border: "hover:border-emerald-200 dark:hover:border-emerald-800" },
                { label: "Đặt hàng",    path: "/don-dat-hang",         icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>, bg: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", border: "hover:border-amber-200 dark:hover:border-amber-800" },
                { label: "Kiểm kê",     path: "/kiem-ke",              icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, bg: "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400", border: "hover:border-violet-200 dark:hover:border-violet-800" },
                { label: "Nguyên liệu", path: "/quan-ly-nguyen-lieu",  icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>, bg: "bg-rose-50 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400", border: "hover:border-rose-200 dark:hover:border-rose-800" },
                { label: "Nhà cung cấp",path: "/quan-ly-nha-cung-cap", icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, bg: "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400", border: "hover:border-teal-200 dark:hover:border-teal-800" },
                { label: "Quản lý kho", path: "/quan-ly-kho",          icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, bg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", border: "hover:border-indigo-200 dark:hover:border-indigo-800" },
                { label: "Lịch",         path: "/calendar",             icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, bg: "bg-pink-50 text-pink-500 dark:bg-pink-900/30 dark:text-pink-400", border: "hover:border-pink-200 dark:hover:border-pink-800" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className={`group flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-800 ${a.border}`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${a.bg} transition-transform duration-200 group-hover:scale-110`}>
                    {a.icon}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-gray-600 dark:text-gray-400">{a.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </>
  );
}
