"use client";

import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import { showToast } from "../../components/common/Toast";
import { exportService, type ExportReceipt } from "../../services/exportService";
import { importService, type ImportReceipt } from "../../services/importService";
import {
  inventoryService,
  type InventoryItem,
} from "../../services/inventoryService";
import { materialService, type Material } from "../../services/materialService";
import { unitService, type Unit } from "../../services/unitService";
import { warehouseService, type Warehouse } from "../../services/warehouseService";
import { downloadExcelFromApi } from "../../services/excelExportService";

type MovementType = "import" | "export";

type MovementEntry = {
  dateTs: number;
  type: MovementType;
  quantity: number;
  amount: number;
};

type LedgerRow = {
  key: string;
  warehouseId: number;
  warehouseName: string;
  materialId: number;
  materialCode: string;
  materialName: string;
  categoryName: string;
  unitName: string;
  openingQuantity: number;
  importQuantity: number;
  exportQuantity: number;
  endingQuantity: number;
  importValue: number;
  exportValue: number;
  currentQuantity: number;
  lastActivityDate?: string;
};

const DEFAULT_PAGE_SIZE = 10;

const getLocalDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultRange = () => {
  const now = new Date();
  return {
    start: getLocalDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: getLocalDateInputValue(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
};

const getDayStartTimestamp = (dateValue?: string) => {
  if (!dateValue) return Number.NEGATIVE_INFINITY;
  const timestamp = new Date(`${dateValue}T00:00:00`).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

const getDayEndTimestamp = (dateValue?: string) => {
  if (!dateValue) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(`${dateValue}T23:59:59.999`).getTime();
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
};

const getDateTimestamp = (value?: string) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const isApprovedStatus = (status?: string) => {
  const normalized = String(status || "").trim().toLowerCase();
  return (
    normalized === "approved" ||
    normalized === "confirmed" ||
    normalized === "đã xác nhận" ||
    normalized === "da xac nhan"
  );
};

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

const formatNumber = (value: number) => value.toLocaleString("vi-VN");

const resolveMovementAmount = (detail: any, quantity: number) => {
  const amount = Number(detail?.amount);
  if (!Number.isNaN(amount) && amount > 0) return amount;

  const unitPrice = Number(detail?.unitPrice);
  if (!Number.isNaN(unitPrice) && unitPrice > 0) {
    return unitPrice * quantity;
  }

  return 0;
};

const getReceiptDate = (receipt: ImportReceipt | ExportReceipt, type: MovementType) => {
  // Some receipt types use different field names across import/export models.
  // Use safe access via `any` or `in` checks to avoid TypeScript errors when properties differ.
  if (type === "import") {
    return (receipt as any)?.importTime || (receipt as any)?.createdAt || "";
  }

  return (receipt as any)?.exportDate || (receipt as any)?.createdAt || "";
};

export default function StockLedgerReport() {
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [importReceipts, setImportReceipts] = useState<ImportReceipt[]>([]);
  const [exportReceipts, setExportReceipts] = useState<ExportReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<number | "">("");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [inventoryList, materialList, warehouseList, unitList, importList, exportList] =
        await Promise.all([
          inventoryService.getAllInventories(),
          materialService.getAllMaterials(),
          warehouseService.getAllWarehouses(),
          unitService.getAllUnits(),
          importService.getAllImportReceipts(),
          exportService.getAllExportReceipts(),
        ]);

      setInventories(inventoryList);
      setMaterials(materialList);
      setWarehouses(warehouseList);
      setUnits(unitList);
      setImportReceipts(importList);
      setExportReceipts(exportList);
    } catch (error: any) {
      const message = error?.message || "Không thể tải dữ liệu báo cáo xuất nhập tồn";
      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const { rows, summaryStats } = useMemo(() => {
    const currentQuantityByKey = new Map<string, number>();
    const inventoryUpdatedByKey = new Map<string, string | undefined>();

    (inventories || []).forEach((item) => {
      if (!item?.warehouseId || !item?.materialId) return;
      const key = `${item.warehouseId}-${item.materialId}`;
      currentQuantityByKey.set(key, Number(item.quantity || 0));
      inventoryUpdatedByKey.set(key, item.updatedDate);
    });

    const movementByKey = new Map<string, MovementEntry[]>();
    const addMovement = (key: string, entry: MovementEntry) => {
      const list = movementByKey.get(key) || [];
      list.push(entry);
      movementByKey.set(key, list);
    };

    (importReceipts || []).forEach((receipt) => {
      if (!isApprovedStatus(receipt?.status)) return;

      const warehouseId = Number(receipt?.warehouseId || receipt?.warehouse?.id || 0);
      if (!warehouseId) return;

      const receiptDate = getReceiptDate(receipt, "import");
      const receiptTs = getDateTimestamp(receiptDate);
      const details = receipt?.importReceiptDetails || [];

      details.forEach((detail: any) => {
        const materialId = Number(detail?.materialId || detail?.material?.id || 0);
        const quantity = Number(detail?.quantity || 0);
        if (!materialId || quantity <= 0) return;

        addMovement(`${warehouseId}-${materialId}`, {
          dateTs: receiptTs,
          type: "import",
          quantity,
          amount: resolveMovementAmount(detail, quantity),
        });
      });
    });

    (exportReceipts || []).forEach((receipt) => {
      if (!isApprovedStatus(receipt?.status)) return;

      const warehouseId = Number(receipt?.warehouseId || receipt?.warehouse?.id || 0);
      if (!warehouseId) return;

      const receiptDate = getReceiptDate(receipt, "export");
      const receiptTs = getDateTimestamp(receiptDate);
      // Some APIs may name details differently; use `any` to access flexibly.
      const details = (receipt as any)?.exportReceiptDetails || (receipt as any)?.exportReceiptDetail || (receipt as any)?.details || [];

      details.forEach((detail: any) => {
        const materialId = Number(detail?.materialId || detail?.material?.id || 0);
        const quantity = Number(detail?.quantity || 0);
        if (!materialId || quantity <= 0) return;

        addMovement(`${warehouseId}-${materialId}`, {
          dateTs: receiptTs,
          type: "export",
          quantity,
          amount: resolveMovementAmount(detail, quantity),
        });
      });
    });

    const startTs = getDayStartTimestamp(startDate);
    const endTs = getDayEndTimestamp(endDate);

    const materialById = new Map<number, Material>(materials.map((item) => [Number(item.id), item]));
    const warehouseById = new Map<number, Warehouse>(warehouses.map((item) => [Number(item.id), item]));
    const unitById = new Map<number, Unit>(units.map((item) => [Number(item.id), item]));

    const keySet = new Set<string>([...currentQuantityByKey.keys(), ...movementByKey.keys()]);
    // Build initial rows array
    const initialRows = Array.from(keySet).map((key) => {
        const [warehouseIdText, materialIdText] = key.split("-");
        const warehouseId = Number(warehouseIdText);
        const materialId = Number(materialIdText);
        if (!warehouseId || !materialId) return null;

        const warehouse = warehouseById.get(warehouseId);
        const material = materialById.get(materialId);
        const movementEntries = movementByKey.get(key) || [];
        const currentQuantity = Number(currentQuantityByKey.get(key) || 0);

        let openingDelta = 0;
        let periodImportQuantity = 0;
        let periodExportQuantity = 0;
        let importValue = 0;
        let exportValue = 0;
        let lastActivityTs = inventoryUpdatedByKey.has(key) ? getDateTimestamp(inventoryUpdatedByKey.get(key)) : 0;

        movementEntries.forEach((movement) => {
          const isAfterStart = movement.dateTs >= startTs;
          const isInPeriod = movement.dateTs >= startTs && movement.dateTs <= endTs;

          if (isAfterStart) {
            openingDelta += movement.type === "import" ? movement.quantity : -movement.quantity;
          }

          if (isInPeriod) {
            if (movement.type === "import") {
              periodImportQuantity += movement.quantity;
              importValue += movement.amount;
            } else {
              periodExportQuantity += movement.quantity;
              exportValue += movement.amount;
            }
          }

          if (movement.dateTs > lastActivityTs) {
            lastActivityTs = movement.dateTs;
          }
        });

        const openingQuantity = currentQuantity - openingDelta;
        const endingQuantity = openingQuantity + periodImportQuantity - periodExportQuantity;

        return {
          key,
          warehouseId,
          warehouseName: warehouse?.name || `Kho ${warehouseId}`,
          materialId,
          materialCode: material?.code || "N/A",
          materialName: material?.name || `Vật tư ${materialId}`,
          categoryName: material?.categoryName || "N/A",
          unitName:
            material?.unitName ||
            (material as any)?.unit?.name ||
            unitById.get(Number((material as any)?.unitId))?.name ||
            "-",
          openingQuantity,
          importQuantity: periodImportQuantity,
          exportQuantity: periodExportQuantity,
          endingQuantity,
          importValue,
          exportValue,
          currentQuantity,
          lastActivityDate: lastActivityTs > 0 ? new Date(lastActivityTs).toISOString() : inventoryUpdatedByKey.get(key),
        } as LedgerRow | null;
    });

    // Filter out nulls and apply search/warehouse filters
    let computedRows = (initialRows.filter(Boolean) as LedgerRow[]).filter((row: LedgerRow) => {
      const matchesWarehouse = warehouseFilter === "" || row.warehouseId === warehouseFilter;

      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        row.warehouseName.toLowerCase().includes(query) ||
        row.materialCode.toLowerCase().includes(query) ||
        row.materialName.toLowerCase().includes(query) ||
        row.categoryName.toLowerCase().includes(query) ||
        row.unitName.toLowerCase().includes(query);

      return matchesWarehouse && matchesSearch;
    });

    // Sort rows
    computedRows.sort((left: LedgerRow, right: LedgerRow) => {
      const byWarehouse = left.warehouseName.localeCompare(right.warehouseName, "vi");
      if (byWarehouse !== 0) return byWarehouse;

      return left.materialName.localeCompare(right.materialName, "vi");
    });

    const totals = computedRows.reduce(
      (accumulator: any, row: LedgerRow) => {
        accumulator.totalOpeningQuantity += row.openingQuantity;
        accumulator.totalImportQuantity += row.importQuantity;
        accumulator.totalExportQuantity += row.exportQuantity;
        accumulator.totalEndingQuantity += row.endingQuantity;
        accumulator.totalImportValue += row.importValue;
        accumulator.totalExportValue += row.exportValue;
        return accumulator;
      },
      {
        totalRows: computedRows.length,
        totalOpeningQuantity: 0,
        totalImportQuantity: 0,
        totalExportQuantity: 0,
        totalEndingQuantity: 0,
        totalImportValue: 0,
        totalExportValue: 0,
      },
    );

    return {
      rows: computedRows,
      summaryStats: totals,
    };
  }, [
    inventories,
    importReceipts,
    exportReceipts,
    materials,
    warehouses,
    units,
    startDate,
    endDate,
    searchTerm,
    warehouseFilter,
  ]);

  const itemsPerPage = DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedRows = rows.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleWarehouseChange = (value: string) => {
    setWarehouseFilter(value === "" ? "" : Number(value));
    setCurrentPage(1);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    setCurrentPage(1);
  };

  const handleExportCsv = async () => {
    if (rows.length === 0) {
      showToast("Không có dữ liệu để xuất", "warning");
      return;
    }
    try {
      await downloadExcelFromApi("/api/ExcelExport/inventory", `ton-kho_${startDate}_den_${endDate}.xlsx`);
      showToast(`Đã xuất ${rows.length} dòng báo cáo`, "success");
    } catch (error: any) {
      showToast(error.message || "Lỗi khi xuất Excel", "error");
    }
  };

  return (
    <>
      <PageMeta title="Báo cáo xuất nhập tồn" description="Báo cáo xuất nhập tồn theo kho và vật tư" />
      <PageBreadcrumb pageTitle="Báo cáo xuất nhập tồn" />

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu báo cáo...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Dòng báo cáo</p>
              <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{summaryStats.totalRows}</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Tồn đầu kỳ</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{formatNumber(summaryStats.totalOpeningQuantity)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Nhập trong kỳ</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{formatNumber(summaryStats.totalImportQuantity)}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300">Xuất trong kỳ</p>
              <p className="mt-2 text-2xl font-semibold text-rose-900 dark:text-rose-200">{formatNumber(summaryStats.totalExportQuantity)}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Tồn cuối kỳ</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">{formatNumber(summaryStats.totalEndingQuantity)}</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4 dark:border-violet-500/30 dark:from-violet-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Giá trị nhập</p>
              <p className="mt-2 text-2xl font-semibold text-violet-900 dark:text-violet-200">{formatNumber(summaryStats.totalImportValue)}₫</p>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {errorMessage}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-200 p-5 dark:border-gray-800 lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Báo cáo xuất nhập tồn</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Đối chiếu tồn kho hiện tại với phiếu nhập và xuất đã duyệt trong khoảng thời gian đã chọn.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                  >
                    Xuất Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-b border-gray-200 p-5 dark:border-gray-800 lg:grid-cols-4 lg:p-6">
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Tìm kho, mã vật tư, tên vật tư, đơn vị..."
                  className="h-[48px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Kho
                </label>
                <select
                  value={warehouseFilter === "" ? "" : String(warehouseFilter)}
                  onChange={(event) => handleWarehouseChange(event.target.value)}
                  className="h-[48px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm transition-all duration-200"
                >
                  <option value="">Tất cả kho</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => handleStartDateChange(event.target.value)}
                  className="h-[48px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm transition-all duration-200"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => handleEndDateChange(event.target.value)}
                  className="h-[48px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 text-sm text-gray-900 dark:text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="p-5 lg:p-6">
              <div className="mb-4 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 lg:flex-row lg:items-center lg:justify-between">
                <p>
                  Báo cáo dựa trên {formatNumber(inventories.length)} dòng tồn kho hiện tại, {formatNumber(importReceipts.length)} phiếu nhập và {formatNumber(exportReceipts.length)} phiếu xuất.
                </p>
                <p>
                  Hiển thị {paginatedRows.length} / {formatNumber(rows.length)} dòng
                </p>
              </div>

              <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-gray-200 dark:border-gray-800">
                <table className="module-table min-w-[1400px] w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Kho</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Mã vật tư</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tên vật tư</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Phân loại</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Đơn vị</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tồn đầu kỳ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Nhập kỳ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Xuất kỳ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tồn cuối kỳ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Cập nhật gần nhất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          Không có dữ liệu phù hợp với bộ lọc hiện tại.
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row) => {
                        const stockTone =
                          row.endingQuantity <= 0
                            ? "bg-rose-50 text-rose-700 shadow-[0_0_0_1px_rgba(225,29,72,0.2)] dark:bg-rose-900/20 dark:text-rose-300"
                            : row.endingQuantity <= 10
                              ? "bg-amber-50 text-amber-700 shadow-[0_0_0_1px_rgba(245,158,11,0.2)] dark:bg-amber-900/20 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] dark:bg-emerald-900/20 dark:text-emerald-300";

                        return (
                          <tr
                            key={row.key}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{row.warehouseName}</td>
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold tracking-tight text-gray-900 dark:text-white">{row.materialCode}</td>
                            <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                              <div className="max-w-[220px] truncate" title={row.materialName}>
                                {row.materialName}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">{row.categoryName}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">{row.unitName}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-gray-900 dark:text-gray-100">{formatNumber(row.openingQuantity)}</td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="status-pill bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] dark:bg-emerald-900/20 dark:text-emerald-300">
                                {formatNumber(row.importQuantity)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="status-pill bg-rose-50 text-rose-700 shadow-[0_0_0_1px_rgba(225,29,72,0.2)] dark:bg-rose-900/20 dark:text-rose-300">
                                {formatNumber(row.exportQuantity)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className={`status-pill ${stockTone}`}>
                                {formatNumber(row.endingQuantity)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">{formatDateTime(row.lastActivityDate)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={rows.length}
                startItem={paginatedRows.length > 0 ? (safeCurrentPage - 1) * itemsPerPage + 1 : 0}
                endItem={Math.min(safeCurrentPage * itemsPerPage, rows.length)}
                onPageChange={setCurrentPage}
                labelPrefix="Hiển thị"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}