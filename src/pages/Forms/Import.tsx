"use client";
import { importService } from "../../services/importService";
import { materialService } from "../../services/materialService";
import { supplierService } from "../../services/supplierService";
import { unitService } from "../../services/unitService";
import { warehouseService } from "../../services/warehouseService";
import { useState, useEffect, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CustomSelect from "../../components/common/CustomSelect";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";

// Interface: Hàng hóa trong phiếu nhập
interface Material {
  stt: number;
  id: string;
  materialId: number;
  unitId: number;
  maHang: string;
  tenHang: string;
  donVi: string;
  soLuong: number;
  donGia: number;
}

// Interface: Phiếu nhập kho
interface Receipt {
  id: string;
  ngayTao: string;
  soPhieu: string;
  supplierId?: number;
  tenNCC: string;
  soHoaDonNCC?: string;
  warehouseId?: number;
  kho: string;
  tongTien: number;
  soChungTu?: string;
  trangThai: string;
  materials: Material[];
}

// Page: Quản lý nhập kho
export default function NhapKho() {
  // State: Danh sách phiếu nhập
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  // State: Trạng thái loading
  const [loading, setLoading] = useState(false);
  // State: View hiện tại
  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list",
  );
  // State: Từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  // State: Phiếu được chọn
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  // State: Sắp xếp theo trường nào
  const [sortBy, setSortBy] = useState<"ngayTao" | "tongTien">("ngayTao");
  // State: Thứ tự sắp xếp (tăng/giảm)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ kho: "", trangThai: "" });
  // State: Danh sách hàng hóa có sẵn
  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const materialDropdownRef = useRef<HTMLDivElement>(null);

  const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null,
  );

  const [availableWarehouses, setAvailableWarehouses] = useState<any[]>([]);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const warehouseDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null,
  );

  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        materialDropdownRef.current &&
        !materialDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMaterialDropdownOpen(false);
      }
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSupplierDropdownOpen(false);
      }
      if (
        warehouseDropdownRef.current &&
        !warehouseDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWarehouseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUnits();
    fetchMaterials().then((mats) => {
      fetchImportReceipts(mats);
    });
    fetchSuppliers();
    fetchWarehouses();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await materialService.getAllMaterials();
      console.log("Fetched materials:", data); // Debug log to check the structure of fetched materials
      setAvailableMaterials(data || []);
      return data || [];
    } catch (err) {
      console.error("Lỗi tải danh sách vật tư", err);
      return [];
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      setAvailableSuppliers(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách nhà cung cấp", err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await warehouseService.getAllWarehouses();
      setAvailableWarehouses(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách kho", err);
    }
  };

  const fetchUnits = async () => {
    try {
      const data = await unitService.getAllUnits();
      console.log("Fetched units:", data);
      setAvailableUnits(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn vị", err);
    }
  };

  const fetchImportReceipts = async (mats?: any[]) => {
    try {
      setLoading(true);
      const data = await importService.getAllImportReceipts();
      const materialsList = mats || availableMaterials;
      setReceipts(
        (data || []).map((item: any) => ({
          id: String(item.id),
          soPhieu: item.code,
          ngayTao: item.importTime,
          supplierId: item.supplierId || item.supplier?.id,
          tenNCC: item.supplier?.name || "",
          soHoaDonNCC: item.supplierInvoiceNo,
          warehouseId: item.warehouseId || item.warehouse?.id,
          kho: item.warehouse?.name || "",
          tongTien: item.totalAmount || 0,
          soChungTu: item.documentNo,
          trangThai: item.status,
          materials: (item.importReceiptDetails || []).map(
            (detail: any, idx: number) => {
              const mat = materialsList.find(
                (m: any) => m.id === detail.materialId,
              );
              return {
                stt: idx + 1,
                id: String(detail.id),
                materialId: detail.materialId || 0,
                unitId: detail.unitId || 1,
                maHang: detail.material?.code || mat?.code || "",
                tenHang: detail.material?.name || mat?.name || "",
                donVi: detail.unit?.name || mat?.unitName || "kg",
                soLuong: detail.quantity,
                donGia: detail.unitPrice,
              };
            },
          ),
        })),
      );
    } catch (err) {
      showToast("Lỗi tải dữ liệu phiếu nhập", "error");
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    soPhieu: "",
    ngayTao: new Date().toISOString().split("T")[0],
    tenNCC: "",
    soHoaDonNCC: "",
    kho: "",
    soChungTu: "",
  });

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialInput, setMaterialInput] = useState({
    selectedMaterialId: "",
    maHang: "",
    tenHang: "",
    donVi: "",
    unitId: 1,
    soLuong: "",
    donGia: "",
  });
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
    null,
  );

  const resetForm = () => {
    setFormData({
      soPhieu: "",
      ngayTao: new Date().toISOString().split("T")[0],
      tenNCC: "",
      soHoaDonNCC: "",
      kho: "",
      soChungTu: "",
    });
    setMaterials([]);
    setMaterialInput({
      selectedMaterialId: "",
      maHang: "",
      tenHang: "",
      donVi: "",
      unitId: 1,
      soLuong: "",
      donGia: "",
    });
    setEditingMaterialId(null);
    setMaterialSearchTerm("");
    setSelectedSupplierId(null);
    setSupplierSearchTerm("");
    setSelectedWarehouseId(null);
    setWarehouseSearchTerm("");
  };

  const handleSelectSupplier = (supplierId: number | null) => {
    if (!supplierId) {
      setSelectedSupplierId(null);
      setFormData({ ...formData, tenNCC: "" });
      setSupplierSearchTerm("");
      return;
    }

    const supplier = selectableSuppliers.find((s: any) => s.id === supplierId);
    if (supplier) {
      setSelectedSupplierId(supplierId);
      setFormData({ ...formData, tenNCC: supplier.name || "" });
      setSupplierSearchTerm("");
      setIsSupplierDropdownOpen(false);
    }
  };

  const handleSelectWarehouse = (warehouseId: number | null) => {
    if (!warehouseId) {
      setSelectedWarehouseId(null);
      setFormData({ ...formData, kho: "" });
      setWarehouseSearchTerm("");
      return;
    }
    const warehouse = availableWarehouses.find(
      (w: any) => w.id === warehouseId,
    );
    if (warehouse) {
      setSelectedWarehouseId(warehouseId);
      setFormData({ ...formData, kho: warehouse.name || "" });
      setWarehouseSearchTerm("");
      setIsWarehouseDropdownOpen(false);
    }
  };

  const handleSelectMaterial = (materialId: string) => {
    if (!materialId) {
      setMaterialInput({
        selectedMaterialId: "",
        maHang: "",
        tenHang: "",
        donVi: "",
        unitId: 1,
        soLuong: "",
        donGia: "",
      });
      return;
    }
    const mat = availableMaterials.find(
      (m: any) => String(m.id) === materialId,
    );
    if (mat) {
      console.log("Selected material:", mat);
      // Find unit name from availableUnits using unitId
      const unit = availableUnits.find((u: any) => u.id === mat.unitId);
      const unitName = unit?.name || mat.unit?.name || mat.unitName || "";
      console.log("Unit from mat:", mat.unitId, "→", unitName);
      setMaterialInput({
        selectedMaterialId: String(mat.id),
        maHang: mat.code || "",
        tenHang: mat.name || "",
        donVi: unitName,
        unitId: mat.unitId || 1,
        soLuong: materialInput.soLuong,
        donGia: materialInput.donGia,
      });
    }
  };

  const handleAddMaterial = () => {
    if (
      !materialInput.selectedMaterialId ||
      !materialInput.soLuong ||
      !materialInput.donGia
    ) {
      showToast("Vui lòng chọn vật tư và điền số lượng, đơn giá", "error");
      return;
    }

    const quantity = Number(materialInput.soLuong);
    const price = Number(materialInput.donGia);

    if (quantity <= 0) {
      showToast("Số lượng không hợp lệ", "error");
      return;
    }

    if (price <= 0) {
      showToast("Đơn giá không hợp lệ", "error");
      return;
    }

    const newMaterial: Material = {
      stt: materials.length + 1,
      id: "new_" + Date.now(),
      materialId: Number(materialInput.selectedMaterialId),
      unitId: materialInput.unitId,
      maHang: materialInput.maHang,
      tenHang: materialInput.tenHang,
      donVi: materialInput.donVi,
      soLuong: quantity,
      donGia: price,
    };

    if (editingMaterialId) {
      setMaterials(
        materials.map((item) =>
          item.id === editingMaterialId
            ? {
                ...item,
                materialId: Number(materialInput.selectedMaterialId),
                unitId: materialInput.unitId,
                maHang: materialInput.maHang,
                tenHang: materialInput.tenHang,
                donVi: materialInput.donVi,
                soLuong: quantity,
                donGia: price,
              }
            : item,
        ),
      );
      showToast("Cập nhật hàng hóa thành công", "success");
    } else {
      setMaterials([...materials, newMaterial]);
      showToast("Thêm hàng hóa thành công", "success");
    }

    setMaterialInput({
      selectedMaterialId: "",
      maHang: "",
      tenHang: "",
      donVi: "kg",
      unitId: 1,
      soLuong: "",
      donGia: "",
    });
    setEditingMaterialId(null);
    setMaterialSearchTerm("");
  };

  const handleEditMaterial = (item: Material) => {
    setEditingMaterialId(item.id);
    setMaterialInput({
      selectedMaterialId: String(item.materialId),
      maHang: item.maHang,
      tenHang: item.tenHang,
      donVi: item.donVi,
      unitId: item.unitId || 1,
      soLuong: String(item.soLuong),
      donGia: String(item.donGia),
    });
    setMaterialSearchTerm("");
    setIsMaterialDropdownOpen(false);
  };

  const handleCancelEditMaterial = () => {
    setEditingMaterialId(null);
    setMaterialInput({
      selectedMaterialId: "",
      maHang: "",
      tenHang: "",
      donVi: "",
      unitId: 1,
      soLuong: "",
      donGia: "",
    });
    setMaterialSearchTerm("");
  };

  const filteredAvailableMaterials = availableMaterials.filter((mat: any) => {
    if (!materialSearchTerm) return true;
    const term = materialSearchTerm.toLowerCase();
    return (
      (mat.code || "").toLowerCase().includes(term) ||
      (mat.name || "").toLowerCase().includes(term)
    );
  });

  const isSupplierInactive = (supplier: any) => {
    const normalized = (supplier?.status || "").trim().toLowerCase();
    return normalized === "ngừng hợp tác" || normalized === "ngung hop tac";
  };

  const selectableSuppliers = availableSuppliers.filter(
    (supplier: any) => !isSupplierInactive(supplier),
  );

  const filteredAvailableSuppliers = selectableSuppliers.filter(
    (supplier: any) => {
      if (!supplierSearchTerm) return true;
      const term = supplierSearchTerm.toLowerCase();
      return (
        (supplier.code || "").toLowerCase().includes(term) ||
        (supplier.name || "").toLowerCase().includes(term)
      );
    },
  );

  const filteredAvailableWarehouses = availableWarehouses.filter(
    (warehouse: any) => {
      if (!warehouseSearchTerm) return true;
      const term = warehouseSearchTerm.toLowerCase();
      return (
        (warehouse.code || "").toLowerCase().includes(term) ||
        (warehouse.name || "").toLowerCase().includes(term)
      );
    },
  );

  const isReceiptConfirmed = (status: string) => {
    return normalizeReceiptStatus(status) === "Approved";
  };

  const isReceiptCancelled = (status: string) => {
    return normalizeReceiptStatus(status) === "Cancelled";
  };

  const isReceiptDraft = (status: string) => {
    return normalizeReceiptStatus(status) === "Draft";
  };

  const normalizeReceiptStatus = (status: string) => {
    const normalized = (status || "").trim().toLowerCase();
    if (
      normalized === "approved" ||
      normalized === "confirmed" ||
      normalized === "đã xác nhận" ||
      normalized === "da xac nhan"
    ) {
      return "Approved";
    }
    if (
      normalized === "draft" ||
      normalized === "nháp" ||
      normalized === "nhap"
    ) {
      return "Draft";
    }
    if (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "đã hủy" ||
      normalized === "da huy"
    ) {
      return "Cancelled";
    }
    return "Pending";
  };

  const getReceiptStatusLabel = (status: string) => {
    if (isReceiptConfirmed(status)) return "Đã xác nhận";
    if (isReceiptDraft(status)) return "Đang soạn thảo";
    if (isReceiptCancelled(status)) return "Đã hủy";
    return "Chờ xác nhận";
  };

  const getReceiptStatusClass = (status: string) => {
    const normalized = normalizeReceiptStatus(status);
    if (normalized === "Approved") return "status-confirmed";
    if (normalized === "Draft") return "status-draft";
    if (normalized === "Cancelled") return "status-cancelled";
    return "status-pending";
  };

  const buildImportReceiptPayload = (receipt: Receipt, status: string) => {
    const totalAmount = receipt.materials.reduce(
      (sum, m) => sum + m.soLuong * m.donGia,
      0,
    );
    return {
      code: receipt.soPhieu,
      receiptNumber: receipt.soPhieu,
      importTime: new Date(receipt.ngayTao).toISOString(),
      supplierId: receipt.supplierId || 1,
      warehouseId: receipt.warehouseId || 1,
      status: normalizeReceiptStatus(status),
      createdAt: new Date().toISOString(),
      supplierInvoiceNo: receipt.soHoaDonNCC || "",
      documentNo: receipt.soChungTu || "",
      totalAmount,
      importReceiptDetails: receipt.materials.map((m) => ({
        ...(m.id.startsWith("new_") ? {} : { id: Number(m.id) }),
        materialId: m.materialId,
        unitId: m.unitId || 1,
        quantity: m.soLuong,
        unitPrice: m.donGia,
        amount: m.soLuong * m.donGia,
        note: "",
      })),
    };
  };

  const syncMaterialStockForReceipt = async (receipt: Receipt) => {
    const quantitiesByMaterial = receipt.materials.reduce(
      (acc, item) => {
        if (!item.materialId) return acc;
        acc[item.materialId] =
          (acc[item.materialId] || 0) + Number(item.soLuong || 0);
        return acc;
      },
      {} as Record<number, number>,
    );

    const updateJobs = Object.entries(quantitiesByMaterial).map(
      async ([materialIdText, quantity]) => {
        const materialId = Number(materialIdText);
        let material = availableMaterials.find(
          (m: any) => Number(m.id) === materialId,
        );

        if (!material) {
          material = await materialService.getMaterialById(materialId);
        }

        if (!material) {
          throw new Error(`Không tìm thấy nguyên liệu ID ${materialId}`);
        }

        await materialService.updateMaterial(materialId, {
          code: material.code || "",
          name: material.name || "",
          categoryId: material.categoryId || 1,
          categoryName: material.categoryName || "",
          unitId: material.unitId || 1,
          unitName: material.unitName || "",
          supplierId: material.supplierId || 1,
          stockQuantity:
            Number(material.stockQuantity || 0) + Number(quantity || 0),
          note: material.note || "",
          status: material.status || "Đang kinh doanh",
        } as any);
      },
    );

    await Promise.all(updateJobs);
  };

  const syncMaterialStockForCancellation = async (receipt: Receipt) => {
    const quantitiesByMaterial = receipt.materials.reduce(
      (acc, item) => {
        if (!item.materialId) return acc;
        acc[item.materialId] =
          (acc[item.materialId] || 0) + Number(item.soLuong || 0);
        return acc;
      },
      {} as Record<number, number>,
    );

    const updateJobs = Object.entries(quantitiesByMaterial).map(
      async ([materialIdText, quantity]) => {
        const materialId = Number(materialIdText);
        let material = availableMaterials.find(
          (m: any) => Number(m.id) === materialId,
        );

        if (!material) {
          material = await materialService.getMaterialById(materialId);
        }

        if (!material) {
          throw new Error(`Không tìm thấy nguyên liệu ID ${materialId}`);
        }

        const nextStock = Math.max(
          0,
          Number(material.stockQuantity || 0) - Number(quantity || 0),
        );

        await materialService.updateMaterial(materialId, {
          code: material.code || "",
          name: material.name || "",
          categoryId: material.categoryId || 1,
          categoryName: material.categoryName || "",
          unitId: material.unitId || 1,
          unitName: material.unitName || "",
          supplierId: material.supplierId || 1,
          stockQuantity: nextStock,
          note: material.note || "",
          status: material.status || "Đang kinh doanh",
        } as any);
      },
    );

    await Promise.all(updateJobs);
  };

  const fetchImportReceiptDetail = async (
    receiptId: string | number,
    mats?: any[],
  ) => {
    const data = await importService.getImportReceiptById(Number(receiptId));
    const materialsList = mats || availableMaterials;
    return {
      id: String(data.id),
      soPhieu: data.receiptNumber || data.code || "",
      ngayTao: data.importTime,
      supplierId: data.supplierId || data.supplier?.id,
      tenNCC: data.supplier?.name || "",
      soHoaDonNCC: data.supplierInvoiceNo,
      warehouseId: data.warehouseId || data.warehouse?.id,
      kho: data.warehouse?.name || "",
      tongTien: data.totalAmount || 0,
      soChungTu: data.documentNo,
      trangThai: data.status || "Pending",
      materials: (data.importReceiptDetails || []).map(
        (detail: any, idx: number) => {
          const mat = materialsList.find(
            (m: any) => Number(m.id) === Number(detail.materialId),
          );
          return {
            stt: idx + 1,
            id: String(detail.id ?? `row_${idx}`),
            materialId: Number(detail.materialId || 0),
            unitId: Number(detail.unitId || 1),
            maHang: detail.material?.code || mat?.code || "",
            tenHang: detail.material?.name || mat?.name || "",
            donVi: detail.unit?.name || mat?.unitName || "kg",
            soLuong: Number(detail.quantity ?? 0),
            donGia: Number(detail.unitPrice ?? 0),
          };
        },
      ),
    } as Receipt;
  };

  const handleEditReceipt = async (receipt: Receipt) => {
    if (isReceiptCancelled(receipt.trangThai)) {
      showToast("Phiếu đã hủy không thể chỉnh sửa", "warning");
      return;
    }

    let receiptForEdit = receipt;
    try {
      receiptForEdit = await fetchImportReceiptDetail(receipt.id);
    } catch (err) {
      console.error("Không thể tải chi tiết phiếu nhập khi sửa", err);
    }

    setSelectedReceipt(receiptForEdit);
    setFormData({
      soPhieu: receiptForEdit.soPhieu,
      ngayTao: receiptForEdit.ngayTao
        ? receiptForEdit.ngayTao.split("T")[0]
        : "",
      tenNCC: receiptForEdit.tenNCC,
      soHoaDonNCC: receiptForEdit.soHoaDonNCC || "",
      kho: receiptForEdit.kho,
      soChungTu: receiptForEdit.soChungTu || "",
    });
    if (receiptForEdit.supplierId) {
      setSelectedSupplierId(receiptForEdit.supplierId);
    } else {
      // Find and set the supplier ID based on name
      const supplier = availableSuppliers.find(
        (s: any) => s.name === receiptForEdit.tenNCC,
      );
      if (supplier) {
        setSelectedSupplierId(supplier.id);
      }
    }
    if (receiptForEdit.warehouseId) {
      setSelectedWarehouseId(receiptForEdit.warehouseId);
    } else {
      // Find and set the warehouse ID based on name
      const warehouse = availableWarehouses.find(
        (w: any) => w.name === receiptForEdit.kho,
      );
      if (warehouse) {
        setSelectedWarehouseId(warehouse.id);
      }
    }
    setMaterials(receiptForEdit.materials);
    setView("edit");
  };

  const handleSaveReceipt = async (
    targetStatus: "Draft" | "Pending" = "Pending",
  ) => {
    if (
      !formData.soPhieu ||
      !formData.tenNCC ||
      !formData.kho ||
      materials.length === 0
    ) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    // Validate material quantities and prices
    for (const material of materials) {
      if (material.soLuong <= 0) {
        showToast(
          `Vật tư "${material.tenHang}" có số lượng không hợp lệ`,
          "error",
        );
        return;
      }
      if (material.donGia <= 0) {
        showToast(
          `Vật tư "${material.tenHang}" có đơn giá không hợp lệ`,
          "error",
        );
        return;
      }
    }

    if (!selectedSupplierId) {
      showToast("Vui lòng chọn nhà cung cấp từ danh sách", "error");
      return;
    }

    const selectedSupplier = availableSuppliers.find(
      (s: any) => s.id === selectedSupplierId,
    );
    if (!selectedSupplier || isSupplierInactive(selectedSupplier)) {
      showToast(
        "Nhà cung cấp đã ngừng hợp tác, vui lòng chọn nhà cung cấp khác",
        "error",
      );
      return;
    }

    try {
      setLoading(true);
      const totalAmount = materials.reduce(
        (sum, m) => sum + m.soLuong * m.donGia,
        0,
      );

      const importReceiptDetails = materials.map((m) => ({
        ...(m.id.startsWith("new_") ? {} : { id: Number(m.id) }),
        materialId: m.materialId,
        unitId: m.unitId || 1,
        quantity: m.soLuong,
        unitPrice: m.donGia,
        amount: m.soLuong * m.donGia,
        note: "",
      }));

      const receiptData = {
        code: formData.soPhieu,
        receiptNumber: formData.soPhieu,
        importTime: new Date(formData.ngayTao).toISOString(),
        supplierId: selectedSupplierId || 1,
        warehouseId: selectedWarehouseId || 1,
        status:
          view === "create"
            ? targetStatus
            : ["Approved", "Cancelled"].includes(
                  normalizeReceiptStatus(
                    selectedReceipt?.trangThai || "Pending",
                  ),
                )
              ? normalizeReceiptStatus(selectedReceipt?.trangThai || "Pending")
              : targetStatus,
        createdAt: new Date().toISOString(),
        supplierInvoiceNo: formData.soHoaDonNCC,
        documentNo: formData.soChungTu,
        totalAmount: totalAmount,
        importReceiptDetails: importReceiptDetails,
      };

      if (view === "create") {
        await importService.createImportReceipt(receiptData as any);
        if (targetStatus === "Draft") {
          showToast("Đã lưu phiếu nhập ở trạng thái đang soạn thảo", "success");
        } else {
          showToast("Tạo phiếu nhập kho thành công", "success");
        }
      } else if (selectedReceipt?.id) {
        await importService.updateImportReceipt(
          Number(selectedReceipt.id),
          receiptData as any,
        );
        if (
          isReceiptDraft(selectedReceipt.trangThai) &&
          targetStatus === "Pending"
        ) {
          showToast("Đã gửi phiếu nhập chờ xác nhận", "success");
        } else if (targetStatus === "Draft") {
          showToast("Đã lưu phiếu nhập ở trạng thái đang soạn thảo", "success");
        } else {
          showToast("Cập nhật phiếu nhập kho thành công", "success");
        }
      }

      resetForm();
      setView("list");
      fetchImportReceipts();
    } catch (err) {
      showToast("Lỗi lưu phiếu nhập", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReceipt = (id: string) => {
    showConfirm({
      message: "Bạn có chắc muốn xóa phiếu này?",
      onConfirm: async () => {
        try {
          setLoading(true);
          await importService.deleteImportReceipt(Number(id));
          showToast("Xóa phiếu nhập thành công", "success");
          fetchImportReceipts();
        } catch (err) {
          showToast("Lỗi xóa phiếu nhập", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleConfirmReceipt = (receipt: Receipt) => {
    if (isReceiptConfirmed(receipt.trangThai)) {
      showToast("Phiếu này đã được xác nhận", "success");
      return;
    }

    if (isReceiptDraft(receipt.trangThai)) {
      showToast(
        "Phiếu đang ở trạng thái đang soạn thảo, vui lòng gửi yêu cầu xác nhận trước",
        "warning",
      );
      return;
    }

    if (isReceiptCancelled(receipt.trangThai)) {
      showToast("Phiếu đã hủy không thể xác nhận", "warning");
      return;
    }

    showConfirm({
      message:
        "Bạn có chắc muốn xác nhận phiếu này? Sau khi xác nhận, tồn kho sẽ được cộng thêm.",
      onConfirm: async () => {
        try {
          setLoading(true);
          const detailedReceipt = await fetchImportReceiptDetail(receipt.id);
          const payload = buildImportReceiptPayload(
            detailedReceipt,
            "Approved",
          );
          await importService.updateImportReceipt(
            Number(receipt.id),
            payload as any,
          );
          await syncMaterialStockForReceipt(detailedReceipt);
          showToast(
            "Xác nhận phiếu thành công, tồn kho đã được cập nhật",
            "success",
          );
          const refreshedMaterials = await fetchMaterials();
          await fetchImportReceipts(refreshedMaterials);
          if (selectedReceipt?.id === receipt.id) {
            setSelectedReceipt({ ...detailedReceipt, trangThai: "Approved" });
          }
        } catch (err) {
          showToast("Lỗi khi xác nhận phiếu hoặc cập nhật tồn kho", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSubmitReceipt = (receipt: Receipt) => {
    if (!isReceiptDraft(receipt.trangThai)) {
      showToast("Chỉ phiếu đang soạn thảo mới có thể gửi xác nhận", "warning");
      return;
    }

    showConfirm({
      message: "Bạn có chắc muốn gửi phiếu này sang trạng thái chờ xác nhận?",
      onConfirm: async () => {
        try {
          setLoading(true);
          const detailedReceipt = await fetchImportReceiptDetail(receipt.id);
          const payload = buildImportReceiptPayload(detailedReceipt, "Pending");
          await importService.updateImportReceipt(
            Number(receipt.id),
            payload as any,
          );

          const refreshedMaterials = await fetchMaterials();
          await fetchImportReceipts(refreshedMaterials);

          if (selectedReceipt?.id === receipt.id) {
            setSelectedReceipt({ ...detailedReceipt, trangThai: "Pending" });
          }

          showToast("Đã gửi phiếu nhập chờ xác nhận", "success");
        } catch (err) {
          showToast("Lỗi khi gửi phiếu chờ xác nhận", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancelReceipt = (receipt: Receipt) => {
    if (isReceiptCancelled(receipt.trangThai)) {
      showToast("Phiếu này đã được hủy", "success");
      return;
    }

    const isConfirmed = isReceiptConfirmed(receipt.trangThai);
    showConfirm({
      message: isConfirmed
        ? "Bạn có chắc muốn hủy phiếu này? Phiếu đã xác nhận sẽ được hoàn tác tồn kho trên giao diện."
        : "Bạn có chắc muốn hủy phiếu này?",
      onConfirm: async () => {
        try {
          setLoading(true);
          const detailedReceipt = await fetchImportReceiptDetail(receipt.id);
          const payload = buildImportReceiptPayload(
            detailedReceipt,
            "Cancelled",
          );
          await importService.updateImportReceipt(
            Number(receipt.id),
            payload as any,
          );

          if (isReceiptConfirmed(detailedReceipt.trangThai)) {
            await syncMaterialStockForCancellation(detailedReceipt);
          }

          const refreshedMaterials = await fetchMaterials();
          await fetchImportReceipts(refreshedMaterials);

          if (selectedReceipt?.id === receipt.id) {
            setSelectedReceipt({ ...detailedReceipt, trangThai: "Cancelled" });
          }

          showToast("Hủy phiếu nhập thành công", "success");
        } catch (err) {
          showToast("Lỗi khi hủy phiếu nhập", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const warehouseFilterOptions = Array.from(
    new Set(receipts.map((r) => r.kho).filter(Boolean)),
  );
  const statusFilterOptions = [
    "Đang soạn thảo",
    "Chờ xác nhận",
    "Đã xác nhận",
    "Đã hủy",
  ];

  const filteredReceipts = receipts
    .filter(
      (r) =>
        (r.soPhieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.tenNCC.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filters.kho || r.kho === filters.kho) &&
        (!filters.trangThai ||
          getReceiptStatusLabel(r.trangThai) === filters.trangThai),
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "ngayTao")
        comparison =
          new Date(a.ngayTao).getTime() - new Date(b.ngayTao).getTime();
      else if (sortBy === "tongTien") comparison = a.tongTien - b.tongTien;
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const summaryStats = {
    totalReceipts: receipts.length,
    draftReceipts: receipts.filter(
      (r) => normalizeReceiptStatus(r.trangThai) === "Draft",
    ).length,
    pendingReceipts: receipts.filter(
      (r) => normalizeReceiptStatus(r.trangThai) === "Pending",
    ).length,
    totalValue: receipts.reduce((sum, r) => sum + (r.tongTien || 0), 0),
  };

  if (view === "list") {
    return (
      <>
        <PageMeta title="Phiếu nhập kho" description="Quản lý phiếu nhập kho" />
        <PageBreadcrumb pageTitle="Phiếu nhập kho" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900 p-4">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">
              Tổng phiếu nhập
            </p>
            <p className="mt-2 text-2xl font-semibold text-sky-900 dark:text-sky-200">
              {summaryStats.totalReceipts}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white dark:border-gray-700 dark:from-gray-800/60 dark:to-gray-900 p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Đang soạn thảo
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {summaryStats.draftReceipts}
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:border-amber-500/30 dark:from-amber-500/10 dark:to-gray-900 p-4">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Chờ xác nhận
            </p>
            <p className="mt-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">
              {summaryStats.pendingReceipts}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-gray-900 p-4">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Tổng giá trị nhập
            </p>
            <p className="mt-2 text-xl font-semibold text-emerald-900 dark:text-emerald-200">
              {summaryStats.totalValue.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </div>

        <div className="mt-5 module-view module-surface rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="module-head p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh sách phiếu nhập kho
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý phiếu nhập kho hàng hóa.
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setView("create");
                }}
                className="module-primary-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 shadow-sm"
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
                Thêm Phiếu Nhập
              </button>
            </div>
          </div>

          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
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
                  placeholder="Tìm phiếu hoặc nhà cung cấp..."
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
                              Kho
                            </label>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {warehouseFilterOptions.map((kho) => (
                                <label
                                  key={kho}
                                  className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={filters.kho === kho}
                                    onChange={(e) => {
                                      setFilters({
                                        ...filters,
                                        kho: e.target.checked ? kho : "",
                                      });
                                      setCurrentPage(1);
                                    }}
                                    className="rounded"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {kho}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Trạng thái
                            </label>
                            <div className="space-y-1">
                              {statusFilterOptions.map((status) => (
                                <label
                                  key={status}
                                  className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={filters.trangThai === status}
                                    onChange={(e) => {
                                      setFilters({
                                        ...filters,
                                        trangThai: e.target.checked
                                          ? status
                                          : "",
                                      });
                                      setCurrentPage(1);
                                    }}
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

                <CustomSelect
                  value={sortBy}
                  onChange={(value) => setSortBy(value as "ngayTao" | "tongTien")}
                  options={[
                    { value: "ngayTao", label: "Sắp xếp theo ngày" },
                    { value: "tongTien", label: "Sắp xếp theo giá trị" },
                  ]}
                  buttonClassName="flex-1 sm:flex-initial sm:min-w-[180px]"
                />
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
                    Số Phiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Nhà Cung Cấp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Tổng Tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : paginatedReceipts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  paginatedReceipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {receipt.soPhieu}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {new Date(receipt.ngayTao).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {receipt.tenNCC}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {receipt.kho}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {receipt.tongTien.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`status-pill ${getReceiptStatusClass(receipt.trangThai)}`}
                        >
                          {getReceiptStatusLabel(receipt.trangThai)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedReceipt(receipt);
                              setView("detail");
                            }}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
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
                            onClick={() => void handleEditReceipt(receipt)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
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
                            onClick={() => handleDeleteReceipt(receipt.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
              {Math.min(currentPage * itemsPerPage, filteredReceipts.length)}{" "}
              trong {filteredReceipts.length} phiếu
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
      </>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <>
        <PageMeta
          title={view === "create" ? "Tạo phiếu" : "Sửa phiếu"}
          description="Form phiếu nhập kho"
        />
        <PageBreadcrumb
          pageTitle={view === "create" ? "Tạo phiếu nhập" : "Sửa phiếu nhập"}
        />

        <div className="module-view form-tone-sync module-surface rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {view === "create"
                ? "Tạo phiếu nhập mới"
                : "Chỉnh sửa phiếu nhập"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Phiếu
              </label>
              <input
                type="text"
                value={formData.soPhieu}
                onChange={(e) =>
                  setFormData({ ...formData, soPhieu: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày Tạo
              </label>
              <input
                type="date"
                value={formData.ngayTao}
                onChange={(e) =>
                  setFormData({ ...formData, ngayTao: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nhà Cung Cấp
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
                      selectedSupplierId
                        ? formData.tenNCC
                        : "Gõ tên hoặc mã nhà cung cấp..."
                    }
                    className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedSupplierId && (
                    <button
                      type="button"
                      onClick={() => handleSelectSupplier(null)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                {isSupplierDropdownOpen &&
                  filteredAvailableSuppliers.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      <div className="p-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 font-medium">
                          Chọn nhà cung cấp:
                        </div>
                        {filteredAvailableSuppliers
                          .slice(0, 8)
                          .map((supplier: any) => (
                            <button
                              key={supplier.id}
                              type="button"
                              onClick={() => handleSelectSupplier(supplier.id)}
                              className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${selectedSupplierId === supplier.id ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
                            >
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {supplier.code}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Hóa Đơn NCC
              </label>
              <input
                type="text"
                value={formData.soHoaDonNCC}
                onChange={(e) =>
                  setFormData({ ...formData, soHoaDonNCC: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kho
              </label>
              <div ref={warehouseDropdownRef} className="relative">
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
                    value={warehouseSearchTerm}
                    onChange={(e) => {
                      setWarehouseSearchTerm(e.target.value);
                      setIsWarehouseDropdownOpen(true);
                    }}
                    onFocus={() => setIsWarehouseDropdownOpen(true)}
                    placeholder={
                      selectedWarehouseId
                        ? formData.kho
                        : "Gõ tên hoặc mã kho..."
                    }
                    className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedWarehouseId && (
                    <button
                      type="button"
                      onClick={() => handleSelectWarehouse(null)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                {isWarehouseDropdownOpen &&
                  filteredAvailableWarehouses.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      <div className="p-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 font-medium">
                          Chọn kho:
                        </div>
                        {filteredAvailableWarehouses
                          .slice(0, 8)
                          .map((warehouse: any) => (
                            <button
                              key={warehouse.id}
                              type="button"
                              onClick={() =>
                                handleSelectWarehouse(warehouse.id)
                              }
                              className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${selectedWarehouseId === warehouse.id ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
                            >
                              <div className="font-medium">
                                {warehouse.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {warehouse.code}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Chứng Từ
              </label>
              <input
                type="text"
                value={formData.soChungTu}
                onChange={(e) =>
                  setFormData({ ...formData, soChungTu: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-8 p-4 lg:p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Thêm Hàng Hóa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="md:col-span-2" ref={materialDropdownRef}>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Chọn Vật Tư
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
                        if (!e.target.value) {
                          handleSelectMaterial("");
                        }
                      }}
                      onFocus={() => setIsMaterialDropdownOpen(true)}
                      placeholder={
                        materialInput.selectedMaterialId
                          ? `${materialInput.maHang} - ${materialInput.tenHang}`
                          : "Gõ tên hoặc mã vật tư để tìm..."
                      }
                      className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {materialInput.selectedMaterialId && (
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectMaterial("");
                          setMaterialSearchTerm("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

                  {/* Selected badge */}
                  {materialInput.selectedMaterialId &&
                    !isMaterialDropdownOpen && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 rounded-md">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {materialInput.maHang} - {materialInput.tenHang}
                        </span>
                      </div>
                    )}

                  {/* Dropdown list */}
                  {isMaterialDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredAvailableMaterials.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                          Không tìm thấy vật tư
                        </div>
                      ) : (
                        filteredAvailableMaterials.map((mat: any) => (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => {
                              handleSelectMaterial(String(mat.id));
                              setMaterialSearchTerm("");
                              setIsMaterialDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                              materialInput.selectedMaterialId ===
                              String(mat.id)
                                ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            <span className="font-medium">{mat.code}</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {" "}
                              — {mat.name}
                            </span>
                            {mat.unitName && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                ({mat.unitName})
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
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Đơn Vị
                </label>
                <input
                  type="text"
                  value={materialInput.donVi}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed"
                  placeholder={
                    materialInput.selectedMaterialId ? "" : "Chọn vật tư trước"
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Số Lượng
                </label>
                <input
                  type="number"
                  value={materialInput.soLuong}
                  onChange={(e) =>
                    setMaterialInput({
                      ...materialInput,
                      soLuong: e.target.value,
                    })
                  }
                  placeholder=""
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Đơn Giá
                </label>
                <input
                  type="number"
                  value={materialInput.donGia}
                  onChange={(e) =>
                    setMaterialInput({
                      ...materialInput,
                      donGia: e.target.value,
                    })
                  }
                  placeholder=""
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddMaterial}
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
                    d={editingMaterialId ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"}
                  />
                </svg>
                {editingMaterialId ? "Cập Nhật Hàng Hóa" : "Thêm Hàng Hóa"}
              </button>
              {editingMaterialId && (
                <button
                  onClick={handleCancelEditMaterial}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy Sửa
                </button>
              )}
            </div>
            {materials.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-xs">
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
                    {materials.map((m, idx) => (
                      <tr key={m.id}>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {m.maHang}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {m.tenHang}
                        </td>
                        <td className="px-4 py-2 text-gray-900 dark:text-white">
                          {m.donVi}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                          {m.soLuong}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                          {m.donGia.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                          {(m.soLuong * m.donGia).toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEditMaterial(m)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => {
                                if (editingMaterialId === m.id) {
                                  handleCancelEditMaterial();
                                }
                                setMaterials(
                                  materials.filter((_, i) => i !== idx),
                                );
                                showToast("Xóa hàng hóa thành công", "success");
                              }}
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

          {materials.length > 0 && (
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Tổng Tiền:
                </span>
                <span className="text-lg font-bold text-blue-900 dark:text-blue-300">
                  {materials
                    .reduce((sum, m) => sum + m.soLuong * m.donGia, 0)
                    .toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => void handleSaveReceipt("Draft")}
              className="module-primary-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors"
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
              {view === "create" ? "Tạo Phiếu" : "Cập Nhật"}
            </button>
            <button
              onClick={() => {
                setView("list");
                resetForm();
              }}
              className="module-secondary-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
              Hủy
            </button>
          </div>
        </div>
      </>
    );
  }

  if (view === "detail" && selectedReceipt) {
    const totalAmount = selectedReceipt.materials.reduce(
      (sum, m) => sum + m.soLuong * m.donGia,
      0,
    );
    const totalQuantity = selectedReceipt.materials.reduce(
      (sum, m) => sum + Number(m.soLuong || 0),
      0,
    );
    const averagePrice =
      totalQuantity > 0 ? Math.round(totalAmount / totalQuantity) : 0;
    return (
      <>
        <PageMeta
          title={`Chi tiết phiếu ${selectedReceipt.soPhieu}`}
          description="Chi tiết phiếu nhập kho"
        />

        <div className="module-view space-y-4">
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
                  Chi tiết phiếu nhập {selectedReceipt.soPhieu}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Ngày tạo: {new Date(selectedReceipt.ngayTao).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <span
                  className={`status-pill ${getReceiptStatusClass(selectedReceipt.trangThai)}`}
                >
                  {getReceiptStatusLabel(selectedReceipt.trangThai)}
                </span>
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/70 bg-white/70 p-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70">
                  {isReceiptDraft(selectedReceipt.trangThai) && (
                    <button
                      onClick={() => handleSubmitReceipt(selectedReceipt)}
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
                  {!isReceiptDraft(selectedReceipt.trangThai) &&
                    !isReceiptConfirmed(selectedReceipt.trangThai) &&
                    !isReceiptCancelled(selectedReceipt.trangThai) && (
                      <button
                        onClick={() => handleConfirmReceipt(selectedReceipt)}
                        aria-label="Xác nhận phiếu"
                        title="Xác nhận phiếu"
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
                  {!isReceiptCancelled(selectedReceipt.trangThai) && (
                    <button
                      onClick={() => handleCancelReceipt(selectedReceipt)}
                      aria-label="Hủy phiếu"
                      title="Hủy phiếu"
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
                    onClick={() => void handleEditReceipt(selectedReceipt)}
                    aria-label="Sửa phiếu"
                    title="Sửa phiếu"
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
                    onClick={() => handleDeleteReceipt(selectedReceipt.id)}
                    aria-label="Xóa phiếu"
                    title="Xóa phiếu"
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
                    Số mặt hàng
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
                  {selectedReceipt.materials.length}
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
                    Số phiếu
                  </p>
                  <span className="mt-1 inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    {selectedReceipt.soPhieu}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Nhà cung cấp
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedReceipt.tenNCC || "Chưa có"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Kho nhập
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedReceipt.kho || "Chưa có"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Số chứng từ
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedReceipt.soChungTu || "Chưa có"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Danh sách hàng hóa
                </h3>
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {selectedReceipt.materials.length} dòng
                </span>
              </div>

              <div className="overflow-x-auto custom-scrollbar rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="module-table w-full text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        STT
                      </th>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedReceipt.materials.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          Phiếu nhập chưa có hàng hóa.
                        </td>
                      </tr>
                    ) : (
                      selectedReceipt.materials.map((m, idx) => (
                        <tr
                          key={m.id}
                          className="transition-colors odd:bg-white even:bg-gray-50/60 hover:bg-sky-50/70 dark:odd:bg-transparent dark:even:bg-gray-800/30 dark:hover:bg-sky-900/20"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                            {m.maHang}
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {m.tenHang}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                            {m.donVi}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                            {Number(m.soLuong || 0).toLocaleString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                            {Number(m.donGia || 0).toLocaleString("vi-VN")}₫
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                            {(Number(m.soLuong || 0) * Number(m.donGia || 0)).toLocaleString("vi-VN")}₫
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ngày tạo</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedReceipt.ngayTao ? new Date(selectedReceipt.ngayTao).toLocaleDateString("vi-VN") : "-"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nhà cung cấp</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedReceipt.tenNCC || "-"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kho</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {selectedReceipt.kho || "-"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trạng thái</p>
                    <span className={`status-pill ${getReceiptStatusClass(selectedReceipt.trangThai)}`}>
                      {getReceiptStatusLabel(selectedReceipt.trangThai)}
                    </span>
                  </div>
                </div>

                {(selectedReceipt.soHoaDonNCC || selectedReceipt.soChungTu) && (
                  <div className="text-xs space-y-1 mb-2 text-gray-600 dark:text-gray-400">
                    {selectedReceipt.soHoaDonNCC && (
                      <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-blue-50 dark:bg-blue-500/10">
                        <span className="text-blue-700 dark:text-blue-300">Số hóa đơn nhà cung cấp:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-100">{selectedReceipt.soHoaDonNCC}</span>
                      </div>
                    )}
                    {selectedReceipt.soChungTu && (
                      <div className="flex justify-between gap-2 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-500/10">
                        <span className="text-amber-700 dark:text-amber-300">Số chứng từ:</span>
                        <span className="font-medium text-amber-900 dark:text-amber-100">{selectedReceipt.soChungTu}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 p-3 border border-emerald-200 dark:border-emerald-500/30">
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">TỔNG GIÁ TRỊ</p>
                  <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                    {totalAmount.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
