"use client";
import axios from "axios";
import { useState, useEffect } from "react";
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

interface Supplier {
  id: string;
  tenNCC: string;
  diaChiNCC: string;
  sdtNCC: string;
  emailNCC: string;
  nguoiLienHe: string;
  dieuKienThanhToan: string;
  moTa: string;
  ngayTao: string;
  trangThai: "Hoạt động" | "Vô hiệu hóa";
}

export default function QuanLyNhaCungCap() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Fetch suppliers from API
  useEffect(() => {


const fetchSuppliers = async () => {
  try {
    const response = await axios.get(
      "https://localhost:44391/WeatherForecast",
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: false
      }
    );

    // axios tự parse JSON, data nằm ở response.data
    setSuppliers(response.data);
    showToast("Tải dữ liệu thành công", "success");
  } catch (error: any) {
    let errorMsg = "Unknown error";

    if (axios.isAxiosError(error)) {
      // Lỗi có response từ BE
      if (error.response) {
        errorMsg = `API Error: ${error.response.status} ${error.response.statusText}`;
        console.error("Response data:", error.response.data);
      }
      // Lỗi không gọi được BE (CORS, SSL, network)
      else if (error.request) {
        errorMsg = "Không thể kết nối tới server (CORS / SSL)";
      } 
      else {
        errorMsg = error.message;
      }
    }

    console.error("Error fetching suppliers:", error);
    showToast(`Lỗi: ${errorMsg}`, "error");
  }
};


    fetchSuppliers();
  }, []);

  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    tenNCC: "",
    diaChiNCC: "",
    sdtNCC: "",
    emailNCC: "",
    nguoiLienHe: "",
    dieuKienThanhToan: "",
    moTa: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      tenNCC: "",
      diaChiNCC: "",
      sdtNCC: "",
      emailNCC: "",
      nguoiLienHe: "",
      dieuKienThanhToan: "",
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

  // Save supplier
  const handleSaveSupplier = () => {
    if (!formData.tenNCC || !formData.sdtNCC) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }

    if (view === "create") {
      const newSupplier: Supplier = {
        id: Date.now().toString(),
        tenNCC: formData.tenNCC,
        diaChiNCC: formData.diaChiNCC,
        sdtNCC: formData.sdtNCC,
        emailNCC: formData.emailNCC,
        nguoiLienHe: formData.nguoiLienHe,
        dieuKienThanhToan: formData.dieuKienThanhToan,
        moTa: formData.moTa,
        ngayTao: new Date().toISOString().split("T")[0],
        trangThai: "Hoạt động",
      };
      setSuppliers([...suppliers, newSupplier]);
      showToast("Nhà cung cấp đã được tạo thành công!", "success");
    } else if (view === "edit" && selectedSupplier) {
      setSuppliers(
        suppliers.map((s) =>
          s.id === selectedSupplier.id
            ? {
                ...s,
                tenNCC: formData.tenNCC,
                diaChiNCC: formData.diaChiNCC,
                sdtNCC: formData.sdtNCC,
                emailNCC: formData.emailNCC,
                nguoiLienHe: formData.nguoiLienHe,
                dieuKienThanhToan: formData.dieuKienThanhToan,
                moTa: formData.moTa,
              }
            : s
        )
      );
      showToast("Nhà cung cấp đã được cập nhật!", "success");
    }

    resetForm();
    setView("list");
  };

  // Delete supplier
  const handleDeleteSupplier = (id: string) => {
    showConfirm({
      message: "Bạn có chắc chắn muốn xóa nhà cung cấp này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => {
        setSuppliers(suppliers.filter((s) => s.id !== id));
        showToast("Nhà cung cấp đã được xóa!", "success");
      },
    });
  };

  // Edit supplier
  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      tenNCC: supplier.tenNCC,
      diaChiNCC: supplier.diaChiNCC,
      sdtNCC: supplier.sdtNCC,
      emailNCC: supplier.emailNCC,
      nguoiLienHe: supplier.nguoiLienHe,
      dieuKienThanhToan: supplier.dieuKienThanhToan,
      moTa: supplier.moTa,
    });
    setView("edit");
  };

  // View detail
  const handleViewDetail = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setView("detail");
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    setSuppliers(
      suppliers.map((s) =>
        s.id === id
          ? {
              ...s,
              trangThai: s.trangThai === "Hoạt động" ? "Vô hiệu hóa" : "Hoạt động",
            }
          : s
      )
    );
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    searchTerm.toLowerCase() === ""
      ? true
      : supplier.tenNCC.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.diaChiNCC.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.sdtNCC.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Quản Lý Nhà Cung Cấp" description="Quản lý danh sách nhà cung cấp" />
      <PageBreadcrumb pageTitle="Quản Lý Nhà Cung Cấp" />

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
              + Thêm Nhà Cung Cấp
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, địa chỉ hoặc SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <ComponentCard title={`Danh Sách Nhà Cung Cấp (${filteredSuppliers.length})`}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Tên NCC
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
                        SĐT
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Email
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 uppercase"
                      >
                        Người Liên Hệ
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
                    {filteredSuppliers.map((supplier) => (
                      <TableRow
                        key={supplier.id}
                        className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <TableCell className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {supplier.tenNCC}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {supplier.diaChiNCC}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {supplier.sdtNCC}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {supplier.emailNCC}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {supplier.nguoiLienHe}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <Badge
                            color={
                              supplier.trangThai === "Hoạt động"
                                ? "success"
                                : "error"
                            }
                          >
                            {supplier.trangThai}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(supplier)}
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
                              onClick={() => handleEditSupplier(supplier)}
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
                              onClick={() => handleDeleteSupplier(supplier.id)}
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
                              onClick={() => handleToggleStatus(supplier.id)}
                              title={supplier.trangThai === "Hoạt động" ? "Vô hiệu hóa" : "Kích hoạt"}
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

            {suppliers.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Không có nhà cung cấp nào
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
                Tên NCC
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

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Địa Chỉ
              </label>
              <input
                type="text"
                name="diaChiNCC"
                value={formData.diaChiNCC}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="123 Đường ABC, TP HCM"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email NCC
              </label>
              <input
                type="email"
                name="emailNCC"
                value={formData.emailNCC}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="abc@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Người Liên Hệ
              </label>
              <input
                type="text"
                name="nguoiLienHe"
                value={formData.nguoiLienHe}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Điều Kiện Thanh Toán
              </label>
              <input
                type="text"
                name="dieuKienThanhToan"
                value={formData.dieuKienThanhToan}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Thanh toán 30 ngày"
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
                placeholder="Mô tả chi tiết về nhà cung cấp..."
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSaveSupplier}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
            >
              💾 Lưu Nhà Cung Cấp
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

      {view === "detail" && selectedSupplier && (
        <div className="space-y-4">
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition-colors"
          >
            ← Quay Lại
          </button>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {selectedSupplier.tenNCC}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Địa Chỉ
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedSupplier.diaChiNCC}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SĐT
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedSupplier.sdtNCC}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedSupplier.emailNCC}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Người Liên Hệ
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedSupplier.nguoiLienHe}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Điều Kiện Thanh Toán
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedSupplier.dieuKienThanhToan}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Trạng Thái
                </p>
                <p
                  className={`font-semibold ${
                    selectedSupplier.trangThai === "Hoạt động"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {selectedSupplier.trangThai}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mô Tả
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedSupplier.moTa || "Không có mô tả"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày Tạo
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedSupplier.ngayTao}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
