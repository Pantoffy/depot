"use client";

import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";

interface Material {
  stt: number;
  id: string;
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
  tenNCC: string;
  soHoaDonNCC?: string;
  kho: string;
  tongTien: number;
  soChungTu?: string;
  trangThai: "Chờ xác nhận" | "Đã xác nhận";
  materials: Material[];
}

export default function NhapKho() {
  // State for list and form
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: "PN001",
      ngayTao: "2026-01-20",
      soPhieu: "PN001",
      tenNCC: "Công ty ABC",
      soHoaDonNCC: "HD-001",
      kho: "kho-a",
      tongTien: 5000000,
      soChungTu: "CT-001",
      trangThai: "Chờ xác nhận",
      materials: [
        {
          stt: 1,
          id: "1",
          maHang: "H001",
          tenHang: "Bột mỳ",
          donVi: "kg",
          soLuong: 100,
          donGia: 50000,
        },
      ],
    },
  ]);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
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
    maHang: "",
    tenHang: "",
    donVi: "kg",
    soLuong: "",
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
    });
    setMaterials([]);
    setMaterialInput({
      maHang: "",
      tenHang: "",
      donVi: "kg",
      soLuong: "",
      donGia: "",
    });
  };

  // Handle form input change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle material input change
  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMaterialInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add material
  const addMaterial = () => {
    if (
      materialInput.maHang &&
      materialInput.tenHang &&
      materialInput.soLuong &&
      materialInput.donGia
    ) {
      const newMaterial: Material = {
        stt: materials.length + 1,
        id: Date.now().toString(),
        maHang: materialInput.maHang,
        tenHang: materialInput.tenHang,
        donVi: materialInput.donVi,
        soLuong: parseFloat(materialInput.soLuong),
        donGia: parseFloat(materialInput.donGia),
      };
      setMaterials((prev) => [...prev, newMaterial]);
      setMaterialInput({
        maHang: "",
        tenHang: "",
        donVi: "kg",
        soLuong: "",
        donGia: "",
      });
    } else {
      showToast("Vui lòng điền đầy đủ thông tin hàng hóa", "warning");
    }
  };

  // Remove material
  const removeMaterial = (id: string) => {
    setMaterials((prev) =>
      prev.filter((m) => m.id !== id).map((m, index) => ({
        ...m,
        stt: index + 1,
      }))
    );
  };

  // Calculate total
  const calculateTotal = () => {
    return materials.reduce((sum, m) => sum + m.soLuong * m.donGia, 0);
  };

  // Save receipt
  const handleSaveReceipt = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.soPhieu ||
      !formData.tenNCC ||
      !formData.kho ||
      materials.length === 0
    ) {
      showToast("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    if (view === "create") {
      const newReceipt: Receipt = {
        id: Date.now().toString(),
        soPhieu: formData.soPhieu,
        ngayTao: formData.ngayTao,
        tenNCC: formData.tenNCC,
        soHoaDonNCC: formData.soHoaDonNCC,
        kho: formData.kho,
        soChungTu: formData.soChungTu,
        tongTien: calculateTotal(),
        trangThai: "Chờ xác nhận",
        materials: materials,
      };
      setReceipts((prev) => [newReceipt, ...prev]);
      showToast("Phiếu nhập kho đã được tạo!", "success");
    } else if (view === "edit" && selectedReceipt) {
      setReceipts((prev) =>
        prev.map((r) =>
          r.id === selectedReceipt.id
            ? {
                ...r,
                soPhieu: formData.soPhieu,
                ngayTao: formData.ngayTao,
                tenNCC: formData.tenNCC,
                soHoaDonNCC: formData.soHoaDonNCC,
                kho: formData.kho,
                soChungTu: formData.soChungTu,
                tongTien: calculateTotal(),
                materials: materials,
              }
            : r
        )
      );
      showToast("Phiếu nhập kho đã được cập nhật!", "success");
    }

    resetForm();
    setView("list");
  };

  // Delete receipt
  const handleDeleteReceipt = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa phiếu nhập kho này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => {
        setReceipts((prev) => prev.filter((r) => r.id !== id));
        showToast("Phiếu nhập kho đã được xóa!", "success");
      },
    });
  };

  // Edit receipt
  const handleEditReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setFormData({
      soPhieu: receipt.soPhieu,
      ngayTao: receipt.ngayTao,
      tenNCC: receipt.tenNCC,
      soHoaDonNCC: receipt.soHoaDonNCC || "",
      kho: receipt.kho,
      soChungTu: receipt.soChungTu || "",
    });
    setMaterials(receipt.materials);
    setView("edit");
  };

  // View detail
  const handleViewDetail = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setView("detail");
  };

  // Confirm receipt
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

  // Cancel receipt
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

  const filteredReceipts = receipts.filter((receipt) =>
    searchTerm.toLowerCase() === ""
      ? true
      : receipt.soPhieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.tenNCC.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageMeta
        title="Quản lý phiếu nhập kho"
        description="Quản lý phiếu nhập kho nguyên liệu"
      />

      <PageBreadcrumb pageTitle="Quản lý phiếu nhập kho" />

      {view === "list" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={() => {
                resetForm();
                setView("create");
              }}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700 transition-colors"
            >
              + Thêm phiếu nhập kho
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm theo số phiếu hoặc nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <ComponentCard title={`Danh Sách Phiếu Nhập Kho (${filteredReceipts.length})`}>
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
                        Nhà Cung Cấp
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Kho
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
                    {filteredReceipts.map((receipt) => (
                      <TableRow
                        key={receipt.id}
                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {receipt.soPhieu}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(receipt.ngayTao).toLocaleDateString("vi-VN")}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {receipt.tenNCC}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {receipt.kho}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {receipt.tongTien.toLocaleString("vi-VN")} đ
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <Badge
                            color={
                              receipt.trangThai === "Đã xác nhận"
                                ? "success"
                                : "warning"
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
                                  onClick={() => handleEditReceipt(receipt)}
                                  title="Sửa"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 transition-colors"
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-4l4.35-4.35m0 0a2.828 2.828 0 114 4L9.172 20.172"
                                    />
                                  </svg>
                                </button>
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
        </div>
      )}

      {(view === "create" || view === "edit") && (
        <form onSubmit={handleSaveReceipt} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {view === "create"
                ? "Tạo phiếu nhập kho mới"
                : "Sửa phiếu nhập kho"}
            </h3>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setView("list");
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Thông tin phiếu nhập */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
              Thông tin phiếu nhập
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số phiếu *
                </label>
                <input
                  type="text"
                  name="soPhieu"
                  value={formData.soPhieu}
                  onChange={handleFormChange}
                  placeholder="Nhập số phiếu"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày tạo *
                </label>
                <input
                  type="date"
                  name="ngayTao"
                  value={formData.ngayTao}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nhà cung cấp *
                </label>
                <input
                  type="text"
                  name="tenNCC"
                  value={formData.tenNCC}
                  onChange={handleFormChange}
                  placeholder="Nhập tên NCC"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số hóa đơn NCC
                </label>
                <input
                  type="text"
                  name="soHoaDonNCC"
                  value={formData.soHoaDonNCC}
                  onChange={handleFormChange}
                  placeholder="Nhập số hóa đơn"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kho *
                </label>
                <select
                  name="kho"
                  value={formData.kho}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">-- Chọn kho --</option>
                  <option value="kho-a">Kho A</option>
                  <option value="kho-b">Kho B</option>
                  <option value="kho-c">Kho C</option>
                  <option value="kho-d">Kho D</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số chứng từ
                </label>
                <input
                  type="text"
                  name="soChungTu"
                  value={formData.soChungTu}
                  onChange={handleFormChange}
                  placeholder="Nhập số chứng từ"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Thêm hàng hóa */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
            <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
              Thêm hàng hóa
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã hàng
                </label>
                <input
                  type="text"
                  name="maHang"
                  value={materialInput.maHang}
                  onChange={handleMaterialChange}
                  placeholder="Mã hàng"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên hàng hóa *
                </label>
                <input
                  type="text"
                  name="tenHang"
                  value={materialInput.tenHang}
                  onChange={handleMaterialChange}
                  placeholder="Tên hàng"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đơn vị
                </label>
                <select
                  name="donVi"
                  value={materialInput.donVi}
                  onChange={handleMaterialChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="cái">cái</option>
                  <option value="hộp">hộp</option>
                  <option value="túi">túi</option>
                  <option value="chai">chai</option>
                  <option value="lon">lon</option>
                  <option value="gói">gói</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Số lượng *
                </label>
                <input
                  type="number"
                  name="soLuong"
                  value={materialInput.soLuong}
                  onChange={handleMaterialChange}
                  placeholder="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Đơn giá *
                </label>
                <input
                  type="number"
                  name="donGia"
                  value={materialInput.donGia}
                  onChange={handleMaterialChange}
                  placeholder="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addMaterial}
                  className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách hàng hóa */}
          {materials.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Danh sách hàng hóa
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        STT
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Mã hàng
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Tên hàng hóa
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Đơn vị
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Số lượng
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Đơn giá
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Thành tiền
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                          {material.stt}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                          {material.maHang}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                          {material.tenHang}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                          {material.donVi}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                          {material.soLuong}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                          {material.donGia.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-300">
                          {(material.soLuong * material.donGia).toLocaleString(
                            "vi-VN"
                          )}{" "}
                          đ
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => removeMaterial(material.id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="text-right">
                  <p className="mb-2 text-gray-600 dark:text-gray-400">
                    Tổng cộng:
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateTotal().toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setView("list");
              }}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              {view === "create" ? "Lưu phiếu" : "Cập nhật phiếu"}
            </button>
          </div>
        </form>
      )}

      {view === "detail" && selectedReceipt && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Chi tiết phiếu nhập kho
            </h3>
            <button
              onClick={() => setView("list")}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Detail */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Số phiếu
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReceipt.soPhieu}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày tạo
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedReceipt.ngayTao).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nhà cung cấp
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReceipt.tenNCC}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Số hóa đơn NCC
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReceipt.soHoaDonNCC || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Kho</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReceipt.kho}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Số chứng từ
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedReceipt.soChungTu || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tổng tiền
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {selectedReceipt.tongTien.toLocaleString("vi-VN")} đ
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trạng thái
                </p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedReceipt.trangThai === "Đã xác nhận"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {selectedReceipt.trangThai}
                </span>
              </div>
            </div>
          </div>

          {/* Materials detail */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-gray-dark">
            <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Danh sách hàng hóa
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      STT
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      Mã hàng
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      Tên hàng hóa
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      Đơn vị
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      Đơn giá
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectedReceipt.materials.map((material) => (
                    <tr key={material.id}>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {material.stt}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {material.maHang}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {material.tenHang}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {material.donVi}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {material.soLuong}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {material.donGia.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-300">
                        {(material.soLuong * material.donGia).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="text-right">
                <p className="mb-2 text-gray-600 dark:text-gray-400">
                  Tổng cộng:
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedReceipt.tongTien.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setView("list")}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Quay lại
            </button>

            {selectedReceipt.trangThai === "Chờ xác nhận" && (
              <>
                <button
                  onClick={() => handleEditReceipt(selectedReceipt)}
                  className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Sửa
                </button>
                <button
                  onClick={() => {
                    handleDeleteReceipt(selectedReceipt.id);
                    setView("list");
                  }}
                  className="rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Xóa
                </button>
                <button
                  onClick={() => {
                    handleConfirmReceipt(selectedReceipt.id);
                    setView("list");
                  }}
                  className="rounded-lg bg-green-500 px-6 py-2 text-sm font-medium text-white hover:bg-green-600"
                >
                  Xác nhận
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

