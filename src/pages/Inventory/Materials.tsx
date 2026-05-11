"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { FormTextarea } from "../../components/form";
import { materialService, Material } from "../../services/materialService";
import { categoryService, Category, suggestCategory, DEFAULT_CATEGORIES, getCategoriesByItemType } from "../../services/categoryService";
import { unitService, Unit, suggestUnit, DEFAULT_UNITS } from "../../services/unitService";
import {
  hydrateMaterialsItemType,
  resolveMaterialItemType,
  setStoredItemType,
  type ItemType,
} from "../../services/itemTypeService";
import { buildInventoryQuantityMap, inventoryService, InventoryItem } from "../../services/inventoryService";
import { supplierService, Supplier } from "../../services/supplierService";
import { useAuth } from "../../context/AuthContext";

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
  const { canApprove } = useAuth();
  
  const normalizeStatus = (status?: string) => {
    const value = (status || "").trim().toLowerCase();

    if (value === "đang kinh doanh" || value === "đang hoạt động") {
      return "Đang hoạt động";
    }

    if (value === "ngừng kinh doanh" || value === "ngừng hoạt động") {
      return "Ngừng hoạt động";
    }

    return status || "Ngừng hoạt động";
  };

  const isActiveStatus = (status?: string) => normalizeStatus(status) === "Đang hoạt động";

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierQuery, setSupplierQuery] = useState("");
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const [isSupplierTyping, setIsSupplierTyping] = useState(false);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const inventoryQuantityByMaterial = useMemo(
    () => buildInventoryQuantityMap(inventories),
    [inventories],
  );

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    itemType: "material" as ItemType,
    categoryId: 1,
    unitId: 1,
    supplierId: 0,
    note: "",
    status: "",
  });

  const getSupplierLabel = useCallback((supplier: Supplier) => {
    return supplier.name || supplier.code || `NCC #${supplier.id}`;
  }, []);

  const selectedSupplier = useMemo(
    () => suppliers.find((s) => Number(s.id) === Number(formData.supplierId)),
    [suppliers, formData.supplierId],
  );

  const filteredCategories = useMemo(
    () => getCategoriesByItemType(categories, formData.itemType),
    [categories, formData.itemType],
  );

  const filteredSuppliers = useMemo(() => {
    const query = supplierQuery.trim().toLowerCase();
    if (!query) return suppliers;

    return suppliers.filter((supplier) => {
      const label = getSupplierLabel(supplier).toLowerCase();
      const code = (supplier.code || "").toLowerCase();
      return label.includes(query) || code.includes(query);
    });
  }, [suppliers, supplierQuery, getSupplierLabel]);

  useEffect(() => {
    if (isSupplierTyping) return;
    if (selectedSupplier) {
      setSupplierQuery(getSupplierLabel(selectedSupplier));
    }
  }, [selectedSupplier, isSupplierTyping, getSupplierLabel]);

  // Fetch materials and categories on mount
  useEffect(() => {
    fetchMaterials();
    fetchCategories();
    fetchUnits();
    fetchSuppliers();
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

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      const supplierList = data || [];
      setSuppliers(supplierList);
    } catch (error) {
      console.warn("Không thể tải nhà cung cấp từ API.", error);
      setSuppliers([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialService.getAllMaterials();
      // Debug: log raw itemType values returned by backend to help identify filtering/mapping issues
      try {
        const rawTypes = (data || []).map((m) => m.itemType || "(empty)");
        console.debug("[Materials] raw itemType values:", rawTypes);
        const unique = Array.from(new Set(rawTypes));
        console.debug("[Materials] unique itemType values:", unique);
      } catch (e) {
        console.debug("[Materials] cannot inspect itemType values", e);
      }
      setMaterials(hydrateMaterialsItemType(data || []));
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
      itemType: "material",
      categoryId: 1,
      unitId: 1,
      supplierId: 0,
      note: "",
      status: "Đang hoạt động",
    });
    setSupplierQuery("");
    setIsSupplierTyping(false);
    setIsSupplierDropdownOpen(false);
  };

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ["categoryId", "unitId", "supplierId"];
    setFormData((prev) => {
      const nextValue = numericFields.includes(name)
        ? (value === "" ? 0 : parseInt(value, 10))
        : value;

      const nextData = {
        ...prev,
        [name]: nextValue,
      };

      if (name === "itemType") {
        const itemType = value as ItemType;
        const nextSuggestedUnit = suggestUnit(nextData.name, units, itemType);
        
        // Get valid categories for this itemType and set first one as default
        const validCategories = getCategoriesByItemType(categories, itemType);
        const defaultCategoryId = validCategories.length > 0 ? validCategories[0].id : 1;

        if (itemType === "asset") {
          return {
            ...nextData,
            categoryId: defaultCategoryId,
            unitId: nextSuggestedUnit?.unitId || nextData.unitId,
          };
        }

        return {
          ...nextData,
          categoryId: defaultCategoryId,
          unitId: nextSuggestedUnit?.unitId || nextData.unitId,
        };
      }

      return nextData;
    });

    if (name === "itemType") {
      return;
    }

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

  // Auto-fill unit based on material name keywords and item type
  const handleAutoFillUnit = useCallback((materialName: string) => {
    setFormData((prev) => {
      const suggestion = suggestUnit(materialName, units, prev.itemType);
      if (!suggestion) return prev;
      return {
        ...prev,
        unitId: suggestion.unitId,
      };
    });
  }, [units]);
  // Save material
  const handleSaveMaterial = async () => {
    if (!formData.code || !formData.name) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    if (formData.itemType === "material" && (!formData.supplierId || formData.supplierId <= 0)) {
      showToast("Vui lòng chọn nhà cung cấp hợp lệ!", "warning");
      return;
    }

    // Check if user is trying to change status without permission
    if (view === "edit" && selectedMaterial && selectedMaterial.status !== formData.status && !canApprove()) {
      showToast("Bạn không có quyền thay đổi trạng thái nguyên liệu", "error");
      return;
    }

    try {
      if (view === "create") {
        const createdMaterial = await materialService.createMaterial({
          code: formData.code,
          name: formData.name,
          itemType: formData.itemType,
          categoryId: formData.categoryId,
          unitId: formData.unitId,
          supplierId: formData.supplierId,
          note: formData.note,
          status: formData.status,
        } as any);
        if (createdMaterial?.id) {
          setStoredItemType(createdMaterial.id, formData.itemType);
        }
        showToast("Nguyên liệu đã được tạo thành công!", "success");
      } else if (view === "edit" && selectedMaterial && selectedMaterial.id) {
        await materialService.updateMaterial(selectedMaterial.id, {
          code: formData.code,
          name: formData.name,
          itemType: formData.itemType,
          categoryId: formData.categoryId,
          unitId: formData.unitId,
          supplierId: formData.supplierId,
          note: formData.note,
          status: formData.status,
        } as any);
        setStoredItemType(selectedMaterial.id, formData.itemType);
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
    const resolvedItemType = resolveMaterialItemType(material);
    setSelectedMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      itemType: resolvedItemType,
      categoryId: material.categoryId,
      unitId: material.unitId,
      supplierId: material.supplierId,
      note: material.note || "",
      status: normalizeStatus(material.status),
    });
    setView("edit");
    const editSupplier = suppliers.find(
      (s) => Number(s.id) === Number(material.supplierId),
    );
    if (editSupplier) {
      setSupplierQuery(getSupplierLabel(editSupplier));
    }
    setIsSupplierTyping(false);
    setIsSupplierDropdownOpen(false);
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
    
    const statusMatch = filters.status.length === 0 || filters.status.includes(normalizeStatus(material.status));
    return searchMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaterials = filteredMaterials.slice(startIndex, startIndex + itemsPerPage);
  const summaryStats = {
    totalMaterials: materials.length,
    activeMaterials: materials.filter((m) => isActiveStatus(m.status)).length,
    inactiveMaterials: materials.filter((m) => !isActiveStatus(m.status)).length,
    totalStock: Object.values(inventoryQuantityByMaterial).reduce<number>((sum, quantity) => sum + Number(quantity || 0), 0),
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getItemTypeLabel = (material: Material) => {
    const t = resolveMaterialItemType(material);
    if (t === "asset") return "Tài sản";
    if (t === "goods") return "Hàng hóa";
    return "Nguyên liệu";
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

  const getMaterialStockQuantity = (materialId?: number) => {
    if (!materialId) return 0;
    return inventoryQuantityByMaterial[materialId] || 0;
  };

  // Xuất danh sách nguyên liệu ra file Excel (CSV)
  const exportToExcel = () => {
    const dataToExport = filteredMaterials.length > 0 ? filteredMaterials : materials;
    if (dataToExport.length === 0) {
      showToast("Không có dữ liệu để xuất!", "error");
      return;
    }

    const headers = ["STT", "Mã", "Tên", "Loại", "Danh Mục", "Đơn Vị", "Kho", "Tồn Kho", "Trạng Thái", "Ghi Chú", "Ngày Tạo"];

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
      escapeCSV(getItemTypeLabel(m)),
      escapeCSV(m.categoryName || ""),
      escapeCSV(getUnitName(m)),
      escapeCSV(getWarehouseNames(m.id)),
      getMaterialStockQuantity(m.id),
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

  const pageTitle = view === "list" ? "Quản lý vật tư và tài sản" : view === "create" ? "Thêm Vật Tư Mới" : "Chỉnh Sửa Vật Tư";
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
      <PageMeta title={pageTitle} description="Quản lý danh sách nguyên liệu và tài sản" />
      <PageBreadcrumb pageTitle={pageTitle} action={breadcrumbAction} />

      {view === "list" && (
        <>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Tổng vật tư</p>
            <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{summaryStats.totalMaterials}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Đang hoạt động</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{summaryStats.activeMaterials}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-500/30 dark:from-rose-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-rose-700 dark:text-rose-300">Ngừng hoạt động</p>
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
                  Danh sách vật tư và tài sản
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý danh sách nguyên liệu và tài sản dùng chung bảng Materials
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
                            {["Đang hoạt động", "Ngừng hoạt động"].map((status) => (
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
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại</th>
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
                        <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${
                          resolveMaterialItemType(material) === "asset"
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                            : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                        }`}>
                          {getItemTypeLabel(material)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {getMaterialStockQuantity(material.id)} {getUnitName(material)}
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
                          isActiveStatus(material.status)
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {normalizeStatus(material.status)}
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
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredMaterials.length}
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
              <div className="module-surface rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 lg:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {view === "create" ? "Thêm Vật Tư Mới" : "Chỉnh Sửa Vật Tư"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mã Vật Tư
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
                  Tên Vật Tư *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập tên nguyên liệu hoặc tài sản"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loại vật tư
                </label>
                <select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="material">Nguyên liệu</option>
                  <option value="goods">Hàng hóa</option>
                  <option value="asset">Tài sản</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Danh Mục
                </label>
                {filteredCategories.length > 0 ? (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="" disabled>Chọn danh mục</option>
                    {filteredCategories.map((cat) => (
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
                {formData.itemType === "asset" && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tài sản sẽ ưu tiên đơn vị đếm như cái, chiếc hoặc bộ.
                  </p>
                )}
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nhà Cung Cấp
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={supplierQuery}
                      onFocus={() => setIsSupplierDropdownOpen(true)}
                      onChange={(e) => {
                        setSupplierQuery(e.target.value);
                        setIsSupplierTyping(true);
                        setIsSupplierDropdownOpen(true);
                        setFormData((prev) => ({ ...prev, supplierId: 0 }));
                      }}
                      onBlur={() => {
                        window.setTimeout(() => {
                          setIsSupplierDropdownOpen(false);
                          if (selectedSupplier) {
                            setSupplierQuery(getSupplierLabel(selectedSupplier));
                          }
                          setIsSupplierTyping(false);
                        }, 120);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && filteredSuppliers.length > 0) {
                          e.preventDefault();
                          const supplier = filteredSuppliers[0];
                          setFormData((prev) => ({
                            ...prev,
                            supplierId: Number(supplier.id || 0),
                          }));
                          setSupplierQuery(getSupplierLabel(supplier));
                          setIsSupplierDropdownOpen(false);
                          setIsSupplierTyping(false);
                        }
                      }}
                      className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nhập tên hoặc mã nhà cung cấp"
                    />
                    <button
                      type="button"
                      onClick={() => setIsSupplierDropdownOpen((prev) => !prev)}
                      className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-gray-500 dark:text-gray-400"
                      tabIndex={-1}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isSupplierDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                        <ul className="max-h-52 overflow-y-auto py-1">
                          {filteredSuppliers.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                              Không tìm thấy nhà cung cấp
                            </li>
                          ) : (
                            filteredSuppliers.map((supplier) => {
                              const isSelected = Number(supplier.id) === Number(formData.supplierId);
                              return (
                                <li key={supplier.id}>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        supplierId: Number(supplier.id || 0),
                                      }));
                                      setSupplierQuery(getSupplierLabel(supplier));
                                      setIsSupplierDropdownOpen(false);
                                      setIsSupplierTyping(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                      isSelected
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                                    }`}
                                  >
                                    <span className="truncate">{getSupplierLabel(supplier)}</span>
                                    <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">{supplier.code}</span>
                                  </button>
                                </li>
                              );
                            })
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng Thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  disabled={view === "edit" && !canApprove()}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option>Đang hoạt động</option>
                  <option>Ngừng hoạt động</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <FormTextarea
                  label="Ghi Chú"
                  name="note"
                  value={formData.note}
                  onChange={(val) => handleFormChange({ target: { name: "note", value: val } } as any)}
                  rows={4}
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
                {view === "create" ? "Tạo Vật Tư" : "Cập Nhật"}
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
        const isActive = isActiveStatus(selectedMaterial.status);
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
                      {normalizeStatus(selectedMaterial.status)}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                      {getItemTypeLabel(selectedMaterial)}
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
                  <p className="mt-1 text-lg font-semibold text-sky-900 dark:text-sky-100">{getMaterialStockQuantity(selectedMaterial.id).toLocaleString("vi-VN")}</p>
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
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {resolveMaterialItemType(selectedMaterial) === "asset"
                      ? "Không yêu cầu (tài sản)"
                      : selectedMaterial.supplier?.name || "-"}
                  </p>
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
