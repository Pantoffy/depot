"use client";

import { Search, SlidersHorizontal, ArrowUp, ArrowDown, Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomSelect from "../../components/common/CustomSelect";
import Pagination from "../../components/common/Pagination";
import { showToast } from "../../components/common/Toast";
import { downloadExcelFromApi } from "../../services/excelExportService";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { FormInput, FormDatePicker, FormTextarea } from "../../components/form";
import { materialService, type Material } from "../../services/materialService";
import { hydrateMaterialsItemType, resolveMaterialItemType } from "../../services/itemTypeService";
import { supplierService, type Supplier } from "../../services/supplierService";
import { unitService } from "../../services/unitService";
import {
  purchaseOrderService,
  type PurchaseOrder,
  type PurchaseOrderDetail,
} from "../../services/purchaseOrderService";
import { importService } from "../../services/importService";

type PurchaseOrderView = "list" | "create" | "edit" | "detail";

type LineItem = {
  id: string;
  materialId: number;
  unitId: number;
  maHang: string;
  tenHang: string;
  donVi: string;
  soLuong: number;
  donGia: number;
  ghiChu?: string;
};

type UiOrder = {
  id: number;
  code: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  supplierId: number;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  status: string;
  note: string;
  totalAmount: number;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string | null;
  details: LineItem[];
};

const STATUS_DRAFT = "Đang soạn thảo";
const STATUS_PENDING = "Chờ xác nhận";
const STATUS_CONFIRMED = "Đã xác nhận";
const STATUS_CANCELLED = "Đã hủy";
const STATUS_DELIVERED = "Đã nhận hàng";
type PurchaseOrderStatusLabel =
  | typeof STATUS_DRAFT
  | typeof STATUS_PENDING
  | typeof STATUS_CONFIRMED
  | typeof STATUS_CANCELLED
  | typeof STATUS_DELIVERED;
const STATUS_OPTIONS = [
  STATUS_DRAFT,
  STATUS_PENDING,
  STATUS_CONFIRMED,
  STATUS_CANCELLED,
  STATUS_DELIVERED,
] as const;

const toDateInput = (value?: string | null): string => {
  if (!value) {
    return "";
  }
  return value.includes("T") ? value.split("T")[0] : value;
};

const toVnDate = (value: string): string => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("vi-VN");
};

const getMaterialUnitName = (material?: Material | null): string => {
  if (!material) {
    return "";
  }
  const unitNameFromObject = (material as Material & { unit?: { name?: string } }).unit?.name;
  return material.unitName || unitNameFromObject || "";
};

const normalizeOrderStatus = (status: string): PurchaseOrderStatusLabel => {
  const normalized = (status || "").trim().toLowerCase();
  if (
    normalized === "đang soạn thảo" ||
    normalized === "draft" ||
    normalized === "nháp"
  ) {
    return STATUS_DRAFT;
  }
  if (
    normalized === "chờ xác nhận" ||
    normalized === "pending" ||
    normalized === "waiting" ||
    normalized === "chot xac nhan"
  ) {
    return STATUS_PENDING;
  }
  if (
    normalized === "đã xác nhận" ||
    normalized === "approved" ||
    normalized === "confirmed" ||
    normalized === "da xac nhan"
  ) {
    return STATUS_CONFIRMED;
  }
  if (
    normalized === "đã nhận hàng" ||
    normalized === "delivered" ||
    normalized === "da nhan hang"
  ) {
    return STATUS_DELIVERED;
  }
  return STATUS_DRAFT;
};

const getStatusClass = (status: string): string => {
  const normalized = normalizeOrderStatus(status);
  if (normalized === STATUS_DRAFT) {
    return "status-draft";
  }
  if (normalized === STATUS_DELIVERED) {
    return "status-delivered";
  }
  if (normalized === STATUS_CONFIRMED) {
    return "status-confirmed";
  }
  if (normalized === STATUS_CANCELLED) {
    return "status-cancelled";
  }
  return "status-pending";
};

const buildUiOrder = (
  order: PurchaseOrder,
  materials: Material[],
  suppliers: Supplier[],
  units?: any[],
): UiOrder => {
  const supplierFromList = suppliers.find((s) => s.id === order.supplierId);
  const supplierName = order.supplier?.name || supplierFromList?.name || "";

  const details: LineItem[] = (order.purchaseOrderDetails || []).map(
    (detail: PurchaseOrderDetail, idx) => {
      const material = materials.find((m) => m.id === detail.materialId);
      const quantity = Number(detail.quantity || 0);
      const unitPrice = Number(detail.unitPrice || 0);
      
      // Lookup unit name từ units list
      const unit = units?.find((u: any) => u.id === (detail.unitId || material?.unitId));
      const unitName = unit?.name || material?.unitName || "";
      
      return {
        id: String(detail.id ?? `${detail.materialId}-${idx}`),
        materialId: detail.materialId,
        unitId: detail.unitId || material?.unitId || 1,
        maHang: detail.material?.code || material?.code || "",
        tenHang: detail.material?.name || material?.name || "",
        donVi: unitName,
        soLuong: quantity,
        donGia: unitPrice,
        ghiChu: detail.note,
      };
    },
  );

  const calculatedTotal = details.reduce(
    (sum, d) => sum + d.soLuong * d.donGia,
    0,
  );

  return {
    id: order.id ?? 0,
    code: order.code,
    poNumber: order.poNumber,
    orderDate: toDateInput(order.orderDate),
    expectedDeliveryDate: toDateInput(order.expectedDeliveryDate),
    supplierId: order.supplierId,
    supplierName,
    supplierPhone: order.supplier?.phone || supplierFromList?.phone,
    supplierEmail: order.supplier?.email || supplierFromList?.email,
    supplierAddress: order.supplier?.address || supplierFromList?.address,
    status: normalizeOrderStatus(order.status),
    note: order.note || "",
    totalAmount: Number(order.totalAmount ?? calculatedTotal),
    createdBy: order.createdBy || "",
    approvedBy: order.approvedBy || "",
    approvedAt: order.approvedAt || null,
    details,
  };
};

const PO_DRAFT_KEY = "purchase_order_draft";

export default function PurchaseOrderPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [importReceipts, setImportReceipts] = useState<any[]>([]);

  const navigate = useNavigate();
  const { canApprove } = useAuth();
  const [view, setView] = useState<PurchaseOrderView>("list");
  const [selectedOrder, setSelectedOrder] = useState<UiOrder | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<"orderDate" | "totalAmount">(
    "orderDate",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    code: "",
    poNumber: "",
    orderDate: toDateInput(new Date().toISOString()),
    supplierId: "",
    expectedDeliveryDate: "",
    status: STATUS_DRAFT,
    note: "",
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [lineInput, setLineInput] = useState({
    materialId: "",
    unitName: "",
    soLuong: "",
    donGia: "",
    ghiChu: "",
  });

  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const materialDropdownRef = useRef<HTMLDivElement>(null);

  const refreshOrders = async (
    materialsArg?: Material[],
    suppliersArg?: Supplier[],
    unitsArg?: any[],
  ): Promise<void> => {
    const materials = materialsArg || availableMaterials;
    const suppliers = suppliersArg || availableSuppliers;
    const units = unitsArg || availableUnits;
    const data = await purchaseOrderService.getAllPurchaseOrders();
    setOrders((data || []).map((o) => buildUiOrder(o, materials, suppliers, units)));
  };

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [materialsResponse, suppliers, units, imports] = await Promise.all([
        materialService.getAllMaterials(),
        supplierService.getAllSuppliers(),
        unitService.getAllUnits(),
        importService.getAllImportReceipts(),
      ]);
      const hydratedMaterials = hydrateMaterialsItemType(materialsResponse || []);
      const poMaterials = hydratedMaterials.filter((material) => {
        const type = resolveMaterialItemType(material);
        return type === "material" || type === "goods";
      });
      setAvailableMaterials(poMaterials);
      setAvailableSuppliers(suppliers || []);
      setAvailableUnits(units || []);
      setImportReceipts(imports || []);
      await refreshOrders(hydratedMaterials || [], suppliers || [], units || []);
    } catch {
      showToast("Không thể tải dữ liệu đơn đặt hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-open detail view when navigated from notification (?id=...)
  useEffect(() => {
    const openId = searchParams.get("id");
    if (!openId || orders.length === 0) return;
    const order = orders.find((o) => String(o.id) === openId);
    if (order) {
      openDetailView(order);
    }
    setSearchParams({});
  }, [orders, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSupplierDropdownOpen(false);
      }
      if (
        materialDropdownRef.current &&
        !materialDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMaterialDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateNextCode = (prefix: string): string => {
    let maxNumber = 0;
    for (const order of orders) {
      const code = order.code || "";
      if (code.startsWith(prefix) && code.length > prefix.length) {
        const num = parseInt(code.slice(prefix.length), 10);
        if (!isNaN(num)) maxNumber = Math.max(maxNumber, num);
      }
    }
    return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
  };

  const resetForm = (): void => {
    localStorage.removeItem(PO_DRAFT_KEY);
    setFormData({
      code: "",
      poNumber: "",
      orderDate: toDateInput(new Date().toISOString()),
      supplierId: "",
      expectedDeliveryDate: "",
      status: STATUS_DRAFT,
      note: "",
    });
    setLineItems([]);
    setLineInput({ materialId: "", unitName: "", soLuong: "", donGia: "", ghiChu: "" });
    setSupplierSearchTerm("");
    setMaterialSearchTerm("");
  };

  // Auto-save draft to localStorage when filling the create form
  useEffect(() => {
    if (view !== "create") return;
    if (!formData.code && !formData.poNumber && !formData.supplierId && lineItems.length === 0) return;
    const draft = { formData, lineItems };
    localStorage.setItem(PO_DRAFT_KEY, JSON.stringify(draft));
  }, [view, formData, lineItems]);

  const openCreateForm = (): void => {
    const nextCode = generateNextCode("PO");
    const savedDraft = localStorage.getItem(PO_DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData({ ...draft.formData, code: nextCode });
        setLineItems(draft.lineItems || []);
        showToast("Đã khôi phục đơn đặt hàng đang soạn dở", "info");
      } catch {
        resetForm();
        setFormData((prev) => ({ ...prev, code: nextCode }));
      }
    } else {
      resetForm();
      setFormData((prev) => ({ ...prev, code: nextCode }));
    }
    setSelectedOrder(null);
    setView("create");
  };

  const canEditOrder = (status: string) =>
    status !== STATUS_CONFIRMED && status !== STATUS_DELIVERED && status !== STATUS_CANCELLED;

  const openEditForm = (order: UiOrder): void => {
    if (!canEditOrder(order.status)) {
      showToast(
        order.status === STATUS_CANCELLED
          ? "Đơn hàng đã hủy không thể chỉnh sửa"
          : "Đơn hàng đã xác nhận không thể chỉnh sửa",
        "warning"
      );
      return;
    }
    setSelectedOrder(order);
    setFormData({
      code: order.code,
      poNumber: order.poNumber,
      orderDate: order.orderDate,
      supplierId: String(order.supplierId),
      expectedDeliveryDate: order.expectedDeliveryDate,
      status: normalizeOrderStatus(order.status),
      note: order.note,
    });
    setLineItems(order.details);
    setLineInput({ materialId: "", unitName: "", soLuong: "", donGia: "", ghiChu: "" });
    setSupplierSearchTerm(order.supplierName || "");
    setMaterialSearchTerm("");
    setView("edit");
  };

  const openDetailView = (order: UiOrder): void => {
    setSelectedOrder(order);
    setView("detail");
  };

  const handleSelectSupplier = (supplierId: string) => {
    const supplier = availableSuppliers.find(
      (s) => String(s.id) === supplierId,
    );
    setFormData((prev) => ({ ...prev, supplierId }));
    setSupplierSearchTerm(supplier?.name || supplier?.code || "");
    setIsSupplierDropdownOpen(false);
  };

  const handleSelectMaterial = (materialId: string) => {
    const material = availableMaterials.find(
      (m) => String(m.id) === materialId,
    );
    if (material) {
      // Lookup unit name từ availableUnits
      const unit = availableUnits.find((u: any) => u.id === material.unitId);
      const unitName = unit?.name || material.unitName || "";
      console.log("Selected material:", material);
      console.log("Unit from mat:", material.unitId, "→", unitName);
      setLineInput((prev) => ({ ...prev, materialId, unitName }));
      setMaterialSearchTerm(`${material.code} - ${material.name}`);
    } else {
      setLineInput((prev) => ({ ...prev, materialId: "", unitName: "" }));
      setMaterialSearchTerm("");
    }
    setIsMaterialDropdownOpen(false);
  };

  const handleAddLine = (): void => {
    const selectedMaterial = availableMaterials.find(
      (m) => String(m.id) === lineInput.materialId,
    );
    if (
      selectedMaterial?.id === undefined ||
      !lineInput.soLuong ||
      !lineInput.donGia
    ) {
      showToast("Vui lòng chọn nguyên liệu và nhập số lượng, đơn giá", "error");
      return;
    }

    const soLuong = Number(lineInput.soLuong);
    const donGia = Number(lineInput.donGia);
    if (soLuong <= 0 || donGia < 0) {
      showToast("Số lượng phải lớn hơn 0 và đơn giá không được âm", "error");
      return;
    }

    const materialId = selectedMaterial.id;
    setLineItems((prev) => [
      ...prev,
      {
        id: `${materialId}-${Date.now()}`,
        materialId,
        unitId: selectedMaterial.unitId,
        maHang: selectedMaterial.code,
        tenHang: selectedMaterial.name,
        donVi: lineInput.unitName,
        soLuong,
        donGia,
        ghiChu: lineInput.ghiChu,
      },
    ]);

    setLineInput({ materialId: "", unitName: "", soLuong: "", donGia: "", ghiChu: "" });
    setMaterialSearchTerm("");
  };

  const handleSaveOrder = async (): Promise<void> => {
    const supplierId = Number(formData.supplierId);
    if (
      !formData.poNumber ||
      !supplierId ||
      lineItems.length === 0
    ) {
      showToast("Vui lòng nhập đầy đủ thông tin bắt buộc", "error");
      return;
    }

    const payload: Omit<PurchaseOrder, "id" | "createdAt"> = {
      code: formData.code || "",
      poNumber: formData.poNumber,
      orderDate: formData.orderDate,
      supplierId,
      expectedDeliveryDate: formData.expectedDeliveryDate || null,
      status:
        view === "create"
          ? STATUS_DRAFT
          : normalizeOrderStatus(selectedOrder?.status || formData.status),
      createdBy: selectedOrder?.createdBy || undefined,
      approvedBy: selectedOrder?.approvedBy || undefined,
      approvedAt: selectedOrder?.approvedAt || undefined,
      note: formData.note,
      totalAmount: lineItems.reduce((sum, i) => sum + i.soLuong * i.donGia, 0),
      purchaseOrderDetails: lineItems.map((item) => ({
        purchaseOrderId: selectedOrder?.id || 0,
        materialId: item.materialId,
        unitId: item.unitId,
        quantity: item.soLuong,
        unitPrice: item.donGia,
        amount: item.soLuong * item.donGia,
        note: item.ghiChu,
      })),
    };

    try {
      setLoading(true);
      if (view === "edit" && selectedOrder?.id) {
        await purchaseOrderService.updatePurchaseOrder(
          selectedOrder.id,
          payload,
        );
        showToast("Cập nhật đơn đặt hàng thành công", "success");
      } else {
        await purchaseOrderService.createPurchaseOrder(payload);
        showToast("Đã tạo đơn đặt hàng ở trạng thái đang soạn thảo", "success");
      }
      await refreshOrders();
      setView("list");
      resetForm();
    } catch {
      showToast("Lưu đơn đặt hàng thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApprovalRequest = async (order: UiOrder): Promise<void> => {
    if (normalizeOrderStatus(order.status) !== STATUS_DRAFT) {
      showToast("Chỉ phiếu đang soạn thảo mới có thể gửi xác nhận", "warning");
      return;
    }

    const payload: Omit<PurchaseOrder, "id" | "createdAt"> = {
      code: order.code,
      poNumber: order.poNumber,
      orderDate: order.orderDate,
      supplierId: order.supplierId,
      expectedDeliveryDate: order.expectedDeliveryDate || null,
      status: STATUS_PENDING,
      createdBy: order.createdBy || undefined,
      approvedBy: order.approvedBy || undefined,
      approvedAt: order.approvedAt || undefined,
      note: order.note,
      totalAmount: order.totalAmount,
      purchaseOrderDetails: order.details.map((item) => ({
        purchaseOrderId: order.id,
        materialId: item.materialId,
        unitId: item.unitId,
        quantity: item.soLuong,
        unitPrice: item.donGia,
        amount: item.soLuong * item.donGia,
        note: item.ghiChu,
      })),
    };

    try {
      setLoading(true);
      await purchaseOrderService.updatePurchaseOrder(order.id, payload);
      await refreshOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...order, status: STATUS_PENDING });
      }
      showToast("Đã gửi yêu cầu xác nhận", "success");
    } catch {
      showToast("Không thể gửi yêu cầu xác nhận", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = (id: number, status?: string): void => {
    if (status) {
      const normalized = normalizeOrderStatus(status);
      if (normalized === STATUS_CONFIRMED || normalized === STATUS_DELIVERED) {
        showToast("Không thể xóa đơn hàng đã xác nhận hoặc đã nhận hàng", "error");
        return;
      }
    }
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa đơn hàng này?",
      onConfirm: async () => {
        try {
          setLoading(true);
          await purchaseOrderService.deletePurchaseOrder(id);
          await refreshOrders();
          showToast("Đã xóa đơn đặt hàng", "success");
        } catch {
          showToast("Xóa đơn đặt hàng thất bại", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleConfirmOrder = async (order: UiOrder): Promise<void> => {
    if (!canApprove()) {
      showToast("Chỉ Quản lý kho mới có quyền xác nhận đơn hàng", "warning");
      return;
    }
    if (normalizeOrderStatus(order.status) !== STATUS_PENDING) {
      showToast("Chỉ phiếu chờ xác nhận mới có thể được xác nhận", "warning");
      return;
    }

    const payload: Omit<PurchaseOrder, "id" | "createdAt"> = {
      code: order.code,
      poNumber: order.poNumber,
      orderDate: order.orderDate,
      supplierId: order.supplierId,
      expectedDeliveryDate: order.expectedDeliveryDate || null,
      status: STATUS_CONFIRMED,
      createdBy: order.createdBy || undefined,
      approvedBy: order.approvedBy || undefined,
      approvedAt: order.approvedAt || undefined,
      note: order.note,
      totalAmount: order.totalAmount,
      purchaseOrderDetails: order.details.map((item) => ({
        purchaseOrderId: order.id,
        materialId: item.materialId,
        unitId: item.unitId,
        quantity: item.soLuong,
        unitPrice: item.donGia,
        amount: item.soLuong * item.donGia,
        note: item.ghiChu,
      })),
    };

    showConfirm({
      message: "Bạn có chắc muốn xác nhận đơn hàng này?",
      onConfirm: async () => {
        try {
          setLoading(true);
          await purchaseOrderService.updatePurchaseOrder(order.id, payload);
          await refreshOrders();
          if (selectedOrder?.id === order.id) {
            setSelectedOrder({ ...order, status: STATUS_CONFIRMED });
          }
          showToast("Đã xác nhận đơn hàng", "success");
        } catch {
          showToast("Xác nhận đơn hàng thất bại", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancelOrder = async (order: UiOrder): Promise<void> => {
    const currentStatus = normalizeOrderStatus(order.status);
    if (currentStatus !== STATUS_DRAFT) {
      showToast("Chỉ được hủy đơn hàng đang ở trạng thái Đang soạn thảo", "warning");
      return;
    }

    showConfirm({
      message: "Bạn có chắc muốn hủy đơn hàng này?",
      onConfirm: async () => {
        try {
          setLoading(true);
          const payload: Omit<PurchaseOrder, "id" | "createdAt"> = {
            code: order.code,
            poNumber: order.poNumber,
            orderDate: order.orderDate,
            supplierId: order.supplierId,
            expectedDeliveryDate: order.expectedDeliveryDate || null,
            status: STATUS_CANCELLED,
            createdBy: order.createdBy || undefined,
            approvedBy: order.approvedBy || undefined,
            approvedAt: order.approvedAt || undefined,
            note: order.note,
            totalAmount: order.totalAmount,
            purchaseOrderDetails: order.details.map((item) => ({
              purchaseOrderId: order.id,
              materialId: item.materialId,
              unitId: item.unitId,
              quantity: item.soLuong,
              unitPrice: item.donGia,
              amount: item.soLuong * item.donGia,
              note: item.ghiChu,
            })),
          };
          await purchaseOrderService.updatePurchaseOrder(order.id, payload);
          await refreshOrders();
          if (selectedOrder?.id === order.id) {
            setSelectedOrder({ ...order, status: STATUS_CANCELLED });
          }
          showToast("Đã hủy đơn hàng", "success");
        } catch {
          showToast("Hủy đơn hàng thất bại", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleMarkAsDelivered = async (order: UiOrder): Promise<void> => {
    if (normalizeOrderStatus(order.status) !== STATUS_CONFIRMED) {
      showToast("Chỉ phiếu đã xác nhận mới có thể đánh dấu là đã nhận hàng", "warning");
      return;
    }

    showConfirm({
      message: "Bạn có chắc muốn đánh dấu đơn hàng này là đã nhận hàng?",
      onConfirm: async () => {
        try {
          setLoading(true);
          const payload: Omit<PurchaseOrder, "id" | "createdAt"> = {
            code: order.code,
            poNumber: order.poNumber,
            orderDate: order.orderDate,
            supplierId: order.supplierId,
            expectedDeliveryDate: order.expectedDeliveryDate || null,
            status: STATUS_DELIVERED,
            createdBy: order.createdBy || undefined,
            approvedBy: order.approvedBy || undefined,
            approvedAt: order.approvedAt || undefined,
            note: order.note,
            totalAmount: order.totalAmount,
            purchaseOrderDetails: order.details.map((item) => ({
              purchaseOrderId: order.id,
              materialId: item.materialId,
              unitId: item.unitId,
              quantity: item.soLuong,
              unitPrice: item.donGia,
              amount: item.soLuong * item.donGia,
              note: item.ghiChu,
            })),
          };
          await purchaseOrderService.updatePurchaseOrder(order.id, payload);

          await refreshOrders();
          if (selectedOrder?.id === order.id) {
            setSelectedOrder({ ...order, status: STATUS_DELIVERED });
          }
          showToast("Đã đánh dấu đơn hàng là đã nhận hàng.", "success");

          // Prompt to create import receipt immediately
          showConfirm({
            message: `Đơn hàng ${order.poNumber} đã nhận hàng thành công! Bạn có muốn tạo phiếu nhập kho ngay với số lượng đã đặt không?`,
            onConfirm: () => {
              navigate(`/nhap-kho?purchaseOrderId=${order.id}`);
            },
          });
        } catch {
          showToast("Không thể cập nhật trạng thái đơn hàng", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Lấy danh sách phiếu nhập liên kết với PO
  const getLinkedImports = (po: UiOrder) => {
    return importReceipts.filter((receipt) => {
      const docNo = (receipt.documentNo || "").trim().toLowerCase();
      return docNo === po.code.toLowerCase() || docNo === po.poNumber.toLowerCase();
    });
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const keyword = searchTerm.trim().toLowerCase();
        const matchKeyword =
          !keyword ||
          o.code.toLowerCase().includes(keyword) ||
          o.poNumber.toLowerCase().includes(keyword) ||
          o.supplierName.toLowerCase().includes(keyword);
        const matchStatus = !statusFilter || o.status === statusFilter;
        return matchKeyword && matchStatus;
      })
      .sort((a, b) => {
        const base =
          sortBy === "orderDate"
            ? new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
            : a.totalAmount - b.totalAmount;
        return sortOrder === "desc" ? -base : base;
      });
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  const summaryStats = useMemo(() => {
    const totalOrders = orders.length;
    const draftOrders = orders.filter((o) => o.status === STATUS_DRAFT).length;
    const pendingOrders = orders.filter(
      (o) => o.status === STATUS_PENDING,
    ).length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { totalOrders, draftOrders, pendingOrders, totalValue };
  }, [orders]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage),
  );
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const pageTitle = view === "list" ? "Đơn đặt hàng" : view === "create" ? "Tạo đơn đặt hàng" : "Cập nhật đơn đặt hàng";
  const breadcrumbAction = view === "list" ? (
    <button
      onClick={openCreateForm}
      className="module-primary-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-sm"
    >
      Thêm Đơn Hàng
    </button>
  ) : (
    <button
      onClick={() => {
        resetForm();
        setSelectedOrder(null);
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

  if (view === "create" || view === "edit") {
    const total = lineItems.reduce((sum, i) => sum + i.soLuong * i.donGia, 0);
    const selectedSupplierForForm = availableSuppliers.find(
      (s) => String(s.id) === formData.supplierId,
    );
    const filteredSuppliers = availableSuppliers.filter((supplier) => {
      const term = supplierSearchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        (supplier.name || "").toLowerCase().includes(term) ||
        supplier.code.toLowerCase().includes(term)
      );
    });

    const selectedMaterialForInput = availableMaterials.find(
      (m) => String(m.id) === lineInput.materialId,
    );
    const filteredMaterials = availableMaterials.filter((material) => {
      const term = materialSearchTerm.trim().toLowerCase();
      if (!term) return true;
      return (
        material.code.toLowerCase().includes(term) ||
        material.name.toLowerCase().includes(term)
      );
    });

    return (
      <div className="module-view space-y-4">
        <PageMeta title={pageTitle} description="Form đơn đặt hàng" />
        <PageBreadcrumb pageTitle={pageTitle} action={breadcrumbAction} />

        <div className="form-tone-sync module-surface rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 p-6 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/70">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-5 dark:border-slate-800">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {view === "create"
                ? "Tạo đơn đặt hàng mới"
                : "Chỉnh sửa đơn đặt hàng"}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Nhập thông tin đơn hàng, nhà cung cấp và danh sách hàng hóa cần đặt
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
            <FormInput
              label="Mã đơn"
              value={formData.code}
              onChange={() => {}}
              readOnly
              className="h-[48px] bg-gray-50 dark:bg-gray-800/50"
            />
            <FormInput
              label="Số PO"
              value={formData.poNumber}
              onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
              required
              className="h-[48px]"
            />
            <FormInput
              label="Ngày đặt"
              type="date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              className="h-[48px]"
            />
            <FormDatePicker
              label="Dự kiến giao"
              value={formData.expectedDeliveryDate}
              onChange={(val) =>
                setFormData({
                  ...formData,
                  expectedDeliveryDate: val,
                })
              }
              placeholder="Chọn ngày dự kiến giao"
              displayFormat="d/m/Y"
              minDate={new Date()}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nhà cung cấp
              </label>
              <div ref={supplierDropdownRef} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={supplierSearchTerm}
                    onChange={(e) => {
                      setSupplierSearchTerm(e.target.value);
                      setIsSupplierDropdownOpen(true);
                    }}
                    onFocus={() => setIsSupplierDropdownOpen(true)}
                    placeholder={
                      selectedSupplierForForm
                        ? selectedSupplierForForm.name ||
                          selectedSupplierForForm.code
                        : "Gõ tên hoặc mã nhà cung cấp..."
                    }
                    className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 pr-10 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  {formData.supplierId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, supplierId: "" }));
                        setSupplierSearchTerm("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSupplierDropdownOpen((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className={`h-4 w-4 transition-transform ${isSupplierDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {isSupplierDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <ul className="max-h-56 overflow-auto py-1">
                      {filteredSuppliers.length === 0 ? (
                        <li className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                          Không tìm thấy nhà cung cấp
                        </li>
                      ) : (
                        filteredSuppliers.slice(0, 8).map((supplier) => (
                          <li key={supplier.id}>
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectSupplier(String(supplier.id || ""))
                              }
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                formData.supplierId === String(supplier.id || "")
                                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                                  : "text-gray-800 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800/50"
                              }`}
                            >
                              <span className="font-medium">{supplier.code}</span>
                              <span className="text-gray-500 dark:text-gray-400"> - {supplier.name || "Không tên"}</span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <FormTextarea
                label="Ghi chú"
                value={formData.note}
                onChange={(val) =>
                  setFormData({ ...formData, note: val })
                }
                rows={3}
                placeholder="Nhập ghi chú..."
              />
            </div>
          </div>

          <div className="mb-8 rounded-[24px] border border-cyan-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-cyan-500/20 dark:bg-slate-900/70 lg:p-6">
            <div className="mb-4 flex flex-col gap-2 border-b border-cyan-100 pb-4 dark:border-cyan-500/20">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Thêm Hàng Hóa
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Thêm các hàng hóa cần đặt mua vào danh sách
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div className="md:col-span-2" ref={materialDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nguyên liệu
                </label>
                <div className="relative">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      value={materialSearchTerm}
                      onChange={(e) => {
                        setMaterialSearchTerm(e.target.value);
                        setIsMaterialDropdownOpen(true);
                      }}
                      onFocus={() => setIsMaterialDropdownOpen(true)}
                      placeholder={
                        selectedMaterialForInput
                          ? `${selectedMaterialForInput.code} - ${selectedMaterialForInput.name}`
                          : "Gõ tên hoặc mã nguyên liệu..."
                      }
                      className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 pl-10 pr-9 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                    />
                    {lineInput.materialId && (
                      <button
                        type="button"
                        onClick={() => {
                          setLineInput((prev) => ({ ...prev, materialId: "", unitName: "" }));
                          setMaterialSearchTerm("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isMaterialDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredMaterials.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                          Không tìm thấy nguyên liệu
                        </div>
                      ) : (
                        filteredMaterials.slice(0, 10).map((material) => (
                          <button
                            key={material.id}
                            type="button"
                            onClick={() =>
                              handleSelectMaterial(String(material.id || ""))
                            }
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                              lineInput.materialId === String(material.id || "")
                                ? "bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            <span className="font-medium">{material.code}</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {" "}
                              - {material.name}
                            </span>
                            {getMaterialUnitName(material) && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                ({getMaterialUnitName(material)})
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Đơn vị
                </label>
                <input
                  type="text"
                  value={lineInput.unitName}
                  readOnly
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={lineInput.soLuong}
                  onChange={(e) =>
                    setLineInput({ ...lineInput, soLuong: e.target.value })
                  }
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Đơn giá
                </label>
                <input
                  type="number"
                  value={lineInput.donGia}
                  onChange={(e) =>
                    setLineInput({ ...lineInput, donGia: e.target.value })
                  }
                  className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ghi chú dòng hàng
              </label>
              <input
                type="text"
                value={lineInput.ghiChu}
                onChange={(e) =>
                  setLineInput({ ...lineInput, ghiChu: e.target.value })
                }
                className="h-[48px] w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-900 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Thêm Hàng Hóa
            </button>

            {lineItems.length > 0 && (
              <div className="mt-6 overflow-x-auto custom-scrollbar">
                <table className="module-table w-full text-xs">
                  <thead className="border-b border-gray-300 dark:border-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        STT
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Mã
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Tên Hàng
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Đơn Vị
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                        SL
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                        Đơn Giá
                      </th>
                      <th className="px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">
                        Thành Tiền
                      </th>
                      {/*<th className="px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                        Hành Động
                      </th>*/}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {item.maHang}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {item.tenHang}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {item.donVi}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                          {item.soLuong}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                          {item.donGia.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                          {(item.soLuong * item.donGia).toLocaleString("vi-VN")}
                          ₫
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setLineInput({
                                  materialId: String(item.materialId),
                                  unitName: item.donVi,
                                  soLuong: String(item.soLuong),
                                  donGia: String(item.donGia),
                                  ghiChu: item.ghiChu || "",
                                });
                                setMaterialSearchTerm(`${item.maHang} - ${item.tenHang}`);
                                setLineItems((prev) =>
                                  prev.filter((x) => x.id !== item.id),
                                );
                              }}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setLineItems((prev) =>
                                  prev.filter((x) => x.id !== item.id),
                                )
                              }
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {lineItems.length > 0 && (
            <div className="mb-8 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-cyan-900 dark:text-cyan-300">
                  Tổng Tiền:
                </span>
                <span className="text-lg font-bold text-cyan-900 dark:text-cyan-300">
                  {total.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => void handleSaveOrder()}
              disabled={loading}
              className="module-primary-btn inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {view === "create" ? "Tạo đơn" : "Cập nhật"}
            </button>
            <button
              type="button"
              onClick={() => {
                setView("list");
                resetForm();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Quay Lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "detail" && selectedOrder) {
    const totalAmount = selectedOrder.totalAmount;
    const totalQuantity = selectedOrder.details.reduce(
      (sum, d) => sum + Number(d.soLuong || 0),
      0,
    );
    const averagePrice =
      totalQuantity > 0 ? Math.round(totalAmount / totalQuantity) : 0;

    return (
      <div className="module-view space-y-4">
        <PageMeta
          title={`Chi tiết đơn ${selectedOrder.code}`}
          description="Chi tiết đơn đặt hàng"
        />

        <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 dark:border-sky-500/30 dark:from-sky-500/10 dark:via-gray-900 dark:to-emerald-500/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <button
                onClick={() => setView("list")}
                className="module-ghost-btn inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay Lại
              </button>
              <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                Chi tiết đơn hàng {selectedOrder.code}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Ngày đặt: {toVnDate(selectedOrder.orderDate)}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span
                className={`status-pill ${getStatusClass(selectedOrder.status)}`}
              >
                {selectedOrder.status}
              </span>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/70 bg-white/70 p-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70">
                {normalizeOrderStatus(selectedOrder.status) === STATUS_DRAFT && (
                  <button
                    type="button"
                    onClick={() => void handleSubmitApprovalRequest(selectedOrder)}
                    aria-label="Gửi yêu cầu xác nhận"
                    title="Gửi yêu cầu xác nhận"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                )}
                {normalizeOrderStatus(selectedOrder.status) === STATUS_PENDING && canApprove() && (
                  <button
                    type="button"
                    onClick={() => void handleConfirmOrder(selectedOrder)}
                    aria-label="Xác nhận đơn hàng"
                    title="Xác nhận đơn hàng"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                )}
                {normalizeOrderStatus(selectedOrder.status) === STATUS_CONFIRMED && (
                  <button
                    type="button"
                    onClick={() => void handleMarkAsDelivered(selectedOrder)}
                    aria-label="Đánh dấu đã nhận hàng"
                    title="Đánh dấu đã nhận hàng"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                )}
                {normalizeOrderStatus(selectedOrder.status) === STATUS_DELIVERED && (
                  (() => {
                    const linkedImports = getLinkedImports(selectedOrder);
                    return linkedImports.length > 0 ? (
                      <div className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-100 px-3.5 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          Đơn hàng đang được nhập tại phiếu nhập{" "}
                          {linkedImports.map((imp) => imp.receiptNumber).join(", ")}
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/nhap-kho?purchaseOrderId=${selectedOrder.id}`)}
                        aria-label="Tạo phiếu nhập kho"
                        title="Tạo phiếu nhập kho từ đơn hàng này"
                        className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-sm font-semibold text-white shadow-sm ring-1 ring-emerald-700/30 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95"
                      >
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Tạo phiếu nhập
                      </button>
                    );
                  })()
                )}
                <button
                  type="button"
                  onClick={() => openEditForm(selectedOrder)}
                  aria-label="Sửa đơn hàng"
                  title="Sửa đơn hàng"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white transition-colors hover:bg-amber-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                {normalizeOrderStatus(selectedOrder.status) === STATUS_DRAFT && (
                  <button
                    type="button"
                    onClick={() => void handleCancelOrder(selectedOrder)}
                    aria-label="Hủy đơn hàng"
                    title="Hủy đơn hàng"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700 text-white transition-colors hover:bg-gray-800"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.status)}
                  aria-label="Xóa đơn hàng"
                  title="Xóa đơn hàng"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-sky-200 bg-white/80 p-4 backdrop-blur-sm dark:border-sky-500/30 dark:bg-sky-500/10">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
                  Tổng giá trị
                </p>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v-1m-6-6h12"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold text-sky-900 dark:text-sky-100">
                {totalAmount.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-white/80 p-4 backdrop-blur-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                  Số đơn vị
                </p>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 13V7a2 2 0 00-2-2h-3M4 7v10a2 2 0 002 2h12a2 2 0 002-2v-4M8 7h4"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold text-indigo-900 dark:text-indigo-100">
                {selectedOrder.details.length}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Tổng số lượng
                </p>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7h18M6 11h12m-9 4h6"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                {totalQuantity.toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-white/80 p-4 backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Đơn giá trung bình
                </p>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v12m-4-8h8"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold text-amber-900 dark:text-amber-100">
                {averagePrice.toLocaleString("vi-VN")}₫
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="module-surface lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-6 grid grid-cols-1 gap-4 border-b border-gray-200 pb-6 sm:grid-cols-2 dark:border-gray-700">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Mã đơn
                </p>
                <span className="mt-1 inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  {selectedOrder.code}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Danh sách hàng hóa
              </h3>
              <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {selectedOrder.details.length} dòng
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="module-table w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Mã
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Tên hàng
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Đơn vị
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Thành tiền
                    </th>
                    {/*<th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Hành động
                    </th>*/}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedOrder.details.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    selectedOrder.details.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-4 text-gray-900 dark:text-white">
                          {item.maHang}
                        </td>
                        <td className="px-4 py-4 text-gray-900 dark:text-white">
                          {item.tenHang}
                        </td>
                        <td className="px-4 py-4 text-center text-gray-900 dark:text-white">
                          {item.donVi}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                          {item.soLuong.toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                          {item.donGia.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          {(item.soLuong * item.donGia).toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-4 text-center">
                          {/*<div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => openEditForm(selectedOrder)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrder((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    details: prev.details.filter((x) => x.id !== item.id),
                                  };
                                });
                              }}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                            >
                              Xóa
                            </button>
                          </div>*/}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 dark:border-gray-700 dark:from-white/5 dark:to-gray-800/30">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Thông tin</p>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="rounded-lg bg-white p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ngày đặt</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {toVnDate(selectedOrder.orderDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nhà cung cấp</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {selectedOrder.supplierName || "-"}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ngày dự kiến giao</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {selectedOrder.expectedDeliveryDate
                      ? toVnDate(selectedOrder.expectedDeliveryDate)
                      : "-"}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trạng thái</p>
                  <span className={`status-pill ${getStatusClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1 mb-2 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-blue-50 dark:bg-blue-500/10">
                  <span className="text-blue-700 dark:text-blue-300">Số PO:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">{selectedOrder.poNumber || "-"}</span>
                </div>

              </div>

              {(selectedOrder.createdBy || selectedOrder.approvedBy || selectedOrder.approvedAt) && (
                <div className="text-xs space-y-1 mb-2">
                  {selectedOrder.createdBy && (
                    <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-purple-50 dark:bg-purple-500/10">
                      <span className="text-purple-700 dark:text-purple-300">Người tạo:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100">{selectedOrder.createdBy}</span>
                    </div>
                  )}
                  {selectedOrder.approvedBy && (
                    <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-green-50 dark:bg-green-500/10">
                      <span className="text-green-700 dark:text-green-300">Xác nhận bởi:</span>
                      <span className="font-medium text-green-900 dark:text-green-100">{selectedOrder.approvedBy}</span>
                    </div>
                  )}
                  {selectedOrder.approvedAt && (
                    <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-indigo-50 dark:bg-indigo-500/10">
                      <span className="text-indigo-700 dark:text-indigo-300">Thời gian xác nhận:</span>
                      <span className="font-medium text-indigo-900 dark:text-indigo-100">
                        {new Date(selectedOrder.approvedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 p-3 border border-emerald-200 dark:border-emerald-500/30">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">TỔNG GIÁ TRỊ</p>
                <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                  {selectedOrder.totalAmount.toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-view space-y-5">
      <PageBreadcrumb pageTitle={pageTitle} action={breadcrumbAction} />
      <PageMeta title={pageTitle} description="Quản lý đơn đặt hàng" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900 p-4">
          <p className="text-xs font-medium text-sky-700 dark:text-sky-300">
            Tổng đơn
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">
            {summaryStats.totalOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white dark:border-gray-700 dark:from-gray-800/60 dark:to-gray-900 p-4">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Đang soạn thảo
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {summaryStats.draftOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:border-amber-500/30 dark:from-amber-500/10 dark:to-gray-900 p-4">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Chờ xác nhận
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">
            {summaryStats.pendingOrders}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900 p-4">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Tổng giá trị
          </p>
          <p className="mt-2 text-xl font-semibold text-emerald-900 dark:text-emerald-200">
            {summaryStats.totalValue.toLocaleString("vi-VN")}₫
          </p>
        </div>
      </div>

      <div className="module-surface rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="module-head p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white to-slate-50 dark:from-transparent dark:to-transparent">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Danh sách đơn đặt hàng
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Quản lý đơn đặt hàng từ các nhà cung cấp.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    await downloadExcelFromApi("/api/ExcelExport/purchase-orders", `don-dat-hang_${new Date().toISOString().slice(0, 10)}.xlsx`);
                    showToast("Đã xuất danh sách đơn đặt hàng!", "success");
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

        <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 overflow-visible">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm đơn hàng hoặc NCC..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-[48px] w-full pl-10 px-4 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative">
                {(() => {
                  const activeCount = statusFilter ? 1 : 0;
                  const STATUS_DOTS: Record<string, string> = {
                    [STATUS_DRAFT]: "bg-gray-400",
                    [STATUS_PENDING]: "bg-amber-400",
                    [STATUS_CONFIRMED]: "bg-emerald-500",
                    [STATUS_CANCELLED]: "bg-rose-400",
                    [STATUS_DELIVERED]: "bg-sky-400",
                  };
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
                                  onClick={() => setStatusFilter("")}
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
                                  {STATUS_OPTIONS.map((status) => (
                                    <label key={status} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={statusFilter === status}
                                        onChange={(e) => setStatusFilter(e.target.checked ? status : "")}
                                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                      />
                                      <span className={`h-2 w-2 rounded-full ${STATUS_DOTS[status] ?? "bg-gray-400"}`} />
                                      <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
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

              <CustomSelect
                value={sortBy}
                onChange={(value) => setSortBy(value as "orderDate" | "totalAmount")}
                options={[
                  { value: "orderDate", label: "Sắp xếp theo ngày" },
                  { value: "totalAmount", label: "Sắp xếp theo giá trị" },
                ]}
                buttonClassName="flex-1 sm:flex-initial sm:min-w-[180px]"
              />
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="flex items-center justify-center h-[48px] w-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex-shrink-0 shadow-sm"
              >
                {sortOrder === "asc" ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="module-table w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Mã đơn
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Số PO
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Ngày đặt
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  NCC
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Trạng thái
                </th>
                {/*<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Nhập kho
                </th>*/}
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.map((order) => {
                const linkedImports = getLinkedImports(order);

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold tracking-tight text-gray-900 dark:text-white">
                      {order.code}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                      {order.poNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                      {toVnDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200">
                      {order.supplierName || "-"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {order.totalAmount.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-pill ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                     {/*<td className="px-6 py-4">
                     {linkedImports.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {linkedImports.map((imp) => (
                            <div key={imp.id} className="text-xs">
                              <span className="text-gray-700 dark:text-gray-300">
                                Đơn {order.code} đang được nhập vào phiếu nhập{" "}
                              </span>
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {imp.receiptNumber}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Chưa có phiếu nhập</span>
                      )}
                    </td>*/}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openDetailView(order)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Xem chi tiết đơn hàng"
                      >
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEditForm(order)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Chỉnh sửa đơn hàng"
                      >
                        <svg
                          className="w-4 h-4 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id, order.status)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        aria-label="Xóa đơn hàng"
                      >
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.max(totalPages, 1)}
          totalItems={filteredOrders.length}
          startItem={filteredOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
          endItem={currentPage * itemsPerPage}
          onPageChange={setCurrentPage}
          labelPrefix="Hiển thị"
        />
      </div>
    </div>
  );
}
