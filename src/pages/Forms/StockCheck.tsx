"use client";

import { useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { showToast } from "../../components/common/Toast";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  note: string;
};

type AssetRow = {
  id: string;
  warehouse: string;
  materialCode: string;
  materialName: string;
  supplier: string;
  systemQty: number;
  checkQty: number;
  handlingProposal: string;
  recordedCheck: boolean;
  reason: string;
  status: string;
};

const DEFAULT_WAREHOUSE_OPTIONS = [
  "Kho chính",
  "Kho lạnh",
  "Kho thành phẩm",
  "Kho nguyên liệu",
];

const HANDLING_OPTIONS = [
  "Thanh lý hủy",
  "Bảo trì, bảo dưỡng",
  "Nhập kho bù KK thiếu",
  "Xuất kho bù KK thừa",
];

const STATUS_OPTIONS = ["Lưu kho", "Luân chuyển", "Thanh lý"];

export default function KiemKe() {
  const [formData, setFormData] = useState({
    maPhieuBaoCao: "",
    tenPhieu: "",
    ngayTao: new Date().toISOString().split("T")[0],
    nguoiTao: "",
    soEApprove: "",
    soKeHoachKiemKe: "",
    khuVucTapTrungKho: "",
    khoKiemKe: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    ngayChotSo: "",
    moTa: "",
    loaiHangHoa: "Tất cả",
  });

  const [memberInput, setMemberInput] = useState({
    name: "",
    role: "",
    note: "",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assetRows, setAssetRows] = useState<AssetRow[]>([]);
  const [showAssetModal, setShowAssetModal] = useState(false);

  const [assetFilter, setAssetFilter] = useState({
    keyword: "",
    discrepancyType: "Tất cả",
    warehouse: "",
  });

  const [assetDraft, setAssetDraft] = useState({
    warehouse: "",
    materialCode: "",
    materialName: "",
    supplier: "",
    systemQty: "0",
    checkQty: "0",
    handlingProposal: "",
    recordedCheck: true,
    reason: "",
    status: "",
  });

  const generatedCode = useMemo(() => {
    if (formData.maPhieuBaoCao.trim()) return formData.maPhieuBaoCao;
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `KK-${stamp}`;
  }, [formData.maPhieuBaoCao]);

  const filteredAssetRows = useMemo(() => {
    return assetRows.filter((row) => {
      const keyword = assetFilter.keyword.trim().toLowerCase();
      const keywordMatch =
        keyword.length === 0 ||
        row.materialCode.toLowerCase().includes(keyword) ||
        row.materialName.toLowerCase().includes(keyword);

      const warehouseMatch = !assetFilter.warehouse || row.warehouse === assetFilter.warehouse;
      const diff = row.checkQty - row.systemQty;
      const discrepancyMatch =
        assetFilter.discrepancyType === "Tất cả" ||
        (assetFilter.discrepancyType === "Thiếu" && diff < 0) ||
        (assetFilter.discrepancyType === "Thừa" && diff > 0) ||
        (assetFilter.discrepancyType === "Bằng 0" && diff === 0);

      return keywordMatch && warehouseMatch && discrepancyMatch;
    });
  }, [assetFilter, assetRows]);

  const handleAddMember = () => {
    if (!memberInput.name.trim() || !memberInput.role.trim()) {
      showToast("Vui lòng nhập tên và chức danh", "warning");
      return;
    }

    const next: TeamMember = {
      id: `${Date.now()}`,
      name: memberInput.name.trim(),
      role: memberInput.role.trim(),
      note: memberInput.note.trim(),
    };

    setTeamMembers((prev) => [...prev, next]);
    setMemberInput({ name: "", role: "", note: "" });
  };

  const handleRemoveMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveDraft = () => {
    showToast("Đã lưu giao diện nháp (FE-only)", "success");
  };

  const handleCreateRequest = () => {
    showToast("Đã soạn dữ liệu trình duyệt (chưa kết nối BE)", "success");
  };

  const handleAddAsset = () => {
    if (!assetDraft.materialCode.trim() || !assetDraft.materialName.trim()) {
      showToast("Vui lòng nhập mã vật tư và tên vật tư", "warning");
      return;
    }

    const systemQty = Number(assetDraft.systemQty || 0);
    const checkQty = Number(assetDraft.checkQty || 0);

    const nextRow: AssetRow = {
      id: `${Date.now()}`,
      warehouse: assetDraft.warehouse || "Kho chính",
      materialCode: assetDraft.materialCode.trim(),
      materialName: assetDraft.materialName.trim(),
      supplier: assetDraft.supplier.trim(),
      systemQty: Number.isNaN(systemQty) ? 0 : systemQty,
      checkQty: Number.isNaN(checkQty) ? 0 : checkQty,
      handlingProposal: assetDraft.handlingProposal || "",
      recordedCheck: assetDraft.recordedCheck,
      reason: assetDraft.reason.trim(),
      status: assetDraft.status || "Lưu kho",
    };

    setAssetRows((prev) => [...prev, nextRow]);
    setAssetDraft({
      warehouse: "",
      materialCode: "",
      materialName: "",
      supplier: "",
      systemQty: "0",
      checkQty: "0",
      handlingProposal: "",
      recordedCheck: true,
      reason: "",
      status: "",
    });
    setShowAssetModal(false);
    showToast("Đã thêm tài sản (FE-only)", "success");
  };

  const handleUpdateAsset = (
    id: string,
    updates: Partial<Pick<AssetRow, "checkQty" | "handlingProposal" | "recordedCheck" | "reason" | "status">>,
  ) => {
    setAssetRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  };

  const handleDeleteAsset = (id: string) => {
    setAssetRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <>
      <PageMeta title="Tạo mới báo cáo kiểm kê" description="Màn hình tạo báo cáo kiểm kê" />
      <PageBreadcrumb pageTitle="Kiểm kê" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between lg:p-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tạo mới báo cáo kết quả kiểm kê</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Khởi tạo</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
                Đóng
              </button>
              <button
                onClick={handleSaveDraft}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={handleCreateRequest}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
              >
                Soạn thảo tờ trình
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-4">
            <div className="border-b border-gray-200 p-4 dark:border-gray-800 lg:border-b-0 lg:border-r">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Các bước</p>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  1. Thông tin chung
                </div>
                <div className="rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300">2. Tổ kiểm kê</div>
                <div className="rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300">3. Thông tin tài sản</div>
                <div className="rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300">4. Tài liệu đính kèm</div>
              </div>
            </div>

            <div className="p-4 lg:col-span-3 lg:p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">Thông tin chung</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Mã phiếu báo cáo kiểm kê" value={generatedCode} readOnly />
                <Field
                  label="Tên phiếu"
                  value={formData.tenPhieu}
                  onChange={(v) => setFormData((p) => ({ ...p, tenPhieu: v }))}
                  placeholder="Nhập tên phiếu"
                />
                <Field
                  label="Ngày tạo"
                  type="date"
                  value={formData.ngayTao}
                  onChange={(v) => setFormData((p) => ({ ...p, ngayTao: v }))}
                />

                <Field
                  label="Người tạo"
                  value={formData.nguoiTao}
                  onChange={(v) => setFormData((p) => ({ ...p, nguoiTao: v }))}
                  placeholder="Nhập người tạo"
                />
                <Field
                  label="Số eApprove"
                  value={formData.soEApprove}
                  onChange={(v) => setFormData((p) => ({ ...p, soEApprove: v }))}
                  placeholder="Hệ thống tự sinh"
                />
                <Field
                  label="Số kế hoạch kiểm kê"
                  value={formData.soKeHoachKiemKe}
                  onChange={(v) => setFormData((p) => ({ ...p, soKeHoachKiemKe: v }))}
                  placeholder="Chọn số kế hoạch"
                />

                <Field
                  label="Khu vực tập trung kho"
                  value={formData.khuVucTapTrungKho}
                  onChange={(v) => setFormData((p) => ({ ...p, khuVucTapTrungKho: v }))}
                  placeholder="Chọn khu vực"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Kho kiểm kê</label>
                  <select
                    value={formData.khoKiemKe}
                    onChange={(e) => setFormData((p) => ({ ...p, khoKiemKe: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="">Chọn kho kiểm kê</option>
                    {DEFAULT_WAREHOUSE_OPTIONS.map((kho) => (
                      <option key={kho} value={kho}>
                        {kho}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Loại hàng hóa kiểm kê</label>
                  <select
                    value={formData.loaiHangHoa}
                    onChange={(e) => setFormData((p) => ({ ...p, loaiHangHoa: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="Tất cả">Tất cả</option>
                    <option value="Nguyên liệu">Nguyên liệu</option>
                    <option value="Bán thành phẩm">Bán thành phẩm</option>
                    <option value="Thành phẩm">Thành phẩm</option>
                  </select>
                </div>

                <Field
                  label="Ngày bắt đầu"
                  type="date"
                  value={formData.ngayBatDau}
                  onChange={(v) => setFormData((p) => ({ ...p, ngayBatDau: v }))}
                />
                <Field
                  label="Ngày kết thúc"
                  type="date"
                  value={formData.ngayKetThuc}
                  onChange={(v) => setFormData((p) => ({ ...p, ngayKetThuc: v }))}
                />
                <Field
                  label="Ngày chốt số kiểm kê"
                  type="date"
                  value={formData.ngayChotSo}
                  onChange={(v) => setFormData((p) => ({ ...p, ngayChotSo: v }))}
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData((p) => ({ ...p, moTa: e.target.value }))}
                  rows={3}
                  placeholder="Nhập mô tả"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Danh sách tổ kiểm kê</h4>
                </div>

                <div className="grid grid-cols-1 gap-3 border-b border-gray-200 p-4 md:grid-cols-4 dark:border-gray-800">
                  <input
                    value={memberInput.name}
                    onChange={(e) => setMemberInput((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Tên người kiểm kê"
                    className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <input
                    value={memberInput.role}
                    onChange={(e) => setMemberInput((p) => ({ ...p, role: e.target.value }))}
                    placeholder="Chức danh"
                    className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <input
                    value={memberInput.note}
                    onChange={(e) => setMemberInput((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Ghi chú"
                    className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                  <button
                    onClick={handleAddMember}
                    className="h-10 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
                  >
                    Thêm thành viên
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">STT</th>
                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tên người kiểm kê</th>
                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Chức danh</th>
                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Ghi chú</th>
                        <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            Chưa có thành viên tổ kiểm kê
                          </td>
                        </tr>
                      ) : (
                        teamMembers.map((member, index) => (
                          <tr key={member.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{index + 1}</td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{member.name}</td>
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{member.role}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{member.note || "-"}</td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                  <h4 className="font-semibold uppercase text-brand-600 dark:text-brand-400">Thông tin tài sản</h4>
                </div>

                <div className="flex flex-col gap-3 border-b border-gray-200 p-4 dark:border-gray-800 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-3xl">
                    <input
                      value={assetFilter.keyword}
                      onChange={(e) => setAssetFilter((p) => ({ ...p, keyword: e.target.value }))}
                      placeholder="Nhập mã hoặc tên vật tư"
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />

                    <select
                      value={assetFilter.discrepancyType}
                      onChange={(e) => setAssetFilter((p) => ({ ...p, discrepancyType: e.target.value }))}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="Tất cả">Chọn loại chênh lệch kiểm kê</option>
                      <option value="Thiếu">Thiếu</option>
                      <option value="Thừa">Thừa</option>
                      <option value="Bằng 0">Bằng 0</option>
                    </select>

                    <select
                      value={assetFilter.warehouse}
                      onChange={(e) => setAssetFilter((p) => ({ ...p, warehouse: e.target.value }))}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">Chọn kho</option>
                      {DEFAULT_WAREHOUSE_OPTIONS.map((warehouse) => (
                        <option key={warehouse} value={warehouse}>
                          {warehouse}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setShowAssetModal(true)}
                    className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Thêm tài sản
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1680px] text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/40">
                      <tr>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">STT</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Kho</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Mã vật tư</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Tên vật tư</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">NCC</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Số lượng hệ thống ghi nhận</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Số lượng kiểm kê</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Số lệch kiểm kê (KK - HTGN)</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Đề nghị xử lý</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Ghi nhận KK</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Giải trình lý do KK</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Trạng thái</th>
                        <th className="px-3 py-3 font-medium text-gray-600 dark:text-gray-300">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssetRows.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="px-3 py-10 text-center text-gray-500 dark:text-gray-400">
                            No Data
                          </td>
                        </tr>
                      ) : (
                        filteredAssetRows.map((row, index) => {
                          const diff = row.checkQty - row.systemQty;
                          const diffClass =
                            diff === 0
                              ? "text-emerald-600"
                              : diff > 0
                                ? "text-blue-600"
                                : "text-red-600";

                          return (
                            <tr key={row.id} className="border-b border-gray-100 align-top dark:border-gray-800">
                              <td className="px-3 py-3 text-gray-900 dark:text-gray-100">{index + 1}</td>
                              <td className="px-3 py-3 text-gray-900 dark:text-gray-100">{row.warehouse}</td>
                              <td className="px-3 py-3 text-gray-900 dark:text-gray-100">{row.materialCode}</td>
                              <td className="px-3 py-3 text-gray-900 dark:text-gray-100">{row.materialName}</td>
                              <td className="px-3 py-3 text-gray-900 dark:text-gray-100">{row.supplier || "-"}</td>
                              <td className="px-3 py-3 text-gray-900 dark:text-gray-100">{row.systemQty}</td>
                              <td className="px-3 py-3">
                                <input
                                  type="number"
                                  value={row.checkQty}
                                  onChange={(e) =>
                                    handleUpdateAsset(row.id, {
                                      checkQty: Number(e.target.value || 0),
                                    })
                                  }
                                  className="h-9 w-24 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                />
                              </td>
                              <td className={`px-3 py-3 font-semibold ${diffClass}`}>{diff}</td>
                              <td className="px-3 py-3">
                                <select
                                  value={row.handlingProposal}
                                  onChange={(e) =>
                                    handleUpdateAsset(row.id, {
                                      handlingProposal: e.target.value,
                                    })
                                  }
                                  className="h-9 w-44 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                  <option value="">Chọn đề nghị xử lý</option>
                                  {HANDLING_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                  <input
                                    type="checkbox"
                                    checked={row.recordedCheck}
                                    onChange={(e) =>
                                      handleUpdateAsset(row.id, {
                                        recordedCheck: e.target.checked,
                                      })
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                  />
                                  Ghi nhận
                                </label>
                              </td>
                              <td className="px-3 py-3">
                                <input
                                  type="text"
                                  value={row.reason}
                                  onChange={(e) =>
                                    handleUpdateAsset(row.id, {
                                      reason: e.target.value,
                                    })
                                  }
                                  placeholder="Nhập giải trình lý do"
                                  className="h-9 w-52 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <select
                                  value={row.status}
                                  onChange={(e) =>
                                    handleUpdateAsset(row.id, {
                                      status: e.target.value,
                                    })
                                  }
                                  className="h-9 w-36 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                  {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-3">
                                <button
                                  onClick={() => handleDeleteAsset(row.id)}
                                  className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">Thêm tài sản</h4>
              <button
                onClick={() => setShowAssetModal(false)}
                className="rounded-md border border-gray-300 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                value={assetDraft.warehouse}
                onChange={(e) => setAssetDraft((p) => ({ ...p, warehouse: e.target.value }))}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Chọn kho</option>
                {DEFAULT_WAREHOUSE_OPTIONS.map((warehouse) => (
                  <option key={warehouse} value={warehouse}>
                    {warehouse}
                  </option>
                ))}
              </select>

              <input
                value={assetDraft.supplier}
                onChange={(e) => setAssetDraft((p) => ({ ...p, supplier: e.target.value }))}
                placeholder="NCC"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />

              <input
                value={assetDraft.materialCode}
                onChange={(e) => setAssetDraft((p) => ({ ...p, materialCode: e.target.value }))}
                placeholder="Mã vật tư"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                value={assetDraft.materialName}
                onChange={(e) => setAssetDraft((p) => ({ ...p, materialName: e.target.value }))}
                placeholder="Tên vật tư"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />

              <input
                type="number"
                value={assetDraft.systemQty}
                onChange={(e) => setAssetDraft((p) => ({ ...p, systemQty: e.target.value }))}
                placeholder="Số lượng hệ thống ghi nhận"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                type="number"
                value={assetDraft.checkQty}
                onChange={(e) => setAssetDraft((p) => ({ ...p, checkQty: e.target.value }))}
                placeholder="Số lượng kiểm kê"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />

              <select
                value={assetDraft.handlingProposal}
                onChange={(e) => setAssetDraft((p) => ({ ...p, handlingProposal: e.target.value }))}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Chọn đề nghị xử lý</option>
                {HANDLING_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={assetDraft.status}
                onChange={(e) => setAssetDraft((p) => ({ ...p, status: e.target.value }))}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Chọn trạng thái</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <div className="md:col-span-2">
                <input
                  value={assetDraft.reason}
                  onChange={(e) => setAssetDraft((p) => ({ ...p, reason: e.target.value }))}
                  placeholder="Giải trình lý do KK"
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={assetDraft.recordedCheck}
                  onChange={(e) => setAssetDraft((p) => ({ ...p, recordedCheck: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Ghi nhận KK
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowAssetModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={handleAddAsset}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
  readOnly?: boolean;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500 read-only:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:read-only:bg-gray-800"
      />
    </div>
  );
}
