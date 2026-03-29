"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Flatpickr from "react-flatpickr";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { materialService, type Material } from "../../services/materialService";
import { supplierService, type Supplier } from "../../services/supplierService";
import { unitService } from "../../services/unitService";
import {
  purchaseOrderService,
  type PurchaseOrder,
  type PurchaseOrderDetail,
} from "../../services/purchaseOrderService";

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
  details: LineItem[];
};

const STATUS_DRAFT = "Đang soạn thảo";
const STATUS_PENDING = "Chờ xác nhận";
const STATUS_CONFIRMED = "Đã xác nhận";
const STATUS_DELIVERED = "Đã giao hàng";
const STATUS_OPTIONS = [
  STATUS_DRAFT,
  STATUS_PENDING,
  STATUS_CONFIRMED,
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

const getStatusClass = (status: string): string => {
  if (status === STATUS_DRAFT) {
    return "status-draft";
  }
  if (status === STATUS_DELIVERED) {
    return "status-delivered";
  }
  if (status === STATUS_CONFIRMED) {
    return "status-confirmed";
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
    status: order.status,
    note: order.note || "",
    totalAmount: Number(order.totalAmount ?? calculatedTotal),
    details,
  };
};

export default function PurchaseOrderPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<UiOrder[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  const [view, setView] = useState<PurchaseOrderView>("list");
  const [selectedOrder, setSelectedOrder] = useState<UiOrder | null>(null);
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
      const [materials, suppliers, units] = await Promise.all([
        materialService.getAllMaterials(),
        supplierService.getAllSuppliers(),
        unitService.getAllUnits(),
      ]);
      setAvailableMaterials(materials || []);
      setAvailableSuppliers(suppliers || []);
      setAvailableUnits(units || []);
      await refreshOrders(materials || [], suppliers || [], units || []);
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

  const resetForm = (): void => {
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

  const openCreateForm = (): void => {
    resetForm();
    setSelectedOrder(null);
    setView("create");
  };

  const openEditForm = (order: UiOrder): void => {
    setSelectedOrder(order);
    setFormData({
      code: order.code,
      poNumber: order.poNumber,
      orderDate: order.orderDate,
      supplierId: String(order.supplierId),
      expectedDeliveryDate: order.expectedDeliveryDate,
      status: order.status,
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
      !formData.code ||
      !formData.poNumber ||
      !supplierId ||
      lineItems.length === 0
    ) {
      showToast("Vui lòng nhập đầy đủ thông tin bắt buộc", "error");
      return;
    }

    const payload: Omit<PurchaseOrder, "id" | "createdAt"> = {
      code: formData.code,
      poNumber: formData.poNumber,
      orderDate: formData.orderDate,
      supplierId,
      expectedDeliveryDate: formData.expectedDeliveryDate || null,
      status:
        view === "create"
          ? STATUS_DRAFT
          : selectedOrder?.status || formData.status,
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
    if (order.status !== STATUS_DRAFT) {
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

  const handleDeleteOrder = (id: number): void => {
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
        <PageMeta
          title={
            view === "create" ? "Tạo đơn đặt hàng" : "Chỉnh sửa đơn đặt hàng"
          }
          description="Form đơn đặt hàng"
        />
        <PageBreadcrumb
          pageTitle={
            view === "create" ? "Tạo đơn đặt hàng" : "Cập nhật đơn đặt hàng"
          }
        />

        <div className="form-tone-sync module-surface rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {view === "create"
                ? "Tạo đơn đặt hàng mới"
                : "Chỉnh sửa đơn đặt hàng"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nhập thông tin đơn hàng và danh sách hàng hóa cần đặt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Input
              label="Mã đơn"
              value={formData.code}
              onChange={(v) => setFormData({ ...formData, code: v })}
            />
            <Input
              label="Số PO"
              value={formData.poNumber}
              onChange={(v) => setFormData({ ...formData, poNumber: v })}
            />
            <Input
              label="Ngày đặt"
              type="date"
              value={formData.orderDate}
              onChange={(v) => setFormData({ ...formData, orderDate: v })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dự kiến giao
              </label>
              <div className="relative w-full flatpickr-wrapper">
                <Flatpickr
                  value={formData.expectedDeliveryDate}
                  onChange={(selectedDates: Date[]) => {
                    const selectedDate = selectedDates[0];
                    setFormData({
                      ...formData,
                      expectedDeliveryDate: selectedDate
                        ? selectedDate.toISOString().split("T")[0]
                        : "",
                    });
                  }}
                  options={{
                    dateFormat: "Y-m-d",
                    altInput: true,
                    altFormat: "d/m/Y",
                    disableMobile: true,
                    altInputClass:
                      "po-expected-delivery-input w-full flatpickr-input",
                  }}
                  placeholder="Chọn ngày dự kiến giao"
                  className="hidden"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-7 w-7 rounded-md text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-500/20 pointer-events-none">
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
                      d="M8 7V3m8 4V3m-9 8h10m-13 9h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v11a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Nhấn vào ô ngày để mở lịch nhanh
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nhà cung cấp
              </label>
              <div ref={supplierDropdownRef} className="relative">
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
                    className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.supplierId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, supplierId: "" }));
                        setSupplierSearchTerm("");
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

                {isSupplierDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuppliers.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        Không tìm thấy nhà cung cấp
                      </div>
                    ) : (
                      filteredSuppliers.slice(0, 8).map((supplier) => (
                        <button
                          key={supplier.id}
                          type="button"
                          onClick={() =>
                            handleSelectSupplier(String(supplier.id || ""))
                          }
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                            formData.supplierId === String(supplier.id || "")
                              ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          <span className="font-medium">{supplier.code}</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {" "}
                            - {supplier.name || "Không tên"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ghi chú
              </label>
              <textarea
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-8 p-4 lg:p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Thêm Hàng Hóa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div className="md:col-span-2" ref={materialDropdownRef}>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      className="w-full pl-10 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                              lineInput.materialId === String(material.id || "")
                                ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"
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
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Đơn vị
                </label>
                <input
                  type="text"
                  value={lineInput.unitName}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={lineInput.soLuong}
                  onChange={(e) =>
                    setLineInput({ ...lineInput, soLuong: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Đơn giá
                </label>
                <input
                  type="number"
                  value={lineInput.donGia}
                  onChange={(e) =>
                    setLineInput({ ...lineInput, donGia: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ghi chú dòng hàng
              </label>
              <input
                type="text"
                value={lineInput.ghiChu}
                onChange={(e) =>
                  setLineInput({ ...lineInput, ghiChu: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
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
                      <th className="px-4 py-2 text-center font-semibold text-gray-700 dark:text-gray-300">
                        Hành Động
                      </th>
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
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Tổng Tiền:
                </span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-300">
                  {total.toLocaleString("vi-VN")}₫
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void handleSaveOrder()}
              disabled={loading}
              className="module-primary-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
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
              className="module-secondary-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            >
              Hủy
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
                {selectedOrder.status === STATUS_DRAFT && (
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
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
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
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Hành động
                    </th>
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
                          <div className="flex items-center justify-center gap-3">
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
                          </div>
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
                <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-500/10">
                  <span className="text-amber-700 dark:text-amber-300">Số chứng từ:</span>
                  <span className="font-medium text-amber-900 dark:text-amber-100">{selectedOrder.code || "-"}</span>
                </div>
              </div>

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
      <PageBreadcrumb pageTitle="Đơn đặt hàng" />
      <PageMeta title="Đơn đặt hàng" description="Quản lý đơn đặt hàng" />

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
                onClick={() =>
                  showToast("Chức năng export sẽ bổ sung sau", "warning")
                }
                className="module-secondary-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Export
              </button>
              <button
                onClick={openCreateForm}
                className="module-primary-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-sm"
              >
                Thêm Đơn Hàng
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 overflow-visible">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-72">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
                placeholder="Tìm đơn hàng hoặc NCC..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
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
                            Trạng thái
                          </label>
                          <div className="space-y-1">
                            {STATUS_OPTIONS.map((status) => (
                              <label
                                key={status}
                                className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={statusFilter === status}
                                  onChange={(e) =>
                                    setStatusFilter(e.target.checked ? status : "")
                                  }
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {status}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "orderDate" | "totalAmount")
                }
                className="flex-1 sm:flex-initial px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="orderDate">Sắp xếp theo ngày</option>
                <option value="totalAmount">Sắp xếp theo giá trị</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex-shrink-0"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
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
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
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
                        onClick={() => handleDeleteOrder(order.id)}
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
              ))}

              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong{" "}
            {filteredOrders.length} đơn
          </p>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let startPage = Math.max(
                1,
                currentPage - Math.floor(maxVisible / 2),
              );
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);
              if (endPage - startPage + 1 < maxVisible) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }
              pages.push(1);
              if (startPage > 2) {
                pages.push("...");
              }
              for (
                let i = Math.max(2, startPage);
                i <= Math.min(totalPages - 1, endPage);
                i++
              ) {
                if (!pages.includes(i)) {
                  pages.push(i);
                }
              }
              if (endPage < totalPages - 1) {
                pages.push("...");
              }
              if (totalPages > 1 && !pages.includes(totalPages)) {
                pages.push(totalPages);
              }
              return pages.map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${page === currentPage ? "bg-blue-600 text-white" : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >
                    {page}
                  </button>
                ),
              );
            })()}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
};

function Input({ label, value, onChange, type = "text" }: InputProps) {
  const openDatePicker = (
    event: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>,
  ) => {
    if (type !== "date") {
      return;
    }
    const input = event.currentTarget;
    const isDarkMode = document.documentElement.classList.contains("dark");
    input.style.colorScheme = isDarkMode ? "dark" : "light";
    if (typeof input.showPicker === "function") {
      input.showPicker();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={openDatePicker}
        onFocus={openDatePicker}
        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
