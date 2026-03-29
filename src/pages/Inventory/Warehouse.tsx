"use client";

import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { warehouseService, Warehouse } from "../../services/warehouseService";

// Dropdown Action Component
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
    <div className="flex gap-2">
      <button
        onClick={onView}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Xem chi tiết"
      >
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      <button
        onClick={onEdit}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Chỉnh sửa"
      >
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={onDelete}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Xóa"
      >
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default function QuanLyKho() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ status: string[] }>({
    status: [],
  });
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    typeId: 1,
    address: "",
    area: "",
    managerName: "",
    managerPhone: "",
    note: "",
    status: "Hoạt động",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch warehouses on component mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getAllWarehouses();
      console.log("Warehouses data:", data);
      setWarehouses(data);
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
      
      console.error("Error fetching warehouses:", error);
      showToast(`Lỗi: ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedWarehouses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedWarehouses.filter(w => w.id !== undefined).map(w => w.id!));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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

  const handleSaveWarehouse = async () => {
    if (!formData.code || !formData.name) {
      showToast("Vui lòng điền đầy đủ thông tin (Code và Name)!", "warning");
      return;
    }

    try {
      if (view === "create") {
        const result = await warehouseService.createWarehouse({
          code: formData.code,
          name: formData.name,
          typeId: formData.typeId,
          address: formData.address,
          area: formData.area ? parseFloat(formData.area) : undefined,
          managerName: formData.managerName,
          managerPhone: formData.managerPhone,
          note: formData.note,
          status: formData.status,
        });
        const newWarehouse = result || { ...formData, typeId: formData.typeId, area: formData.area ? parseFloat(formData.area) : 0, createdTime: new Date().toISOString() };
        setWarehouses([...warehouses, newWarehouse]);
        showToast("Kho đã được tạo thành công!", "success");
      } else if (view === "edit" && selectedWarehouse?.id) {
        await warehouseService.updateWarehouse(
          selectedWarehouse.id,
          {
            code: formData.code,
            name: formData.name,
            typeId: formData.typeId,
            address: formData.address,
            area: formData.area ? parseFloat(formData.area) : undefined,
            managerName: formData.managerName,
            managerPhone: formData.managerPhone,
            note: formData.note,
            status: formData.status,
          }
        );
        const updatedWarehouse = { 
          ...selectedWarehouse, 
          code: formData.code,
          name: formData.name,
          typeId: formData.typeId,
          address: formData.address,
          area: formData.area ? parseFloat(formData.area) : undefined,
          managerName: formData.managerName,
          managerPhone: formData.managerPhone,
          note: formData.note,
          status: formData.status,
        };
        setWarehouses(
          warehouses.map((w) => (w.id === selectedWarehouse.id ? updatedWarehouse : w))
        );
        showToast("Kho đã được cập nhật!", "success");
      }
      resetForm();
      setView("list");
    } catch (error: any) {
      console.error(error);
      let errorMsg = "Lỗi khi lưu kho!";
      if (error.response) {
        errorMsg = `API Error: ${error.response.status}`;
      }
      showToast(errorMsg, "error");
    }
  };

  const handleDeleteWarehouse = (warehouseId: number) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa kho này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          console.log("Deleting warehouse ID:", warehouseId);
          await warehouseService.deleteWarehouse(warehouseId);
          setWarehouses(warehouses.filter((w) => w.id !== warehouseId));
          showToast("Kho đã được xóa!", "success");
        } catch (error: any) {
          console.error("Delete error:", error);
          let errorMsg = "Lỗi khi xóa kho!";
          if (error.response) {
            errorMsg = `API Error: ${error.response.status}`;
          }
          showToast(errorMsg, "error");
        }
      },
    });
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      code: warehouse.code,
      name: warehouse.name,
      typeId: warehouse.typeId,
      address: warehouse.address || "",
      area: warehouse.area?.toString() || "",
      managerName: warehouse.managerName || "",
      managerPhone: warehouse.managerPhone || "",
      note: warehouse.note || "",
      status: warehouse.status || "Hoạt động",
    });
    setView("edit");
  };

  const handleViewDetail = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setView("detail");
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      typeId: 1,
      address: "",
      area: "",
      managerName: "",
      managerPhone: "",
      note: "",
      status: "Hoạt động",
    });
    setSelectedWarehouse(null);
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    // Apply search filter
    const matchesSearch = searchTerm.toLowerCase() === ""
      ? true
      : warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = filters.status.length === 0 || (warehouse.status && filters.status.includes(warehouse.status));
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWarehouses = filteredWarehouses.slice(startIndex, startIndex + itemsPerPage);
  const summaryStats = {
    totalWarehouses: warehouses.length,
    activeWarehouses: warehouses.filter((w) => w.status === "Hoạt động").length,
    inactiveWarehouses: warehouses.filter((w) => w.status && w.status !== "Hoạt động").length,
    totalArea: warehouses.reduce((sum, w) => sum + Number(w.area || 0), 0),
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <PageMeta title="Quản lý kho" description="Quản lý kho và theo dõi tồn kho" />
      <PageBreadcrumb pageTitle="Quản lý kho" />

      {view === "list" && (
        <>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Tổng kho</p>
            <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{summaryStats.totalWarehouses}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Hoạt động</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{summaryStats.activeWarehouses}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Khác trạng thái</p>
            <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">{summaryStats.inactiveWarehouses}</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Tổng diện tích</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{summaryStats.totalArea.toLocaleString("vi-VN")} m²</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh sách kho
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý kho và theo dõi tồn kho của bạn.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setView("create");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm Kho
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 overflow-visible">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Bộ lọc
                </button>

                {isFilterOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Trạng Thái
                          </label>
                          <div className="space-y-1">
                            {["Hoạt động", "Ngừng hoạt động", "Bảo trì"].map(status => (
                              <label key={status} className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.status.includes(status)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters({ ...filters, status: [...filters.status, status] });
                                    } else {
                                      setFilters({ ...filters, status: filters.status.filter(s => s !== status) });
                                    }
                                  }}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải danh sách kho...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-4 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.length === paginatedWarehouses.length && paginatedWarehouses.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                    />
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên Kho</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Diện Tích</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Người Quản Lý</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày Tạo</th>
                  <th className="px-5 py-4"></th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedWarehouses.map((warehouse, index) => (
                  <tr 
                    key={warehouse.id || `warehouse-${index}`} 
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <input 
                        type="checkbox" 
                        checked={warehouse.id ? selectedItems.includes(warehouse.id) : false}
                        onChange={() => warehouse.id && handleSelectItem(warehouse.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {warehouse.name}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {warehouse.address || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {warehouse.area ? `${warehouse.area} m²` : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {warehouse.managerName || "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        warehouse.status === "Hoạt động"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {warehouse.status || "Chưa xác định"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {warehouse.createdTime ? formatDate(warehouse.createdTime) : "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ActionDropdown
                        onView={() => handleViewDetail(warehouse)}
                        onEdit={() => handleEditWarehouse(warehouse)}
                        onDelete={() => warehouse.id && handleDeleteWarehouse(warehouse.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              {/* Empty State */}
              {filteredWarehouses.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Không tìm thấy kho
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hãy thêm kho mới hoặc thay đổi từ khóa tìm kiếm.
              </p>
            </div>
          )}

              {/* Pagination */}
              {filteredWarehouses.length > 0 && (
                <div className="px-5 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hiển thị <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> đến <span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredWarehouses.length)}</span> của <span className="font-medium text-gray-900 dark:text-white">{filteredWarehouses.length}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }

                      pages.push(1);
                      if (startPage > 2) {
                        pages.push('...');
                      }
                      for (let i = Math.max(2, startPage); i <= Math.min(totalPages - 1, endPage); i++) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }
                      if (endPage < totalPages - 1) {
                        pages.push('...');
                      }
                      if (totalPages > 1 && !pages.includes(totalPages)) {
                        pages.push(totalPages);
                      }

                      return pages.map((page, idx) => (
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} className="text-gray-500 dark:text-gray-400">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ));
                    })()}
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
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
                {view === "create" ? "Thêm kho mới" : "Chỉnh sửa kho"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {view === "create" ? "Điền thông tin để thêm kho mới." : "Cập nhật thông tin kho."}
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: WH001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên Kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: Kho A - Chính"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loại Kho
                  </label>
                  <input
                    type="number"
                    name="typeId"
                    value={formData.typeId}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diện Tích (m²)
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa chỉ Kho
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: 123 Đường ABC, TP HCM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Người Quản Lý
                  </label>
                  <input
                    type="text"
                    name="managerName"
                    value={formData.managerName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: Trần Văn B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SĐT Người Quản Lý
                  </label>
                  <input
                    type="text"
                    name="managerPhone"
                    value={formData.managerPhone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="VD: 0987654321"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trạng Thái
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option>Hoạt động</option>
                    <option>Ngừng hoạt động</option>
                    <option>Bảo trì</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ghi Chú
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Ghi chú thêm về kho..."
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
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveWarehouse}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                {view === "create" ? "Thêm Kho" : "Lưu Thay Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "detail" && selectedWarehouse && (() => {
        const isActive = selectedWarehouse.status === "Hoạt động";
        const areaValue = Number(selectedWarehouse.area || 0);

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

            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-5 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:via-gray-900 dark:to-cyan-500/10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-indigo-700 dark:text-indigo-300">Kho hàng</p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedWarehouse.code} - {selectedWarehouse.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {selectedWarehouse.status || "Chưa xác định"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
                      Loại kho: {selectedWarehouse.typeId || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-indigo-100 bg-white/70 p-1 dark:border-indigo-500/20 dark:bg-gray-900/40">
                  <button
                    onClick={() => handleEditWarehouse(selectedWarehouse)}
                    className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-500/20"
                    title="Chỉnh sửa"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => selectedWarehouse.id && handleDeleteWarehouse(selectedWarehouse.id)}
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
                <div className="rounded-xl border border-indigo-200 bg-white/80 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                  <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Diện tích</p>
                  <p className="mt-1 text-lg font-semibold text-indigo-900 dark:text-indigo-100">{areaValue.toLocaleString("vi-VN")} m2</p>
                </div>
                <div className="rounded-xl border border-cyan-200 bg-white/80 p-3 dark:border-cyan-500/30 dark:bg-cyan-500/10">
                  <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Quản lý kho</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-900 dark:text-cyan-100">{selectedWarehouse.managerName || "-"}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white/80 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Ngày tạo</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-900 dark:text-emerald-100">{selectedWarehouse.createdTime ? formatDate(selectedWarehouse.createdTime) : "-"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Thông tin chi tiết</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Số điện thoại quản lý</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedWarehouse.managerPhone || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Mã kho</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedWarehouse.code}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Địa chỉ</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedWarehouse.address || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ghi chú</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedWarehouse.note || "Không có ghi chú"}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}


