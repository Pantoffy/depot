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
  id: string;
  maHang: string;
  tenHang: string;
  donVi: string;
  soLuongTon: number;
  donGiaNhap: number;
  donGiaXuat: number;
  nhaCungCapChinh: string;
  moTa: string;
  hinhAnh?: string;
  ngayTao: string;
}

export default function QuanLyNguyenLieu() {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: "1",
      maHang: "H001",
      tenHang: "Bột mỳ",
      donVi: "kg",
      soLuongTon: 100,
      donGiaNhap: 50000,
      donGiaXuat: 60000,
      nhaCungCapChinh: "Công ty ABC",
      moTa: "Bột mỳ loại 1",
      ngayTao: "2026-01-20",
    },
  ]);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    maHang: "",
    tenHang: "",
    donVi: "kg",
    soLuongTon: "",
    donGiaNhap: "",
    donGiaXuat: "",
    nhaCungCapChinh: "",
    moTa: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      maHang: "",
      tenHang: "",
      donVi: "kg",
      soLuongTon: "",
      donGiaNhap: "",
      donGiaXuat: "",
      nhaCungCapChinh: "",
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

  // Save material
  const handleSaveMaterial = () => {
    if (!formData.maHang || !formData.tenHang) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    if (view === "create") {
      const newMaterial: Material = {
        id: Date.now().toString(),
        maHang: formData.maHang,
        tenHang: formData.tenHang,
        donVi: formData.donVi,
        soLuongTon: parseFloat(formData.soLuongTon) || 0,
        donGiaNhap: parseFloat(formData.donGiaNhap) || 0,
        donGiaXuat: parseFloat(formData.donGiaXuat) || 0,
        nhaCungCapChinh: formData.nhaCungCapChinh,
        moTa: formData.moTa,
        ngayTao: new Date().toISOString().split("T")[0],
      };
      setMaterials([...materials, newMaterial]);
      showToast("Nguyên liệu đã được tạo thành công!", "success");
    } else if (view === "edit" && selectedMaterial) {
      setMaterials(
        materials.map((m) =>
          m.id === selectedMaterial.id
            ? {
                ...m,
                maHang: formData.maHang,
                tenHang: formData.tenHang,
                donVi: formData.donVi,
                soLuongTon: parseFloat(formData.soLuongTon) || 0,
                donGiaNhap: parseFloat(formData.donGiaNhap) || 0,
                donGiaXuat: parseFloat(formData.donGiaXuat) || 0,
                nhaCungCapChinh: formData.nhaCungCapChinh,
                moTa: formData.moTa,
              }
            : m
        )
      );
      showToast("Nguyên liệu đã được cập nhật!", "success");
    }

    resetForm();
    setView("list");
  };

  // Delete material
  const handleDeleteMaterial = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa nguyên liệu này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => {
        setMaterials(materials.filter((m) => m.id !== id));
        showToast("Nguyên liệu đã được xóa!", "success");
      },
    });
  };

  // Edit material
  const handleEditMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      maHang: material.maHang,
      tenHang: material.tenHang,
      donVi: material.donVi,
      soLuongTon: material.soLuongTon.toString(),
      donGiaNhap: material.donGiaNhap.toString(),
      donGiaXuat: material.donGiaXuat.toString(),
      nhaCungCapChinh: material.nhaCungCapChinh,
      moTa: material.moTa,
    });
    setView("edit");
  };

  // View detail
  const handleViewDetail = (material: Material) => {
    setSelectedMaterial(material);
    setView("detail");
  };

  // Filter materials
  const filteredMaterials = materials.filter((material) =>
    searchTerm.toLowerCase() === ""
      ? true
      : material.maHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tenHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.nhaCungCapChinh.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Quản Lý Nguyên Liệu" />
      <PageBreadcrumb pageName="Quản Lý Nguyên Liệu" />

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
              + Thêm Nguyên Liệu
            </button>
            
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên hàng hoặc nhà cung cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <ComponentCard title={`Danh Sách Nguyên Liệu (${filteredMaterials.length})`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Mã Hàng
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Tên Hàng
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Đơn Vị
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Tồn Kho
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        NCC Chính
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Đơn Giá Nhập
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Đơn Giá Xuất
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
                    {filteredMaterials.map((material) => (
                      <TableRow
                        key={material.id}
                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {material.maHang}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {material.tenHang}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {material.donVi}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {material.soLuongTon}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {material.nhaCungCapChinh}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {material.donGiaNhap.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {material.donGiaXuat.toLocaleString()} đ
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(material)}
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
                              onClick={() => handleEditMaterial(material)}
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
                              onClick={() => handleDeleteMaterial(material.id)}
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {materials.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Không có nguyên liệu nào
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
                Mã Hàng
              </label>
              <input
                type="text"
                name="maHang"
                value={formData.maHang}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="H001"
                disabled={view === "edit"}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tên Hàng
              </label>
              <input
                type="text"
                name="tenHang"
                value={formData.tenHang}
                onChange={handleFormChange}
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
                value={formData.donVi}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option>kg</option>
                <option>cái</option>
                <option>thùng</option>
                <option>liter</option>
                <option>m</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Số Lượng Tồn
              </label>
              <input
                type="number"
                name="soLuongTon"
                value={formData.soLuongTon}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Đơn Giá Nhập
              </label>
              <input
                type="number"
                name="donGiaNhap"
                value={formData.donGiaNhap}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Đơn Giá Xuất
              </label>
              <input
                type="number"
                name="donGiaXuat"
                value={formData.donGiaXuat}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="60000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                NCC Chính
              </label>
              <input
                type="text"
                name="nhaCungCapChinh"
                value={formData.nhaCungCapChinh}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Công ty ABC"
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
                placeholder="Mô tả chi tiết về nguyên liệu..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveMaterial}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              💾 Lưu Nguyên Liệu
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

      {view === "detail" && selectedMaterial && (
        <div className="space-y-4">
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            ← Quay Lại
          </button>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedMaterial.maHang} - {selectedMaterial.tenHang}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mã Hàng
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedMaterial.maHang}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tên Hàng
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedMaterial.tenHang}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đơn Vị
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedMaterial.donVi}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Số Lượng Tồn
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedMaterial.soLuongTon}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đơn Giá Nhập
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedMaterial.donGiaNhap.toLocaleString()} đ
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đơn Giá Xuất
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedMaterial.donGiaXuat.toLocaleString()} đ
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lợi Nhuận / Đơn Vị
                </p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {(selectedMaterial.donGiaXuat - selectedMaterial.donGiaNhap).toLocaleString()} đ
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  NCC Chính
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedMaterial.nhaCungCapChinh}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mô Tả
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedMaterial.moTa || "Không có mô tả"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày Tạo
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedMaterial.ngayTao}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
