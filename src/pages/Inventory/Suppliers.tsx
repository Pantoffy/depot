"use client";

import { Search, SlidersHorizontal, Eye, Pencil, Trash2, Download, ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { supplierService, Supplier } from "../../services/supplierService";
import { useAuth } from "../../context/AuthContext";
import { downloadExcelFromApi } from "../../services/excelExportService";

// Component: Dropdown hành động (View/Edit/Delete nhà cung cấp)
const ActionDropdown = ({ 
  onView, 
  onEdit, 
  onDelete
}: { 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  return (
    <div className="flex gap-1.5">
      <button
        onClick={onView}
        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        title="Xem chi tiết"
      >
        <Eye className="w-4 h-4 text-blue-500" />
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
        title="Chỉnh sửa"
      >
        <Pencil className="w-4 h-4 text-orange-500" />
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Xóa"
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
};

export default function Suppliers() {
  const { canApprove } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ status: string[]; type: string[] }>({
    status: [],
    type: [],
  });
  const [formData, setFormData] = useState({
    code: "",
    type: "",
    name: "",
    contactPerson: "",
    title: "",
    phone: "",
    email: "",
    role: "",
    citizenId: "",
    address: "",
    status: "Hoạt động",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAllSuppliers();
      console.log("Suppliers data:", data);
      data.forEach((s) => console.log(`Supplier ${s.name}: status = "${s.status}" (type: ${typeof s.status})`));
      setSuppliers(data);
    } catch (error: any) {
      let errorMsg = "Unknown error";
      
      if (error.response) {
        errorMsg = `API Error: ${error.response.status} - ${error.response.statusText}`;
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        errorMsg = "Không thể kết nối tới server (CORS / SSL / Server chưa chạy)";
      } else {
        errorMsg = error.message;
      }
      
      console.error("Error fetching suppliers:", error);
      showToast(`Lỗi: ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedSuppliers.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedSuppliers.filter(s => s.id !== undefined).map(s => s.id!));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "",
      name: "",
      contactPerson: "",
      title: "",
      phone: "",
      email: "",
      role: "",
      citizenId: "",
      address: "",
      status: "Hoạt động",
    });
    setSelectedSupplier(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSupplier = async () => {
    if (!formData.code || !formData.type) {
      showToast("Vui lòng điền đầy đủ thông tin (Code và Type)!", "warning");
      return;
    }

    try {
      if (view === "create") {
        const result = await supplierService.createSupplier(formData);
        // Nếu API không trả về data, dùng formData
        const newSupplier = result || { ...formData, createdTime: new Date().toISOString() };
        setSuppliers([...suppliers, newSupplier]);
        showToast("Nhà cung cấp đã được tạo thành công!", "success");
      } else if (view === "edit" && selectedSupplier?.id) {
        await supplierService.updateSupplier(
          selectedSupplier.id,
          formData
        );
        // Dùng formData để cập nhật local state, giữ nguyên id và createdTime
        const updatedSupplier = { 
          ...selectedSupplier, 
          ...formData 
        };
        setSuppliers(
          suppliers.map((s) => (s.id === selectedSupplier.id ? updatedSupplier : s))
        );
        showToast("Nhà cung cấp đã được cập nhật!", "success");
      }
      resetForm();
      setView("list");
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi lưu nhà cung cấp!", "error");
    }
  };

  const handleDeleteSupplier = (supplierId: number) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa nhà cung cấp này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          console.log("Deleting supplier ID:", supplierId);
          await supplierService.deleteSupplier(supplierId);
          setSuppliers(suppliers.filter((s) => s.id !== supplierId));
          showToast("Nhà cung cấp đã được xóa!", "success");
        } catch (error: any) {
          console.error("Delete error:", error);
          let errorMsg = "Lỗi khi xóa nhà cung cấp!";
          
          if (error.response) {
            errorMsg = `API Error: ${error.response.status} - ${error.response.statusText}`;
            console.error("Response data:", error.response.data);
          } else if (error.request) {
            errorMsg = "Không thể kết nối tới server";
          }
          
          showToast(errorMsg, "error");
        }
      },
    });
  };

  const handleToggleStatus = (supplier: Supplier) => {
    if (!canApprove()) {
      showToast("Bạn không có quyền thay đổi trạng thái NCC", "error");
      return;
    }

    const newStatus = supplier.status === "Hoạt động" ? "Ngừng hợp tác" : "Hoạt động";
    showConfirm({
      message: `Bạn có chắc chắn muốn đổi trạng thái thành "${newStatus}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          if (!supplier.id) return;
          const updatedData = { ...supplier, status: newStatus };
          await supplierService.updateSupplier(supplier.id, updatedData);
          
          // Update local state with the new status
          const updatedSupplier = { ...supplier, status: newStatus };
          setSuppliers(
            suppliers.map((s) => (s.id === supplier.id ? updatedSupplier : s))
          );
          if (selectedSupplier?.id === supplier.id) {
            setSelectedSupplier(updatedSupplier);
          }
          // Reset filters to show the updated supplier
          setFilters({ status: [], type: [] });
          showToast(`Trạng thái đã được cập nhật thành "${newStatus}"!`, "success");
        } catch (error: any) {
          console.error("Toggle status error:", error);
          let errorMsg = "Lỗi khi cập nhật trạng thái!";
          
          if (error.response) {
            errorMsg = `API Error: ${error.response.status} - ${error.response.statusText}`;
          } else if (error.request) {
            errorMsg = "Không thể kết nối tới server";
          }
          
          showToast(errorMsg, "error");
        }
      },
    });
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      code: supplier.code,
      type: supplier.type,
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      title: supplier.title || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      role: supplier.role || "",
      citizenId: supplier.citizenId || "",
      address: supplier.address || "",
      status: supplier.status,
    });
    setView("edit");
  };

  const handleViewDetail = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setView("detail");
  };


  const filteredSuppliers = suppliers.filter((supplier) => {
    // Apply search filter
    const matchesSearch = searchTerm.toLowerCase() === ""
      ? true
      : supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = filters.status.length === 0 || filters.status.includes(supplier.status);

    // Apply type filter
    const matchesType = filters.type.length === 0 || filters.type.includes(supplier.type);

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);
  const summaryStats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter((s) => s.status === "Hoạt động").length,
    pausedSuppliers: suppliers.filter((s) => s.status === "Ngừng hợp tác").length,
    withEmail: suppliers.filter((s) => Boolean((s.email || "").trim())).length,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const pageTitle = view === "list"
    ? "Quản lý nhà cung cấp"
    : view === "create"
      ? "Thêm Nhà Cung Cấp Mới"
      : view === "detail"
        ? "Chi Tiết Nhà Cung Cấp"
        : "Chỉnh Sửa Nhà Cung Cấp";
  const breadcrumbAction = view === "list" ? (
    <button
      onClick={() => {
        resetForm();
        setView("create");
      }}
      className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
      Thêm mới
    </button>
  ) : (
    <button
      onClick={() => {
        resetForm();
        setView("list");
      }}
      className="module-ghost-btn inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      Quay Lại
    </button>
  );

  return (
    <>
      <PageMeta title={pageTitle} description="Quản lý danh sách nhà cung cấp" />
      <PageBreadcrumb pageTitle={pageTitle} action={breadcrumbAction} />

      {view === "list" && (
        <>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Tổng nhà cung cấp</p>
            <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{summaryStats.totalSuppliers}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Hoạt động</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{summaryStats.activeSuppliers}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Ngừng hợp tác</p>
            <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">{summaryStats.pausedSuppliers}</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Có email</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{summaryStats.withEmail}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh sách nhà cung cấp
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý danh sách các nhà cung cấp của bạn.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      await downloadExcelFromApi("/api/ExcelExport/suppliers", `nha-cung-cap_${new Date().toISOString().slice(0, 10)}.xlsx`);
                      showToast("Đã xuất danh sách nhà cung cấp!", "success");
                    } catch (e: any) {
                      showToast(e.message || "Lỗi khi xuất Excel", "error");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 overflow-visible">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="h-[48px] w-full pl-10 pr-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm"
                />
              </div>
              
              <div className="relative">
                {(() => {
                  const activeCount = filters.status.length + filters.type.length;
                  const toggle = <T,>(arr: T[], val: T): T[] =>
                    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`relative inline-flex h-[48px] items-center gap-2 px-4 text-sm font-medium border rounded-xl shadow-sm transition-colors ${
                          activeCount > 0
                            ? "bg-cyan-50 border-cyan-300 text-cyan-700 dark:bg-cyan-900/20 dark:border-cyan-700 dark:text-cyan-300"
                            : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Bộ lọc
                        {activeCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white">
                            {activeCount}
                          </span>
                        )}
                      </button>

                      {isFilterOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                              <span className="text-sm font-semibold text-gray-800 dark:text-white">Bộ lọc</span>
                              {activeCount > 0 && (
                                <button
                                  onClick={() => setFilters({ status: [], type: [] })}
                                  className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
                                >
                                  Xóa tất cả
                                </button>
                              )}
                            </div>
                            <div className="max-h-[380px] overflow-y-auto p-4 space-y-5">
                              <div>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Trạng thái</p>
                                <div className="space-y-1">
                                  {[
                                    { label: "Hoạt động", dot: "bg-emerald-500" },
                                    { label: "Ngừng hợp tác", dot: "bg-rose-400" },
                                  ].map(({ label, dot }) => (
                                    <label key={label} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={filters.status.includes(label)}
                                        onChange={() => setFilters((p) => ({ ...p, status: toggle(p.status, label) }))}
                                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                      />
                                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Loại NCC</p>
                                <div className="space-y-1">
                                  {[
                                    { label: "Cá nhân", dot: "bg-sky-400" },
                                    { label: "Doanh nghiệp", dot: "bg-violet-400" },
                                  ].map(({ label, dot }) => (
                                    <label key={label} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={filters.type.includes(label)}
                                        onChange={() => setFilters((p) => ({ ...p, type: toggle(p.type, label) }))}
                                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                      />
                                      <span className={`h-2 w-2 rounded-full ${dot}`} />
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-cyan-500 dark:border-gray-800"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải danh sách nhà cung cấp...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-5 py-3 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.length === paginatedSuppliers.length && paginatedSuppliers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-cyan-500 dark:bg-gray-800"
                    />
                  </th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tên NCC</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Địa chỉ</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">SĐT</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Email</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Trạng Thái</th>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Ngày Tạo</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedSuppliers.map((supplier, index) => (
                  <tr 
                    key={supplier.id || `supplier-${index}`} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <input 
                        type="checkbox" 
                        checked={supplier.id ? selectedItems.includes(supplier.id) : false}
                        onChange={() => supplier.id && handleSelectItem(supplier.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-cyan-500 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {supplier.name}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {supplier.address}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {supplier.phone}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {supplier.email}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                    <span className={`status-pill ${
                      supplier.status === "Hoạt động"
                        ? "bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] dark:bg-emerald-900/20 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 shadow-[0_0_0_1px_rgba(225,29,72,0.2)] dark:bg-rose-900/20 dark:text-rose-300"
                      }`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {supplier.createdTime ? formatDate(supplier.createdTime) : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ActionDropdown
                        onView={() => handleViewDetail(supplier)}
                        onEdit={() => handleEditSupplier(supplier)}
                        onDelete={() => supplier.id && handleDeleteSupplier(supplier.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              {/* Empty State */}
              {filteredSuppliers.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Không tìm thấy nhà cung cấp
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hãy thêm nhà cung cấp mới hoặc thay đổi từ khóa tìm kiếm.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {filteredSuppliers.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredSuppliers.length}
                  startItem={startIndex + 1}
                  endItem={startIndex + itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
        </>
      )}

      {(view === "create" || view === "edit") && (
        <div className="module-view form-tone-sync space-y-6">
          <button
            onClick={() => {
              resetForm();
              setView("list");
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </button>

          <div className="module-surface rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {view === "create" ? "Thêm Nhà Cung Cấp Mới" : "Chỉnh Sửa Nhà Cung Cấp"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {view === "create" ? "Điền thông tin để thêm nhà cung cấp mới." : "Cập nhật thông tin nhà cung cấp."}
              </p>
            </div>

            <div className="p-5 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mã Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: SUP001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: Supplier"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên Nhà Cung Cấp
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: Công ty TNHH ABC"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: 123 Đường Lê Lợi, TP HCM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Điện Thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: 0287654321"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: contact@abc.com.vn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Người Liên Hệ
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chức Danh
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: Giám đốc"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vai Trò
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: Sales"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số CCCD
                  </label>
                  <input
                    type="text"
                    name="citizenId"
                    value={formData.citizenId}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: 123456789"
                  />
                </div>

              </div>
            </div>

            <div className="px-5 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setView("list");
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 module-secondary-btn bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSupplier}
                className="px-4 py-2.5 text-sm font-medium module-primary-btn text-white transition-all duration-200"
              >
                {view === "create" ? "Thêm NCC" : "Lưu Thay Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "detail" && selectedSupplier && (() => {
        const isActive = selectedSupplier.status === "Hoạt động";
        const contactCoverage = [selectedSupplier.phone, selectedSupplier.email].filter(Boolean).length;

        return (
          <div className="module-view space-y-4">
            <button
              onClick={() => setView("list")}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Quay Lại
            </button>

            <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-5 dark:border-cyan-500/30 dark:from-cyan-500/10 dark:via-gray-900 dark:to-emerald-500/10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-cyan-700 dark:text-cyan-300">Nhà cung cấp</p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.code} - {selectedSupplier.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {selectedSupplier.status || "Chưa xác định"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
                      Loại: {selectedSupplier.type || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-cyan-100 bg-white/70 p-1 dark:border-cyan-500/20 dark:bg-gray-900/40">
                  <button
                    onClick={() => handleEditSupplier(selectedSupplier)}
                    className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-500/20"
                    title="Chỉnh sửa"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {canApprove() && (
                    <button
                      onClick={() => handleToggleStatus(selectedSupplier)}
                      className={`rounded-lg p-2 transition-colors ${
                        selectedSupplier.status === "Hoạt động"
                          ? "text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          : "text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      }`}
                      title={selectedSupplier.status === "Hoạt động" ? "Ngưng hợp tác" : "Kích hoạt"}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => selectedSupplier.id && handleDeleteSupplier(selectedSupplier.id)}
                    className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-500/20"
                    title="Xóa"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-cyan-200 bg-white/80 p-3 dark:border-cyan-500/30 dark:bg-cyan-500/10">
                  <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Liên hệ khả dụng</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-900 dark:text-cyan-100">{contactCoverage}/2</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white/80 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Người liên hệ</p>
                  <p className="mt-1 text-lg font-semibold text-amber-900 dark:text-amber-100">{selectedSupplier.contactPerson || "-"}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white/80 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Ngày tạo</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-900 dark:text-emerald-100">{selectedSupplier.createdTime ? formatDate(selectedSupplier.createdTime) : "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Thông tin chi tiết</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Điện thoại</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedSupplier.phone || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedSupplier.email || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Chức danh</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedSupplier.title || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Vai trò</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedSupplier.role || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Địa chỉ</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedSupplier.address || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Số CCCD</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedSupplier.citizenId || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}


