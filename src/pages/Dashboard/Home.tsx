import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { materialService, Material } from "../../services/materialService";
import { supplierService, Supplier } from "../../services/supplierService";
import { warehouseService, Warehouse } from "../../services/warehouseService";
import { importService, ImportReceipt } from "../../services/importService";
import { unitService, Unit, DEFAULT_UNITS } from "../../services/unitService";

// ========== COMPONENTS ==========

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
}) => {
  const colorMap: Record<string, { bg: string; iconBg: string }> = {
    blue: {
      bg: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-400/30",
    },
    green: {
      bg: "from-green-500 to-green-600",
      iconBg: "bg-green-400/30",
    },
    orange: {
      bg: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-400/30",
    },
    red: {
      bg: "from-red-500 to-red-600",
      iconBg: "bg-red-400/30",
    },
    purple: {
      bg: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-400/30",
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${c.bg} p-5 text-white shadow-lg ${onClick ? "cursor-pointer hover:shadow-xl transition-shadow" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-white/70">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-xl ${c.iconBg} p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [imports, setImports] = useState<ImportReceipt[]>([]);
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mats, sups, whs, imps] = await Promise.allSettled([
        materialService.getAllMaterials(),
        supplierService.getAllSuppliers(),
        warehouseService.getAllWarehouses(),
        importService.getAllImportReceipts(),
      ]);

      if (mats.status === "fulfilled") setMaterials(mats.value);
      if (sups.status === "fulfilled") setSuppliers(sups.value);
      if (whs.status === "fulfilled") setWarehouses(whs.value);
      if (imps.status === "fulfilled") setImports(imps.value);

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

  // ========== Computed values ==========
  const activeMaterials = materials.filter((m) => m.status === "Đang kinh doanh");
  const lowStockMaterials = materials
    .filter((m) => m.stockQuantity <= 10 && m.status === "Đang kinh doanh")
    .sort((a, b) => a.stockQuantity - b.stockQuantity);

  const activeSuppliers = suppliers.filter((s) => s.status === "Đang hoạt động" || s.status === "Đang kinh doanh");
  const activeWarehouses = warehouses.filter((w) => w.status === "Đang hoạt động" || w.status === "Đang kinh doanh");

  const recentImports = [...imports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentMaterials = [...materials]
    .sort((a, b) => new Date(b.createdTime || "").getTime() - new Date(a.createdTime || "").getTime())
    .slice(0, 5);

  // Helpers
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

  // Total import value
  const totalImportValue = imports.reduce((sum, imp) => sum + (imp.totalAmount || 0), 0);

  if (loading) {
    return (
      <>
        <PageMeta title="Tổng Quan | Quản Lý Kho" description="Tổng quan hệ thống quản lý kho" />
        <PageBreadcrumb pageTitle="Tổng Quan" />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Tổng Quan | Quản Lý Kho" description="Tổng quan hệ thống quản lý kho" />
      <PageBreadcrumb pageTitle="Tổng Quan" />

      {/* Cảnh báo tồn kho thấp */}
      {lowStockMaterials.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">
                Cảnh báo: {lowStockMaterials.length} nguyên liệu tồn kho thấp
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {lowStockMaterials.slice(0, 3).map((m) => m.name).join(", ")}
                {lowStockMaterials.length > 3 && ` và ${lowStockMaterials.length - 3} nguyên liệu khác`}
                {" "} — cần nhập thêm hàng.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
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
          title="Nhà Cung Cấp"
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
          subtitle={`${activeWarehouses.length} đang hoạt động`}
          color="purple"
          onClick={() => navigate("/quan-ly-kho")}
          icon={
            <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          title="Phiếu Nhập"
          value={imports.length}
          subtitle={totalImportValue > 0 ? `Tổng: ${formatCurrency(totalImportValue)}` : undefined}
          color="orange"
          onClick={() => navigate("/nhap-kho")}
          icon={
            <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">

        {/* Nguyên liệu tồn kho thấp */}
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Nguyên Liệu Tồn Kho Thấp
            </h3>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {lowStockMaterials.length}
            </span>
          </div>
          <div className="p-5">
            {lowStockMaterials.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                Tất cả nguyên liệu đều đủ tồn kho
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockMaterials.slice(0, 6).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-white/[0.03] p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {m.code} • {m.categoryName || "Chưa phân loại"}
                      </p>
                    </div>
                    <div className="ml-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          m.stockQuantity <= 0
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : m.stockQuantity <= 5
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {m.stockQuantity} {getUnitName(m)}
                      </span>
                    </div>
                  </div>
                ))}
                {lowStockMaterials.length > 6 && (
                  <button
                    onClick={() => navigate("/quan-ly-nguyen-lieu")}
                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline py-2"
                  >
                    Xem tất cả {lowStockMaterials.length} nguyên liệu →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phiếu nhập gần đây */}
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Phiếu Nhập Gần Đây
            </h3>
            <button
              onClick={() => navigate("/nhap-kho")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="overflow-x-auto">
            {recentImports.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Chưa có phiếu nhập nào
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Mã Phiếu</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">NCC</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Giá Trị</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentImports.map((imp) => (
                    <tr key={imp.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                        {imp.code}
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                        {imp.supplier?.name || `NCC #${imp.supplierId}`}
                      </td>
                      <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">
                        {formatCurrency(imp.totalAmount)}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        {formatDate(imp.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">

        {/* Nguyên liệu mới thêm */}
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Nguyên Liệu Mới Thêm
            </h3>
            <button
              onClick={() => navigate("/quan-ly-nguyen-lieu")}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Xem tất cả →
            </button>
          </div>
          <div className="overflow-x-auto">
            {recentMaterials.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Chưa có nguyên liệu nào
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Tên</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Mã</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Tồn Kho</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Ngày Tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">
                        {m.name}
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                        {m.code}
                      </td>
                      <td className="px-5 py-3 text-gray-900 dark:text-white">
                        {m.stockQuantity} {getUnitName(m)}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                        {formatDate(m.createdTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Danh sách nhà cung cấp + kho */}
        <div className="space-y-6">
          {/* Nhà cung cấp */}
          <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Nhà Cung Cấp
              </h3>
              <button
                onClick={() => navigate("/quan-ly-nha-cung-cap")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="p-5">
              {suppliers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Chưa có nhà cung cấp nào
                </p>
              ) : (
                <div className="space-y-3">
                  {suppliers.slice(0, 4).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-green-700 dark:text-green-400">
                            {(s.name || s.code || "?")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {s.name || s.code}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {s.phone || s.email || s.type}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.status === "Đang hoạt động" || s.status === "Đang kinh doanh"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kho */}
          <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03]">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Danh Sách Kho
              </h3>
              <button
                onClick={() => navigate("/quan-ly-kho")}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="p-5">
              {warehouses.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Chưa có kho nào
                </p>
              ) : (
                <div className="space-y-3">
                  {warehouses.slice(0, 4).map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {w.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {w.address || w.code}
                            {w.area ? ` • ${w.area}m²` : ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          w.status === "Đang hoạt động" || w.status === "Đang kinh doanh"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Thao Tác Nhanh
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/nhap-kho")}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nhập Kho</span>
          </button>
          <button
            onClick={() => navigate("/xuat-kho")}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-300 dark:hover:border-orange-700 transition-all"
          >
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Xuất Kho</span>
          </button>
          <button
            onClick={() => navigate("/quan-ly-nguyen-lieu")}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-300 dark:hover:border-green-700 transition-all"
          >
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nguyên Liệu</span>
          </button>
          <button
            onClick={() => navigate("/don-dat-hang")}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-300 dark:hover:border-purple-700 transition-all"
          >
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Đơn Đặt Hàng</span>
          </button>
        </div>
      </div>
    </>
  );
}
