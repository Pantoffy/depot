"use client";

import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import { showToast } from "../../components/common/Toast";
import { stockService, type StockCheck } from "../../services/stockService";
import { warehouseService, type Warehouse } from "../../services/warehouseService";

const DEFAULT_PAGE_SIZE = 15;

const getLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDefaultRange = () => {
  const now = new Date();
  return {
    start: getLocalDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: getLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
};

const formatNumber = (v: number) => v.toLocaleString("vi-VN");

const formatDate = (s?: string) => {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const isCompleted = (status?: string) => {
  const n = String(status || "").trim().toLowerCase();
  return n === "completed" || n === "approved" || n === "hoÃ n thÃ nh" || n === "Ä‘Ã£ xÃ¡c nháº­n";
};

export default function StockCheckReport() {
  const defaultRange = useMemo(() => getDefaultRange(), []);

  const [checks, setChecks] = useState<StockCheck[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const [cList, wList] = await Promise.all([
          stockService.getAllStockChecks(),
          warehouseService.getAllWarehouses(),
        ]);
        setChecks(cList);
        setWarehouses(wList);
      } catch (err: any) {
        const msg = err?.message || "KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u bÃ¡o cÃ¡o kiá»ƒm kÃª";
        setErrorMessage(msg);
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { rows, stats } = useMemo(() => {
    const startTs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
    const endTs = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;

    const filtered = (checks || []).filter((c) => {
      const ts = new Date(c.checkTime || c.startDate || c.createdTime || "").getTime();
      if (!Number.isNaN(ts) && (ts < startTs || ts > endTs)) return false;

      if (warehouseFilter !== "" && Number(c.warehouseId) !== warehouseFilter) return false;

      if (statusFilter) {
        const n = String(c.status || "").trim().toLowerCase();
        if (statusFilter === "completed" && !isCompleted(c.status)) return false;
        if (statusFilter === "pending" && isCompleted(c.status)) return false;
        if (statusFilter === "inprogress" && n !== "inprogress" && n !== "Ä‘ang kiá»ƒm kÃª") return false;
      }

      const q = searchTerm.trim().toLowerCase();
      if (q) {
        const match =
          (c.code || "").toLowerCase().includes(q) ||
          (c.name || "").toLowerCase().includes(q) ||
          (c.warehouse?.name || "").toLowerCase().includes(q) ||
          (c.createdBy || "").toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const ta = new Date(a.checkTime || a.startDate || a.createdTime || "").getTime();
      const tb = new Date(b.checkTime || b.startDate || b.createdTime || "").getTime();
      return tb - ta;
    });

    const totalChecks = filtered.length;
    const completedCount = filtered.filter((c) => isCompleted(c.status)).length;
    const withDiscrepancy = filtered.filter((c) => {
      const details = c.stockCheckDetails || [];
      return details.some((d) => Number(d.difference || 0) !== 0);
    }).length;
    const totalItems = filtered.reduce((s, c) => s + (c.stockCheckDetails?.length || 0), 0);

    return {
      rows: filtered,
      stats: { totalChecks, completedCount, withDiscrepancy, totalItems },
    };
  }, [checks, searchTerm, warehouseFilter, statusFilter, startDate, endDate]);

  const itemsPerPage = DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = rows.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const resetPage = () => setCurrentPage(1);

  return (
    <>
      <PageMeta title="BÃ¡o cÃ¡o kiá»ƒm kÃª" description="Thá»‘ng kÃª phiáº¿u kiá»ƒm kÃª kho theo thá»i gian" />
      <PageBreadcrumb pageTitle="BÃ¡o cÃ¡o kiá»ƒm kÃª" />

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Äang táº£i dá»¯ liá»‡u bÃ¡o cÃ¡o...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Tá»•ng phiáº¿u kiá»ƒm kÃª</p>
              <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{formatNumber(stats.totalChecks)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">HoÃ n thÃ nh</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{formatNumber(stats.completedCount)}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300">CÃ³ chÃªnh lá»‡ch</p>
              <p className="mt-2 text-2xl font-semibold text-rose-900 dark:text-rose-200">{formatNumber(stats.withDiscrepancy)}</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Tá»•ng VT kiá»ƒm</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{formatNumber(stats.totalItems)}</p>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {errorMessage}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header */}
            <div className="border-b border-gray-200 p-5 dark:border-gray-800 lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">BÃ¡o cÃ¡o kiá»ƒm kÃª</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Danh sÃ¡ch phiáº¿u kiá»ƒm kÃª kho trong khoáº£ng thá»i gian Ä‘Ã£ chá»n.
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="grid gap-3 border-b border-gray-200 p-5 dark:border-gray-800 lg:grid-cols-4 lg:p-6">
              <div className="lg:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">TÃ¬m kiáº¿m</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                  placeholder="MÃ£ phiáº¿u, tÃªn, kho, ngÆ°á»i láº­p..."
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Kho</label>
                <select
                  value={warehouseFilter === "" ? "" : String(warehouseFilter)}
                  onChange={(e) => { setWarehouseFilter(e.target.value === "" ? "" : Number(e.target.value)); resetPage(); }}
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Táº¥t cáº£ kho</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tráº¡ng thÃ¡i</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="">Táº¥t cáº£</option>
                  <option value="completed">HoÃ n thÃ nh</option>
                  <option value="inprogress">Äang kiá»ƒm kÃª</option>
                  <option value="pending">Chá» xá»­ lÃ½</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Tá»« ngÃ y</label>
                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); resetPage(); }}
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Äáº¿n ngÃ y</label>
                <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); resetPage(); }}
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
              </div>
            </div>

            {/* Table */}
            <div className="p-5 lg:p-6">
              <div className="mb-4 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 lg:flex-row lg:items-center lg:justify-between">
                <p>BÃ¡o cÃ¡o dá»±a trÃªn {formatNumber(checks.length)} phiáº¿u kiá»ƒm kÃª.</p>
                <p>Hiá»ƒn thá»‹ {paginatedRows.length} / {formatNumber(rows.length)} phiáº¿u</p>
              </div>

              <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
                <table className="module-table min-w-[900px] w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <tr>
                      {["NgÃ y kiá»ƒm", "MÃ£ phiáº¿u", "TÃªn Ä‘á»£t kiá»ƒm", "Kho", "Sá»‘ VT kiá»ƒm", "CÃ³ chÃªnh lá»‡ch", "NgÆ°á»i láº­p", "Tráº¡ng thÃ¡i"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                          KhÃ´ng cÃ³ dá»¯ liá»‡u phÃ¹ há»£p vá»›i bá»™ lá»c hiá»‡n táº¡i.
                        </td>
                      </tr>
                    ) : paginatedRows.map((c) => {
                      const details = c.stockCheckDetails || [];
                      const discrepancyCount = details.filter((d) => Number(d.difference || 0) !== 0).length;
                      const completed = isCompleted(c.status);
                      const inProgress = String(c.status || "").trim().toLowerCase() === "inprogress" || String(c.status || "").trim().toLowerCase() === "Ä‘ang kiá»ƒm kÃª";
                      const statusCls = completed
                        ? "bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] dark:bg-emerald-900/20 dark:text-emerald-300"
                        : inProgress
                        ? "bg-sky-50 text-sky-700 shadow-[0_0_0_1px_rgba(14,165,233,0.2)] dark:bg-sky-900/20 dark:text-sky-300"
                        : "bg-amber-50 text-amber-700 shadow-[0_0_0_1px_rgba(245,158,11,0.2)] dark:bg-amber-900/20 dark:text-amber-300";
                      const statusText = completed ? "HoÃ n thÃ nh" : inProgress ? "Äang kiá»ƒm kÃª" : "Chá» xá»­ lÃ½";
                      return (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(c.checkTime || c.startDate || c.createdTime)}</td>
                          <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold tracking-tight text-gray-900 dark:text-white">{c.code}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                            <div className="max-w-[200px] truncate" title={c.name}>{c.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{c.warehouse?.name || `Kho ${c.warehouseId}`}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{details.length}</td>
                          <td className="px-6 py-4">
                            {discrepancyCount > 0 ? (
                              <span className="status-pill bg-rose-50 text-rose-700 shadow-[0_0_0_1px_rgba(225,29,72,0.2)] dark:bg-rose-900/20 dark:text-rose-300">
                                {discrepancyCount} VT
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">â€”</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{c.createdBy || "-"}</td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className={`status-pill ${statusCls}`}>{statusText}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={rows.length}
                startItem={paginatedRows.length > 0 ? (safePage - 1) * itemsPerPage + 1 : 0}
                endItem={Math.min(safePage * itemsPerPage, rows.length)}
                onPageChange={setCurrentPage}
                labelPrefix="Hiá»ƒn thá»‹"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
