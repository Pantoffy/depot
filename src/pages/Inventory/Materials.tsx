"use client";
import { useEffect, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { materialService, Material } from "../../services/materialService";
import { categoryService, Category, suggestCategory, DEFAULT_CATEGORIES } from "../../services/categoryService";
import { unitService, Unit, suggestUnit, DEFAULT_UNITS } from "../../services/unitService";
import { inventoryService, InventoryItem } from "../../services/inventoryService";

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

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{ status: string[] }>({
    status: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Category states
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // Unit states
  const [units, setUnits] = useState<Unit[]>(DEFAULT_UNITS);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    categoryId: 1,
    unitId: 1,
    supplierId: 1,
    note: "",
    status: "",
  });

  // Fetch materials and categories on mount
  useEffect(() => {
    fetchMaterials();
    fetchCategories();
    fetchUnits();
    fetchInventories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (error) {
      console.warn("Không thể tải danh mục từ API, sử dụng danh sách mặc định.", error);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await unitService.getAllUnits();
      if (data && data.length > 0) {
        setUnits(data);
      }
    } catch (error) {
      console.warn("Không thể tải đơn vị từ API, sử dụng danh sách mặc định.", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialService.getAllMaterials();
      setMaterials(data);
    } catch (error: any) {
      let errorMsg = "Unknown error";
      if (error.response) {
        errorMsg = `API Error: ${error.response.status} - ${error.response.statusText}`;
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        errorMsg = "Không thể kết nối tới server";
      }
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventories = async () => {
    try {
      const data = await inventoryService.getAllInventories();
      setInventories(data || []);
    } catch (error) {
      console.warn("Không thể tải tồn kho từ API.", error);
      setInventories([]);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      categoryId: 1,
      unitId: 1,
      supplierId: 1,
      note: "",
      status: "Đang kinh doanh",
    });
  };

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["categoryId", "unitId", "supplierId"].includes(name) ? parseInt(value) : value,
    }));

    // Auto-fill category and unit when material name changes
    if (name === "name") {
      handleAutoFillCategory(value);
      handleAutoFillUnit(value);
    }
  };

  // Auto-fill category based on material name keywords
  const handleAutoFillCategory = useCallback((materialName: string) => {
    const suggestion = suggestCategory(materialName);
    if (suggestion) {
      setFormData((prev) => ({
        ...prev,
        categoryId: suggestion.categoryId,
      }));
    }
  }, []);

  // Auto-fill unit based on material name keywords
  const handleAutoFillUnit = useCallback((materialName: string) => {
    const suggestion = suggestUnit(materialName);
    if (suggestion) {
      setFormData((prev) => ({
        ...prev,
        unitId: suggestion.unitId,
      }));
    }
  }, []);

  // Save material
  const handleSaveMaterial = async () => {
    if (!formData.code || !formData.name) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    try {
      if (view === "create") {
        await materialService.createMaterial({
          code: formData.code,
          name: formData.name,
          categoryId: formData.categoryId,
          unitId: formData.unitId,
          supplierId: formData.supplierId,
          stockQuantity: 0,
          note: formData.note,
          status: formData.status,
        } as any);
        showToast("Nguyên liệu đã được tạo thành công!", "success");
      } else if (view === "edit" && selectedMaterial && selectedMaterial.id) {
        await materialService.updateMaterial(selectedMaterial.id, {
          code: formData.code,
          name: formData.name,
          categoryId: formData.categoryId,
          unitId: formData.unitId,
          supplierId: formData.supplierId,
          stockQuantity: selectedMaterial.stockQuantity || 0,
          note: formData.note,
          status: formData.status,
        } as any);
        showToast("Nguyên liệu đã được cập nhật!", "success");
      }
      fetchMaterials();
      resetForm();
      setView("list");
    } catch (error: any) {
      showToast(error.message || "Lỗi khi lưu nguyên liệu", "error");
      console.error("Error saving material:", error);
    }
  };

  // Delete material
  const handleDeleteMaterial = (id: number | undefined) => {
    if (!id) return;
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa nguyên liệu này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          await materialService.deleteMaterial(id);
          showToast("Nguyên liệu đã được xóa!", "success");
          fetchMaterials();
        } catch (error: any) {
          showToast(error.message || "Lỗi khi xóa nguyên liệu", "error");
          console.error("Error deleting material:", error);
        }
      },
    });
  };

  // Edit material
  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      categoryId: material.categoryId,
      unitId: material.unitId,
      supplierId: material.supplierId,
      note: material.note || "",
      status: material.status || "Hoạt động",
    });
    setView("edit");
  };

  // View detail
  const handleViewDetail = (material: Material) => {
    setSelectedMaterial(material);
    setView("detail");
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedMaterials.length && paginatedMaterials.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedMaterials.map(m => m.id || 0).filter(id => id !== 0));
    }
  };

  // Filter and paginate materials
  const filteredMaterials = materials.filter((material) => {
    const searchMatch = searchTerm.toLowerCase() === ""
      ? true
      : material.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filters.status.length === 0 || filters.status.includes(material.status || "");
    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaterials = filteredMaterials.slice(startIndex, startIndex + itemsPerPage);
  const summaryStats = {
    totalMaterials: materials.length,
    activeMaterials: materials.filter((m) => m.status === "Đang kinh doanh").length,
    inactiveMaterials: materials.filter((m) => m.status !== "Đang kinh doanh").length,
    totalStock: materials.reduce((sum, m) => sum + Number(m.stockQuantity || 0), 0),
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Lấy tên đơn vị: ưu tiên unitName từ API, fallback tra từ danh sách units
  const getUnitName = (material: Material) => {
    if (material.unitName) return material.unitName;
    const unit = units.find((u) => u.id === material.unitId);
    return unit?.name || "";
  };

  const getWarehouseNames = (materialId?: number) => {
    if (!materialId) return "-";
    const names = inventories
      .filter((item) => item.materialId === materialId)
      .map((item) => item.warehouse?.name)
      .filter((name): name is string => !!name);

    const uniqueNames = [...new Set(names)];
    return uniqueNames.length > 0 ? uniqueNames.join(", ") : "-";
  };

  // Xuất danh sách nguyên liệu ra file Excel (CSV)
  const exportToExcel = () => {
    const dataToExport = filteredMaterials.length > 0 ? filteredMaterials : materials;
    if (dataToExport.length === 0) {
      showToast("Không có dữ liệu để xuất!", "error");
      return;
    }

    const headers = ["STT", "Mã", "Tên Nguyên Liệu", "Danh Mục", "Đơn Vị", "Kho", "Tồn Kho", "Trạng Thái", "Ghi Chú", "Ngày Tạo"];

    const escapeCSV = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = dataToExport.map((m, index) => [
      index + 1,
      escapeCSV(m.code || ""),
      escapeCSV(m.name || ""),
      escapeCSV(m.categoryName || ""),
      escapeCSV(getUnitName(m)),
      escapeCSV(getWarehouseNames(m.id)),
      m.stockQuantity ?? 0,
      escapeCSV(m.status || ""),
      escapeCSV(m.note || ""),
      formatDate(m.createdTime),
    ].join(","));

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `nguyen-lieu_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất ${dataToExport.length} nguyên liệu ra file Excel!`, "success");
  };

  return (
    <>
      <PageMeta title="Quản lý nguyên liệu" description="Quản lý danh sách nguyên liệu" />
      <PageBreadcrumb pageTitle="Quản lý nguyên liệu" />

      {view === "list" && (
        <>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Tổng nguyên liệu</p>
            <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{summaryStats.totalMaterials}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Đang kinh doanh</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{summaryStats.activeMaterials}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300">Ngừng kinh doanh</p>
            <p className="mt-2 text-2xl font-semibold text-rose-900 dark:text-rose-200">{summaryStats.inactiveMaterials}</p>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Tổng tồn kho</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{summaryStats.totalStock.toLocaleString("vi-VN")}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh sách nguyên liệu
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý danh sách các nguyên liệu trong kho
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Xuất Excel
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
                  Thêm nguyên liệu
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
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
                            {["Đang kinh doanh", "Ngừng kinh doanh"].map((status) => (
                              <label key={status} className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.status.includes(status)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({
                                        ...prev,
                                        status: [...prev.status, status]
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        status: prev.status.filter(s => s !== status)
                                      }));
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
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải danh sách nguyên liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-5 py-4 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.length === paginatedMaterials.length && paginatedMaterials.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                      />
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên Nguyên Liệu</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tồn Kho</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Danh Mục</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày Tạo</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedMaterials.map((material) => (
                    <tr 
                      key={material.id} 
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <input 
                          type="checkbox" 
                          checked={material.id ? selectedItems.includes(material.id) : false}
                          onChange={() => material.id && handleSelectItem(material.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {material.name}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {material.code}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {material.stockQuantity} {getUnitName(material)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {material.categoryName}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${
                          material.status === "Đang kinh doanh"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {material.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(material.createdTime)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ActionDropdown
                          onView={() => handleViewDetail(material)}
                          onEdit={() => handleEditMaterial(material)}
                          onDelete={() => material.id && handleDeleteMaterial(material.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Empty State */}
              {filteredMaterials.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Không tìm thấy nguyên liệu
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hãy thêm nguyên liệu mới hoặc thay đổi từ khóa tìm kiếm.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {filteredMaterials.length > 0 && (
                <div className="px-5 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Đang hiển thị <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> -  <span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredMaterials.length)}</span> trên <span className="font-medium text-gray-900 dark:text-white">{filteredMaterials.length}</span>
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

                      // Always show first page
                      pages.push(1);
                      if (startPage > 2) {
                        pages.push('...');
                      }
                      // Show middle pages
                      for (let i = Math.max(2, startPage); i <= Math.min(totalPages - 1, endPage); i++) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }
                      // Show ellipsis before last page if needed
                      if (endPage < totalPages - 1) {
                        pages.push('...');
                      }
                      // Always show last page if there's more than one page
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
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay Lại
          </button>

          <div className="module-surface rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 lg:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {view === "create" ? "Thêm Nguyên Liệu Mới" : "Chỉnh Sửa Nguyên Liệu"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mã Nguyên Liệu
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="ML001"
                  disabled={view === "edit"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên Nguyên Liệu *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập tên nguyên liệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Danh Mục
                </label>
                {categories.length > 0 ? (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" disabled>Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value={formData.categoryId}>{formData.categoryId}</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Đơn Vị
                </label>
                <select
                  name="unitId"
                  value={formData.unitId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="" disabled>Chọn đơn vị</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nhà Cung Cấp
                </label>
                <input
                  type="number"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="1"
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
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option>Đang kinh doanh</option>
                  <option>Ngừng kinh doanh</option>
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
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Nhập ghi chú chi tiết..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveMaterial}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {view === "create" ? "Tạo Nguyên Liệu" : "Cập Nhật"}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setView("list");
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {view === "detail" && selectedMaterial && (() => {
        const isActive = selectedMaterial.status === "Đang kinh doanh";
        const warehouseNames = getWarehouseNames(selectedMaterial.id);
        const warehouseCount = warehouseNames === "-" ? 0 : warehouseNames.split(",").length;

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

            <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 dark:border-sky-500/30 dark:from-sky-500/10 dark:via-gray-900 dark:to-emerald-500/10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-sky-700 dark:text-sky-300">Nguyên liệu</p>
                  <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedMaterial.code} - {selectedMaterial.name}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {selectedMaterial.status || "Chưa xác định"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800/70 dark:text-gray-300">
                      Đơn vị: {getUnitName(selectedMaterial) || "-"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-sky-100 bg-white/70 p-1 dark:border-sky-500/20 dark:bg-gray-900/40">
                  <button
                    onClick={() => handleEditMaterial(selectedMaterial)}
                    className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-500/20"
                    title="Chỉnh sửa"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteMaterial(selectedMaterial.id)}
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
                <div className="rounded-xl border border-sky-200 bg-white/80 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
                  <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Số lượng tồn</p>
                  <p className="mt-1 text-lg font-semibold text-sky-900 dark:text-sky-100">{Number(selectedMaterial.stockQuantity || 0).toLocaleString("vi-VN")}</p>
                </div>
                <div className="rounded-xl border border-violet-200 bg-white/80 p-3 dark:border-violet-500/30 dark:bg-violet-500/10">
                  <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Số kho lưu trữ</p>
                  <p className="mt-1 text-lg font-semibold text-violet-900 dark:text-violet-100">{warehouseCount}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white/80 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Ngày tạo</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-900 dark:text-emerald-100">{formatDate(selectedMaterial.createdTime)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Thông tin chi tiết</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Danh mục</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedMaterial.categoryName || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Nhà cung cấp</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedMaterial.supplier?.name || "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Kho đang lưu trữ</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{warehouseNames}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 md:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ghi chú</p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedMaterial.note || "Không có ghi chú"}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
