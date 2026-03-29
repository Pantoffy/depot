"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import { exportService } from "../../services/exportService";
import { inventoryService } from "../../services/inventoryService";
import { materialService } from "../../services/materialService";
import { unitService } from "../../services/unitService";
import { warehouseService } from "../../services/warehouseService";

interface MaterialLine {
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

interface Receipt {
  id: string;
  ngayTao: string;
  soPhieu: string;
  receiverName: string;
  warehouseId?: number;
  kho: string;
  tongTien: number;
  lyDo: string;
  soChungTu?: string;
  trangThai: string;
  materials: MaterialLine[];
}

export default function XuatKho() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [sortBy, setSortBy] = useState<"ngayTao" | "tongTien">("ngayTao");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ kho: "", trangThai: "" });

  const [availableMaterials, setAvailableMaterials] = useState<any[]>([]);
  const [availableWarehouses, setAvailableWarehouses] = useState<any[]>([]);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  const [materialSearchTerm, setMaterialSearchTerm] = useState("");
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const materialDropdownRef = useRef<HTMLDivElement>(null);

  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const warehouseDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState({
    soPhieu: "",
    ngayTao: new Date().toISOString().split("T")[0],
    nguoiNhan: "",
    soChungTu: "",
    kho: "",
    lyDo: "Bán hàng",
  });

  const [materials, setMaterials] = useState<MaterialLine[]>([]);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        materialDropdownRef.current &&
        !materialDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMaterialDropdownOpen(false);
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
      fetchExportReceipts(mats);
    });
    fetchWarehouses();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await materialService.getAllMaterials();
      setAvailableMaterials(data || []);
      return data || [];
    } catch (err) {
      console.error("Lỗi tải danh sách nguyên liệu", err);
      return [];
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
      setAvailableUnits(data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách đơn vị", err);
    }
  };

  const getUnitNameById = (unitId?: number, fallback?: string) => {
    if (!unitId) return fallback || "kg";
    const unit = availableUnits.find(
      (u: any) => Number(u.id) === Number(unitId),
    );
    return unit?.name || fallback || "kg";
  };

  const mapExportReceipt = (item: any, materialsList: any[]): Receipt => {
    const rawDetails =
      item.exportReceiptDetails ||
      item.exportReceiptDetail ||
      item.details ||
      [];

    const mappedMaterials: MaterialLine[] = rawDetails.map(
      (detail: any, idx: number) => {
        const mat = materialsList.find(
          (m: any) =>
            Number(m.id) ===
            Number(
              detail.materialId || detail.material?.id || detail.materialID,
            ),
        );
        const unitName =
          detail.unit?.name ||
          getUnitNameById(
            detail.unitId || detail.unit?.id,
            mat?.unitName || mat?.unit?.name,
          ) ||
          "kg";

        const quantity = Number(detail.quantity ?? detail.soLuong ?? 0);
        const unitPrice = Number(detail.unitPrice ?? detail.donGia ?? 0);

        return {
          stt: idx + 1,
          id: String(detail.id ?? `row_${idx}`),
          materialId: Number(
            detail.materialId || detail.material?.id || detail.materialID || 0,
          ),
          unitId: Number(detail.unitId || detail.unit?.id || mat?.unitId || 1),
          maHang:
            detail.material?.code || detail.materialCode || mat?.code || "",
          tenHang:
            detail.material?.name || detail.materialName || mat?.name || "",
          donVi: unitName,
          soLuong: quantity,
          donGia: unitPrice,
        };
      },
    );

    const totalFromDetails = mappedMaterials.reduce(
      (sum, m) => sum + m.soLuong * m.donGia,
      0,
    );

    return {
      id: String(item.id),
      soPhieu: item.receiptNumber || item.code || item.soPhieu || "",
      ngayTao: item.exportDate || item.ngayTao || item.createdAt,
      receiverName: item.receiverName || item.nguoiNhan || "",
      warehouseId: item.warehouseId || item.warehouse?.id,
      kho: item.warehouse?.name || item.warehouseName || item.kho || "",
      tongTien: Number(
        item.totalAmount || item.tongTien || totalFromDetails || 0,
      ),
      soChungTu: item.documentNo || item.soChungTu || "",
      lyDo: item.reason || item.lyDo || "",
      trangThai: normalizeReceiptStatus(
        item.status || item.trangThai || "Pending",
      ),
      materials: mappedMaterials,
    };
  };

  const fetchExportReceiptDetail = async (
    receiptId: string | number,
    mats?: any[],
  ) => {
    const data = await exportService.getExportReceiptById(Number(receiptId));
    const materialsList = mats || availableMaterials;
    return mapExportReceipt(data, materialsList);
  };

  const fetchExportReceipts = async (mats?: any[]) => {
    try {
      setLoading(true);
      const data = await exportService.getAllExportReceipts();
      const materialsList = mats || availableMaterials;

      const mappedReceipts: Receipt[] = (data || []).map((item: any) =>
        mapExportReceipt(item, materialsList),
      );

      setReceipts(mappedReceipts);
    } catch (err) {
      showToast("Lỗi tải dữ liệu phiếu xuất", "error");
    } finally {
      setLoading(false);
    }
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

  const extractApiErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return "Lỗi lưu phiếu xuất";
    }

    const data = error.response?.data as any;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data?.errors && typeof data.errors === "object") {
      const flat = Object.values(data.errors)
        .flatMap((v: any) => (Array.isArray(v) ? v : [v]))
        .filter(Boolean)
        .map(String);
      if (flat.length > 0) {
        return flat.join("; ");
      }
    }

    if (typeof data?.title === "string" && data.title.trim()) {
      return data.title;
    }

    return error.message || "Lỗi lưu phiếu xuất";
  };

  const isReceiptConfirmed = (status: string) => {
    return normalizeReceiptStatus(status) === "Approved";
  };

  const isReceiptCancelled = (status: string) => {
    return normalizeReceiptStatus(status) === "Cancelled";
  };

  const isReceiptDraft = (status: string) => {
    return normalizeReceiptStatus(status) === "Draft";
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

  const resetForm = () => {
    setFormData({
      soPhieu: "",
      ngayTao: new Date().toISOString().split("T")[0],
      nguoiNhan: "",
      soChungTu: "",
      kho: "",
      lyDo: "Bán hàng",
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
    setSelectedWarehouseId(null);
    setWarehouseSearchTerm("");
    setMaterialSearchTerm("");
  };

  const handleSelectWarehouse = (warehouseId: number | null) => {
    if (!warehouseId) {
      setSelectedWarehouseId(null);
      setFormData((prev) => ({ ...prev, kho: "" }));
      setWarehouseSearchTerm("");
      return;
    }

    const warehouse = availableWarehouses.find(
      (w: any) => Number(w.id) === Number(warehouseId),
    );
    if (!warehouse) return;

    setSelectedWarehouseId(warehouseId);
    setFormData((prev) => ({ ...prev, kho: warehouse.name || "" }));
    setWarehouseSearchTerm("");
    setIsWarehouseDropdownOpen(false);
  };

  const handleSelectMaterial = (materialId: string) => {
    if (!materialId) {
      setMaterialInput((prev) => ({
        ...prev,
        selectedMaterialId: "",
        maHang: "",
        tenHang: "",
        donVi: "",
        unitId: 1,
      }));
      return;
    }

    const mat = availableMaterials.find(
      (m: any) => String(m.id) === materialId,
    );
    if (!mat) return;

    setMaterialInput((prev) => ({
      ...prev,
      selectedMaterialId: String(mat.id),
      maHang: mat.code || "",
      tenHang: mat.name || "",
      donVi: getUnitNameById(mat.unitId, mat.unitName || mat.unit?.name || ""),
      unitId: Number(mat.unitId || 1),
    }));
  };

  const handleAddMaterial = () => {
    if (
      !materialInput.selectedMaterialId ||
      !materialInput.soLuong ||
      !materialInput.donGia
    ) {
      showToast("Vui lòng chọn nguyên liệu và điền số lượng, đơn giá", "error");
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

    const newMaterial: MaterialLine = {
      stt: materials.length + 1,
      id: `new_${Date.now()}`,
      materialId: Number(materialInput.selectedMaterialId),
      unitId: materialInput.unitId,
      maHang: materialInput.maHang,
      tenHang: materialInput.tenHang,
      donVi: materialInput.donVi || "kg",
      soLuong: quantity,
      donGia: price,
    };

    if (editingMaterialId) {
      setMaterials((prev) =>
        prev.map((item) =>
          item.id === editingMaterialId
            ? {
                ...item,
                materialId: Number(materialInput.selectedMaterialId),
                unitId: materialInput.unitId,
                maHang: materialInput.maHang,
                tenHang: materialInput.tenHang,
                donVi: materialInput.donVi || "kg",
                soLuong: quantity,
                donGia: price,
              }
            : item,
        ),
      );
      showToast("Cập nhật hàng hóa thành công", "success");
    } else {
      setMaterials((prev) => [...prev, newMaterial]);
      showToast("Thêm hàng hóa thành công", "success");
    }

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
  };

  const handleEditMaterial = (item: MaterialLine) => {
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

  const buildExportReceiptPayload = (receipt: Receipt, status: string) => {
    const totalAmount = receipt.materials.reduce(
      (sum, m) => sum + m.soLuong * m.donGia,
      0,
    );

    return {
      code: receipt.soPhieu,
      receiptNumber: receipt.soPhieu,
      exportDate: new Date(receipt.ngayTao).toISOString(),
      warehouseId: receipt.warehouseId || 1,
      receiverName: receipt.receiverName,
      reason: receipt.lyDo || "",
      documentNo: receipt.soChungTu || "",
      totalAmount,
      status: normalizeReceiptStatus(status),
      createdAt: new Date().toISOString(),
      exportReceiptDetails: receipt.materials.map((m) => ({
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

  const validateStockForReceipt = async (receipt: Receipt) => {
    if (!receipt.warehouseId) {
      throw new Error("Không xác định được kho để kiểm tra tồn.");
    }

    const inventoryList = await inventoryService.getAllInventories();

    const quantitiesByMaterial = receipt.materials.reduce(
      (acc, item) => {
        if (!item.materialId) return acc;
        acc[item.materialId] =
          (acc[item.materialId] || 0) + Number(item.soLuong || 0);
        return acc;
      },
      {} as Record<number, number>,
    );

    for (const [materialIdText, quantity] of Object.entries(
      quantitiesByMaterial,
    )) {
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

      const inventoryRow = inventoryList.find(
        (row: any) =>
          Number(row.warehouseId) === Number(receipt.warehouseId) &&
          Number(row.materialId) === materialId,
      );

      const stock = Number(inventoryRow?.quantity || 0);
      const needed = Number(quantity || 0);
      if (stock < needed) {
        const warehouseName =
          availableWarehouses.find(
            (w: any) => Number(w.id) === Number(receipt.warehouseId),
          )?.name ||
          receipt.kho ||
          "kho đã chọn";
        throw new Error(
          `Không đủ hàng tồn kho trong "${warehouseName}" cho "${material.name}". Tồn kho: ${stock}, yêu cầu: ${needed}`,
        );
      }
    }
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

  const handleEditReceipt = async (receipt: Receipt) => {
    if (isReceiptCancelled(receipt.trangThai)) {
      showToast("Phiếu đã hủy không thể chỉnh sửa", "warning");
      return;
    }

    let receiptForEdit = receipt;

    try {
      receiptForEdit = await fetchExportReceiptDetail(receipt.id);
    } catch (err) {
      console.error("Không thể tải chi tiết phiếu xuất khi sửa", err);
    }

    setSelectedReceipt(receiptForEdit);
    setFormData({
      soPhieu: receiptForEdit.soPhieu,
      ngayTao: receiptForEdit.ngayTao
        ? receiptForEdit.ngayTao.split("T")[0]
        : "",
      nguoiNhan: receiptForEdit.receiverName,
      soChungTu: receiptForEdit.soChungTu || "",
      kho: receiptForEdit.kho,
      lyDo: receiptForEdit.lyDo || "Bán hàng",
    });

    if (receiptForEdit.warehouseId) {
      setSelectedWarehouseId(receiptForEdit.warehouseId);
    } else {
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

  const handleViewReceipt = async (receipt: Receipt) => {
    let receiptForView = receipt;

    try {
      receiptForView = await fetchExportReceiptDetail(receipt.id);
    } catch (err) {
      console.error("Không thể tải chi tiết phiếu xuất khi xem", err);
    }

    setSelectedReceipt(receiptForView);
    setView("detail");
  };

  const handleSaveReceipt = async (
    targetStatus: "Draft" | "Pending" = "Pending",
  ) => {
    if (
      !formData.soPhieu ||
      !formData.nguoiNhan ||
      !formData.kho ||
      materials.length === 0
    ) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    if (!selectedWarehouseId) {
      showToast("Vui lòng chọn kho từ danh sách", "error");
      return;
    }

    for (const item of materials) {
      if (item.soLuong <= 0) {
        showToast(
          `Nguyên liệu "${item.tenHang}" có số lượng không hợp lệ`,
          "error",
        );
        return;
      }
      if (item.donGia <= 0) {
        showToast(
          `Nguyên liệu "${item.tenHang}" có đơn giá không hợp lệ`,
          "error",
        );
        return;
      }
    }

    const workingReceipt: Receipt = {
      id: selectedReceipt?.id || "",
      soPhieu: formData.soPhieu,
      ngayTao: formData.ngayTao,
      receiverName: formData.nguoiNhan,
      warehouseId: selectedWarehouseId,
      kho: formData.kho,
      tongTien: materials.reduce((sum, m) => sum + m.soLuong * m.donGia, 0),
      lyDo: formData.lyDo,
      soChungTu: formData.soChungTu,
      trangThai:
        view === "create"
          ? targetStatus
          : ["Approved", "Cancelled"].includes(
                normalizeReceiptStatus(selectedReceipt?.trangThai || "Pending"),
              )
            ? normalizeReceiptStatus(selectedReceipt?.trangThai || "Pending")
            : targetStatus,
      materials,
    };

    try {
      setLoading(true);
      await validateStockForReceipt(workingReceipt);
      const payload = buildExportReceiptPayload(
        workingReceipt,
        workingReceipt.trangThai,
      );

      if (view === "create") {
        await exportService.createExportReceipt(payload as any);
        if (targetStatus === "Draft") {
          showToast("Đã lưu phiếu xuất ở trạng thái đang soạn thảo", "success");
        } else {
          showToast(
            "Tạo phiếu xuất kho thành công. Tồn kho sẽ được trừ khi bạn bấm Xác nhận.",
            "success",
          );
        }
      } else if (selectedReceipt?.id) {
        await exportService.updateExportReceipt(
          Number(selectedReceipt.id),
          payload as any,
        );
        if (
          isReceiptDraft(selectedReceipt.trangThai) &&
          targetStatus === "Pending"
        ) {
          showToast("Đã gửi phiếu xuất chờ xác nhận", "success");
        } else if (targetStatus === "Draft") {
          showToast("Đã lưu phiếu xuất ở trạng thái đang soạn thảo", "success");
        } else {
          showToast("Cập nhật phiếu xuất kho thành công", "success");
        }
      }

      resetForm();
      setView("list");
      fetchExportReceipts();
    } catch (err) {
      showToast(extractApiErrorMessage(err), "error");
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
          await exportService.deleteExportReceipt(Number(id));
          showToast("Xóa phiếu xuất thành công", "success");
          fetchExportReceipts();
        } catch (err) {
          showToast("Lỗi xóa phiếu xuất", "error");
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
        "Bạn có chắc muốn xác nhận phiếu này? Sau khi xác nhận, backend sẽ tự động cập nhật tồn kho.",
      onConfirm: async () => {
        try {
          setLoading(true);
          const detailedReceipt = await fetchExportReceiptDetail(receipt.id);
          const payload = buildExportReceiptPayload(
            detailedReceipt,
            "Approved",
          );
          await exportService.updateExportReceipt(
            Number(receipt.id),
            payload as any,
          );
          await syncMaterialStockForReceipt(detailedReceipt);
          const refreshedMaterials = await fetchMaterials();
          await fetchExportReceipts(refreshedMaterials);

          if (selectedReceipt?.id === receipt.id) {
            setSelectedReceipt({ ...detailedReceipt, trangThai: "Approved" });
          }

          showToast(
            "Xác nhận phiếu thành công, tồn kho đã được cập nhật",
            "success",
          );
        } catch (err) {
          const message = extractApiErrorMessage(err);
          showToast(message, "error");
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
          const detailedReceipt = await fetchExportReceiptDetail(receipt.id);
          const payload = buildExportReceiptPayload(detailedReceipt, "Pending");
          await exportService.updateExportReceipt(
            Number(receipt.id),
            payload as any,
          );

          const refreshedMaterials = await fetchMaterials();
          await fetchExportReceipts(refreshedMaterials);

          if (selectedReceipt?.id === receipt.id) {
            setSelectedReceipt({ ...detailedReceipt, trangThai: "Pending" });
          }

          showToast("Đã gửi phiếu xuất chờ xác nhận", "success");
        } catch (err) {
          const message = extractApiErrorMessage(err);
          showToast(message, "error");
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

    const wasConfirmed = isReceiptConfirmed(receipt.trangThai);
    showConfirm({
      message: wasConfirmed
        ? "Bạn có chắc muốn hủy phiếu này? Phiếu đã xác nhận sẽ được hoàn tác tồn kho trên giao diện."
        : "Bạn có chắc muốn hủy phiếu này?",
      onConfirm: async () => {
        try {
          setLoading(true);
          const detailedReceipt = await fetchExportReceiptDetail(receipt.id);
          const payload = buildExportReceiptPayload(
            detailedReceipt,
            "Cancelled",
          );
          await exportService.updateExportReceipt(
            Number(receipt.id),
            payload as any,
          );

          if (isReceiptConfirmed(detailedReceipt.trangThai)) {
            await syncMaterialStockForCancellation(detailedReceipt);
          }

          const refreshedMaterials = await fetchMaterials();
          await fetchExportReceipts(refreshedMaterials);

          if (selectedReceipt?.id === receipt.id) {
            setSelectedReceipt({ ...detailedReceipt, trangThai: "Cancelled" });
          }

          showToast("Hủy phiếu xuất thành công", "success");
        } catch (err) {
          const message = extractApiErrorMessage(err);
          showToast(message, "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleExportToCSV = () => {
    if (receipts.length === 0) {
      showToast("Không có dữ liệu để xuất", "warning");
      return;
    }

    const headers = [
      "Số Phiếu",
      "Ngày Xuất",
      "Người Nhận",
      "Kho",
      "Tổng Tiền",
      "Trạng Thái",
    ];
    const rows = receipts.map((r) => [
      r.soPhieu,
      new Date(r.ngayTao).toLocaleDateString("vi-VN"),
      r.receiverName,
      r.kho,
      r.tongTien.toLocaleString("vi-VN"),
      getReceiptStatusLabel(r.trangThai),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `phieu-xuat-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showToast("Xuất dữ liệu thành công", "success");
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
          r.receiverName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filters.kho || r.kho === filters.kho) &&
        (!filters.trangThai ||
          getReceiptStatusLabel(r.trangThai) === filters.trangThai),
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "ngayTao") {
        comparison =
          new Date(a.ngayTao).getTime() - new Date(b.ngayTao).getTime();
      } else if (sortBy === "tongTien") {
        comparison = a.tongTien - b.tongTien;
      }
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
        <PageMeta title="Phiếu xuất kho" description="Quản lý phiếu xuất kho" />
        <PageBreadcrumb pageTitle="Phiếu xuất kho" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white dark:border-sky-500/30 dark:from-sky-500/10 dark:to-gray-900 p-4">
            <p className="text-xs font-medium text-sky-700 dark:text-sky-300">
              Tổng phiếu xuất
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
              Tổng giá trị xuất
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
                  Danh sách phiếu xuất kho
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý phiếu xuất kho hàng hóa.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportToCSV}
                  className="module-secondary-btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export
                </button>
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
                  Thêm Phiếu Xuất
                </button>
              </div>
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
                  placeholder="Tìm phiếu hoặc người nhận..."
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

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "ngayTao" | "tongTien")
                  }
                  className="flex-1 sm:flex-initial px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ngayTao">Sắp xếp theo ngày</option>
                  <option value="tongTien">Sắp xếp theo giá trị</option>
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
                    Số Phiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Người Nhận
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
                        {receipt.receiverName}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {receipt.kho || `Kho ${receipt.warehouseId || ""}`}
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
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleViewReceipt(receipt)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            aria-label="Xem chi tiết phiếu xuất"
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
                            aria-label="Chỉnh sửa phiếu xuất"
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
                            aria-label="Xóa phiếu xuất"
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
                      className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
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
          description="Form phiếu xuất kho"
        />
        <PageBreadcrumb
          pageTitle={view === "create" ? "Tạo phiếu xuất" : "Sửa phiếu xuất"}
        />

        <div className="module-view form-tone-sync module-surface rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {view === "create"
                ? "Tạo phiếu xuất mới"
                : "Chỉnh sửa phiếu xuất"}
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
                Người Nhận
              </label>
              <input
                type="text"
                value={formData.nguoiNhan}
                onChange={(e) =>
                  setFormData({ ...formData, nguoiNhan: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lý Do Xuất
              </label>
              <select
                value={formData.lyDo}
                onChange={(e) =>
                  setFormData({ ...formData, lyDo: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bán hàng">Bán hàng</option>
                <option value="Hỏng hóc">Hỏng hóc</option>
                <option value="Khác">Khác</option>
              </select>
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
                              className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors ${
                                selectedWarehouseId === warehouse.id
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
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
                  Chọn Nguyên Liệu
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
                          : "Gõ tên hoặc mã nguyên liệu để tìm..."
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

                  {materialInput.selectedMaterialId &&
                    !isMaterialDropdownOpen && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 rounded-md">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {materialInput.maHang} - {materialInput.tenHang}
                        </span>
                      </div>
                    )}

                  {isMaterialDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredAvailableMaterials.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                          Không tìm thấy nguyên liệu
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
                    materialInput.selectedMaterialId
                      ? ""
                      : "Chọn nguyên liệu trước"
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

    return (
      <>
        <PageMeta
          title={`Chi tiết phiếu ${selectedReceipt.soPhieu}`}
          description="Chi tiết phiếu xuất kho"
        />
        <PageBreadcrumb
          pageTitle={`Chi tiết phiếu ${selectedReceipt.soPhieu}`}
        />

        <div className="mb-4 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 dark:border-sky-500/30 dark:from-sky-500/10 dark:via-gray-900 dark:to-emerald-500/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <button
                onClick={() => setView("list")}
                className="module-ghost-btn inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/70"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Quay Lại
              </button>
              <h2 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
                Chi tiết phiếu xuất {selectedReceipt.soPhieu}
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

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-white/80 p-4 backdrop-blur-sm dark:border-sky-500/30 dark:bg-sky-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
                Tổng giá trị
              </p>
              <p className="mt-2 text-xl font-semibold text-sky-900 dark:text-sky-100">
                {totalAmount.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-white/80 p-4 backdrop-blur-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                Số mặt hàng
              </p>
              <p className="mt-2 text-xl font-semibold text-indigo-900 dark:text-indigo-100">
                {selectedReceipt.materials.length}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 backdrop-blur-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Tổng số lượng
              </p>
              <p className="mt-2 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                {totalQuantity.toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>

        <div className="module-view grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="module-surface lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div className="mb-6 grid grid-cols-1 gap-4 border-b border-gray-200 pb-6 sm:grid-cols-2 dark:border-gray-700">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Số phiếu
                </p>
                <span className="mt-1 inline-flex rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  {selectedReceipt.soPhieu}
                </span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Danh Sách Hàng Hóa
            </h3>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="module-table w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Mã
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Tên Hàng
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Đơn vị
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      SL
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Đơn Giá
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                      Thành Tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedReceipt.materials.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
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
                        {m.soLuong}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                        {m.donGia.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        {(m.soLuong * m.donGia).toLocaleString("vi-VN")}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 dark:border-gray-700 dark:from-white/5 dark:to-gray-800/30">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                Thông tin
              </p>

              <div className="mb-2 grid grid-cols-2 gap-2">
                <div className="col-span-2 rounded-lg border border-gray-100 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ngày tạo</p>
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(selectedReceipt.ngayTao).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                <div className="col-span-2 rounded-lg border border-gray-100 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Người nhận</p>
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {selectedReceipt.receiverName || "-"}
                  </p>
                </div>

                <div className="col-span-2 rounded-lg border border-gray-100 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kho xuất</p>
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {selectedReceipt.kho || "-"}
                  </p>
                </div>

                <div className="col-span-2 rounded-lg border border-gray-100 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trạng thái</p>
                  <span className={`status-pill mt-1 ${getReceiptStatusClass(selectedReceipt.trangThai)}`}>
                    {getReceiptStatusLabel(selectedReceipt.trangThai)}
                  </span>
                </div>
              </div>

              <div className="mb-2 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-sky-50 p-2.5 dark:border-blue-500/20 dark:from-blue-500/10 dark:to-sky-500/10">
                <p className="text-xs font-semibold uppercase text-blue-600 dark:text-blue-300">Số phiếu</p>
                <p className="mt-1 text-sm font-bold text-blue-800 dark:text-blue-100">
                  {selectedReceipt.soPhieu || "-"}
                </p>
              </div>

              <div className="mb-2 rounded-lg border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-orange-500/10">
                <p className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-300">Số chứng từ</p>
                <p className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-100">
                  {selectedReceipt.soChungTu || "-"}
                </p>
              </div>

              <div className="mb-3 rounded-lg border border-gray-100 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400">Lý do xuất</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {selectedReceipt.lyDo || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-teal-500/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                  Tổng giá trị
                </p>
                <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-100">
                  {totalAmount.toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
