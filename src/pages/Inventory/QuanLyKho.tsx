"use client";

import { useState, useRef, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";

interface Warehouse {
  id: string;
  tenKho: string;
  diaChiKho: string;
  dienTich: number;
  nguoiQuanLy: string;
  sdtNguoiQuanLy: string;
  moTa: string;
  ngayTao: string;
  trangThai: "Hoạt động" | "Vô hiệu hóa";
}

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
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "1",
      tenKho: "Kho A - Chính",
      diaChiKho: "123 Đường ABC, TP HCM",
      dienTich: 500,
      nguoiQuanLy: "Trần Văn B",
      sdtNguoiQuanLy: "0987654321",
      moTa: "Kho chính lưu trữ bột mỳ và lương khô",
      ngayTao: "2026-01-01",
      trangThai: "Hoạt động",
    },
    {
      id: "2",
      tenKho: "Kho B - Phụ trợ",
      diaChiKho: "456 Đường XYZ, Quận 1, TP HCM",
      dienTich: 300,
      nguoiQuanLy: "Nguyễn Thị C",
      sdtNguoiQuanLy: "0912345678",
      moTa: "Kho phụ trợ lưu trữ các nguyên liệu tươi",
      ngayTao: "2026-01-05",
      trangThai: "Hoạt động",
    },
    {
      id: "3",
      tenKho: "Kho C - Lạnh",
      diaChiKho: "789 Đường DEF, Quận 2, TP HCM",
      dienTich: 200,
      nguoiQuanLy: "Lê Văn D",
      sdtNguoiQuanLy: "0923456789",
      moTa: "Kho lạnh duy trì nhiệt độ 0-5°C",
      ngayTao: "2026-01-10",
      trangThai: "Hoạt động",
    },
  ]);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ trangThai: string[] }>({
    trangThai: [],
  });
  const [formData, setFormData] = useState({
    tenKho: "",
    diaChiKho: "",
    dienTich: "",
    nguoiQuanLy: "",
    sdtNguoiQuanLy: "",
    moTa: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedWarehouses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedWarehouses.map(w => w.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setFormData({
      tenKho: "",
      diaChiKho: "",
      dienTich: "",
      nguoiQuanLy: "",
      sdtNguoiQuanLy: "",
      moTa: "",
    });
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

  const handleSaveWarehouse = () => {
    if (!formData.tenKho || !formData.diaChiKho || !formData.dienTich) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    if (view === "create") {
      const newWarehouse: Warehouse = {
        id: Date.now().toString(),
        tenKho: formData.tenKho,
        diaChiKho: formData.diaChiKho,
        dienTich: parseFloat(formData.dienTich) || 0,
        nguoiQuanLy: formData.nguoiQuanLy,
        sdtNguoiQuanLy: formData.sdtNguoiQuanLy,
        moTa: formData.moTa,
        ngayTao: new Date().toISOString().split("T")[0],
        trangThai: "Hoạt động",
      };
      setWarehouses([...warehouses, newWarehouse]);
      showToast("Kho đã được tạo thành công!", "success");
    } else if (view === "edit" && selectedWarehouse) {
      setWarehouses(
        warehouses.map((w) =>
          w.id === selectedWarehouse.id
            ? {
                ...w,
                tenKho: formData.tenKho,
                diaChiKho: formData.diaChiKho,
                dienTich: parseFloat(formData.dienTich) || 0,
                nguoiQuanLy: formData.nguoiQuanLy,
                sdtNguoiQuanLy: formData.sdtNguoiQuanLy,
                moTa: formData.moTa,
              }
            : w
        )
      );
      showToast("Kho đã được cập nhật!", "success");
    }

    resetForm();
    setView("list");
  };

  const handleDeleteWarehouse = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa kho này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => {
        setWarehouses((prev) => prev.filter((w) => w.id !== id));
        showToast("Kho đã được xóa!", "success");
      },
    });
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      tenKho: warehouse.tenKho,
      diaChiKho: warehouse.diaChiKho,
      dienTich: warehouse.dienTich.toString(),
      nguoiQuanLy: warehouse.nguoiQuanLy,
      sdtNguoiQuanLy: warehouse.sdtNguoiQuanLy,
      moTa: warehouse.moTa,
    });
    setView("edit");
  };

  const handleViewDetail = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setView("detail");
  };

  const handleToggleStatus = (id: string) => {
    setWarehouses(
      warehouses.map((w) =>
        w.id === id
          ? {
              ...w,
              trangThai: w.trangThai === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động",
            }
          : w
      )
    );
  };

  const filteredWarehouses = warehouses.filter((warehouse) =>
    searchTerm.toLowerCase() === ""
      ? true
      : warehouse.tenKho.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.diaChiKho.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredWarehouses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWarehouses = filteredWarehouses.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <PageMeta title="Quản Lý Kho" description="Quản lý kho và theo dõi tồn kho" />
      <PageBreadcrumb pageTitle="Quản Lý Kho" />

      {view === "list" && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh Sách Kho
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
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-gray-600 transition-all duration-200"
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
                                  checked={filters.trangThai.includes(status)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters({ ...filters, trangThai: [...filters.trangThai, status] });
                                    } else {
                                      setFilters({ ...filters, trangThai: filters.trangThai.filter(s => s !== status) });
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
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Địa Chỉ</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Diện Tích</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Người Quản Lý</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày Tạo</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedWarehouses.map((warehouse) => (
                  <tr 
                    key={warehouse.id} 
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(warehouse.id)}
                        onChange={() => handleSelectItem(warehouse.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {warehouse.tenKho}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {warehouse.diaChiKho}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {warehouse.dienTich} m²
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {warehouse.nguoiQuanLy}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        warehouse.trangThai === "Hoạt động"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {warehouse.trangThai}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(warehouse.ngayTao)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ActionDropdown
                        onView={() => handleViewDetail(warehouse)}
                        onEdit={() => handleEditWarehouse(warehouse)}
                        onDelete={() => handleDeleteWarehouse(warehouse.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
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

      {(view === "create" || view === "edit") && (
        <div className="space-y-6">
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

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {view === "create" ? "Thêm Kho Mới" : "Chỉnh Sửa Kho"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {view === "create" ? "Điền thông tin để thêm kho mới." : "Cập nhật thông tin kho."}
              </p>
            </div>

            <div className="p-5 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên Kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="tenKho"
                    value={formData.tenKho}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="VD: Kho A - Chính"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Diện Tích (m²) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="dienTich"
                    value={formData.dienTich}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa Chỉ Kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="diaChiKho"
                    value={formData.diaChiKho}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="VD: 123 Đường ABC, TP HCM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Người Quản Lý
                  </label>
                  <input
                    type="text"
                    name="nguoiQuanLy"
                    value={formData.nguoiQuanLy}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="VD: Trần Văn B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SĐT Người Quản Lý
                  </label>
                  <input
                    type="text"
                    name="sdtNguoiQuanLy"
                    value={formData.sdtNguoiQuanLy}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="VD: 0987654321"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mô Tả
                  </label>
                  <textarea
                    name="moTa"
                    value={formData.moTa}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Mô tả chi tiết về kho..."
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

      {view === "detail" && selectedWarehouse && (
        <div className="space-y-6">
          <button
            onClick={() => setView("list")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </button>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {selectedWarehouse.tenKho.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedWarehouse.tenKho}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedWarehouse.diaChiKho}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditWarehouse(selectedWarehouse)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteWarehouse(selectedWarehouse.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Diện Tích Kho
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedWarehouse.dienTich} <span className="text-sm font-normal text-gray-500">m²</span>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Người Quản Lý
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedWarehouse.nguoiQuanLy}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    SĐT
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedWarehouse.sdtNguoiQuanLy}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Trạng Thái
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedWarehouse.trangThai === "Hoạt động"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {selectedWarehouse.trangThai}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Ngày Tạo
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(selectedWarehouse.ngayTao)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                    Hành động
                  </p>
                  <button
                    onClick={() => handleToggleStatus(selectedWarehouse.id)}
                    className="w-full px-3 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedWarehouse.trangThai === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Mô Tả
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    {selectedWarehouse.moTa || "Chưa có mô tả cho kho này."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
