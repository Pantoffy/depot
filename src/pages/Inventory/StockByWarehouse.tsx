"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import { showToast } from "../../components/common/Toast";
import { exportService } from "../../services/exportService";
import { importService } from "../../services/importService";
import { inventoryService } from "../../services/inventoryService";
import { materialService } from "../../services/materialService";
import { unitService } from "../../services/unitService";
import { warehouseService, Warehouse } from "../../services/warehouseService";

// Dropdown Action Component
const ActionDropdown = ({ 
  onView
}: { 
  onView: () => void;
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onView}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Xem chi tiết"
      >
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
    </div>
  );
};

interface StockItem {
  id?: number;
  warehouseId: number;
  warehouseName: string;
  materialId: number;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitName: string;
  categoryName: string;
  updatedDate?: string;
  lastImportDate?: string;
  lastExportDate?: string;
  exportCount: number;
}

type SelectOption = {
  value: string;
  label: string;
};

export default function StockByWarehouse() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState<number | "">("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isApprovedReceipt = (status?: string) => {
    const normalized = String(status || "")
      .trim()
      .toLowerCase();

    return (
      normalized === "approved" ||
      normalized === "confirmed" ||
      normalized === "đã xác nhận" ||
      normalized === "da xac nhan"
    );
  };

  const getDateTimestamp = (value?: string) => {
    if (!value) return 0;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? 0 : t;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventories, materials, warehouses_list, units] = await Promise.all([
        inventoryService.getAllInventories(),
        materialService.getAllMaterials(),
        warehouseService.getAllWarehouses(),
        unitService.getAllUnits(),
      ]);

      const [importReceipts, exportReceipts] = await Promise.all([
        importService.getAllImportReceipts(),
        exportService.getAllExportReceipts(),
      ]);

      setWarehouses(warehouses_list);

      const movementStats = new Map<
        string,
        {
          lastImportDate?: string;
          lastExportDate?: string;
          exportCount: number;
        }
      >();

      const updateLatestDate = (
        currentDate: string | undefined,
        incomingDate: string | undefined,
      ) => {
        if (!incomingDate) return currentDate;
        if (!currentDate) return incomingDate;

        return getDateTimestamp(incomingDate) >= getDateTimestamp(currentDate)
          ? incomingDate
          : currentDate;
      };

      (importReceipts || []).forEach((receipt: any) => {
        if (!isApprovedReceipt(receipt?.status)) return;

        const warehouseId = Number(receipt?.warehouseId || receipt?.warehouse?.id || 0);
        if (!warehouseId) return;

        const receiptDate = receipt?.importTime || receipt?.createdAt;
        const details = receipt?.importReceiptDetails || [];

        details.forEach((detail: any) => {
          const materialId = Number(detail?.materialId || detail?.material?.id || 0);
          if (!materialId) return;

          const key = `${warehouseId}-${materialId}`;
          const existing = movementStats.get(key) || { exportCount: 0 };

          movementStats.set(key, {
            ...existing,
            lastImportDate: updateLatestDate(existing.lastImportDate, receiptDate),
          });
        });
      });

      (exportReceipts || []).forEach((receipt: any) => {
        if (!isApprovedReceipt(receipt?.status)) return;

        const warehouseId = Number(receipt?.warehouseId || receipt?.warehouse?.id || 0);
        if (!warehouseId) return;

        const receiptDate = receipt?.exportDate || receipt?.createdAt;
        const details =
          receipt?.exportReceiptDetails ||
          receipt?.exportReceiptDetail ||
          receipt?.details ||
          [];

        details.forEach((detail: any) => {
          const materialId = Number(detail?.materialId || detail?.material?.id || 0);
          if (!materialId) return;

          const key = `${warehouseId}-${materialId}`;
          const existing = movementStats.get(key) || { exportCount: 0 };

          movementStats.set(key, {
            ...existing,
            lastExportDate: updateLatestDate(existing.lastExportDate, receiptDate),
            exportCount: Number(existing.exportCount || 0) + 1,
          });
        });
      });

      // Combine inventory data with material and warehouse info
      const combined: StockItem[] = (inventories || []).map((inv) => {
        const material = materials.find(
          (m: any) => Number(m.id) === Number(inv.materialId),
        );
        const warehouse = warehouses_list.find((w) => w.id === inv.warehouseId);
        const key = `${inv.warehouseId}-${inv.materialId}`;
        const movement = movementStats.get(key);
        const resolvedUnitName =
          material?.unitName ||
          (material as any)?.unit?.name ||
          units.find((u) => Number(u.id) === Number((material as any)?.unitId))?.name ||
          "-";

        return {
          id: inv.id,
          warehouseId: inv.warehouseId,
          warehouseName: warehouse?.name || "Không xác định",
          materialId: inv.materialId,
          materialCode: material?.code || "N/A",
          materialName: material?.name || "Không xác định",
          quantity: inv.quantity,
          unitName: resolvedUnitName,
          categoryName: material?.categoryName || "N/A",
          updatedDate: inv.updatedDate,
          lastImportDate: movement?.lastImportDate,
          lastExportDate: movement?.lastExportDate,
          exportCount: Number(movement?.exportCount || 0),
        };
      });

      setStockItems(combined);
    } catch (error: any) {
      let errorMsg = "Không thể tải dữ liệu tồn kho";
      if (error.response) {
        errorMsg = `API Error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "Không thể kết nối tới server";
      }
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search term and warehouse filter
  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWarehouse = filterWarehouse === "" || item.warehouseId === filterWarehouse;

    return matchesSearch && matchesWarehouse;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleWarehouseFilterChange = (value: string) => {
    setFilterWarehouse(value === "" ? "" : parseInt(value));
    setCurrentPage(1);
  };

  const handleViewDetail = (item: StockItem) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const summaryStats = useMemo(() => {
    const totalQuantity = stockItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const warehouseCount = new Set(stockItems.map((item) => item.warehouseId)).size;
    const lowStockCount = stockItems.filter((item) => item.quantity > 0 && item.quantity <= 10).length;
    const outOfStockCount = stockItems.filter((item) => item.quantity <= 0).length;
    const totalExportCount = stockItems.reduce((sum, item) => sum + Number(item.exportCount || 0), 0);

    return {
      totalItems: stockItems.length,
      totalQuantity,
      warehouseCount,
      lowStockCount,
      outOfStockCount,
      totalExportCount,
    };
  }, [stockItems]);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStockBadgeClass = (quantity: number) => {
    if (quantity <= 0) {
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
    }

    if (quantity <= 10) {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    }

    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  };

  const getStockLabel = (quantity: number) => {
    if (quantity <= 0) return "Hết hàng";
    if (quantity <= 10) return "Sắp hết";
    return "Ổn định";
  };

  return (
    <>
      <PageMeta title="Quản lý tồn kho" description="Quản lý tồn kho của các nguyên liệu theo kho" />
      <PageBreadcrumb pageTitle="Quản lý tồn kho" />

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <div className="form-tone-sync space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Dòng tồn kho</p>
              <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{summaryStats.totalItems}</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Tổng số lượng</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{summaryStats.totalQuantity.toLocaleString("vi-VN")}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Kho có tồn</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{summaryStats.warehouseCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Sắp hết hàng</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">{summaryStats.lowStockCount}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300">Đã hết hàng</p>
              <p className="mt-2 text-2xl font-semibold text-rose-900 dark:text-rose-200">{summaryStats.outOfStockCount}</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 dark:border-violet-500/30 dark:from-violet-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Tổng lượt xuất</p>
              <p className="mt-2 text-2xl font-semibold text-violet-900 dark:text-violet-200">{summaryStats.totalExportCount.toLocaleString("vi-VN")}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-200 p-5 dark:border-gray-800 lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Danh sách tồn kho theo kho</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Theo dõi số lượng vật tư tại từng kho theo thời gian cập nhật mới nhất.</p>
                </div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Làm mới dữ liệu
                </button>
              </div>
            </div>

            <div className="m-6 mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-xl">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm theo kho, mã nguyên liệu hoặc tên nguyên liệu"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <CustomSelect
                value={filterWarehouse === "" ? "" : String(filterWarehouse)}
                onChange={handleWarehouseFilterChange}
                options={[
                  { value: "", label: "Tất cả kho" },
                  ...warehouses.map((warehouse) => ({
                    value: String(warehouse.id),
                    label: warehouse.name,
                  })),
                ]}
                buttonClassName="w-full lg:w-72"
              />
            </div>

            <div className="mx-6 mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full min-w-[1540px] text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Kho</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Mã nguyên liệu</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tên nguyên liệu</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Phân loại</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Số lượng</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Trạng thái tồn</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Ngày nhập gần nhất</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Ngày xuất gần nhất</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Số lần xuất</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Đơn vị</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Cập nhật lúc</th>
                    <th className="whitespace-nowrap px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-300">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                        Không có dữ liệu tồn kho
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={`${item.warehouseId}-${item.materialId}`} className="transition-colors odd:bg-white even:bg-gray-50/60 hover:bg-blue-50/60 dark:odd:bg-transparent dark:even:bg-gray-800/20 dark:hover:bg-blue-900/20">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          <div className="max-w-[160px] truncate" title={item.warehouseName}>
                            {item.warehouseName}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-900 dark:text-gray-100">{item.materialCode}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                          <div className="max-w-[180px] truncate" title={item.materialName}>
                            {item.materialName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex max-w-[150px] truncate rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" title={item.categoryName}>
                            {item.categoryName}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">{item.quantity.toLocaleString("vi-VN")}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStockBadgeClass(item.quantity)}`}>
                            {getStockLabel(item.quantity)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(item.lastImportDate)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(item.lastExportDate)}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                            {Number(item.exportCount || 0).toLocaleString("vi-VN")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{item.unitName}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(item.updatedDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <ActionDropdown onView={() => handleViewDetail(item)} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
              startItem={paginatedItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              endItem={currentPage * itemsPerPage}
              onPageChange={setCurrentPage}
              labelPrefix="Hien thi"
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-6 py-4 dark:border-gray-800 dark:from-blue-950/30 dark:to-transparent">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                Chi Tiết Tồn Kho
              </h3>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Kho
                </label>
                <p className="text-black dark:text-white">{selectedItem.warehouseName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mã Nguyên Liệu
                </label>
                <p className="text-black dark:text-white">{selectedItem.materialCode}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tên Nguyên Liệu
                </label>
                <p className="text-black dark:text-white">{selectedItem.materialName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Phân Loại
                </label>
                <p className="text-black dark:text-white">{selectedItem.categoryName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Số Lượng
                </label>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{selectedItem.quantity}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Đơn Vị
                </label>
                <p className="text-black dark:text-white">{selectedItem.unitName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cập Nhật Lúc
                </label>
                <p className="text-black dark:text-white">
                  {selectedItem.updatedDate
                    ? new Date(selectedItem.updatedDate).toLocaleString("vi-VN")
                    : "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ngày Nhập Gần Nhất
                </label>
                <p className="text-black dark:text-white">{formatDateTime(selectedItem.lastImportDate)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ngày Xuất Gần Nhất
                </label>
                <p className="text-black dark:text-white">{formatDateTime(selectedItem.lastExportDate)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Số Lần Xuất
                </label>
                <p className="text-black dark:text-white">{Number(selectedItem.exportCount || 0).toLocaleString("vi-VN")}</p>
              </div>
            </div>

            <div className="mt-2 flex justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              <button
                onClick={() => setShowDetail(false)}
                className="inline-flex items-center justify-center rounded-md border border-stroke px-4 py-2 text-center font-medium text-gray-700 hover:bg-gray-100 dark:border-strokedark dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
  buttonClassName = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={wrapperRef} className={`relative ${buttonClassName}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-blue-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <ul className="max-h-56 overflow-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <li key={`${option.value}-${option.label}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
