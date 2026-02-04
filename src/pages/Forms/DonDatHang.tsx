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

interface PurchaseOrder {
  id: string;
  ngayTao: string;
  soDH: string;
  tenNCC: string;
  diaChi: string;
  sdt: string;
  email: string;
  hangChuyenGiao: string;
  trangThai: "Chờ xác nhận" | "Đã xác nhận" | "Đã giao hàng";
  tongTien: number;
  ghiChu: string;
  materials: Material[];
}

export default function DonDatHang() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    {
      id: "DO001",
      ngayTao: "2026-01-20",
      soDH: "DO001",
      tenNCC: "Công ty ABC",
      diaChi: "123 Đường ABC, Quận 1",
      sdt: "0123456789",
      email: "abc@company.com",
      hangChuyenGiao: "2026-02-01",
      trangThai: "Chờ xác nhận",
      tongTien: 8500000,
      ghiChu: "Đặt hàng nhanh",
      materials: [
        { stt: 1, id: "1", maHang: "H001", tenHang: "Bột mỳ", donVi: "kg", soLuong: 150, donGia: 50000 },
      ],
    },
    {
      id: "DO002",
      ngayTao: "2026-01-18",
      soDH: "DO002",
      tenNCC: "Công ty XYZ",
      diaChi: "456 Đường XYZ, Quận 2",
      sdt: "0987654321",
      email: "xyz@company.com",
      hangChuyenGiao: "2026-02-05",
      trangThai: "Đã xác nhận",
      tongTien: 5600000,
      ghiChu: "Hàng chất lượng",
      materials: [
        { stt: 1, id: "2", maHang: "H002", tenHang: "Đường trắng", donVi: "kg", soLuong: 200, donGia: 28000 },
      ],
    },
    {
      id: "DO003",
      ngayTao: "2026-01-15",
      soDH: "DO003",
      tenNCC: "Công ty DEF",
      diaChi: "789 Đường DEF, Quận 3",
      sdt: "0912345678",
      email: "def@company.com",
      hangChuyenGiao: "2026-02-10",
      trangThai: "Đã giao hàng",
      tongTien: 4200000,
      ghiChu: "Giao hàng thành công",
      materials: [
        { stt: 1, id: "3", maHang: "H003", tenHang: "Bơ thực vật", donVi: "kg", soLuong: 75, donGia: 56000 },
      ],
    },
  ]);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [sortBy, setSortBy] = useState<"ngayTao" | "tongTien">("ngayTao");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ trangThai: "" });
  const [filterSearch, setFilterSearch] = useState({ trangThai: "" });

  const [formData, setFormData] = useState({
    soDH: "",
    ngayTao: new Date().toISOString().split("T")[0],
    tenNCC: "",
    diaChi: "",
    sdt: "",
    email: "",
    hangChuyenGiao: "",
    ghiChu: "",
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
      soDH: "",
      ngayTao: new Date().toISOString().split("T")[0],
      tenNCC: "",
      diaChi: "",
      sdt: "",
      email: "",
      hangChuyenGiao: "",
      ghiChu: "",
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

  const handleSaveOrder = () => {
    if (!formData.soDH || !formData.tenNCC || !formData.diaChi || materials.length === 0) {
      showToast("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const totalAmount = materials.reduce((sum, m) => sum + m.soLuong * m.donGia, 0);
    const newOrder: PurchaseOrder = {
      id: formData.soDH,
      ngayTao: formData.ngayTao,
      soDH: formData.soDH,
      tenNCC: formData.tenNCC,
      diaChi: formData.diaChi,
      sdt: formData.sdt,
      email: formData.email,
      hangChuyenGiao: formData.hangChuyenGiao,
      tongTien: totalAmount,
      ghiChu: formData.ghiChu,
      trangThai: "Chờ xác nhận",
      materials: materials,
    };

    setOrders([...orders, newOrder]);
    resetForm();
    setView("list");
    showToast("Tạo đơn đặt hàng thành công", "success");
  };

  const handleDeleteOrder = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa đơn hàng này?",
      onConfirm: () => {
        setOrders(orders.filter((o) => o.id !== id));
      },
    });
  };

  const handleStatusChange = (id: string) => {
    setOrders(
      orders.map((o) => {
        if (o.id === id) {
          const statusMap: Record<string, string> = {
            "Chờ xác nhận": "Đã xác nhận",
            "Đã xác nhận": "Đã giao hàng",
            "Đã giao hàng": "Chờ xác nhận",
          };
          return { ...o, trangThai: statusMap[o.trangThai] as any };
        }
        return o;
      })
    );
    showToast("Cập nhật trạng thái thành công", "success");
  };

  // Filter and sort
  const filteredOrders = orders
    .filter(
      (o) =>
        (o.soDH.toLowerCase().includes(searchTerm.toLowerCase()) ||
         o.tenNCC.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filters.trangThai || o.trangThai === filters.trangThai)
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

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (view === "list") {
    return (
      <div className="space-y-4">
        <PageBreadcrumb pageTitle="Đơn Đặt Hàng" />
        <PageMeta title="Đơn Đặt Hàng" description="Quản lý đơn đặt hàng" />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Danh Sách Đơn Đặt Hàng
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Quản lý đơn đặt hàng từ các nhà cung cấp.
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
                  Thêm Đơn Hàng
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-5 lg:p-6 border-b border-gray-200 dark:border-gray-800 overflow-visible">
            <div className="flex flex-col gap-3 items-start justify-between">
              <div className="relative w-full">
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center gap-3 relative w-full">
                <div className="relative flex-1">
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
                            {["Chờ xác nhận", "Đã xác nhận", "Đã giao hàng"].filter(s => s.toLowerCase().includes(filterSearch.trangThai.toLowerCase())).map(status => (
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
                  className="px-3 py-2.5 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  <option value="ngayTao">Sắp xếp theo ngày</option>
                  <option value="tongTien">Sắp xếp theo tiền</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all whitespace-nowrap"
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
                    Số ĐH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    NCC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Hạn Giao
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
                {paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.soDH}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(order.ngayTao).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {order.tenNCC}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(order.hangChuyenGiao).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {order.tongTien.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${
                          order.trangThai === "Đã giao hàng"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : order.trangThai === "Đã xác nhận"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                        }`}
                      >
                        {order.trangThai}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <ActionDropdown
                          onView={() => {
                            setSelectedOrder(order);
                            setView("detail");
                          }}
                          onEdit={() => {
                            setSelectedOrder(order);
                            setFormData({
                              soDH: order.soDH,
                              ngayTao: order.ngayTao,
                              tenNCC: order.tenNCC,
                              diaChi: order.diaChi,
                              sdt: order.sdt,
                              email: order.email,
                              hangChuyenGiao: order.hangChuyenGiao,
                              ghiChu: order.ghiChu,
                            });
                            setMaterials(order.materials);
                            setView("edit");
                          }}
                          onDelete={() => handleDeleteOrder(order.id)}
                          onStatusChange={() => handleStatusChange(order.id)}
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
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong{" "}
              {filteredOrders.length} đơn hàng
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
          pageTitle={view === "create" ? "Thêm Đơn Hàng" : "Chỉnh Sửa Đơn Hàng"}
        />

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {view === "create" ? "Tạo Đơn Đặt Hàng Mới" : "Chỉnh Sửa Đơn Đặt Hàng"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nhập thông tin đơn hàng và danh sách hàng hóa cần đặt
            </p>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Đơn Hàng
              </label>
              <input
                type="text"
                value={formData.soDH}
                onChange={(e) => setFormData({ ...formData, soDH: e.target.value })}
                placeholder="DO001"
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
                Nhà Cung Cấp
              </label>
              <input
                type="text"
                value={formData.tenNCC}
                onChange={(e) => setFormData({ ...formData, tenNCC: e.target.value })}
                placeholder="Tên nhà cung cấp"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hạn Giao Hàng
              </label>
              <input
                type="date"
                value={formData.hangChuyenGiao}
                onChange={(e) => setFormData({ ...formData, hangChuyenGiao: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Địa Chỉ
              </label>
              <input
                type="text"
                value={formData.diaChi}
                onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                placeholder="Địa chỉ giao hàng"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số Điện Thoại
              </label>
              <input
                type="tel"
                value={formData.sdt}
                onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                placeholder="0123456789"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@company.com"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ghi Chú
              </label>
              <textarea
                value={formData.ghiChu}
                onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                placeholder="Ghi chú thêm về đơn hàng"
                rows={3}
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
              onClick={handleSaveOrder}
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
              {view === "create" ? "Tạo Đơn" : "Cập Nhật"}
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

  if (view === "detail" && selectedOrder) {
    const totalAmount = selectedOrder.materials.reduce(
      (sum, m) => sum + m.soLuong * m.donGia,
      0
    );

    return (
      <div className="space-y-4">
        <PageBreadcrumb pageTitle={`Chi Tiết Đơn Hàng ${selectedOrder.soDH}`} />

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
                    {selectedOrder.soDH}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ngày tạo: {new Date(selectedOrder.ngayTao).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    selectedOrder.trangThai === "Đã giao hàng"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : selectedOrder.trangThai === "Đã xác nhận"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                  }`}
                >
                  {selectedOrder.trangThai}
                </span>
              </div>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Nhà Cung Cấp
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedOrder.tenNCC}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Địa Chỉ
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedOrder.diaChi}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  SDT
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedOrder.sdt}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedOrder.email}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Hạn Giao Hàng
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(selectedOrder.hangChuyenGiao).toLocaleDateString("vi-VN")}
                </p>
              </div>
              {selectedOrder.ghiChu && (
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                    Ghi Chú
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedOrder.ghiChu}
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
                    {selectedOrder.materials.map((m) => (
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
                {selectedOrder.materials.length}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Tổng SL
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedOrder.materials.reduce((sum, m) => sum + m.soLuong, 0)}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => handleStatusChange(selectedOrder.id)}
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
                Cập Nhật
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(selectedOrder);
                  setFormData({
                    soDH: selectedOrder.soDH,
                    ngayTao: selectedOrder.ngayTao,
                    tenNCC: selectedOrder.tenNCC,
                    diaChi: selectedOrder.diaChi,
                    sdt: selectedOrder.sdt,
                    email: selectedOrder.email,
                    hangChuyenGiao: selectedOrder.hangChuyenGiao,
                    ghiChu: selectedOrder.ghiChu,
                  });
                  setMaterials(selectedOrder.materials);
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
