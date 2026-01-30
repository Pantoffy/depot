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

export default function DonDatHang() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
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
      ],
    },
  ]);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState({
    soPO: "",
    ngayTao: new Date().toISOString().split("T")[0],
    tenNCC: "",
    diaChiNCC: "",
    sdtNCC: "",
    ngayGiaoHang: "",
    diaDiemGiao: "",
  });

  const [details, setDetails] = useState<PODetail[]>([]);
  const [detailInput, setDetailInput] = useState({
    maHang: "",
    tenHang: "",
    donVi: "kg",
    soLuong: "",
    donGia: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      soPO: "",
      ngayTao: new Date().toISOString().split("T")[0],
      tenNCC: "",
      diaChiNCC: "",
      sdtNCC: "",
      ngayGiaoHang: "",
      diaDiemGiao: "",
    });
    setDetails([]);
    setDetailInput({
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

  // Handle detail input change
  const handleDetailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDetailInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add detail to list
  const addDetail = () => {
    if (
      detailInput.maHang &&
      detailInput.tenHang &&
      detailInput.soLuong &&
      detailInput.donGia
    ) {
      const newDetail: PODetail = {
        stt: details.length + 1,
        id: Date.now().toString(),
        maHang: detailInput.maHang,
        tenHang: detailInput.tenHang,
        donVi: detailInput.donVi,
        soLuong: parseFloat(detailInput.soLuong),
        donGia: parseFloat(detailInput.donGia),
      };
      setDetails([...details, newDetail]);
      setDetailInput({
        maHang: "",
        tenHang: "",
        donVi: "kg",
        soLuong: "",
        donGia: "",
      });
    }
  };

  // Remove detail from list
  const removeDetail = (id: string) => {
    const updatedDetails = details
      .filter((d) => d.id !== id)
      .map((d, index) => ({
        ...d,
        stt: index + 1,
      }));
    setDetails(updatedDetails);
  };

  // Calculate total
  const calculateTotal = () => {
    return details.reduce((sum, detail) => sum + detail.soLuong * detail.donGia, 0);
  };

  // Save or update PO
  const handleSavePO = () => {
    if (!formData.soPO || !formData.tenNCC || details.length === 0) {
      showToast("Vui lòng điền đầy đủ thông tin và thêm ít nhất 1 mặt hàng!", "warning");
      return;
    }

    if (view === "create") {
      const newPO: PurchaseOrder = {
        id: Date.now().toString(),
        soPO: formData.soPO,
        ngayTao: formData.ngayTao,
        tenNCC: formData.tenNCC,
        diaChiNCC: formData.diaChiNCC,
        sdtNCC: formData.sdtNCC,
        ngayGiaoHang: formData.ngayGiaoHang,
        diaDiemGiao: formData.diaDiemGiao,
        tongTien: calculateTotal(),
        trangThai: "Chờ giao",
        details: details,
      };
      setPurchaseOrders([...purchaseOrders, newPO]);
      showToast("Đơn đặt hàng đã được tạo thành công!", "success");
    } else if (view === "edit" && selectedPO) {
      setPurchaseOrders(
        purchaseOrders.map((po) =>
          po.id === selectedPO.id
            ? {
                ...po,
                soPO: formData.soPO,
                ngayTao: formData.ngayTao,
                tenNCC: formData.tenNCC,
                diaChiNCC: formData.diaChiNCC,
                sdtNCC: formData.sdtNCC,
                ngayGiaoHang: formData.ngayGiaoHang,
                diaDiemGiao: formData.diaDiemGiao,
                tongTien: calculateTotal(),
                details: details,
              }
            : po
        )
      );
      showToast("Đơn đặt hàng đã được cập nhật!", "success");
    }

    resetForm();
    setView("list");
  };

  // Delete PO
  const handleDeletePO = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa đơn đặt hàng này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => {
        setPurchaseOrders(purchaseOrders.filter((po) => po.id !== id));
        showToast("Đơn đặt hàng đã được xóa!", "success");
      },
    });
  };

  // Edit PO
  const handleEditPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setFormData({
      soPO: po.soPO,
      ngayTao: po.ngayTao,
      tenNCC: po.tenNCC,
      diaChiNCC: po.diaChiNCC,
      sdtNCC: po.sdtNCC,
      ngayGiaoHang: po.ngayGiaoHang,
      diaDiemGiao: po.diaDiemGiao,
    });
    setDetails(po.details);
    setView("edit");
  };

  // View detail
  const handleViewDetail = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setView("detail");
  };

  // Confirm delivery
  const handleConfirmDelivery = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn đơn hàng này đã được giao?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onConfirm: () => {
        setPurchaseOrders((prev) =>
          prev.map((po) =>
            po.id === id ? { ...po, trangThai: "Đã giao" } : po
          )
        );
        showToast("Trạng thái đơn đặt hàng đã được cập nhật!", "success");
      },
    });
  };

  // Cancel PO
  const handleCancelPO = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn hủy đơn đặt hàng này?",
      okText: "Hủy",
      cancelText: "Hủy",
      onConfirm: () => {
        setPurchaseOrders((prev) =>
          prev.map((po) =>
            po.id === id ? { ...po, trangThai: "Hủy" } : po
          )
        );
        showToast("Đơn đặt hàng đã được hủy!", "success");
      },
    });
  };

  const filteredPurchaseOrders = purchaseOrders.filter((po) =>
    searchTerm.toLowerCase() === ""
      ? true
      : po.soPO.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.tenNCC.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Đơn Đặt Hàng" />
      <PageBreadcrumb pageTitle="Đơn Đặt Hàng" />

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
              + Tạo Đơn Đặt Hàng
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm theo số PO hoặc tên nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <ComponentCard title={`Danh Sách Đơn Đặt Hàng (${filteredPurchaseOrders.length})`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Số PO
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
                        Ngày Giao
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
                    {filteredPurchaseOrders.map((po) => (
                      <TableRow
                        key={po.id}
                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {po.soPO}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {po.ngayTao}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {po.tenNCC}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {po.ngayGiaoHang}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {po.tongTien.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <Badge
                            color={
                              po.trangThai === "Chờ giao"
                                ? "warning"
                                : po.trangThai === "Đã giao"
                                ? "success"
                                : "danger"
                            }
                          >
                            {po.trangThai}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(po)}
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
                            {po.trangThai === "Chờ giao" && (
                              <>
                                <button
                                  onClick={() => handleEditPO(po)}
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
                              onClick={() => handleDeletePO(po.id)}
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
                              onClick={() => handleConfirmDelivery(po.id)}
                              title="Xác nhận đã giao"
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
                        {po.trangThai === "Đã giao" && (
                          <button
                            onClick={() => handleCancelPO(po.id)}
                            title="Hủy đơn"
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

            {purchaseOrders.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Không có đơn đặt hàng nào
              </div>
            )}
          </ComponentCard>
        </div>
      )}

      {(view === "create" || view === "edit") && (
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
                Số PO
              </label>
              <input
                type="text"
                name="soPO"
                value={formData.soPO}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="VD: PO-2026-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ngày Tạo
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
                Tên Nhà Cung Cấp
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
                Địa Chỉ NCC
              </label>
              <input
                type="text"
                name="diaChiNCC"
                value={formData.diaChiNCC}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="123 Đường ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                SĐT NCC
              </label>
              <input
                type="text"
                name="sdtNCC"
                value={formData.sdtNCC}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0901234567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ngày Giao Hàng
              </label>
              <input
                type="date"
                name="ngayGiaoHang"
                value={formData.ngayGiaoHang}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Địa Điểm Giao
              </label>
              <input
                type="text"
                name="diaDiemGiao"
                value={formData.diaDiemGiao}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Kho A"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Chi Tiết Mặt Hàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mã Hàng
                </label>
                <input
                  type="text"
                  name="maHang"
                  value={detailInput.maHang}
                  onChange={handleDetailChange}
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
                  value={detailInput.tenHang}
                  onChange={handleDetailChange}
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
                  value={detailInput.donVi}
                  onChange={handleDetailChange}
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
                  name="soLuong"
                  value={detailInput.soLuong}
                  onChange={handleDetailChange}
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
                  value={detailInput.donGia}
                  onChange={handleDetailChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="50000"
                />
              </div>
            </div>

            <button
              onClick={addDetail}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              + Thêm Mặt Hàng
            </button>

            {details.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600">
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
                    {details.map((detail) => (
                      <tr
                        key={detail.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-2">{detail.stt}</td>
                        <td className="px-4 py-2">{detail.maHang}</td>
                        <td className="px-4 py-2">{detail.tenHang}</td>
                        <td className="px-4 py-2 text-right">
                          {detail.soLuong} {detail.donVi}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {detail.donGia.toLocaleString()} đ
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          {(detail.soLuong * detail.donGia).toLocaleString()} đ
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => removeDetail(detail.id)}
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
              onClick={handleSavePO}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              💾 Lưu Đơn Đặt Hàng
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

      {view === "detail" && selectedPO && (
        <div className="space-y-4">
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            ← Quay Lại
          </button>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Chi Tiết Đơn Đặt Hàng: {selectedPO.soPO}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày Tạo
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedPO.ngayTao}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trạng Thái
                </p>
                <p
                  className={`text-lg font-semibold ${
                    selectedPO.trangThai === "Chờ giao"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : selectedPO.trangThai === "Đã giao"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {selectedPO.trangThai}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nhà Cung Cấp
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedPO.tenNCC}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Địa Chỉ
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedPO.diaChiNCC}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SĐT NCC
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedPO.sdtNCC}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày Giao Dự Kiến
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedPO.ngayGiaoHang}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Địa Điểm Giao
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedPO.diaDiemGiao}
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
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Số Lượng
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Đơn Giá
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Thành Tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.details.map((detail) => (
                    <tr
                      key={detail.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {detail.stt}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-semibold">
                        {detail.maHang}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {detail.tenHang}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {detail.donVi}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                        {detail.soLuong}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                        {detail.donGia.toLocaleString()} đ
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">
                        {(detail.soLuong * detail.donGia).toLocaleString()} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                Tổng Tiền: {selectedPO.tongTien.toLocaleString()} đ
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
