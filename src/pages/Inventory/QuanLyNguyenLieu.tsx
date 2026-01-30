"use client";

import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";

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
      <PageMeta title="Quản Lý Nguyên Liệu" description="Quản Lý Nguyên Liệu" />
      <PageBreadcrumb pageTitle="Quản Lý Nguyên Liệu" />

      {view === "list" && (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Danh Sách Nguyên Liệu
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Quản lý kho và theo dõi tồn kho của bạn
                </p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setView("create");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm Nguyên Liệu
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Lọc
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Nguyên Liệu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Danh Mục
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      NCC
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tồn Kho
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Giá Nhập
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Ngày Tạo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {/* Action column */}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {material.maHang.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {material.tenHang}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {material.maHang}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {material.donVi}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {material.nhaCungCapChinh}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white w-10 text-right">
                            {material.soLuongTon}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            material.soLuongTon > 50
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : material.soLuongTon > 20
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {material.soLuongTon > 30 ? 'Tồn kho đủ dùng' : material.soLuongTon > 10 ? 'Tồn kho thấp' : 'Thiếu hàng'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {material.donGiaNhap.toLocaleString()} đ
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {material.ngayTao}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(material)}
                            title="Xem chi tiết"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditMaterial(material)}
                            title="Sửa"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-4l4.35-4.35m0 0a2.828 2.828 0 114 4L9.172 20.172" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(material.id)}
                            title="Xóa"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMaterials.length === 0 && (
              <div className="py-12 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Không có nguyên liệu nào
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị 1 - {filteredMaterials.length} của {filteredMaterials.length}
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                ←
              </button>
              <button className="px-3 py-1 rounded bg-blue-600 text-white font-semibold">
                1
              </button>
              <button className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                →
              </button>
            </div>
          </div>
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
