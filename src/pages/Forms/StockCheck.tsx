"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { FormInput, FormDatePicker } from "../../components/form";
import { stockService } from "../../services/stockService";
import { warehouseService, type Warehouse } from "../../services/warehouseService";
import { materialService, type Material } from "../../services/materialService";
import { inventoryService, type InventoryItem } from "../../services/inventoryService";
import { useAuth } from "../../context/AuthContext";

const ActionDropdown = ({
  onView,
  onEdit,
  onDelete,
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

type TeamMember = {
  id: string;
  name: string;
  role: string;
  note: string;
};

type AssetRow = {
  id: string;
  materialId?: number;
  warehouseId?: number;
  warehouse: string;
  materialCode: string;
  materialName: string;
  supplier: string;
  systemQty: number;
  checkQty: number;
  handlingProposal: string;
  recordedCheck: boolean;
  status: string;
};

type StockCheckReceipt = {
  id: string;
  maPhieu: string;
  tenPhieu: string;
  khoKiemKe: string;
  ngayTao: string;
  nguoiTao: string;
  tongVatTu: number;
  trangThai: "Nháp" | "Đã trình" | "Đã duyệt" | "Đã hủy";
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  teamMembers?: TeamMember[];
  assets?: AssetRow[];
  endDate?: string;
  note?: string;
};

type ExistingMemberOption = {
  name: string;
  role: string;
  note: string;
};

type WarehouseMaterialOption = {
  materialId: number;
  warehouseId: number;
  warehouseName: string;
  code: string;
  name: string;
  supplier: string;
  systemQty: number;
};

const HANDLING_OPTIONS = [
  "Thanh lý hủy",
  "Bảo trì, bảo dưỡng",
  "Nhập kho bù kiểm kê thiếu",
  "Xuất kho bù kiểm kê thừa",
];

const STATUS_OPTIONS = ["Lưu kho", "Luân chuyển", "Thanh lý"];

export default function KiemKe() {
  const location = useLocation();
  const navigate = useNavigate();
  const { receiptId } = useParams<{ receiptId?: string }>();
  const { canApprove, hasRole } = useAuth();
  const canSubmitOrCancel = () => hasRole("Nhân viên kho") || hasRole("Quản lý kho") || hasRole("Admin");

  const resolveViewByPath = (pathname: string): "list" | "create" | "detail" => {
    if (pathname === "/kiem-ke/tao-moi") {
      return "create";
    }

    if (pathname.startsWith("/kiem-ke/chi-tiet/")) {
      return "detail";
    }

    return "list";
  };

  const [view, setView] = useState<"list" | "create" | "detail">(
    resolveViewByPath(location.pathname),
  );
  const [receipts, setReceipts] = useState<StockCheckReceipt[]>([]);
  const [receiptSearchTerm, setReceiptSearchTerm] = useState("");
  const [receiptStatusFilter, setReceiptStatusFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [originalDetailIds, setOriginalDetailIds] = useState<number[]>([]);
  const [originalTeamIds, setOriginalTeamIds] = useState<number[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    warehouseId: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "Nháp",
  });

  const [teamTabMode, setTeamTabMode] = useState<"select" | "create">("select");

  const [memberInput, setMemberInput] = useState({
    name: "",
    role: "",
    note: "",
  });

  const [newMemberForm, setNewMemberForm] = useState({
    name: "",
    role: "",
    note: "",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assetRows, setAssetRows] = useState<AssetRow[]>([]);
  const [showAssetModal, setShowAssetModal] = useState(false);

  const [assetFilter, setAssetFilter] = useState({
    keyword: "",
    discrepancyType: "Tất cả",
    warehouse: "",
  });

  const [assetDraft, setAssetDraft] = useState({
    materialId: 0,
    warehouseId: 0,
    warehouseName: "",
    materialSearch: "",
    materialCode: "",
    materialName: "",
    supplier: "",
    systemQty: "0",
    checkQty: "0",
    handlingProposal: "",
    recordedCheck: true,
    status: "",
  });
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);

  // Section refs for sticky progress bar navigation
  const generalInfoRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const assetRef = useRef<HTMLDivElement>(null);
  const materialSearchWrapperRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const itemsPerPage = 5;

  // Load stock checks from API on component mount
  useEffect(() => {
    loadStockChecks();
    loadWarehouses();
    loadMaterialSources();
  }, []);

  // Update view when pathname changes
  useEffect(() => {
    setView(resolveViewByPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (materialSearchWrapperRef.current && !materialSearchWrapperRef.current.contains(event.target as Node)) {
        setIsMaterialDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TODO: Load available staff from API (endpoint /Team/All not yet implemented in backend)
  // For now, users can manually enter staff names
  // useEffect(() => {
  //   const loadAvailableStaff = async () => {
  //     try {
  //       const staffData = await stockService.getAllAvailableStaff();
  //       // Transform the data to match our format (name is unique identifier)
  //       const staffList = Array.from(
  //         new Map(staffData.map(staff => [staff.name, { id: staff.id?.toString() || staff.name, name: staff.name }])).values()
  //       );
  //       setAvailableStaff(staffList);
  //     } catch (error) {
  //       console.error('Error loading available staff:', error);
  //       // Keep empty array - will allow manual input
  //     }
  //   };
  //   loadAvailableStaff();
  // }, []);

  const loadWarehouses = async () => {
    try {
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data || []);
    } catch (error) {
      console.error("Error loading warehouses:", error);
      showToast("Không thể tải danh sách kho", "error");
    }
  };

  const loadMaterialSources = async () => {
    try {
      const [materialsData, inventoriesData] = await Promise.all([
        materialService.getAllMaterials(),
        inventoryService.getAllInventories(),
      ]);

      setMaterials(materialsData || []);
      setInventories(inventoriesData || []);
    } catch (error) {
      console.error("Error loading material sources:", error);
      showToast("Không thể tải danh sách vật tư theo kho", "error");
    }
  };

  const loadStockChecks = async () => {
    setIsLoading(true);
    try {
      const data = await stockService.getAllStockChecks();
      // Transform backend data to component format
      const transformed: StockCheckReceipt[] = data.map((item) => ({
        id: item.id?.toString() || '',
        maPhieu: item.code || '',
        tenPhieu: item.name || 'Chưa đặt tên phiếu',
        khoKiemKe: item.warehouse?.name || 'Chưa chọn kho',
        ngayTao: item.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        nguoiTao: item.createdBy || 'Chưa cập nhật',
        createdBy: item.createdBy || '',
        approvedBy: item.approvedBy || '',
        approvedAt: item.approvedAt || '',
        tongVatTu: item.stockCheckDetails?.length || 0,
        trangThai: (
          item.status === 'Nháp' ? 'Nháp'
          : item.status === 'Đã trình' ? 'Đã trình'
          : item.status === 'Đã duyệt' ? 'Đã duyệt'
          : item.status === 'Đã hủy' ? 'Đã hủy'
          : 'Nháp'
        ) as 'Nháp' | 'Đã trình' | 'Đã duyệt' | 'Đã hủy',
        endDate: item.endDate?.split('T')[0] || '',
        note: item.note || '',
        teamMembers: (item.teams || []).map((team) => ({
          id: team.id?.toString() || `${item.id}-${team.name}`,
          name: team.name || '',
          role: team.role || '',
          note: team.note || '',
        })),
        assets: (item.stockCheckDetails || []).map((detail) => ({
          id: detail.id?.toString() || '',
          materialId: detail.materialId,
          warehouse: detail.warehouse?.name || '',
          materialCode: detail.material?.code || '',
          materialName: detail.material?.name || '',
          supplier: '',
          systemQty: Number(detail.systemQuantity) || 0,
          checkQty: Number(detail.actualQuantity) || 0,
          handlingProposal: detail.handlingProposal || '',
          recordedCheck: detail.recordedCheck ?? true,
          status: detail.status || '',
        })),
      }));
      setReceipts(transformed);
    } catch (error) {
      console.error('Error loading stock checks:', error);
      showToast('Lỗi tải dữ liệu kiểm kê', 'error');
      // Keep current state as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const activeReceipt = useMemo(
    () => receipts.find((receipt) => receipt.id === receiptId),
    [receiptId, receipts],
  );

  const detailTeamMembers = useMemo(
    () => activeReceipt?.teamMembers || [],
    [activeReceipt],
  );

  const detailAssets = useMemo(
    () => activeReceipt?.assets || [],
    [activeReceipt],
  );

  const detailTotalDiscrepancy = useMemo(
    () => detailAssets.reduce((sum, row) => sum + (row.checkQty - row.systemQty), 0),
    [detailAssets],
  );

  const detailTotalSystemQty = useMemo(
    () => detailAssets.reduce((sum, row) => sum + Number(row.systemQty || 0), 0),
    [detailAssets],
  );

  const detailTotalCheckQty = useMemo(
    () => detailAssets.reduce((sum, row) => sum + Number(row.checkQty || 0), 0),
    [detailAssets],
  );

  const detailDiscrepancyRows = useMemo(
    () => detailAssets.filter((row) => row.checkQty !== row.systemQty).length,
    [detailAssets],
  );

  // Computed values
  const generatedCode = useMemo(() => {
    if (formData.code.trim()) return formData.code;
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `KK-${stamp}`;
  }, [formData.code]);

  const filteredAssetRows = useMemo(() => {
    return assetRows.filter((row) => {
      const keyword = assetFilter.keyword.trim().toLowerCase();
      const keywordMatch =
        keyword.length === 0 ||
        row.materialCode.toLowerCase().includes(keyword) ||
        row.materialName.toLowerCase().includes(keyword);

      const warehouseMatch = !assetFilter.warehouse || row.warehouse === assetFilter.warehouse;
      const diff = row.checkQty - row.systemQty;
      const discrepancyMatch =
        assetFilter.discrepancyType === "Tất cả" ||
        (assetFilter.discrepancyType === "Thiếu" && diff < 0) ||
        (assetFilter.discrepancyType === "Thừa" && diff > 0) ||
        (assetFilter.discrepancyType === "Bằng 0" && diff === 0);

      return keywordMatch && warehouseMatch && discrepancyMatch;
    });
  }, [assetFilter, assetRows]);

  const summaryStats = useMemo(() => {
    const totalSystemQty = assetRows.reduce((sum, row) => sum + row.systemQty, 0);
    const totalCheckQty = assetRows.reduce((sum, row) => sum + row.checkQty, 0);
    const discrepancyRows = assetRows.filter((row) => row.checkQty !== row.systemQty).length;

    return {
      teamCount: teamMembers.length,
      assetCount: assetRows.length,
      discrepancyRows,
      totalSystemQty,
      totalCheckQty,
    };
  }, [assetRows, teamMembers]);

  const formCompletionPercent = useMemo(() => {
    const completedCount =
      Number(summaryStats.teamCount > 0) +
      Number(summaryStats.assetCount > 0) +
      Number(formData.name.trim().length > 0) +
      Number(selectedWarehouseIds.length > 0);

    return Math.min(100, completedCount * 25);
  }, [formData.name, selectedWarehouseIds.length, summaryStats.assetCount, summaryStats.teamCount]);

  const receiptSummary = useMemo(() => {
    const draftCount = receipts.filter((r) => r.trangThai === "Nháp").length;
    const pendingCount = receipts.filter((r) => r.trangThai === "Đã trình").length;
    const approvedCount = receipts.filter((r) => r.trangThai === "Đã duyệt").length;
    const totalAssets = receipts.reduce((sum, r) => sum + r.tongVatTu, 0);

    return {
      total: receipts.length,
      draftCount,
      pendingCount,
      approvedCount,
      totalAssets,
    };
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    const keyword = receiptSearchTerm.trim().toLowerCase();

    return receipts.filter((receipt) => {
      const matchesKeyword =
        keyword.length === 0 ||
        receipt.maPhieu.toLowerCase().includes(keyword) ||
        receipt.tenPhieu.toLowerCase().includes(keyword) ||
        receipt.khoKiemKe.toLowerCase().includes(keyword) ||
        receipt.nguoiTao.toLowerCase().includes(keyword);

      const matchesStatus =
        receiptStatusFilter === "Tất cả" || receipt.trangThai === receiptStatusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [receiptSearchTerm, receiptStatusFilter, receipts]);

  const availableExistingMembers = useMemo(() => {
    const memberByName = new Map<string, ExistingMemberOption>();

    for (const receipt of receipts) {
      for (const member of receipt.teamMembers || []) {
        const name = member.name?.trim();
        if (!name) continue;

        const key = name.toLowerCase();
        const existing = memberByName.get(key);

        if (!existing || (!existing.role && member.role) || (!existing.note && member.note)) {
          memberByName.set(key, {
            name,
            role: member.role?.trim() || "",
            note: member.note?.trim() || "",
          });
        }
      }

      const createdBy = receipt.nguoiTao?.trim();
      if (createdBy && createdBy !== "Chưa cập nhật") {
        const key = createdBy.toLowerCase();
        if (!memberByName.has(key)) {
          memberByName.set(key, {
            name: createdBy,
            role: "",
            note: "",
          });
        }
      }
    }

    const selectedNames = new Set(teamMembers.map((member) => member.name.trim().toLowerCase()));

    return Array.from(memberByName.values())
      .filter((member) => !selectedNames.has(member.name.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [receipts, teamMembers]);

  const selectedExistingMember = useMemo(
    () => availableExistingMembers.find((member) => member.name === memberInput.name),
    [availableExistingMembers, memberInput.name]
  );

  const selectedWarehouseNames = useMemo(
    () =>
      warehouses
        .filter((warehouse) => warehouse.id && selectedWarehouseIds.includes(warehouse.id))
        .map((warehouse) => warehouse.name),
    [warehouses, selectedWarehouseIds]
  );

  const warehouseMaterialOptions = useMemo(() => {
    if (selectedWarehouseIds.length === 0) {
      return [] as WarehouseMaterialOption[];
    }

    const warehouseMap = new Map<number, string>();
    for (const warehouse of warehouses) {
      if (warehouse.id) {
        warehouseMap.set(warehouse.id, warehouse.name);
      }
    }

    const materialStockMap = new Map<string, number>();
    for (const item of inventories) {
      if (!selectedWarehouseIds.includes(item.warehouseId)) continue;
      const key = `${item.warehouseId}-${item.materialId}`;
      materialStockMap.set(key, Number(item.quantity) || 0);
    }

    const options: WarehouseMaterialOption[] = [];
    for (const material of materials) {
      if (!material.id) continue;

      for (const warehouseId of selectedWarehouseIds) {
        const key = `${warehouseId}-${material.id}`;
        if (!materialStockMap.has(key)) continue;

        options.push({
          materialId: material.id,
          warehouseId,
          warehouseName: warehouseMap.get(warehouseId) || `Kho #${warehouseId}`,
          code: material.code || "",
          name: material.name || "",
          supplier: material.supplier?.name || "",
          systemQty: materialStockMap.get(key) || 0,
        });
      }
    }

    return options
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [materials, inventories, selectedWarehouseIds, warehouses]);

  const filteredMaterialOptions = useMemo(() => {
    const keyword = assetDraft.materialSearch.trim().toLowerCase();
    if (!keyword) return warehouseMaterialOptions;

    return warehouseMaterialOptions.filter((option) => {
      const label = `${option.code} ${option.name} ${option.supplier} ${option.warehouseName}`.toLowerCase();
      return label.includes(keyword);
    });
  }, [warehouseMaterialOptions, assetDraft.materialSearch]);

  const handleSelectMaterialFromWarehouse = (option: WarehouseMaterialOption) => {
    setAssetDraft((prev) => ({
      ...prev,
      materialId: option.materialId,
      warehouseId: option.warehouseId,
      warehouseName: option.warehouseName,
      materialSearch: `${option.code} - ${option.name} (${option.warehouseName})`,
      materialCode: option.code,
      materialName: option.name,
      supplier: option.supplier,
      systemQty: String(option.systemQty),
      checkQty: prev.checkQty === "0" ? String(option.systemQty) : prev.checkQty,
    }));
    setIsMaterialDropdownOpen(false);
  };

  const handleMaterialSearchInputChange = (input: string) => {
    const keyword = input.trim().toLowerCase();
    const exactMatch = warehouseMaterialOptions.find((option) => {
      const fullLabel = `${option.code} - ${option.name}`.toLowerCase();
      return fullLabel === keyword || option.code.toLowerCase() === keyword || option.name.toLowerCase() === keyword;
    });

    if (exactMatch) {
      handleSelectMaterialFromWarehouse(exactMatch);
      return;
    }

    setAssetDraft((prev) => ({
      ...prev,
      materialSearch: input,
      materialId: 0,
      warehouseId: 0,
      warehouseName: "",
      materialCode: "",
      materialName: "",
      supplier: "",
    }));
    setIsMaterialDropdownOpen(Boolean(input.trim()));
  };

  const handleOpenAssetModal = () => {
    if (selectedWarehouseIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một kho kiểm kê ở phần Thông tin chung", "warning");
      return;
    }

    setAssetDraft((prev) => ({
      ...prev,
      materialId: 0,
      warehouseId: 0,
      warehouseName: "",
      materialSearch: "",
      materialCode: "",
      materialName: "",
      supplier: "",
      systemQty: "0",
      checkQty: "0",
      handlingProposal: "",
      recordedCheck: true,
      status: "",
    }));
    setShowAssetModal(true);
  };

  const handleAddExistingMember = () => {
    if (!memberInput.name.trim()) {
      showToast("Vui lòng chọn người kiểm kê", "warning");
      return;
    }

    const selectedName = memberInput.name.trim();
    const selectedMember = availableExistingMembers.find((member) => member.name === selectedName);
    if (!selectedMember) {
      showToast("Vui lòng chọn người từ danh sách có sẵn", "warning");
      return;
    }

    const next: TeamMember = {
      id: `${Date.now()}`,
      name: selectedName,
      role: selectedMember.role,
      note: selectedMember.note,
    };

    setTeamMembers((prev) => [...prev, next]);
    setMemberInput({ name: "", role: "", note: "" });
    showToast("Thêm thành viên thành công", "success");
  };

  const handleAddNewMember = () => {
    if (!newMemberForm.name.trim() || !newMemberForm.role.trim()) {
      showToast("Vui lòng nhập tên và chức danh", "warning");
      return;
    }

    const next: TeamMember = {
      id: `${Date.now()}`,
      name: newMemberForm.name.trim(),
      role: newMemberForm.role.trim(),
      note: newMemberForm.note.trim(),
    };

    setTeamMembers((prev) => [...prev, next]);
    setNewMemberForm({ name: "", role: "", note: "" });
    showToast("Tạo và thêm thành viên thành công", "success");
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveDraft = async () => {
    if (isSaving) return;
    if (selectedWarehouseIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một kho kiểm kê", "warning");
      return;
    }
    if (teamMembers.length === 0) {
      showToast("Phiếu kiểm phải có ít nhất một đội kiểm", "warning");
      return;
    }
    if (assetRows.filter((r) => r.materialId).length === 0) {
      showToast("Phiếu kiểm phải có ít nhất một chi tiết vật tư", "warning");
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingId) {
        // ── EDIT MODE ──
        await stockService.updateStockCheck(editingId, {
          code: generatedCode,
          name: formData.name.trim() || "Chưa đặt tên phiếu",
          warehouseId: selectedWarehouseIds[0] || 0,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status || "Nháp",
        } as any);

        // Delete then re-add details
        for (const detailId of originalDetailIds) {
          await stockService.deleteStockDetail(editingId, detailId);
        }
        for (const asset of assetRows.filter((r) => r.materialId)) {
          await stockService.createStockDetail({
            stockCheckId: editingId,
            materialId: asset.materialId!,
            warehouseId: asset.warehouseId || selectedWarehouseIds[0],
            systemQuantity: asset.systemQty,
            actualQuantity: asset.checkQty,
            handlingProposal: asset.handlingProposal || "",
            recordedCheck: asset.recordedCheck ?? true,
            status: asset.status || "Chưa xử lý",
          });
        }

        // Delete then re-add teams
        for (const teamId of originalTeamIds) {
          await stockService.deleteStockTeam(editingId, teamId);
        }
        for (const member of teamMembers) {
          await stockService.createStockTeam(editingId, {
            name: member.name,
            role: member.role,
            note: member.note || "",
          });
        }

        showToast("Đã cập nhật phiếu kiểm kê thành công", "success");
      } else {
        // ── CREATE MODE ──
        for (const warehouseId of selectedWarehouseIds) {
          const relevantAssets = assetRows.filter((row) => row.materialId);
          const stockCheckData = {
            code: selectedWarehouseIds.length > 1 ? `${generatedCode}-K${warehouseId}` : generatedCode,
            name: formData.name.trim() || "Chưa đặt tên phiếu",
            warehouseId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: "Nháp",
            stockCheckDetails: relevantAssets.map((asset) => ({
              stockCheckId: 0,
              materialId: asset.materialId!,
              warehouseId,
              systemQuantity: asset.systemQty,
              actualQuantity: asset.checkQty,
              handlingProposal: asset.handlingProposal || "",
              recordedCheck: asset.recordedCheck,
              status: asset.status || "",
            })),
            teams: teamMembers.map((member) => ({
              stockCheckId: 0,
              name: member.name,
              role: member.role,
              note: member.note || "",
            })),
          };
          await stockService.createStockCheck(stockCheckData as any);
        }
        showToast("Đã lập phiếu kiểm kê thành công", "success");
      }

      navigate("/kiem-ke");
      await loadStockChecks();
    } catch (error) {
      console.error("Error saving draft:", error);
      // Extract actual error message from API response
      const axiosErr = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> }; status?: number } };
      if (axiosErr?.response?.data) {
        const data = axiosErr.response.data;
        if (data.errors) {
          // ModelState errors
          const msgs = Object.values(data.errors).flat().join("; ");
          showToast(`Lỗi: ${msgs}`, "error");
        } else if (data.message) {
          showToast(`Lỗi: ${data.message}`, "error");
        } else {
          showToast(`Lỗi server ${axiosErr.response.status}`, "error");
        }
      } else {
        showToast("Lỗi lưu phiếu kiểm kê", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenReceipt = (receipt: StockCheckReceipt) => {
    void (async () => {
      try {
        const stockCheck = await stockService.getStockCheckById(Number(receipt.id));

        setFormData({
          code: stockCheck.code || receipt.maPhieu,
          name: stockCheck.name || receipt.tenPhieu,
          warehouseId: stockCheck.warehouseId || 0,
          startDate: stockCheck.startDate?.split("T")[0] || receipt.ngayTao,
          endDate: stockCheck.endDate?.split("T")[0] || receipt.endDate || "",
          status: stockCheck.status || (receipt.trangThai === "Nháp" ? "Nháp" : "Đã duyệt"),
        });
        setSelectedWarehouseIds(stockCheck.warehouseId ? [stockCheck.warehouseId] : []);

        setTeamMembers(
          (stockCheck.teams || []).map((team) => ({
            id: team.id?.toString() || `${Date.now()}-${team.name}`,
            name: team.name || "",
            role: team.role || "",
            note: team.note || "",
          }))
        );

        setAssetRows(
          (stockCheck.stockCheckDetails || []).map((detail) => ({
            id: detail.id?.toString() || `${Date.now()}-${detail.materialId}`,
            materialId: detail.materialId,
            warehouseId: detail.warehouseId || stockCheck.warehouseId,
            warehouse: detail.warehouse?.name || receipt.khoKiemKe || "Kho chính",
            materialCode: detail.material?.code || "",
            materialName: detail.material?.name || "",
            supplier: "",
            systemQty: Number(detail.systemQuantity) || 0,
            checkQty: Number(detail.actualQuantity) || 0,
            handlingProposal: detail.handlingProposal || "",
            recordedCheck: detail.recordedCheck ?? true,
            status: detail.status || "",
          }))
        );

        setAssetFilter({
          keyword: "",
          discrepancyType: "Tất cả",
          warehouse: "",
        });
        setEditingId(Number(receipt.id));
        setOriginalDetailIds(
          (stockCheck.stockCheckDetails || []).map((d) => d.id!).filter(Boolean)
        );
        setOriginalTeamIds(
          (stockCheck.teams || []).map((t) => t.id!).filter(Boolean)
        );
        setView("create");
        navigate("/kiem-ke/tao-moi");
        showToast("Đã nạp dữ liệu phiếu để chỉnh sửa", "success");
      } catch (error) {
        console.error("Error loading stock check for edit:", error);
        showToast("Không thể tải dữ liệu phiếu kiểm kê từ API", "error");
      }
    })();
  };

  const handleViewReceipt = (receipt: StockCheckReceipt) => {
    navigate(`/kiem-ke/chi-tiet/${receipt.id}`);
  };

  const handleCreateNew = () => {
    setFormData({
      code: "",
      name: "",
      warehouseId: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "Nháp",
    });
    setSelectedWarehouseIds([]);
    setTeamMembers([]);
    setAssetRows([]);
    setEditingId(null);
    setOriginalDetailIds([]);
    setOriginalTeamIds([]);
    setView("create");
    navigate("/kiem-ke/tao-moi");
  };

  const handleDeleteReceipt = (receiptId: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa phiếu kiểm kê này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          const id = parseInt(receiptId);
          await stockService.deleteStockCheck(id);
          setReceipts(receipts.filter((r) => r.id !== receiptId));
          showToast("Phiếu kiểm kê đã được xóa!", "success");
        } catch (error) {
          console.error("Error deleting receipt:", error);
          showToast("Lỗi xóa phiếu kiểm kê", "error");
        }
      },
    });
  };

  const handleSubmitStockCheck = (receipt: StockCheckReceipt) => {
    if (!canSubmitOrCancel()) {
      showToast("Bạn không có quyền gửi phiếu", "warning");
      return;
    }
    if (receipt.trangThai !== "Nháp") {
      showToast("Chỉ phiếu Nháp mới có thể gửi xác nhận", "warning");
      return;
    }
    showConfirm({
      message: "Gửi phiếu kiểm kê sang trạng thái Đã trình?",
      okText: "Gửi",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          await stockService.updateStockCheck(Number(receipt.id), { status: "Đã trình" } as any);
          await loadStockChecks();
          showToast("Đã gửi phiếu, trạng thái: Đã trình", "success");
        } catch (error) {
          const axiosErr = error as { response?: { data?: { message?: string } } };
          const msg = axiosErr?.response?.data?.message || "Lỗi khi gửi phiếu";
          showToast(msg, "error");
        }
      },
    });
  };

  const handleApproveStockCheck = (receipt: StockCheckReceipt) => {
    if (!canApprove()) {
      showToast("Bạn không có quyền duyệt phiếu", "warning");
      return;
    }
    showConfirm({
      message: "Duyệt phiếu kiểm kê này?",
      okText: "Duyệt",
      cancelText: "Hủy",
      onConfirm: async () => {
        try {
          await stockService.updateStockCheck(Number(receipt.id), { status: "Đã duyệt" } as any);
          await loadStockChecks();
          showToast("Đã duyệt phiếu kiểm kê", "success");
        } catch (error) {
          const axiosErr = error as { response?: { data?: { message?: string } } };
          const msg = axiosErr?.response?.data?.message || "Lỗi khi duyệt phiếu";
          showToast(msg, "error");
        }
      },
    });
  };

  const handleCancelStockCheck = (receipt: StockCheckReceipt) => {
    if (!canSubmitOrCancel()) {
      showToast("Bạn không có quyền hủy phiếu", "warning");
      return;
    }
    if (receipt.trangThai === "Đã hủy") {
      showToast("Phiếu này đã được hủy", "warning");
      return;
    }
    showConfirm({
      message: "Bạn có chắc muốn hủy phiếu kiểm kê này?",
      okText: "Hủy phiếu",
      cancelText: "Không",
      onConfirm: async () => {
        try {
          await stockService.updateStockCheck(Number(receipt.id), { status: "Đã hủy" } as any);
          await loadStockChecks();
          showToast("Đã hủy phiếu kiểm kê", "success");
        } catch (error) {
          const axiosErr = error as { response?: { data?: { message?: string } } };
          const msg = axiosErr?.response?.data?.message || "Lỗi khi hủy phiếu";
          showToast(msg, "error");
        }
      },
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedReceipts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedReceipts.map(r => r.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStockCheckStatusClass = (status: string) => {
    if (status === "Đã duyệt") return "status-confirmed";
    if (status === "Đã trình") return "status-submitted";
    if (status === "Đã hủy") return "status-cancelled";
    return "status-draft";
  };

  const handleExportReceipts = () => {
    const data = filteredReceipts;
    if (data.length === 0) {
      showToast("Không có dữ liệu để xuất", "warning");
      return;
    }

    const headers = ["STT", "Mã phiếu", "Tên phiếu", "Kho kiểm kê", "Ngày tạo", "Người tạo", "Tổng vật tư", "Trạng thái"];
    const rows = data.map((r, idx) => [
      idx + 1,
      r.maPhieu,
      r.tenPhieu,
      r.khoKiemKe,
      r.ngayTao,
      r.nguoiTao,
      r.tongVatTu,
      r.trangThai,
    ]);

    const csv = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phieu-kiem-ke_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Xuất dữ liệu thành công!", "success");
  };

  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReceipts = filteredReceipts.slice(startIndex, startIndex + itemsPerPage);

  const handleAddAsset = () => {
    if (selectedWarehouseIds.length === 0) {
      showToast("Vui lòng chọn ít nhất một kho kiểm kê ở phần Thông tin chung", "warning");
      return;
    }

    if (!assetDraft.materialId || !assetDraft.warehouseId || !assetDraft.materialCode.trim() || !assetDraft.materialName.trim()) {
      showToast("Vui lòng chọn vật tư từ danh sách của kho", "warning");
      return;
    }

    const systemQty = Number(assetDraft.systemQty || 0);
    const checkQty = Number(assetDraft.checkQty || 0);

    const nextRow: AssetRow = {
      id: `${Date.now()}`,
      materialId: assetDraft.materialId,
      warehouseId: assetDraft.warehouseId,
      warehouse: assetDraft.warehouseName || "Chưa chọn kho",
      materialCode: assetDraft.materialCode.trim(),
      materialName: assetDraft.materialName.trim(),
      supplier: assetDraft.supplier.trim(),
      systemQty: Number.isNaN(systemQty) ? 0 : systemQty,
      checkQty: Number.isNaN(checkQty) ? 0 : checkQty,
      handlingProposal: assetDraft.handlingProposal || "",
      recordedCheck: assetDraft.recordedCheck,
      status: assetDraft.status || "Lưu kho",
    };

    setAssetRows((prev) => [...prev, nextRow]);
    setAssetFilter({
      keyword: "",
      discrepancyType: "Tất cả",
      warehouse: "",
    });
    setAssetDraft({
      materialId: 0,
      warehouseId: 0,
      warehouseName: "",
      materialSearch: "",
      materialCode: "",
      materialName: "",
      supplier: "",
      systemQty: "0",
      checkQty: "0",
      handlingProposal: "",
      recordedCheck: true,
      status: "",
    });
    setShowAssetModal(false);
    showToast("Đã thêm tài sản (FE-only)", "success");
  };

  const handleUpdateAsset = (
    id: string,
    updates: Partial<Pick<AssetRow, "checkQty" | "handlingProposal" | "recordedCheck" | "status">>,
  ) => {
    setAssetRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  };

  const handleDeleteAsset = (id: string) => {
    setAssetRows((prev) => prev.filter((row) => row.id !== id));
  };

  const pageTitle = view === "list" ? "Kiểm kê" : view === "create" ? "Tạo phiếu kiểm kê" : "Chi tiết phiếu kiểm kê";
  const breadcrumbAction = view === "list" ? (
    <button
      onClick={handleCreateNew}
      className="module-primary-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
      </svg>
      Tạo mới
    </button>
  ) : (
    <button
      onClick={() => { setView("list"); navigate("/kiem-ke"); }}
      className="module-ghost-btn inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
      </svg>
      Quay lại danh sách
    </button>
  );

  return (
    <>
      <PageMeta 
        title={view === "list" ? "Danh sách phiếu kiểm kê" : "Tạo mới phiếu kiểm kê"}
        description={view === "list" ? "Danh sách phiếu kiểm kê" : "Màn hình tạo phiếu kiểm kê"}
      />
      <PageBreadcrumb pageTitle={pageTitle} action={breadcrumbAction} />

      {view === "list" && (
        <>
          {/* Summary Stats Cards */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-sky-700 dark:text-sky-300">Tổng phiếu kiểm kê</p>
              <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">{receiptSummary.total}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Nháp</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-200">{receiptSummary.draftCount}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Đã trình</p>
              <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">{receiptSummary.pendingCount}</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Đã duyệt</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{receiptSummary.approvedCount}</p>
            </div>
          </div>

          {/* Main Container */}
          <div className="form-tone-sync rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header Section */}
            <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Danh sách phiếu kiểm kê
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Quản lý danh sách các phiếu kiểm kê kho.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportReceipts}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 overflow-visible">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={receiptSearchTerm}
                    onChange={(e) => { setReceiptSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="h-[48px] w-full pl-10 px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm transition-all duration-200"
                  />
                </div>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="inline-flex items-center gap-2 h-[48px] px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
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
                              {["Tất cả", "Nháp", "Đã trình", "Đã duyệt", "Đã hủy"].map(status => (
                                <label key={status} className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                                  <input
                                    type="radio"
                                    name="status"
                                    checked={receiptStatusFilter === status}
                                    onChange={() => setReceiptStatusFilter(status)}
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

            {/* Tabl taie Section */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-cyan-500 dark:border-gray-800 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="module-table w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-5 py-3 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.length === paginatedReceipts.length && paginatedReceipts.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-cyan-600 focus:ring-cyan-500 dark:bg-gray-900"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Mã phiếu</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tên phiếu</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Kho</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Người tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tổng VLC</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Trạng thái</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Không tìm thấy phiếu kiểm kê
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Hãy tạo phiếu mới hoặc thay đổi từ khóa tìm kiếm.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedReceipts.map((receipt) => (
                      <tr 
                        key={receipt.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(receipt.id)}
                            onChange={() => handleSelectItem(receipt.id)}
                            className="w-4 h-4 rounded border-gray-200 dark:border-gray-700 text-cyan-600 focus:ring-cyan-500 dark:bg-gray-900"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-bold tracking-tight text-gray-900 dark:text-white">
                            {receipt.maPhieu}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receipt.tenPhieu}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receipt.khoKiemKe}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receipt.nguoiTao}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(receipt.ngayTao)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {receipt.tongVatTu}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`status-pill ${getStockCheckStatusClass(receipt.trangThai)}`}>
                            {receipt.trangThai}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ActionDropdown
                            onView={() => handleViewReceipt(receipt)}
                            onEdit={() => handleOpenReceipt(receipt)}
                            onDelete={() => handleDeleteReceipt(receipt.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            )}

            {/* Pagination */}
            {filteredReceipts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReceipts.length}
                startItem={startIndex + 1}
                endItem={startIndex + itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      )}

      {view === "create" && (
        <div className="form-tone-sync space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm dark:border-cyan-900/40 dark:bg-white/[0.03]">
            <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-500/20" />
            <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/20" />

            <div className="relative bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 px-5 py-6 dark:from-cyan-900 dark:via-teal-900 dark:to-emerald-900 sm:px-6 sm:py-7">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Warehouse Stock Check</p>
                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                    {editingId ? "Chỉnh sửa phiếu kiểm kê" : "Tạo phiếu kiểm kê mới"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-cyan-100">
                    {editingId
                      ? `Đang chỉnh sửa phiếu #${editingId}. Cập nhật thông tin và nhấn "Đồng ý" để lưu.`
                      : "Khởi tạo phiếu, gán tổ kiểm kê và ghi nhận số liệu chênh lệch trên cùng một màn hình trực quan."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
                  <button
                    onClick={() => navigate("/kiem-ke")}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại danh sách
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky top-0 z-40 bg-gradient-to-b from-cyan-50/95 to-cyan-50/80 backdrop-blur-xs border-b border-cyan-100 dark:from-cyan-950/40 dark:to-cyan-950/30 dark:border-cyan-900/30 transition-all">
              <div className="space-y-2.5 p-3">
                {/* Progress Bar with Step Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Step 1 */}
                    <button
                      onClick={() => scrollToSection(generalInfoRef)}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all hover:bg-white/60 dark:hover:bg-gray-800/40 active:scale-95"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white dark:bg-cyan-500">1</div>
                      <span className="hidden sm:inline text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Thông tin</span>
                    </button>
                    <div className="hidden sm:block h-0.5 w-6 bg-cyan-200 dark:bg-cyan-900/40" />

                    {/* Step 2 */}
                    <button
                      onClick={() => scrollToSection(teamRef)}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all hover:bg-white/60 dark:hover:bg-gray-800/40 active:scale-95"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white dark:bg-indigo-500">2</div>
                      <span className="hidden sm:inline text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Tổ kiểm kê</span>
                    </button>
                    <div className="hidden sm:block h-0.5 w-6 bg-indigo-200 dark:bg-indigo-900/40" />

                    {/* Step 3 */}
                    <button
                      onClick={() => scrollToSection(assetRef)}
                      className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all hover:bg-white/60 dark:hover:bg-gray-800/40 active:scale-95"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white dark:bg-emerald-500">3</div>
                      <span className="hidden sm:inline text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Tài sản</span>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 whitespace-nowrap">Tiến độ: {formCompletionPercent}%</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/70 dark:bg-gray-800/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${formCompletionPercent}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${formCompletionPercent >= 100 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                      {formCompletionPercent >= 100 ? "✓ Sẵn sàng" : "Hoàn thiện"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-cyan-100/50 dark:border-cyan-900/20" />
              </div>
            </div>

            <div className="relative grid grid-cols-1 gap-2.5 bg-cyan-50/60 p-3 sm:grid-cols-2 lg:grid-cols-5 dark:bg-cyan-950/20">
              <QuickStat
                colorClass="bg-cyan-600"
                label="Mã phiếu"
                value={formData.code}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <QuickStat
                colorClass="bg-indigo-600"
                label="Thành viên"
                value={`${summaryStats.teamCount}`}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5V9H2v11h5m10 0v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5m10 0H7" />
                  </svg>
                }
              />
              <QuickStat
                colorClass="bg-emerald-600"
                label="Tài sản"
                value={`${summaryStats.assetCount}`}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4" />
                  </svg>
                }
              />
              <QuickStat
                colorClass="bg-amber-600"
                label="Dòng lệch"
                value={`${summaryStats.discrepancyRows}`}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                }
              />
              <QuickStat
                colorClass="bg-rose-600"
                label="Tổng chênh"
                value={(summaryStats.totalCheckQty - summaryStats.totalSystemQty).toLocaleString("vi-VN")}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Section 1: General Information */}
            <div ref={generalInfoRef} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                  <span className="text-sm font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin chung</h3>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field 
                  label="Mã phiếu kiểm kê"
                  value={formData.code}
                  onChange={(v) => setFormData((p) => ({ ...p, code: v }))}
                  placeholder="Nhập mã phiếu"
                />
                <Field
                  label="Tên phiếu"
                  value={formData.name}
                  onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
                  placeholder="Nhập tên phiếu"
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Kho kiểm kê</label>
                  <CustomMultiSelect
                    values={selectedWarehouseIds.map(String)}
                    onChange={(values) => {
                      const ids = values.map((value) => parseInt(value)).filter((id) => !Number.isNaN(id) && id > 0);
                      setSelectedWarehouseIds(ids);
                      setFormData((p) => ({ ...p, warehouseId: ids[0] || 0 }));
                    }}
                    options={[
                      ...warehouses.map((kho) => ({
                        value: String(kho.id ?? 0),
                        label: kho.name,
                      })),
                    ]}
                    placeholder="Chọn một hoặc nhiều kho kiểm kê"
                  />
                </div>

                <DatePickerField
                  label="Ngày bắt đầu"
                  value={formData.startDate}
                  placeholder="Chọn ngày bắt đầu"
                  onChange={(v) => setFormData((p) => ({ ...p, startDate: v }))}
                />
                <DatePickerField
                  label="Ngày kết thúc"
                  value={formData.endDate}
                  placeholder="Chọn ngày kết thúc"
                  onChange={(v) => setFormData((p) => ({ ...p, endDate: v }))}
                />
              </div>
            </div>

            {/* Section 2: Team Members */}
            <div ref={teamRef} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white px-6 py-4 dark:border-gray-800 dark:from-indigo-950/30 dark:to-transparent">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tổ kiểm kê</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Thêm thành viên tham gia và vai trò phụ trách kiểm kê.</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {teamMembers.length} thành viên
                </span>
              </div>

              <div className="p-6">
                {/* Tab Navigation */}
                <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setTeamTabMode("select")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      teamTabMode === "select"
                        ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
                    </svg>
                    Chọn người có sẵn
                  </button>
                  <button
                    onClick={() => setTeamTabMode("create")}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      teamTabMode === "create"
                        ? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo mới
                  </button>
                </div>

                {/* Tab 1: Select Existing Member */}
                {teamTabMode === "select" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
                        {/* Staff Selection Input */}
                        <div className="relative md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Chọn người từ danh sách</label>
                          <CustomSelect
                            value={memberInput.name}
                            onChange={(value) => setMemberInput((p) => ({ ...p, name: value }))}
                            options={[
                              {
                                value: "",
                                label: availableExistingMembers.length === 0 ? "Không có người trong danh sách" : "Chọn người kiểm kê",
                              },
                              ...availableExistingMembers.map((member) => ({
                                value: member.name,
                                label: member.name,
                              })),
                            ]}
                          />
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={handleAddExistingMember}
                          className="h-11 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                          <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Thêm
                        </button>
                      </div>

                      {selectedExistingMember && (
                        <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-200">
                          <p>
                            Chức danh: {selectedExistingMember.role || "Chưa có"}
                          </p>
                          <p>
                            Ghi chú: {selectedExistingMember.note || "Không có"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-900/20">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                        💡 Danh sách người được lấy từ dữ liệu API (người tạo và thành viên các phiếu trước đó).
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Create New Member */}
                {teamTabMode === "create" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end">
                        {/* New Member Name Input */}
                        <FormInput
                          label="Tên người mới"
                          value={newMemberForm.name}
                          onChange={(e) => setNewMemberForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Nhập tên đầy đủ"
                        />

                        {/* New Member Role Input */}
                        <FormInput
                          label="Chức danh"
                          value={newMemberForm.role}
                          onChange={(e) => setNewMemberForm((p) => ({ ...p, role: e.target.value }))}
                          placeholder="VD: Tổ trưởng, Kiểm kho..."
                        />

                        {/* New Member Note Input */}
                        <FormInput
                          label="Ghi chú"
                          value={newMemberForm.note}
                          onChange={(e) => setNewMemberForm((p) => ({ ...p, note: e.target.value }))}
                          placeholder="Ghi chú (tuỳ chọn)"
                        />

                        {/* Create & Add Button */}
                        <button
                          onClick={handleAddNewMember}
                          className="h-11 w-full rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                        >
                          <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Tạo & Thêm
                        </button>
                      </div>
                    </div>
                    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-900/20">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                        💡 Gợi ý: Nhập thông tin người mới, sau đó click "Tạo & Thêm" để thêm vào danh sách tổ kiểm kê.
                      </p>
                    </div>
                  </div>
                )}

                {/* Team Members Table */}
                {(teamMembers || []).length > 0 && (
                  <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60">
                        <tr>
                          <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">STT</th>
                          <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tên người kiểm kê</th>
                          <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Chức danh</th>
                          <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Ghi chú</th>
                          <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tác vụ</th>
                        </tr>
                      </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {(teamMembers || []).map((member, index) => (
                          <tr key={member.id} className="transition-colors odd:bg-white even:bg-gray-50/60 hover:bg-indigo-50/60 dark:odd:bg-transparent dark:even:bg-gray-800/20 dark:hover:bg-indigo-900/20">
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{index + 1}</td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{member.name}</td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{member.role}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{member.note || "-"}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="rounded-md px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(teamMembers || []).length === 0 && (
                  <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white py-10 text-center dark:border-gray-700 dark:from-gray-900/40 dark:to-gray-900/10">
                    <svg className="mx-auto mb-2 h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
                    </svg>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Chưa có thành viên tổ kiểm kê</p>
                  </div>
                )}
              </div>
            </div>
            {/* Section 3: Asset Information */}
            <div ref={assetRef} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white px-6 py-4 dark:border-gray-800 dark:from-emerald-950/30 dark:to-transparent">
                <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin tài sản</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Quản lý dữ liệu kiểm kê, chênh lệch và đề nghị xử lý từng vật tư.</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {summaryStats.assetCount} tài sản
                </span>
              </div>

              {/* Filter Section */}
              <div className="m-6 mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:flex-1 lg:max-w-2xl">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={assetFilter.keyword}
                      onChange={(e) => setAssetFilter((p) => ({ ...p, keyword: e.target.value }))}
                      placeholder="Tìm kiếm mã hoặc tên vật tư"
                      className="h-[48px] w-full rounded-xl border border-gray-200 bg-white pl-10 px-4 text-sm text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </div>

                  <CustomSelect
                    value={assetFilter.discrepancyType}
                    onChange={(value) => setAssetFilter((p) => ({ ...p, discrepancyType: value }))}
                    options={[
                      { value: "Tất cả", label: "Loại chênh lệch" },
                      { value: "Thiếu", label: "Thiếu" },
                      { value: "Thừa", label: "Thừa" },
                      { value: "Bằng 0", label: "Bằng 0" },
                    ]}
                    buttonClassName="sm:min-w-[170px]"
                  />

                  <CustomSelect
                    value={assetFilter.warehouse}
                    onChange={(value) => setAssetFilter((p) => ({ ...p, warehouse: value }))}
                    options={[
                      { value: "", label: "Chọn kho" },
                      ...warehouses.map((warehouse) => ({
                        value: warehouse.name,
                        label: warehouse.name,
                      })),
                    ]}
                    buttonClassName="sm:min-w-[140px]"
                  />
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    onClick={() =>
                      setAssetFilter({
                        keyword: "",
                        discrepancyType: "Tất cả",
                        warehouse: "",
                      })
                    }
                    className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={handleOpenAssetModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm tài sản
                  </button>
                </div>
              </div>

              {/* Assets Table */}
              <div className="mx-6 mb-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">STT</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Mã VT</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">Tên vật tư</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Số lượng hệ thống</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Số lượng kiểm kê</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Chênh lệch</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Đề nghị xử lý</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Ghi nhận</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Trạng thái</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Tác vụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssetRows.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-10" />
                            </svg>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Không có tài sản nào</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      (filteredAssetRows || []).map((row, index) => {
                        const diff = row.checkQty - row.systemQty;
                        const diffClass =
                          diff === 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : diff > 0
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400";

                        return (
                          <tr key={row.id} className="border-t border-gray-100 transition-colors odd:bg-white even:bg-gray-50/40 hover:bg-emerald-50/40 dark:border-gray-800/50 dark:odd:bg-transparent dark:even:bg-gray-800/10 dark:hover:bg-emerald-900/15">
                            <td className="px-3 py-3 text-center font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{index + 1}</td>
                            <td className="px-3 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{row.materialCode}</td>
                            <td className="px-3 py-3 text-gray-900 dark:text-gray-100 max-w-xs">{row.materialName}</td>
                            <td className="px-3 py-3 text-center text-gray-900 dark:text-gray-100 whitespace-nowrap font-medium">{row.systemQty}</td>
                            <td className="px-3 py-3">
                              <input
                                type="number"
                                value={row.checkQty}
                                onChange={(e) =>
                                  handleUpdateAsset(row.id, {
                                    checkQty: Number(e.target.value || 0),
                                  })
                                }
                                className="h-8 w-20 rounded border border-gray-300 bg-white px-2 text-center text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors"
                              />
                            </td>
                            <td className={`px-3 py-3 font-semibold text-center whitespace-nowrap ${diffClass}`}>{diff > 0 ? `+${diff}` : diff}</td>
                            <td className="px-3 py-3">
                              <CustomSelect
                                value={row.handlingProposal}
                                onChange={(value) =>
                                  handleUpdateAsset(row.id, {
                                    handlingProposal: value,
                                  })
                                }
                                options={[
                                  { value: "", label: "Chọn xử lý" },
                                  ...HANDLING_OPTIONS.map((option) => ({
                                    value: option,
                                    label: option,
                                  })),
                                ]}
                                size="sm"
                                buttonClassName="w-[170px]"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <label className="inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={row.recordedCheck}
                                  onChange={(e) =>
                                    handleUpdateAsset(row.id, {
                                      recordedCheck: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700 cursor-pointer"
                                />
                              </label>
                            </td>
                            <td className="px-3 py-3">
                              <CustomSelect
                                value={row.status}
                                onChange={(value) =>
                                  handleUpdateAsset(row.id, {
                                    status: value,
                                  })
                                }
                                options={STATUS_OPTIONS.map((status) => ({
                                  value: status,
                                  label: status,
                                }))}
                                size="sm"
                                buttonClassName="w-[130px]"
                              />
                            </td>
                            <td className="px-3 py-3">
                              <button
                                onClick={() => handleDeleteAsset(row.id)}
                                className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors hover:underline"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-end gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 px-5 py-4 dark:border-cyan-900/30 dark:bg-cyan-950/20">
            <button
              onClick={() => navigate("/kiem-ke")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại danh sách
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
            >
              {isSaving ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isSaving ? "Đang lưu..." : editingId ? "Đồng ý" : "Lập phiếu"}
            </button>
          </div>
        </div>
      )}

      {view === "detail" && (
        <div className="module-view space-y-4">
          {!activeReceipt ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Không tìm thấy phiếu kiểm kê</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Phiếu có thể đã bị xóa hoặc không tồn tại trong danh sách hiện tại.</p>
              <button
                onClick={() => navigate("/kiem-ke")}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Quay lại danh sách
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 dark:border-sky-500/30 dark:from-sky-500/10 dark:via-gray-900 dark:to-emerald-500/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <button
                      onClick={() => navigate("/kiem-ke")}
                      className="module-ghost-btn inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Quay Lại
                    </button>
                    <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">Chi tiết phiếu kiểm kê {activeReceipt.maPhieu}</h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Ngày tạo: {formatDate(activeReceipt.ngayTao)}</p>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                      activeReceipt.trangThai === "Nháp"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : activeReceipt.trangThai === "Đã trình"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : activeReceipt.trangThai === "Đã duyệt"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {activeReceipt.trangThai}
                    </span>
                    <div className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/70 p-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70">
                      {/* Gửi xác nhận: chỉ Nháp + có quyền */}
                      {activeReceipt.trangThai === "Nháp" && canSubmitOrCancel() && (
                        <button
                          onClick={() => handleSubmitStockCheck(activeReceipt)}
                          aria-label="Gửi xác nhận"
                          title="Gửi xác nhận"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {/* Duyệt: chỉ Đã trình + canApprove */}
                      {activeReceipt.trangThai === "Đã trình" && canApprove() && (
                        <button
                          onClick={() => handleApproveStockCheck(activeReceipt)}
                          aria-label="Duyệt phiếu"
                          title="Duyệt phiếu"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {/* Hủy: không áp dụng khi Đã hủy + có quyền */}
                      {activeReceipt.trangThai !== "Đã hủy" && canSubmitOrCancel() && (
                        <button
                          onClick={() => handleCancelStockCheck(activeReceipt)}
                          aria-label="Hủy phiếu"
                          title="Hủy phiếu"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700 text-white transition-colors hover:bg-gray-800"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {/* Chỉnh sửa: chỉ Nháp */}
                      {activeReceipt.trangThai === "Nháp" && (
                        <button
                          onClick={() => handleOpenReceipt(activeReceipt)}
                          aria-label="Chỉnh sửa"
                          title="Chỉnh sửa"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white transition-colors hover:bg-amber-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {/* Xóa: chỉ Nháp */}
                      {activeReceipt.trangThai === "Nháp" && (
                        <button
                          onClick={() => handleDeleteReceipt(activeReceipt.id)}
                          aria-label="Xóa phiếu"
                          title="Xóa phiếu"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-sky-200 bg-white/80 p-4 backdrop-blur-sm dark:border-sky-500/30 dark:bg-sky-500/10">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">Số dòng tài sản</p>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold text-sky-900 dark:text-sky-100">{detailAssets.length}</p>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-white/80 p-4 backdrop-blur-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">SL hệ thống</p>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M6 11h12m-9 4h6" /></svg>
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold text-indigo-900 dark:text-indigo-100">{detailTotalSystemQty.toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">SL kiểm kê</p>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold text-emerald-900 dark:text-emerald-100">{detailTotalCheckQty.toLocaleString("vi-VN")}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-white/80 p-4 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">Dòng chênh lệch</p>
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-4-8h8" /></svg>
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-semibold text-amber-900 dark:text-amber-100">{detailDiscrepancyRows}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="module-surface lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                  <div className="mb-6 grid grid-cols-1 gap-4 border-b border-gray-200 pb-6 sm:grid-cols-2 dark:border-gray-700">
                    <DetailStat label="Mã phiếu" value={activeReceipt.maPhieu} />
                    <DetailStat label="Kho kiểm kê" value={activeReceipt.khoKiemKe || "-"} />
                    <DetailStat label="Ngày tạo" value={formatDate(activeReceipt.ngayTao)} />
                    <DetailStat label="Ngày kết thúc" value={activeReceipt.endDate ? formatDate(activeReceipt.endDate) : "-"} />
                    <DetailStat label="Người tạo" value={activeReceipt.nguoiTao || "-"} />
                    {activeReceipt.approvedBy && (
                      <DetailStat label="Xác nhận bởi" value={activeReceipt.approvedBy} />
                    )}
                    {activeReceipt.approvedAt && (
                      <DetailStat label="Thời gian xác nhận" value={new Date(activeReceipt.approvedAt).toLocaleString("vi-VN")} />
                    )}
                  </div>
                  {activeReceipt.note && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Ghi chú</p>
                      <p className="mt-1 text-sm text-blue-900 dark:text-blue-100">{activeReceipt.note}</p>
                    </div>
                  )}

                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Danh sách tài sản kiểm kê</h3>
                    <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{detailAssets.length} dòng</span>
                  </div>

                  <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="module-table w-full text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Mã vật tư</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Tên vật tư</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Kho</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">SL hệ thống</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">SL kiểm kê</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Chênh lệch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {detailAssets.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Phiếu này chưa có tài sản kiểm kê.</td>
                          </tr>
                        ) : (
                          (detailAssets || []).map((asset) => {
                            const diff = asset.checkQty - asset.systemQty;
                            return (
                              <tr key={asset.id} className="transition-colors odd:bg-white even:bg-gray-50/60 hover:bg-sky-50/70 dark:odd:bg-transparent dark:even:bg-gray-800/30 dark:hover:bg-sky-900/20">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{asset.materialCode}</td>
                                <td className="px-4 py-3 text-gray-900 dark:text-white">{asset.materialName}</td>
                                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{asset.warehouse || "-"}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{asset.systemQty.toLocaleString("vi-VN")}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{asset.checkQty.toLocaleString("vi-VN")}</td>
                                <td className={`px-4 py-3 text-right font-semibold ${diff >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}`}>{diff >= 0 ? `+${diff}` : diff}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
                  <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 dark:border-gray-700 dark:from-white/5 dark:to-gray-800/30">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Thông tin</p>
                    <div className="text-xs space-y-1 mb-3">
                      <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-500/10">
                        <span className="text-amber-700 dark:text-amber-300">Tổng chênh lệch:</span>
                        <span className={`font-medium ${detailTotalDiscrepancy >= 0 ? "text-blue-900 dark:text-blue-100" : "text-red-900 dark:text-red-100"}`}>
                          {detailTotalDiscrepancy >= 0 ? `+${detailTotalDiscrepancy}` : `${detailTotalDiscrepancy}`}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-blue-50 dark:bg-blue-500/10">
                        <span className="text-blue-700 dark:text-blue-300">Thành viên kiểm kê:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">{detailTeamMembers.length}</span>
                      </div>
                    </div>
                    
                    {(activeReceipt?.createdBy || activeReceipt?.approvedBy || activeReceipt?.approvedAt) && (
                      <div className="mt-3 space-y-1 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs">
                        {activeReceipt?.createdBy && (
                          <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-purple-50 dark:bg-purple-500/10">
                            <span className="text-purple-700 dark:text-purple-300">Người tạo:</span>
                            <span className="font-medium text-purple-900 dark:text-purple-100">{activeReceipt.createdBy}</span>
                          </div>
                        )}
                        {activeReceipt?.approvedBy && (
                          <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-green-50 dark:bg-green-500/10">
                            <span className="text-green-700 dark:text-green-300">Xác nhận bởi:</span>
                            <span className="font-medium text-green-900 dark:text-green-100">{activeReceipt.approvedBy}</span>
                          </div>
                        )}
                        {activeReceipt?.approvedAt && (
                          <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-indigo-50 dark:bg-indigo-500/10">
                            <span className="text-indigo-700 dark:text-indigo-300">Ngày xác nhận:</span>
                            <span className="font-medium text-indigo-900 dark:text-indigo-100">{formatDate(activeReceipt.approvedAt)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-white/[0.03]">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Tổ kiểm kê</h4>
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">{detailTeamMembers.length} người</span>
                    </div>
                    {detailTeamMembers.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có thành viên.</p>
                    ) : (
                      <div className="space-y-2">
                        {(detailTeamMembers || []).map((member) => (
                          <div key={member.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="form-tone-sync w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 dark:from-emerald-900 dark:to-emerald-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/20 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Thêm tài sản mới</h3>
              </div>
              <button
                onClick={() => setShowAssetModal(false)}
                className="rounded-md p-1 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Kho kiểm kê</label>
                  <div className="h-[48px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white flex items-center shadow-sm">
                    {selectedWarehouseNames.length > 0 ? selectedWarehouseNames.join(", ") : "Chưa chọn kho"}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Vật tư *</label>
                  <div ref={materialSearchWrapperRef} className="relative space-y-2">
                    <div className="relative">
                      <input
                        value={assetDraft.materialSearch}
                        onFocus={() => setIsMaterialDropdownOpen(true)}
                        onChange={(e) => handleMaterialSearchInputChange(e.target.value)}
                        placeholder="Nhập để tìm vật tư theo mã hoặc tên"
                        className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setIsMaterialDropdownOpen((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label={isMaterialDropdownOpen ? "Đóng danh sách vật tư" : "Mở danh sách vật tư"}
                      >
                        <svg className={`h-4 w-4 transition-transform ${isMaterialDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {isMaterialDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-40 overflow-auto rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                        {filteredMaterialOptions.length === 0 ? (
                          <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">Không có vật tư thuộc kho đã chọn</p>
                        ) : (
                          filteredMaterialOptions.map((option) => (
                            <button
                              key={`${option.warehouseId}-${option.materialId}`}
                              type="button"
                              onClick={() => handleSelectMaterialFromWarehouse(option)}
                              className="flex w-full items-start justify-between gap-2 border-b border-gray-100 px-3 py-2 text-left text-xs text-gray-700 hover:bg-cyan-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-cyan-900/20"
                            >
                              <span>{option.code} - {option.name} ({option.warehouseName})</span>
                              <span className="text-gray-500 dark:text-gray-400">SL: {option.systemQty}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <FormInput
                  label="Mã vật tư *"
                  value={assetDraft.materialCode}
                  readOnly
                  placeholder="Tự động theo vật tư đã chọn"
                />

                <FormInput
                  label="Tên vật tư *"
                  value={assetDraft.materialName}
                  readOnly
                  placeholder="Tự động theo vật tư đã chọn"
                />

                <FormInput
                  label="Nhà cung cấp"
                  value={assetDraft.supplier}
                  readOnly
                  placeholder="Tự động theo vật tư đã chọn"
                />

                <FormInput
                  label="SL hệ thống ghi nhận"
                  type="number"
                  value={assetDraft.systemQty}
                  onChange={(e) => setAssetDraft((p) => ({ ...p, systemQty: e.target.value }))}
                  placeholder="0"
                />

                <FormInput
                  label="SL kiểm kê"
                  type="number"
                  value={assetDraft.checkQty}
                  onChange={(e) => setAssetDraft((p) => ({ ...p, checkQty: e.target.value }))}
                  placeholder="0"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Đề nghị xử lý</label>
                  <CustomSelect
                    value={assetDraft.handlingProposal}
                    onChange={(value) => setAssetDraft((p) => ({ ...p, handlingProposal: value }))}
                    options={[
                      { value: "", label: "Chọn đề nghị xử lý" },
                      ...HANDLING_OPTIONS.map((option) => ({
                        value: option,
                        label: option,
                      })),
                    ]}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                  <CustomSelect
                    value={assetDraft.status}
                    onChange={(value) => setAssetDraft((p) => ({ ...p, status: value }))}
                    options={[
                      { value: "", label: "Chọn trạng thái" },
                      ...STATUS_OPTIONS.map((status) => ({
                        value: status,
                        label: status,
                      })),
                    ]}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={assetDraft.recordedCheck}
                      onChange={(e) => setAssetDraft((p) => ({ ...p, recordedCheck: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ghi nhận kiểm kê</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
              <button
                onClick={() => setShowAssetModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleAddAsset}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Thêm tài sản
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
  readOnly?: boolean;
};

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  buttonClassName?: string;
  size?: "md" | "sm";
  disabled?: boolean;
};

type CustomMultiSelectProps = {
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  buttonClassName?: string;
};

type QuickStatProps = {
  colorClass: string;
  label: string;
  value: string;
  icon: ReactNode;
};

type DetailStatProps = {
  label: string;
  value: string;
};

function QuickStat({ colorClass, label, value, icon }: QuickStatProps) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/80 p-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-md text-white ${colorClass}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DetailStat({ label, value }: DetailStatProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/40">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{value || "-"}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}: FieldProps) {
  return (
    <FormInput
      label={label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      type={type as any}
      readOnly={readOnly}
    />
  );
}

function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Chọn ngày",
}: DatePickerFieldProps) {
  return (
    <FormDatePicker
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      displayFormat="d/m/Y"
    />
  );
}

function CustomSelect({
  value,
  onChange,
  options,
  buttonClassName = "",
  size = "md",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const sizeClass = size === "sm" ? "h-8 px-2 text-xs" : "h-[48px] px-4 text-sm";

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
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-xl border border-cyan-200 bg-cyan-50 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-700/50 dark:bg-cyan-950/20 dark:text-white ${sizeClass} ${disabled ? "cursor-not-allowed opacity-60" : "hover:border-cyan-300"}`}
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
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
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
                        ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300"
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

function CustomMultiSelect({
  values,
  onChange,
  options,
  placeholder = "Chọn mục",
  buttonClassName = "",
}: CustomMultiSelectProps) {
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

  const selectedLabels = options.filter((opt) => values.includes(opt.value)).map((opt) => opt.label);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${buttonClassName}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm placeholder-gray-400 dark:border-cyan-700/50 dark:bg-cyan-950/20 dark:text-white"
      >
        <div className="min-w-0 flex-1 text-left">
          {selectedLabels.length === 0 ? (
            <span className="block truncate text-sm text-gray-500 dark:text-gray-400" title={placeholder}>
              {placeholder}
            </span>
          ) : (
            <div className="flex flex-wrap gap-1.5" title={selectedLabels.join(", ")}>
              {selectedLabels.slice(0, 3).map((label) => (
                <span
                  key={label}
                  className="inline-flex max-w-full items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-200"
                >
                  <span className="truncate">{label}</span>
                </span>
              ))}

              {selectedLabels.length > 3 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                  +{selectedLabels.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <svg
          className={`h-4 w-4 shrink-0 text-gray-500 transition-transform dark:text-gray-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <ul className="max-h-56 overflow-auto py-1">
            {options.map((option) => {
              const isChecked = values.includes(option.value);
              return (
                <li key={`${option.value}-${option.label}`}>
                  <button
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                      isChecked
                        ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{option.label}</span>
                    <input type="checkbox" readOnly checked={isChecked} className="h-4 w-4" />
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
