"use client";

import { useState, useRef } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";
import { showConfirm } from "../../components/common/ConfirmDialog";

interface Material {
  stt: number;
  id: string;
  maHang: string;
  tenHang: string;
  donVi: string;
  soLuong: number;
  donGia: number;
}

interface ExportReceipt {
  id: string;
  ngayTao: string;
  soPhieu: string;
  nguoiNhan: string;
  soChungTu?: string;
  kho: string;
  tongTien: number;
  lyDo: string;
  trangThai: "Chờ xác nhận" | "Đã xác nhận";
  materials: Material[];
}

export default function XuatKho() {
  const [receipts, setReceipts] = useState<ExportReceipt[]>([
    {
      id: "EX001",
      ngayTao: "2026-01-20",
      soPhieu: "EX001",
      nguoiNhan: "Cửa hàng số 1",
      soChungTu: "CT-001",
      kho: "kho-a",
      tongTien: 3500000,
      lyDo: "Bán hàng",
      trangThai: "Chờ xác nhận",
      materials: [
        { stt: 1, id: "1", maHang: "H001", tenHang: "Bột mỳ", donVi: "kg", soLuong: 50, donGia: 50000 },
      ],
    },
    {
      id: "EX002",
      ngayTao: "2026-01-18",
      soPhieu: "EX002",
      nguoiNhan: "Cửa hàng số 2",
      soChungTu: "CT-002",
      kho: "kho-b",
      tongTien: 2800000,
      lyDo: "Bán hàng",
      trangThai: "Đã xác nhận",
      materials: [
        { stt: 1, id: "2", maHang: "H002", tenHang: "Đường trắng", donVi: "kg", soLuong: 100, donGia: 28000 },
      ],
    },
    {
      id: "EX003",
      ngayTao: "2026-01-15",
      soPhieu: "EX003",
      nguoiNhan: "Cửa hàng số 3",
      soChungTu: "CT-003",
      kho: "kho-c",
      tongTien: 1500000,
      lyDo: "Bán hàng",
      trangThai: "Đã xác nhận",
      materials: [
        { stt: 1, id: "3", maHang: "H003", tenHang: "Bơ thực vật", donVi: "kg", soLuong: 25, donGia: 60000 },
      ],
    },
  ]);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<ExportReceipt | null>(null);
  const [sortBy, setSortBy] = useState<"ngayTao" | "tongTien">("ngayTao");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ kho: "", trangThai: "" });
  const [filterSearch, setFilterSearch] = useState({ kho: "", trangThai: "" });

  const [formData, setFormData] = useState({
    soPhieu: "",
    ngayTao: new Date().toISOString().split("T")[0],
    nguoiNhan: "",
    soChungTu: "",
    kho: "",
    lyDo: "Bán hàng",
  });

  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialInput, setMaterialInput] = useState({
    maHang: "",
    tenHang: "",
    donVi: "kg",
    soLuong: "",
    donGia: "",
  });

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
    setMaterialInput({ maHang: "", tenHang: "", donVi: "kg", soLuong: "", donGia: "" });
  };

  const handleAddMaterial = () => {
    if (!materialInput.maHang || !materialInput.tenHang || !materialInput.soLuong || !materialInput.donGia) {
      showToast("Vui lòng điền đầy đủ thông tin hàng hóa", "error");
      return;
    }

    const newMaterial: Material = {
      stt: materials.length + 1,
      id: Math.random().toString(),
      maHang: materialInput.maHang,
      tenHang: materialInput.tenHang,
      donVi: materialInput.donVi,
      soLuong: Number(materialInput.soLuong),
      donGia: Number(materialInput.donGia),
    };

    setMaterials([...materials, newMaterial]);
    setMaterialInput({ maHang: "", tenHang: "", donVi: "kg", soLuong: "", donGia: "" });
    showToast("Thêm hàng hóa thành công", "success");
  };

  const handleSaveReceipt = () => {
    if (!formData.soPhieu || !formData.nguoiNhan || !formData.kho || materials.length === 0) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const totalAmount = materials.reduce((sum, m) => sum + m.soLuong * m.donGia, 0);
    const newReceipt: ExportReceipt = {
      id: formData.soPhieu,
      ngayTao: formData.ngayTao,
      soPhieu: formData.soPhieu,
      nguoiNhan: formData.nguoiNhan,
      soChungTu: formData.soChungTu,
      kho: formData.kho,
      tongTien: totalAmount,
      lyDo: formData.lyDo,
      trangThai: "Chờ xác nhận",
      materials: materials,
    };

    setReceipts([...receipts, newReceipt]);
    resetForm();
    setView("list");
    showToast("Tạo phiếu xuất kho thành công", "success");
  };

  const handleDeleteReceipt = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa phiếu xuất này?",
      onConfirm: () => {
        setReceipts(receipts.filter((r) => r.id !== id));
      },
    });
  };

  const handleStatusChange = (id: string) => {
    setReceipts(
      receipts.map((r) =>
        r.id === id
          ? {
              ...r,
              trangThai: r.trangThai === "Chờ xác nhận" ? "Đã xác nhận" : "Chờ xác nhận",
            }
          : r
      )
    );
    showToast("Cập nhật trạng thái thành công", "success");
  };

  // Filter and sort
  const filteredReceipts = receipts
    .filter(
      (r) =>
        (r.soPhieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
         r.nguoiNhan.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filters.kho || r.kho === filters.kho) &&
        (!filters.trangThai || r.trangThai === filters.trangThai)
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "ngayTao") {
        comparison = new Date(a.ngayTao).getTime() - new Date(b.ngayTao).getTime();
      } else if (sortBy === "tongTien") {
        comparison = a.tongTien - b.tongTien;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

  const paginatedReceipts = filteredReceipts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);

  if (view === "list") {
    return (
      <div className="space-y-4">
        <PageBreadcrumb pageTitle="Phiếu Xuất Kho" />
        <PageMeta title="Phiếu Xuất Kho" description="Quản lý phiếu xuất kho" />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh Sách Phiếu Xuất Kho
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý phiếu xuất kho hàng hóa và theo dõi bán hàng.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
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

          {/* Search and Filter Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 overflow-visible">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filter
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
                            <input
                            type="text"
                            placeholder="Tìm kho..."
                            value={filterSearch.kho}
                            onChange={(e) => setFilterSearch({ ...filterSearch, kho: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {["kho-a", "kho-b", "kho-c"].filter(k => k.includes(filterSearch.kho.toLowerCase())).map(kho => (
                              <label key={kho} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.kho === kho}
                                  onChange={(e) => setFilters({ ...filters, kho: e.target.checked ? kho : "" })}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{kho}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Trạng Thái
                          </label>
                          <input
                            type="text"
                            placeholder="Tìm trạng thái..."
                            value={filterSearch.trangThai}
                            onChange={(e) => setFilterSearch({ ...filterSearch, trangThai: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                            {["Chờ xác nhận", "Đã xác nhận"].filter(s => s.toLowerCase().includes(filterSearch.trangThai.toLowerCase())).map(status => (
                              <label key={status} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.trangThai === status}
                                  onChange={(e) => setFilters({ ...filters, trangThai: e.target.checked ? status : "" })}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                          <button
                            onClick={() => setIsFilterOpen(false)}
                            className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "ngayTao" | "tongTien")}
                  className="px-3 py-2.5 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ngayTao">Sắp xếp theo ngày</option>
                  <option value="tongTien">Sắp xếp theo tiền</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Số Phiếu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Người Nhận
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Kho
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Tổng Tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedReceipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {receipt.soPhieu}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(receipt.ngayTao).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {receipt.nguoiNhan}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {receipt.kho}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {receipt.tongTien.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${
                          receipt.trangThai === "Đã xác nhận"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                        }`}
                      >
                        {receipt.trangThai}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <ActionDropdown
                          onView={() => {
                            setSelectedReceipt(receipt);
                            setView("detail");
                          }}
                          onEdit={() => {
                            setSelectedReceipt(receipt);
                            setFormData({
                              soPhieu: receipt.soPhieu,
                              ngayTao: receipt.ngayTao,
                              nguoiNhan: receipt.nguoiNhan,
                              soChungTu: receipt.soChungTu || "",
                              kho: receipt.kho,
                              lyDo: receipt.lyDo,
                            });
                            setMaterials(receipt.materials);
                            setView("edit");
                          }}
                          onDelete={() => handleDeleteReceipt(receipt.id)}
                          onStatusChange={() => handleStatusChange(receipt.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
              {Math.min(currentPage * itemsPerPage, filteredReceipts.length)} trong{" "}
              {filteredReceipts.length} phiếu
            </p>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-4">
        <PageBreadcrumb
          pageTitle={view === "create" ? "Thêm Phiếu Xuất" : "Chỉnh Sửa Phiếu Xuất"}
        />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {view === "create" ? "Tạo Phiếu Xuất Mới" : "Chỉnh Sửa Phiếu Xuất"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nhập thông tin phiếu xuất kho và danh sách hàng hóa
            </p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Phiếu
              </label>
              <input
                type="text"
                value={formData.soPhieu}
                onChange={(e) => setFormData({ ...formData, soPhieu: e.target.value })}
                placeholder="EX001"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày Tạo
              </label>
              <input
                type="date"
                value={formData.ngayTao}
                onChange={(e) => setFormData({ ...formData, ngayTao: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, nguoiNhan: e.target.value })}
                placeholder="Tên cửa hàng"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lý Do Xuất
              </label>
              <select
                value={formData.lyDo}
                onChange={(e) => setFormData({ ...formData, lyDo: e.target.value })}
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
              <select
                value={formData.kho}
                onChange={(e) => setFormData({ ...formData, kho: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn kho</option>
                <option value="kho-a">Kho A</option>
                <option value="kho-b">Kho B</option>
                <option value="kho-c">Kho C</option>
              </select>
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
                placeholder="CT-001"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Materials Section */}
          <div className="mb-8 p-4 lg:p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/30">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Thêm Hàng Hóa
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Mã Hàng
                </label>
                <input
                  type="text"
                  value={materialInput.maHang}
                  onChange={(e) =>
                    setMaterialInput({ ...materialInput, maHang: e.target.value })
                  }
                  placeholder="H001"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tên Hàng
                </label>
                <input
                  type="text"
                  value={materialInput.tenHang}
                  onChange={(e) =>
                    setMaterialInput({ ...materialInput, tenHang: e.target.value })
                  }
                  placeholder="Bột mỳ"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Đơn Vị
                </label>
                <select
                  value={materialInput.donVi}
                  onChange={(e) =>
                    setMaterialInput({ ...materialInput, donVi: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="kg">kg</option>
                  <option value="lít">Lít</option>
                  <option value="cái">Cái</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Số Lượng
                </label>
                <input
                  type="number"
                  value={materialInput.soLuong}
                  onChange={(e) =>
                    setMaterialInput({ ...materialInput, soLuong: e.target.value })
                  }
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    setMaterialInput({ ...materialInput, donGia: e.target.value })
                  }
                  placeholder="50000"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleAddMaterial}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Thêm Hàng Hóa
            </button>

            {/* Materials Table */}
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
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{m.maHang}</td>
                        <td className="px-4 py-2">{m.tenHang}</td>
                        <td className="px-4 py-2">{m.donVi}</td>
                        <td className="px-4 py-2 text-right">{m.soLuong}</td>
                        <td className="px-4 py-2 text-right">
                          {m.donGia.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {(m.soLuong * m.donGia).toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              setMaterials(materials.filter((_, i) => i !== idx));
                              showToast("Xóa hàng hóa thành công", "success");
                            }}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Total Amount */}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveReceipt}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    );
  }

  if (view === "detail" && selectedReceipt) {
    const totalAmount = selectedReceipt.materials.reduce(
      (sum, m) => sum + m.soLuong * m.donGia,
      0
    );

    return (
      <div className="space-y-4">
        <PageBreadcrumb pageTitle={`Chi Tiết Phiếu ${selectedReceipt.soPhieu}`} />

        {/* Back Button */}
        <button
          onClick={() => setView("list")}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay Lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Detail Card */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
            <div className="mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedReceipt.soPhieu}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ngày tạo: {new Date(selectedReceipt.ngayTao).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    selectedReceipt.trangThai === "Đã xác nhận"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                  }`}
                >
                  {selectedReceipt.trangThai}
                </span>
              </div>
            </div>

            {/* Receipt Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Người Nhận
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedReceipt.nguoiNhan}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Kho
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedReceipt.kho}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Lý Do
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedReceipt.lyDo}
                </p>
              </div>
              {selectedReceipt.soChungTu && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Số Chứng Từ
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedReceipt.soChungTu}
                  </p>
                </div>
              )}
            </div>

            {/* Materials List */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Danh Sách Hàng Hóa
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Mã
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Tên Hàng
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        Đơn Vị
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                        SL
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                        Đơn Giá
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                        Thành Tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedReceipt.materials.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                          {m.maHang}
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{m.tenHang}</td>
                        <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                          {m.donVi}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          {m.soLuong}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          {m.donGia.toLocaleString("vi-VN")}₫
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">
                          {(m.soLuong * m.donGia).toLocaleString("vi-VN")}₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Metrics */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Tổng Tiền
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalAmount.toLocaleString("vi-VN")}₫
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Số Hàng Hóa
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedReceipt.materials.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Tổng SL
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedReceipt.materials.reduce((sum, m) => sum + m.soLuong, 0)}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleStatusChange(selectedReceipt.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Xác Nhận
              </button>
              <button
                onClick={() => {
                  setSelectedReceipt(selectedReceipt);
                  setFormData({
                    soPhieu: selectedReceipt.soPhieu,
                    ngayTao: selectedReceipt.ngayTao,
                    nguoiNhan: selectedReceipt.nguoiNhan,
                    soChungTu: selectedReceipt.soChungTu || "",
                    kho: selectedReceipt.kho,
                    lyDo: selectedReceipt.lyDo,
                  });
                  setMaterials(selectedReceipt.materials);
                  setView("edit");
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Sửa
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Action Dropdown Component
function ActionDropdown({
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={onView}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
        title="Xem chi tiết"
      >
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      <button
        onClick={onEdit}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
        title="Chỉnh sửa"
      >
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
        title="Xóa"
      >
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
