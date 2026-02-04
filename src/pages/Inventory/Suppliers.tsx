"use client";

import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { supplierService, Supplier } from "../../services/supplierService";

// Dropdown Action Component
const ActionDropdown = ({ 
  onView, 
  onEdit, 
  onDelete,
  onToggleStatus
}: { 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
  onToggleStatus: () => void;
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
        onClick={onToggleStatus}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Ngừng hợp tác"
      >
        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
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

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ status: string[] }>({
    status: [],
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
      showToast("Tải dữ liệu thành công!", "success");
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
        setSuppliers([...suppliers, result]);
        showToast("Nhà cung cấp đã được tạo thành công!", "success");
      } else if (view === "edit" && selectedSupplier?.id) {
        const result = await supplierService.updateSupplier(
          selectedSupplier.id,
          formData
        );
        setSuppliers(
          suppliers.map((s) => (s.id === selectedSupplier.id ? result : s))
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
          setFilters({ status: [] });
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
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <PageMeta title="Quản Lý Nhà Cung Cấp" description="Quản lý danh sách nhà cung cấp" />
      <PageBreadcrumb pageTitle="Quản Lý Nhà Cung Cấp" />

      {view === "list" && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh Sách Nhà Cung Cấp
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý danh sách các nhà cung cấp của bạn.
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
                  Thêm nhà cung cấp
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
                            {["Hoạt động", "Ngừng hợp tác"].map(status => (
                              <label key={status} className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.status.includes(status)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters({ ...filters, status: [...filters.status, status] });
                                    } else {
                                      setFilters({ ...filters, status: filters.status.filter((s: string) => s !== status) });
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
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải danh sách nhà cung cấp...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-5 py-4 text-left">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.length === paginatedSuppliers.length && paginatedSuppliers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                    />
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên NCC</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Địa Chỉ</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">SĐT</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng Thái</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày Tạo</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedSuppliers.map((supplier) => (
                  <tr 
                    key={supplier.id} 
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <input 
                        type="checkbox" 
                        checked={supplier.id ? selectedItems.includes(supplier.id) : false}
                        onChange={() => supplier.id && handleSelectItem(supplier.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
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
                      <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${
                        supplier.status === "Hoạt động"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
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
                        onToggleStatus={() => handleToggleStatus(supplier)}
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
                <div className="px-5 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Đang hiển thị <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> -  <span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredSuppliers.length)}</span> trên <span className="font-medium text-gray-900 dark:text-white">{filteredSuppliers.length}</span>
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    placeholder="VD: Công ty TNHH ABC"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa Chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveSupplier}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                {view === "create" ? "Thêm NCC" : "Lưu Thay Đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "detail" && selectedSupplier && (
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
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {selectedSupplier.name?.charAt(0).toUpperCase() || selectedSupplier.code.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.name || selectedSupplier.code}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedSupplier.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSupplier(selectedSupplier)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => selectedSupplier.id && handleDeleteSupplier(selectedSupplier.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Code
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.code}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Loại
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.type}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Điện Thoại
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.phone}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                    {selectedSupplier.email}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Người Liên Hệ
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.contactPerson || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Trạng Thái
                  </p>
                  <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${
                    selectedSupplier.status === "Hoạt động"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {selectedSupplier.status}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    Chức Danh
                  </p>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    {selectedSupplier.title || "-"}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Ngày Tạo
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSupplier.createdTime ? formatDate(selectedSupplier.createdTime) : "-"}
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
