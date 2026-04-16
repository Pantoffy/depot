"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Flatpickr from "react-flatpickr";
import { useLocation, useNavigate, useParams } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { stockService, type StockCheck } from "../../services/stockService";

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
  trangThai: "Nháp" | "Đã trình";
  teamMembers?: TeamMember[];
  assets?: AssetRow[];
  endDate?: string;
  note?: string;
};

const SAMPLE_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-001",
    name: "Nguyen Van A",
    role: "To truong kiem ke",
    note: "Phu trach tong hop so lieu",
  },
  {
    id: "tm-002",
    name: "Tran Thi B",
    role: "Ke toan kho",
    note: "Doi chieu chung tu",
  },
];


const SAMPLE_ASSETS: AssetRow[] = [
  {
    id: "as-001",
    warehouse: "Kho nguyen lieu",
    materialCode: "NL-CAFE-001",
    materialName: "Hat ca phe Arabica",
    supplier: "Cong ty Nguyen Lieu A",
    systemQty: 120,
    checkQty: 118,
    handlingProposal: "Nhap kho bu KK thieu",
    recordedCheck: true,
    status: "Luu kho",
  },
  {
    id: "as-002",
    warehouse: "Kho nguyen lieu",
    materialCode: "NL-DUONG-002",
    materialName: "Duong tinh luyen",
    supplier: "Cong ty Thuc Pham B",
    systemQty: 80,
    checkQty: 82,
    handlingProposal: "Xuat kho bu KK thua",
    recordedCheck: true,
    status: "Luan chuyen",
  },
];

const MOCK_RECEIPTS: StockCheckReceipt[] = [
  {
    id: "sample-fe-001",
    maPhieu: "KK-FE-MAU-001",
    tenPhieu: "Phieu mau FE - kiem ke kho nguyen lieu",
    khoKiemKe: "Kho nguyen lieu",
    ngayTao: "2026-04-01",
    nguoiTao: "Nguyen Van A",
    tongVatTu: SAMPLE_ASSETS.length,
    trangThai: "Nháp",
    teamMembers: SAMPLE_TEAM_MEMBERS,
    assets: SAMPLE_ASSETS,
  },
  {
    id: "2",
    maPhieu: "KK-20260328-002",
    tenPhieu: "Kiểm kê kho lạnh cuối quý",
    khoKiemKe: "Kho lạnh",
    ngayTao: "2026-03-28",
    nguoiTao: "Trần Thị B",
    tongVatTu: 35,
    trangThai: "Đã trình",
  },
  {
    id: "3",
    maPhieu: "KK-20260315-003",
    tenPhieu: "Kiểm kê định kỳ kho chính",
    khoKiemKe: "Kho chính",
    ngayTao: "2026-03-15",
    nguoiTao: "Phạm Văn C",
    tongVatTu: 48,
    trangThai: "Đã trình",
  },
];

const DEFAULT_WAREHOUSE_OPTIONS = [
  "Kho chính",
  "Kho lạnh",
  "Kho thành phẩm",
  "Kho nguyên liệu",
];

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
  const [receipts, setReceipts] = useState<StockCheckReceipt[]>(MOCK_RECEIPTS);
  const [receiptSearchTerm, setReceiptSearchTerm] = useState("");
  const [receiptStatusFilter, setReceiptStatusFilter] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    warehouseId: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    createdBy: "",
    status: "Pending",
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
    warehouse: "",
    materialCode: "",
    materialName: "",
    supplier: "",
    systemQty: "0",
    checkQty: "0",
    handlingProposal: "",
    recordedCheck: true,
    status: "",
  });

  // Section refs for sticky progress bar navigation
  const generalInfoRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const assetRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const itemsPerPage = 5;

  // Load stock checks from API on component mount
  useEffect(() => {
    loadStockChecks();
  }, []);

  // Update view when pathname changes
  useEffect(() => {
    setView(resolveViewByPath(location.pathname));
  }, [location.pathname]);

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
        tongVatTu: item.stockCheckDetails?.length || 0,
        trangThai: (item.status === 'Pending' ? 'Nháp' : 'Đã trình') as 'Nháp' | 'Đã trình',
        endDate: item.endDate?.split('T')[0] || '',
        note: item.note || '',
        teamMembers: [],  // Teams are loaded separately via API
        assets: (item.stockCheckDetails || []).map((detail) => ({
          id: detail.id?.toString() || '',
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
      // Keep mock data as fallback
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
      Number(formData.warehouseId > 0);

    return Math.min(100, completedCount * 25);
  }, [formData.name, formData.warehouseId, summaryStats.assetCount, summaryStats.teamCount]);

  const receiptSummary = useMemo(() => {
    const draftCount = receipts.filter((r) => r.trangThai === "Nháp").length;
    const submittedCount = receipts.filter((r) => r.trangThai === "Đã trình").length;
    const totalAssets = receipts.reduce((sum, r) => sum + r.tongVatTu, 0);

    return {
      total: receipts.length,
      draftCount,
      submittedCount,
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

  const handleAddExistingMember = () => {
    if (!memberInput.name.trim()) {
      showToast("Vui lòng chọn người kiểm kê", "warning");
      return;
    }

    const next: TeamMember = {
      id: `${Date.now()}`,
      name: memberInput.name.trim(),
      role: "", // Không có chức danh khi chọn người có sẵn
      note: "", // Không có ghi chú khi chọn người có sẵn
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
    
    setIsSaving(true);
    try {
      // Create StockCheck
      const stockCheckData: Omit<StockCheck, "id" | "createdTime"> = {
        code: generatedCode,
        name: formData.name.trim() || "Chưa đặt tên phiếu",
        warehouseId: formData.warehouseId || 1,
        startDate: formData.startDate,
        endDate: formData.endDate,
        createdBy: formData.createdBy.trim() || "Chưa cập nhật",
        status: "Pending",
      };

      const createdStockCheck = await stockService.createStockCheck(stockCheckData);
      
      // Create stock details
      if (createdStockCheck.id && assetRows.length > 0) {
        for (const asset of assetRows) {
          await stockService.createStockDetail({
            stockCheckId: createdStockCheck.id,
            materialId: 1, // TODO: Get from material selector
            systemQuantity: asset.systemQty,
            actualQuantity: asset.checkQty,
            handlingProposal: asset.handlingProposal,
          });
        }
      }

      // Create team members
      if (createdStockCheck.id && teamMembers.length > 0) {
        for (const member of teamMembers) {
          await stockService.createStockTeam(
            createdStockCheck.id,
            {
              name: member.name,
              role: member.role,
              note: member.note,
            }
          );
        }
      }

      showToast("Đã lưu phiếu kiểm kê nháp", "success");
      navigate("/kiem-ke");
      await loadStockChecks(); // Reload data
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast("Lỗi lưu phiếu kiểm kê", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRequest = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      // Create StockCheck with Approved status
      const stockCheckData: Omit<StockCheck, "id" | "createdTime"> = {
        code: generatedCode,
        name: formData.name.trim() || "Chưa đặt tên phiếu",
        warehouseId: formData.warehouseId || 1,
        startDate: formData.startDate,
        endDate: formData.endDate,
        createdBy: formData.createdBy.trim() || "Chưa cập nhật",
        status: "Approved",
      };

      const createdStockCheck = await stockService.createStockCheck(stockCheckData);

      // Create stock details
      if (createdStockCheck.id && assetRows.length > 0) {
        for (const asset of assetRows) {
          await stockService.createStockDetail({
            stockCheckId: createdStockCheck.id,
            materialId: 1, // TODO: Get from material selector
            systemQuantity: asset.systemQty,
            actualQuantity: asset.checkQty,
            handlingProposal: asset.handlingProposal,
          });
        }
      }

      // Create team members
      if (createdStockCheck.id && teamMembers.length > 0) {
        for (const member of teamMembers) {
          await stockService.createStockTeam(
            createdStockCheck.id,
            {
              name: member.name,
              role: member.role,
              note: member.note,
            }
          );
        }
      }

      showToast("Đã trình phiếu kiểm kê cho duyệt", "success");
      navigate("/kiem-ke");
      await loadStockChecks(); // Reload data
    } catch (error) {
      console.error("Error creating request:", error);
      showToast("Lỗi trình phiếu kiểm kê", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenReceipt = (receipt: StockCheckReceipt) => {
    setFormData((prev) => ({
      ...prev,
      name: receipt.tenPhieu,
      startDate: receipt.ngayTao,
      createdBy: receipt.nguoiTao === "Chưa cập nhật" ? "" : receipt.nguoiTao,
      code: receipt.maPhieu,
    }));
    setTeamMembers(receipt.teamMembers || []);
    setAssetRows(receipt.assets || []);
    setAssetFilter({
      keyword: "",
      discrepancyType: "Tất cả",
      warehouse: "",
    });
    setView("create");
    navigate("/kiem-ke/tao-moi");
    showToast("Đã nạp dữ liệu phiếu vào biểu mẫu", "success");
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
      createdBy: "",
      status: "Pending",
    });
    setTeamMembers([]);
    setAssetRows([]);
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
    if (!assetDraft.materialCode.trim() || !assetDraft.materialName.trim()) {
      showToast("Vui lòng nhập mã vật tư và tên vật tư", "warning");
      return;
    }

    const systemQty = Number(assetDraft.systemQty || 0);
    const checkQty = Number(assetDraft.checkQty || 0);

    const nextRow: AssetRow = {
      id: `${Date.now()}`,
      warehouse: assetDraft.warehouse || "Kho chính",
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
      warehouse: "",
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

  return (
    <>
      <PageMeta 
        title={view === "list" ? "Danh sách phiếu kiểm kê" : "Tạo mới phiếu kiểm kê"}
        description={view === "list" ? "Danh sách phiếu kiểm kê" : "Màn hình tạo phiếu kiểm kê"}
      />
      <PageBreadcrumb pageTitle="Kiểm kê" />

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
              <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">{receiptSummary.submittedCount}</p>
            </div>
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-gray-900">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">Tổng vật tư</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-900 dark:text-indigo-200">{receiptSummary.totalAssets}</p>
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
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => handleCreateNew()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo mới
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
                    value={receiptSearchTerm}
                    onChange={(e) => { setReceiptSearchTerm(e.target.value); setCurrentPage(1); }}
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
                              {["Tất cả", "Nháp", "Đã trình"].map(status => (
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
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-5 py-4 text-left">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.length === paginatedReceipts.length && paginatedReceipts.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                      />
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã phiếu</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên phiếu</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kho</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Người tạo</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tổng VLC</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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
                        className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(receipt.id)}
                            onChange={() => handleSelectItem(receipt.id)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {receipt.maPhieu}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receipt.tenPhieu}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receipt.khoKiemKe}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {receipt.nguoiTao}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(receipt.ngayTao)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {receipt.tongVatTu}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium ${
                            receipt.trangThai === "Nháp"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}>
                            {receipt.trangThai}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
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
              <div className="px-5 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Đang hiển thị <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> - <span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredReceipts.length)}</span> trên <span className="font-medium text-gray-900 dark:text-white">{filteredReceipts.length}</span>
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
                          key={`page-${page}`}
                          onClick={() => setCurrentPage(Number(page))}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
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
                  <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Tạo phiếu kiểm kê mới</h1>
                  <p className="mt-2 max-w-2xl text-sm text-cyan-100">
                    Khởi tạo phiếu, gán tổ kiểm kê và ghi nhận số liệu chênh lệch trên cùng một màn hình trực quan.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 md:justify-end">
                  <button
                    onClick={handleSaveDraft}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Lưu nháp
                  </button>
                  <button
                    onClick={handleCreateRequest}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-amber-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Soạn thảo tờ trình
                  </button>
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
                value={generatedCode}
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
                <Field label="Mã phiếu kiểm kê" value={generatedCode} readOnly />
                <Field
                  label="Tên phiếu"
                  value={formData.name}
                  onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
                  placeholder="Nhập tên phiếu"
                />
                <Field
                  label="Người tạo"
                  value={formData.createdBy}
                  onChange={(v) => setFormData((p) => ({ ...p, createdBy: v }))}
                  placeholder="Nhập người tạo"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Kho kiểm kê</label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => setFormData((p) => ({ ...p, warehouseId: parseInt(e.target.value) || 0 }))}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value={0}>Chọn kho kiểm kê</option>
                    {DEFAULT_WAREHOUSE_OPTIONS.map((kho, idx) => (
                      <option key={kho} value={idx + 1}>
                        {kho}
                      </option>
                    ))}
                  </select>
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
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nhập tên người</label>
                          <input
                            type="text"
                            value={memberInput.name}
                            onChange={(e) => setMemberInput((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Nhập tên người kiểm kê"
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={handleAddExistingMember}
                          className="h-10 w-full rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                          <svg className="mr-2 inline h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Thêm
                        </button>
                      </div>
                    </div>
                    <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 dark:bg-blue-900/20">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                        💡 Gợi ý: Chọn tên người từ danh sách và click "Thêm" để thêm vào tổ kiểm kê.
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
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Tên người mới</label>
                          <input
                            value={newMemberForm.name}
                            onChange={(e) => setNewMemberForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Nhập tên đầy đủ"
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        {/* New Member Role Input */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Chức danh</label>
                          <input
                            value={newMemberForm.role}
                            onChange={(e) => setNewMemberForm((p) => ({ ...p, role: e.target.value }))}
                            placeholder="VD: Tổ trưởng, Kiểm kho..."
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        {/* New Member Note Input */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Ghi chú</label>
                          <input
                            value={newMemberForm.note}
                            onChange={(e) => setNewMemberForm((p) => ({ ...p, note: e.target.value }))}
                            placeholder="Ghi chú (tuỳ chọn)"
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        {/* Create & Add Button */}
                        <button
                          onClick={handleAddNewMember}
                          className="h-10 w-full rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
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
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
                      ...DEFAULT_WAREHOUSE_OPTIONS.map((warehouse) => ({
                        value: warehouse,
                        label: warehouse,
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
                    onClick={() => setShowAssetModal(true)}
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
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">SL HT</th>
                      <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">SL KK</th>
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
                              <select
                                value={row.handlingProposal}
                                onChange={(e) =>
                                  handleUpdateAsset(row.id, {
                                    handlingProposal: e.target.value,
                                  })
                                }
                                className="h-8 rounded border border-gray-300 bg-white px-2 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500"
                              >
                                <option value="">Chọn xử lý</option>
                                {HANDLING_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
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
                              <select
                                value={row.status}
                                onChange={(e) =>
                                  handleUpdateAsset(row.id, {
                                    status: e.target.value,
                                  })
                                }
                                className="h-8 rounded border border-gray-300 bg-white px-2 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white transition-colors cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500"
                              >
                                {STATUS_OPTIONS.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
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
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }`}>
                      {activeReceipt.trangThai}
                    </span>
                    <button
                      onClick={() => handleOpenReceipt(activeReceipt)}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                    >
                      Mở biểu mẫu chỉnh sửa
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailStat label="Số dòng tài sản" value={`${detailAssets.length}`} />
                  <DetailStat label="SL hệ thống" value={detailTotalSystemQty.toLocaleString("vi-VN")} />
                  <DetailStat label="SL kiểm kê" value={detailTotalCheckQty.toLocaleString("vi-VN")} />
                  <DetailStat label="Dòng chênh lệch" value={`${detailDiscrepancyRows}`} />
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
                    <DetailStat label="Tổng chênh lệch" value={detailTotalDiscrepancy >= 0 ? `+${detailTotalDiscrepancy}` : `${detailTotalDiscrepancy}`} />
                    <div className="mt-2" />
                    <DetailStat label="Số thành viên tổ kiểm kê" value={`${detailTeamMembers.length}`} />
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
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Chọn kho</label>
                  <select
                    value={assetDraft.warehouse}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, warehouse: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn kho</option>
                    {DEFAULT_WAREHOUSE_OPTIONS.map((warehouse) => (
                      <option key={warehouse} value={warehouse}>
                        {warehouse}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Nhà cung cấp</label>
                  <input
                    value={assetDraft.supplier}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, supplier: e.target.value }))}
                    placeholder="Nhập tên NCC"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã vật tư *</label>
                  <input
                    value={assetDraft.materialCode}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, materialCode: e.target.value }))}
                    placeholder="Nhập mã vật tư"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tên vật tư *</label>
                  <input
                    value={assetDraft.materialName}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, materialName: e.target.value }))}
                    placeholder="Nhập tên vật tư"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">SL hệ thống ghi nhận</label>
                  <input
                    type="number"
                    value={assetDraft.systemQty}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, systemQty: e.target.value }))}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">SL kiểm kê</label>
                  <input
                    type="number"
                    value={assetDraft.checkQty}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, checkQty: e.target.value }))}
                    placeholder="0"
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Đề nghị xử lý</label>
                  <select
                    value={assetDraft.handlingProposal}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, handlingProposal: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn đề nghị xử lý</option>
                    {HANDLING_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</label>
                  <select
                    value={assetDraft.status}
                    onChange={(e) => setAssetDraft((p) => ({ ...p, status: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Chọn trạng thái</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
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
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:read-only:bg-gray-700"
      />
    </div>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Chọn ngày",
}: DatePickerFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative w-full flatpickr-wrapper">
        <Flatpickr
          value={value}
          onChange={(selectedDates: Date[]) => {
            const selectedDate = selectedDates[0];
            onChange(selectedDate ? selectedDate.toISOString().split("T")[0] : "");
          }}
          options={{
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y",
            disableMobile: true,
            altInputClass: "po-expected-delivery-input w-full flatpickr-input",
          }}
          placeholder={placeholder}
          className="hidden"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10m-13 9h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v11a2 2 0 002 2z"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}

function CustomSelect({ value, onChange, options, buttonClassName = "" }: CustomSelectProps) {
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

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={wrapperRef} className={`relative ${buttonClassName}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
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
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-blue-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
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
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
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
