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

interface Warehouse {
  id: string;
  tenKho: string;
  diaChiKho: string;
  dienTich: number;
  nguoiQuanLy: string;
  sdtNguoiQuanLy: string;
  moTa: string;
  ngayTao: string;
  trangThai: "Hoạt động" | "Vô hiệu hóa";
}

export default function QuanLyKho() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: "1",
      tenKho: "Kho A",
      diaChiKho: "123 Đường ABC, TP HCM",
      dienTich: 500,
      nguoiQuanLy: "Trần Văn B",
      sdtNguoiQuanLy: "0987654321",
      moTa: "Kho chính lưu trữ bột mỳ và lương khô",
      ngayTao: "2026-01-01",
      trangThai: "Hoạt động",
    },
  ]);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    tenKho: "",
    diaChiKho: "",
    dienTich: "",
    nguoiQuanLy: "",
    sdtNguoiQuanLy: "",
    moTa: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      tenKho: "",
      diaChiKho: "",
      dienTich: "",
      nguoiQuanLy: "",
      sdtNguoiQuanLy: "",
      moTa: "",
    });
  };

  // Handle form change
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save warehouse
  const handleSaveWarehouse = () => {
    if (!formData.tenKho || !formData.diaChiKho || !formData.dienTich) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    if (view === "create") {
      const newWarehouse: Warehouse = {
        id: Date.now().toString(),
        tenKho: formData.tenKho,
        diaChiKho: formData.diaChiKho,
        dienTich: parseFloat(formData.dienTich) || 0,
        nguoiQuanLy: formData.nguoiQuanLy,
        sdtNguoiQuanLy: formData.sdtNguoiQuanLy,
        moTa: formData.moTa,
        ngayTao: new Date().toISOString().split("T")[0],
        trangThai: "Hoạt động",
      };
      setWarehouses([...warehouses, newWarehouse]);
      showToast("Kho đã được tạo thành công!", "success");
    } else if (view === "edit" && selectedWarehouse) {
      setWarehouses(
        warehouses.map((w) =>
          w.id === selectedWarehouse.id
            ? {
                ...w,
                tenKho: formData.tenKho,
                diaChiKho: formData.diaChiKho,
                dienTich: parseFloat(formData.dienTich) || 0,
                nguoiQuanLy: formData.nguoiQuanLy,
                sdtNguoiQuanLy: formData.sdtNguoiQuanLy,
                moTa: formData.moTa,
              }
            : w
        )
      );
      showToast("Kho đã được cập nhật!", "success");
    }

    resetForm();
    setView("list");
  };

  // Delete warehouse
  const handleDeleteWarehouse = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa kho này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => {
        setWarehouses((prev) => prev.filter((w) => w.id !== id));
        showToast("Kho đã được xóa!", "success");
      },
    });
  };

  // Edit warehouse
  const handleEditWarehouse = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      tenKho: warehouse.tenKho,
      diaChiKho: warehouse.diaChiKho,
      dienTich: warehouse.dienTich.toString(),
      nguoiQuanLy: warehouse.nguoiQuanLy,
      sdtNguoiQuanLy: warehouse.sdtNguoiQuanLy,
      moTa: warehouse.moTa,
    });
    setView("edit");
  };

  // View detail
  const handleViewDetail = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setView("detail");
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setWarehouses(
      warehouses.map((w) =>
        w.id === id
          ? {
              ...w,
              trangThai: w.trangThai === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động",
            }
          : w
      )
    );
  };

  const filteredWarehouses = warehouses.filter((warehouse) =>
    searchTerm.toLowerCase() === ""
      ? true
      : warehouse.tenKho.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.diaChiKho.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Quản Lý Kho" />
      <PageBreadcrumb pageTitle="Quản Lý Kho" />

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
              + Thêm Kho
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <ComponentCard title={`Danh Sách Kho (${filteredWarehouses.length})`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Tên Kho
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Địa Chỉ
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Diện Tích (m²)
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Người Quản Lý
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        SĐT
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
                    {filteredWarehouses.map((warehouse) => (
                      <TableRow
                        key={warehouse.id}
                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {warehouse.tenKho}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {warehouse.diaChiKho}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {warehouse.dienTich}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {warehouse.nguoiQuanLy}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {warehouse.sdtNguoiQuanLy}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <Badge
                            color={
                              warehouse.trangThai === "Hoạt động"
                                ? "success"
                                : "danger"
                            }
                          >
                            {warehouse.trangThai}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(warehouse)}
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
                            <button
                              onClick={() => handleEditWarehouse(warehouse)}
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
                              onClick={() => handleDeleteWarehouse(warehouse.id)}
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
                              onClick={() => handleToggleStatus(warehouse.id)}
                              title={warehouse.trangThai === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}
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
                                  d="M8 7a4 4 0 100 8 4 4 0 000-8zM6 15H4a2 2 0 00-2 2v3h20v-3a2 2 0 00-2-2h-2"
                                />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {warehouses.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Không có kho nào
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
                Tên Kho
              </label>
              <input
                type="text"
                name="tenKho"
                value={formData.tenKho}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Kho A"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Diện Tích (m²)
              </label>
              <input
                type="number"
                name="dienTich"
                value={formData.dienTich}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Địa Chỉ
              </label>
              <input
                type="text"
                name="diaChiKho"
                value={formData.diaChiKho}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="123 Đường ABC, TP HCM"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Người Quản Lý
              </label>
              <input
                type="text"
                name="nguoiQuanLy"
                value={formData.nguoiQuanLy}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Trần Văn B"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                SĐT Người Quản Lý
              </label>
              <input
                type="text"
                name="sdtNguoiQuanLy"
                value={formData.sdtNguoiQuanLy}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="0987654321"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Mô Tả
              </label>
              <textarea
                name="moTa"
                value={formData.moTa}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white h-20"
                placeholder="Mô tả chi tiết về kho..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveWarehouse}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              💾 Lưu Kho
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

      {view === "detail" && selectedWarehouse && (
        <div className="space-y-4">
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            ← Quay Lại
          </button>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedWarehouse.tenKho}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Địa Chỉ
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedWarehouse.diaChiKho}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Diện Tích
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedWarehouse.dienTich} m²
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Người Quản Lý
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedWarehouse.nguoiQuanLy}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SĐT
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedWarehouse.sdtNguoiQuanLy}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trạng Thái
                </p>
                <p
                  className={`font-semibold ${
                    selectedWarehouse.trangThai === "Hoạt động"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {selectedWarehouse.trangThai}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày Tạo
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedWarehouse.ngayTao}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mô Tả
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedWarehouse.moTa || "Không có mô tả"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
