"use client";

import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import ComponentCard from "../../components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";

// Types from PO
interface PODetail {
  stt: number;
  id: string;
  maHang: string;
  tenHang: string;
  donVi: string;
  soLuong: number;
  donGia: number;
}

interface PurchaseOrder {
  id: string;
  soPO: string;
  ngayTao: string;
  tenNCC: string;
  diaChiNCC: string;
  sdtNCC: string;
  ngayGiaoHang: string;
  diaDiemGiao: string;
  tongTien: number;
  trangThai: "Chờ giao" | "Đã giao" | "Hủy";
  details: PODetail[];
}

// Material in Receipt
interface Material {
  stt: number;
  id: string;
  maHang: string;
  tenHang: string;
  donVi: string;
  soLuongDatHang: number; // Số lượng trong PO
  soLuongNhap: number; // Số lượng thực tế nhập
  donGia: number;
  chechusai: number; // Lệch so với PO
}

// Receipt
interface Receipt {
  id: string;
  ngayTao: string;
  soPhieu: string;
  soPO: string; // Liên kết PO
  tenNCC: string;
  soHoaDonNCC?: string;
  kho: string;
  tongTien: number;
  soChungTu?: string;
  trangThai: "Chờ xác nhận" | "Đã xác nhận";
  materials: Material[];
  hinhThucNhap: "theo-po" | "tu-do";
}

export default function NhapKhoTheoGoi() {
  // Mock PO data - in real app, this would come from API
  const mockPOs: PurchaseOrder[] = [
    {
      id: "PO001",
      soPO: "PO-2026-001",
      ngayTao: "2026-01-20",
      tenNCC: "Công ty ABC",
      diaChiNCC: "123 Đường ABC, TP HCM",
      sdtNCC: "0901234567",
      ngayGiaoHang: "2026-01-25",
      diaDiemGiao: "Kho A",
      tongTien: 5000000,
      trangThai: "Chờ giao",
      details: [
        {
          stt: 1,
          id: "1",
          maHang: "H001",
          tenHang: "Bột mỳ",
          donVi: "kg",
          soLuong: 100,
          donGia: 50000,
        },
        {
          stt: 2,
          id: "2",
          maHang: "H002",
          tenHang: "Đường",
          donVi: "kg",
          soLuong: 50,
          donGia: 15000,
        },
      ],
    },
  ];

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [view, setView] = useState<"list" | "create-theo-po" | "create-tu-do" | "edit" | "detail">(
    "list"
  );
  const [hinhThucNhap, setHinhThucNhap] = useState<"theo-po" | "tu-do">("theo-po");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [purchaseOrders] = useState<PurchaseOrder[]>(mockPOs);

  const [formData, setFormData] = useState({
    soPhieu: "",
    ngayTao: new Date().toISOString().split("T")[0],
    tenNCC: "",
    soHoaDonNCC: "",
    kho: "",
    soChungTu: "",
    soPO: "",
  });

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialInput, setMaterialInput] = useState({
    maHang: "",
    tenHang: "",
    donVi: "kg",
    soLuongNhap: "",
    donGia: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      soPhieu: "",
      ngayTao: new Date().toISOString().split("T")[0],
      tenNCC: "",
      soHoaDonNCC: "",
      kho: "",
      soChungTu: "",
      soPO: "",
    });
    setMaterials([]);
    setMaterialInput({
      maHang: "",
      tenHang: "",
      donVi: "kg",
      soLuongNhap: "",
      donGia: "",
    });
    setSelectedPO(null);
  };

  // Chọn PO để nhập
  const selectPOForImport = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setFormData({
      soPhieu: `PN-${new Date().getTime()}`,
      ngayTao: new Date().toISOString().split("T")[0],
      tenNCC: po.tenNCC,
      soHoaDonNCC: "",
      kho: po.diaDiemGiao,
      soChungTu: "",
      soPO: po.soPO,
    });

    // Tạo materials từ PO details với soLuongNhap = 0 (chờ nhập)
    const importMaterials: Material[] = po.details.map((detail) => ({
      stt: detail.stt,
      id: detail.id,
      maHang: detail.maHang,
      tenHang: detail.tenHang,
      donVi: detail.donVi,
      soLuongDatHang: detail.soLuong,
      soLuongNhap: 0,
      donGia: detail.donGia,
      chechusai: 0,
    }));

    setMaterials(importMaterials);
    setView("create-theo-po");
  };

  // Cập nhật số lượng nhập cho từng mặt hàng
  const updateMaterialQuantity = (id: string, soLuongNhap: number) => {
    setMaterials(
      materials.map((m) =>
        m.id === id
          ? {
              ...m,
              soLuongNhap,
              chechusai: soLuongNhap - m.soLuongDatHang,
            }
          : m
      )
    );
  };

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle material input change (cho mode nhập tự do)
  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMaterialInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Thêm material (cho mode nhập tự do)
  const addMaterial = () => {
    if (
      materialInput.maHang &&
      materialInput.tenHang &&
      materialInput.soLuongNhap &&
      materialInput.donGia
    ) {
      const newMaterial: Material = {
        stt: materials.length + 1,
        id: Date.now().toString(),
        maHang: materialInput.maHang,
        tenHang: materialInput.tenHang,
        donVi: materialInput.donVi,
        soLuongDatHang: 0, // Không có PO
        soLuongNhap: parseFloat(materialInput.soLuongNhap),
        donGia: parseFloat(materialInput.donGia),
        chechusai: 0,
      };
      setMaterials([...materials, newMaterial]);
      setMaterialInput({
        maHang: "",
        tenHang: "",
        donVi: "kg",
        soLuongNhap: "",
        donGia: "",
      });
    }
  };

  // Xóa material
  const removeMaterial = (id: string) => {
    const updatedMaterials = materials
      .filter((m) => m.id !== id)
      .map((m, index) => ({
        ...m,
        stt: index + 1,
      }));
    setMaterials(updatedMaterials);
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return materials.reduce((sum, mat) => sum + mat.soLuongNhap * mat.donGia, 0);
  };

  // Lưu phiếu nhập kho
  const handleSaveReceipt = () => {
    if (!formData.soPhieu || !formData.tenNCC || materials.length === 0) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    const newReceipt: Receipt = {
      id: Date.now().toString(),
      ngayTao: formData.ngayTao,
      soPhieu: formData.soPhieu,
      soPO: formData.soPO,
      tenNCC: formData.tenNCC,
      soHoaDonNCC: formData.soHoaDonNCC,
      kho: formData.kho,
      soChungTu: formData.soChungTu,
      tongTien: calculateTotal(),
      trangThai: "Chờ xác nhận",
      materials: materials,
      hinhThucNhap: hinhThucNhap,
    };

    setReceipts([...receipts, newReceipt]);
    showToast("Phiếu nhập kho đã được tạo thành công!", "success");
    resetForm();
    setView("list");
  };

  // Xóa phiếu
  const handleDeleteReceipt = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa phiếu nhập kho này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => {
        setReceipts(receipts.filter((r) => r.id !== id));
        showToast("Phiếu nhập kho đã được xóa!", "success");
      },
    });
  };

  // Xác nhận phiếu
  const handleConfirmReceipt = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xác nhận phiếu nhập kho này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onConfirm: () => {
        setReceipts((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, trangThai: "Đã xác nhận" } : r
          )
        );
        showToast("Phiếu nhập kho đã được xác nhận!", "success");
      },
    });
  };

  // Hủy xác nhận phiếu
  const handleCancelReceipt = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn hủy xác nhận phiếu nhập kho này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onConfirm: () => {
        setReceipts((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, trangThai: "Chờ xác nhận" } : r
          )
        );
        showToast("Phiếu nhập kho đã được hủy xác nhận!", "success");
      },
    });
  };

  // Xem chi tiết phiếu
  const handleViewDetail = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setView("detail");
  };

  return (
    <>
      <PageMeta title="Nhập Kho" />
      <PageBreadcrumb pageName="Nhập Kho" />

      {view === "list" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => {
                setHinhThucNhap("theo-po");
                resetForm();
                setView("create-theo-po");
              }}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 transition-colors"
            >
              + Nhập Theo PO
            </button>
            <button
              onClick={() => {
                setHinhThucNhap("tu-do");
                resetForm();
                setView("create-tu-do");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              + Nhập Tự Do
            </button>
          </div>

          <ComponentCard title="Danh Sách Phiếu Nhập Kho">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Số Phiếu
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Ngày Tạo
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        PO / NCC
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Hình Thức
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Tổng Tiền
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Trạng Thái
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Thao Tác
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipts.map((receipt) => (
                      <TableRow
                        key={receipt.id}
                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {receipt.soPhieu}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {receipt.ngayTao}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {receipt.hinhThucNhap === "theo-po"
                            ? receipt.soPO
                            : receipt.tenNCC}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <Badge
                            color={
                              receipt.hinhThucNhap === "theo-po"
                                ? "info"
                                : "success"
                            }
                          >
                            {receipt.hinhThucNhap === "theo-po"
                              ? "Theo PO"
                              : "Tự Do"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {receipt.tongTien.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <Badge
                            color={
                              receipt.trangThai === "Chờ xác nhận"
                                ? "warning"
                                : "success"
                            }
                          >
                            {receipt.trangThai}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(receipt)}
                              title="Xem chi tiết"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
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
                            {receipt.trangThai === "Chờ xác nhận" && (
                              <>
                                <button
                                  onClick={() => handleDeleteReceipt(receipt.id)}
                                  title="Xóa"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleConfirmReceipt(receipt.id)}
                                  title="Xác nhận"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
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
                                </button>
                                <button
                                  onClick={() => handleConfirmReceipt(receipt.id)}
                                  title="Xác nhận"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
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
                                </button>
                              </>
                            )}
                            {receipt.trangThai === "Đã xác nhận" && (
                              <button
                                onClick={() => handleCancelReceipt(receipt.id)}
                                title="Hủy xác nhận"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50 transition-colors"
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
                                    d="M9 15L3 9m0 0l6-6m-6 6h12a6 6 0 010 12h-3"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {receipts.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Không có phiếu nhập kho nào
              </div>
            )}
          </ComponentCard>
      )}

      {view === "create-theo-po" && (
        <div className="space-y-4">
          {!selectedPO ? (
            <>
              <button
                onClick={() => setView("list")}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
              >
                ← Quay Lại
              </button>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Chọn Đơn Đặt Hàng để Nhập Kho
                </h2>

                <div className="space-y-3">
                  {purchaseOrders.map((po) => (
                    <div
                      key={po.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {po.soPO}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {po.tenNCC} | {po.ngayTao}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            po.trangThai === "Chờ giao"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : po.trangThai === "Đã giao"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {po.trangThai}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Số mặt hàng
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {po.details.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Tổng tiền
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {po.tongTien.toLocaleString()} đ
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Địa điểm giao
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {po.diaDiemGiao}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => selectPOForImport(po)}
                        className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 transition-colors"
                      >
                        Chọn PO này để Nhập Kho
                      </button>
                    </div>
                  ))}
                </div>

                {purchaseOrders.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    Không có đơn đặt hàng nào
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedPO(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
              >
                ← Chọn PO Khác
              </button>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Nhập Kho - {selectedPO.soPO}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Số Phiếu
                    </label>
                    <input
                      type="text"
                      name="soPhieu"
                      value={formData.soPhieu}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Ngày Nhập
                    </label>
                    <input
                      type="date"
                      name="ngayTao"
                      value={formData.ngayTao}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Số Hóa Đơn NCC
                    </label>
                    <input
                      type="text"
                      name="soHoaDonNCC"
                      value={formData.soHoaDonNCC}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="HD-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Kho
                    </label>
                    <select
                      name="kho"
                      value={formData.kho}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option>Kho A</option>
                      <option>Kho B</option>
                      <option>Kho C</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Nhập Số Lượng Thực Tế
                </h3>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-2 text-left">STT</th>
                        <th className="px-4 py-2 text-left">Mã Hàng</th>
                        <th className="px-4 py-2 text-left">Tên Hàng</th>
                        <th className="px-4 py-2 text-right">SL Đặt</th>
                        <th className="px-4 py-2 text-right">SL Nhập</th>
                        <th className="px-4 py-2 text-right">Lệch</th>
                        <th className="px-4 py-2 text-right">Đơn Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr
                          key={material.id}
                          className={`border-b border-gray-200 dark:border-gray-700 ${
                            material.chechusai !== 0
                              ? "bg-yellow-50 dark:bg-yellow-900/20"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-2">{material.stt}</td>
                          <td className="px-4 py-2">{material.maHang}</td>
                          <td className="px-4 py-2">{material.tenHang}</td>
                          <td className="px-4 py-2 text-right">
                            {material.soLuongDatHang} {material.donVi}
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={material.soLuongNhap}
                              onChange={(e) =>
                                updateMaterialQuantity(
                                  material.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-right"
                            />
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-semibold ${
                              material.chechusai === 0
                                ? "text-green-600 dark:text-green-400"
                                : material.chechusai > 0
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {material.chechusai > 0 && "+"}
                            {material.chechusai}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {material.donGia.toLocaleString()} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-right text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Tổng Tiền: {calculateTotal().toLocaleString()} đ
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSaveReceipt}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
                  >
                    💾 Lưu Phiếu Nhập Kho
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPO(null);
                      setView("list");
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {view === "create-tu-do" && (
        <div className="space-y-4">
          <button
            onClick={() => {
              resetForm();
              setView("list");
            }}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            ← Quay Lại
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số Phiếu
              </label>
              <input
                type="text"
                name="soPhieu"
                value={formData.soPhieu}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="PN-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ngày Nhập
              </label>
              <input
                type="date"
                name="ngayTao"
                value={formData.ngayTao}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nhà Cung Cấp
              </label>
              <input
                type="text"
                name="tenNCC"
                value={formData.tenNCC}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Công ty ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số Hóa Đơn NCC
              </label>
              <input
                type="text"
                name="soHoaDonNCC"
                value={formData.soHoaDonNCC}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="HD-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Kho
              </label>
              <select
                name="kho"
                value={formData.kho}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>Kho A</option>
                <option>Kho B</option>
                <option>Kho C</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số Chứng Từ
              </label>
              <input
                type="text"
                name="soChungTu"
                value={formData.soChungTu}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="CT-001"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Thêm Mặt Hàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mã Hàng
                </label>
                <input
                  type="text"
                  name="maHang"
                  value={materialInput.maHang}
                  onChange={handleMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="H001"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tên Hàng
                </label>
                <input
                  type="text"
                  name="tenHang"
                  value={materialInput.tenHang}
                  onChange={handleMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Bột mỳ"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Đơn Vị
                </label>
                <select
                  name="donVi"
                  value={materialInput.donVi}
                  onChange={handleMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>kg</option>
                  <option>cái</option>
                  <option>thùng</option>
                  <option>liter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Số Lượng
                </label>
                <input
                  type="number"
                  name="soLuongNhap"
                  value={materialInput.soLuongNhap}
                  onChange={handleMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Đơn Giá
                </label>
                <input
                  type="number"
                  name="donGia"
                  value={materialInput.donGia}
                  onChange={handleMaterialChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="50000"
                />
              </div>
            </div>

            <button
              onClick={addMaterial}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              + Thêm Mặt Hàng
            </button>

            {materials.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left">STT</th>
                      <th className="px-4 py-2 text-left">Mã Hàng</th>
                      <th className="px-4 py-2 text-left">Tên Hàng</th>
                      <th className="px-4 py-2 text-right">SL</th>
                      <th className="px-4 py-2 text-right">Đơn Giá</th>
                      <th className="px-4 py-2 text-right">Thành Tiền</th>
                      <th className="px-4 py-2 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr
                        key={material.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-2">{material.stt}</td>
                        <td className="px-4 py-2">{material.maHang}</td>
                        <td className="px-4 py-2">{material.tenHang}</td>
                        <td className="px-4 py-2 text-right">
                          {material.soLuongNhap} {material.donVi}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {material.donGia.toLocaleString()} đ
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {(material.soLuongNhap * material.donGia).toLocaleString()}{" "}
                          đ
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => removeMaterial(material.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right text-lg font-semibold text-gray-900 dark:text-white">
                  Tổng Cộng: {calculateTotal().toLocaleString()} đ
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveReceipt}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              💾 Lưu Phiếu Nhập Kho
            </button>
            <button
              onClick={() => {
                resetForm();
                setView("list");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {view === "detail" && selectedReceipt && (
        <div className="space-y-4">
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            ← Quay Lại
          </button>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Chi Tiết Phiếu Nhập Kho: {selectedReceipt.soPhieu}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày Nhập
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReceipt.ngayTao}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trạng Thái
                </p>
                <p
                  className={`text-lg font-semibold ${
                    selectedReceipt.trangThai === "Chờ xác nhận"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {selectedReceipt.trangThai}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nhà Cung Cấp
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedReceipt.tenNCC}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hình Thức Nhập
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedReceipt.hinhThucNhap === "theo-po"
                    ? "Theo PO"
                    : "Tự Do"}
                </p>
              </div>

              {selectedReceipt.hinhThucNhap === "theo-po" && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Số PO
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedReceipt.soPO}
                  </p>
                </div>
              )}

              {selectedReceipt.soHoaDonNCC && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Số Hóa Đơn NCC
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {selectedReceipt.soHoaDonNCC}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kho
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedReceipt.kho}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Danh Sách Mặt Hàng
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      STT
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Mã Hàng
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Tên Hàng
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Đơn Vị
                    </th>
                    {selectedReceipt.hinhThucNhap === "theo-po" && (
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                        SL Đặt
                      </th>
                    )}
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                      SL Nhập
                    </th>
                    {selectedReceipt.hinhThucNhap === "theo-po" && (
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Lệch
                      </th>
                    )}
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Đơn Giá
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Thành Tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.materials.map((material) => (
                    <tr
                      key={material.id}
                      className={`border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        selectedReceipt.hinhThucNhap === "theo-po" &&
                        material.chechusai !== 0
                          ? "bg-yellow-50 dark:bg-yellow-900/20"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {material.stt}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-semibold">
                        {material.maHang}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {material.tenHang}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {material.donVi}
                      </td>
                      {selectedReceipt.hinhThucNhap === "theo-po" && (
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                          {material.soLuongDatHang}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right font-semibold">
                        {material.soLuongNhap}
                      </td>
                      {selectedReceipt.hinhThucNhap === "theo-po" && (
                        <td
                          className={`px-4 py-3 text-sm text-right font-semibold ${
                            material.chechusai === 0
                              ? "text-green-600 dark:text-green-400"
                              : material.chechusai > 0
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {material.chechusai > 0 && "+"}
                          {material.chechusai}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                        {material.donGia.toLocaleString()} đ
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                        {(material.soLuongNhap * material.donGia).toLocaleString()}{" "}
                        đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Tổng Tiền: {selectedReceipt.tongTien.toLocaleString()} đ
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
