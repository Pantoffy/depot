"use client";
import { Search, SlidersHorizontal, Eye, Pencil, Trash2, Download } from "lucide-react";
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
import { downloadExcelFromApi } from "../../services/excelExportService";

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
  const [activeTypeTab, setActiveTypeTab] = useState<"all" | ItemType>("all");
  const [filters, setFilters] = useState<{
    status: string[];
    itemType: ItemType[];
    stockLevel: string[];
    categoryId: number[];
  }>({
    status: [],
    itemType: [],
    stockLevel: [],
    categoryId: [],
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
    const stockQty = inventoryQuantityByMaterial[id] || 0;
    if (stockQty > 0) {
      showToast(`Không thể xóa: vật tư đang có ${stockQty} đơn vị trong kho. Vui lòng xuất hết hàng trước khi xóa.`, "error");
      return;
    }
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
    const q = searchTerm.toLowerCase();
    const searchMatch =
      q === "" ||
      material.code.toLowerCase().includes(q) ||
      material.name.toLowerCase().includes(q) ||
      (material.categoryName || "").toLowerCase().includes(q);

    const statusMatch =
      filters.status.length === 0 ||
      filters.status.includes(normalizeStatus(material.status));

    const itemTypeMatch =
      filters.itemType.length === 0 ||
      filters.itemType.includes(resolveMaterialItemType(material));

    const stock = Number(inventoryQuantityByMaterial[material.id ?? 0] || 0);
    const stockMatch =
      filters.stockLevel.length === 0 ||
      (filters.stockLevel.includes("out_of_stock") && stock <= 0) ||
      (filters.stockLevel.includes("low_stock") && stock > 0 && stock <= 10) ||
      (filters.stockLevel.includes("in_stock") && stock > 10);

    const categoryMatch =
      filters.categoryId.length === 0 ||
      filters.categoryId.includes(material.categoryId);

    return searchMatch && statusMatch && itemTypeMatch && stockMatch && categoryMatch;
  });

  const filteredByTab = activeTypeTab === "all"
    ? filteredMaterials
    : filteredMaterials.filter((m) => resolveMaterialItemType(m) === activeTypeTab);

  const totalPages = Math.ceil(filteredByTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaterials = filteredByTab.slice(startIndex, startIndex + itemsPerPage);

  const countByType = (type: ItemType) => materials.filter((m) => resolveMaterialItemType(m) === type).length;
  const summaryStats = {
    totalMaterials: materials.length,
    materialCount: countByType("material"),
    goodsCount:    countByType("goods"),
    assetCount:    countByType("asset"),
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
  const exportToExcel = async () => {
    try {
      await downloadExcelFromApi("/api/ExcelExport/materials", `vat-tu_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast("Đã xuất danh sách vật tư ra file Excel!", "success");
    } catch (error: any) {
      showToast(error.message || "Lỗi khi xuất Excel", "error");
    }
  };

  const pageTitle = view === "list"
    ? "Quản lý vật tư và tài sản"
    : view === "create"
      ? "Thêm Vật Tư Mới"
      : view === "detail"
        ? "Chi Tiết Vật Tư"
        : "Chỉnh Sửa Vật Tư";
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
        <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <button
            onClick={() => { setActiveTypeTab("material"); setCurrentPage(1); }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              activeTypeTab === "material"
                ? "border-sky-400 bg-sky-50 shadow-md dark:border-sky-500 dark:bg-sky-500/15"
                : "border-sky-200 bg-gradient-to-br from-sky-50 to-white hover:shadow-sm dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900"
            }`}
          >
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Nguyên liệu</p>
            <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{summaryStats.materialCount}</p>
            <p className="mt-0.5 text-[11px] text-sky-500 dark:text-sky-400">loại</p>
          </button>
          <button
            onClick={() => { setActiveTypeTab("goods"); setCurrentPage(1); }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              activeTypeTab === "goods"
                ? "border-teal-400 bg-teal-50 shadow-md dark:border-teal-500 dark:bg-teal-500/15"
                : "border-teal-200 bg-gradient-to-br from-teal-50 to-white hover:shadow-sm dark:border-teal-500/30 dark:from-teal-500/10 dark:to-gray-900"
            }`}
          >
            <p className="text-xs font-medium text-teal-700 dark:text-teal-300">Hàng hóa</p>
            <p className="mt-2 text-2xl font-semibold text-teal-900 dark:text-teal-200">{summaryStats.goodsCount}</p>
            <p className="mt-0.5 text-[11px] text-teal-500 dark:text-teal-400">loại</p>
          </button>
          <button
            onClick={() => { setActiveTypeTab("asset"); setCurrentPage(1); }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              activeTypeTab === "asset"
                ? "border-violet-400 bg-violet-50 shadow-md dark:border-violet-500 dark:bg-violet-500/15"
                : "border-violet-200 bg-gradient-to-br from-violet-50 to-white hover:shadow-sm dark:border-violet-500/30 dark:from-violet-500/10 dark:to-gray-900"
            }`}
          >
            <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Tài sản</p>
            <p className="mt-2 text-2xl font-semibold text-violet-900 dark:text-violet-200">{summaryStats.assetCount}</p>
            <p className="mt-0.5 text-[11px] text-violet-500 dark:text-violet-400">loại</p>
          </button>
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Tổng tồn kho</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{summaryStats.totalStock.toLocaleString("vi-VN")}</p>
            <p className="mt-0.5 text-[11px] text-indigo-500 dark:text-indigo-400">đơn vị</p>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-gray-200 px-5 dark:border-gray-800">
            {([
              { key: "all",      label: "Tất cả",      count: summaryStats.totalMaterials, activeClass: "border-gray-700 text-gray-900 dark:border-white dark:text-white" },
              { key: "material", label: "Nguyên liệu", count: summaryStats.materialCount,   activeClass: "border-sky-500 text-sky-600 dark:text-sky-400" },
              { key: "goods",    label: "Hàng hóa",    count: summaryStats.goodsCount,      activeClass: "border-teal-500 text-teal-600 dark:text-teal-400" },
              { key: "asset",    label: "Tài sản",     count: summaryStats.assetCount,      activeClass: "border-violet-500 text-violet-600 dark:text-violet-400" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTypeTab(tab.key); setCurrentPage(1); }}
                className={`relative flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTypeTab === tab.key
                    ? tab.activeClass
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTypeTab === tab.key
                    ? tab.key === "material" ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                    : tab.key === "goods"    ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                    : tab.key === "asset"    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}>{tab.count}</span>
              </button>
            ))}
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
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-[48px] w-full pl-10 pr-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm"
                />
              </div>
                <div className="relative">
                  {/* Filter button with active-count badge */}
                  {(() => {
                    const activeCount =
                      filters.status.length +
                      filters.stockLevel.length +
                      filters.categoryId.length;

                    // Categories that actually appear in the loaded materials
                    const usedCategories = categories.filter((c) =>
                      materials.some((m) => m.categoryId === c.id),
                    );

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
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsFilterOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                              {/* Header */}
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                                <span className="text-sm font-semibold text-gray-800 dark:text-white">Bộ lọc</span>
                                {activeCount > 0 && (
                                  <button
                                    onClick={() => setFilters({ status: [], itemType: [], stockLevel: [], categoryId: [] })} 
                                    className="text-xs font-medium text-rose-500 hover:text-rose-600 transition-colors"
                                  >
                                    Xóa tất cả
                                  </button>
                                )}
                              </div>

                              <div className="max-h-[420px] overflow-y-auto p-4 space-y-5">
                                {/* Trạng thái */}
                                <div>
                                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Trạng thái</p>
                                  <div className="space-y-1">
                                    {[
                                      { label: "Đang hoạt động", dot: "bg-emerald-500" },
                                      { label: "Ngừng hoạt động", dot: "bg-gray-400" },
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

                                {/* Tồn kho */}
                                <div>
                                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tồn kho</p>
                                  <div className="space-y-1">
                                    {[
                                      { value: "in_stock",     label: "Còn hàng",  sub: ">10",  dot: "bg-emerald-500" },
                                      { value: "low_stock",    label: "Sắp hết",  sub: "1–10", dot: "bg-amber-400" },
                                      { value: "out_of_stock", label: "Hết hàng", sub: "0",    dot: "bg-rose-500" },
                                    ].map(({ value, label, sub, dot }) => (
                                      <label key={value} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={filters.stockLevel.includes(value)}
                                          onChange={() => setFilters((p) => ({ ...p, stockLevel: toggle(p.stockLevel, value) }))}
                                          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                        <span className="ml-auto text-xs text-gray-400">{sub}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Danh mục */}
                                {usedCategories.length > 0 && (
                                  <div>
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Danh mục</p>
                                    <div className="space-y-1">
                                      {usedCategories.map((cat) => (
                                        <label key={cat.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={filters.categoryId.includes(cat.id)}
                                            onChange={() => setFilters((p) => ({ ...p, categoryId: toggle(p.categoryId, cat.id) }))}
                                            className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                          />
                                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{cat.name}</span>
                                          <span className="ml-auto shrink-0 text-xs text-gray-400">
                                            {materials.filter((m) => m.categoryId === cat.id).length}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer */}
                              <div className="border-t border-gray-100 dark:border-gray-800 p-3">
                                <button
                                  onClick={() => { setIsFilterOpen(false); setCurrentPage(1); }}
                                  className="w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors"
                                >
                                  {activeCount > 0 ? `Áp dụng (${filteredByTab.length} kết quả)` : "Đóng"}
                                </button>
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
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Đang tải danh sách nguyên liệu...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-5 py-3 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.length === paginatedMaterials.length && paginatedMaterials.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-cyan-500 dark:bg-gray-800"
                      />
                    </th>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tên</th>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Mã</th>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Loại</th>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tồn Kho</th>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Danh Mục</th>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Trạng Thái</th>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Ngày Tạo</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedMaterials.map((material) => (
                    <tr 
                      key={material.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <input 
                          type="checkbox" 
                          checked={material.id ? selectedItems.includes(material.id) : false}
                          onChange={() => material.id && handleSelectItem(material.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-cyan-500 dark:bg-gray-800"
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
                        <span className={`status-pill ${
                          resolveMaterialItemType(material) === "asset"
                            ? "bg-violet-50 text-violet-700 shadow-[0_0_0_1px_rgba(139,92,246,0.25)] dark:bg-violet-900/20 dark:text-violet-300"
                            : "bg-sky-50 text-sky-700 shadow-[0_0_0_1px_rgba(56,189,248,0.25)] dark:bg-sky-900/20 dark:text-sky-300"
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
                        <span className={`status-pill ${
                          isActiveStatus(material.status)
                            ? "bg-emerald-50 text-emerald-700 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] dark:bg-emerald-900/20 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 shadow-[0_0_0_1px_rgba(225,29,72,0.2)] dark:bg-rose-900/20 dark:text-rose-300"
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
              {filteredByTab.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {activeTypeTab === "asset" ? "Không tìm thấy tài sản" : activeTypeTab === "goods" ? "Không tìm thấy hàng hóa" : "Không tìm thấy nguyên liệu"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hãy thêm mới hoặc thay đổi từ khóa tìm kiếm.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {filteredByTab.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredByTab.length}
                  startItem={startIndex + 1}
                  endItem={Math.min(startIndex + itemsPerPage, filteredByTab.length)}
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
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
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
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
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
                                        ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300"
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

              {view === "edit" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng Thái
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  disabled={!canApprove()}
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option>Đang hoạt động</option>
                  <option>Ngừng hoạt động</option>
                </select>
              </div>
              )}

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
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium module-primary-btn text-white transition-all duration-200"
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
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
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
