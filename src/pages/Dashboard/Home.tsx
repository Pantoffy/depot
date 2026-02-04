import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

// Stats Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = "blue",
  trend = "up"
}: { 
  title: string; 
  value: string | number; 
  change?: string; 
  icon: string; 
  color?: string;
  trend?: "up" | "down";
}) => {
  const colorMap: { [key: string]: string } = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-6 hover:shadow-lg dark:hover:shadow-xl/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`mt-1 text-xs font-semibold ${trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {trend === "up" ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${colorMap[color]}`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

// Mini Chart Component (Simple bar representation)
const MiniChart = ({ data, title }: { data: number[]; title: string }) => {
  const max = Math.max(...data);
  return (
    <div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</p>
      <div className="flex items-end gap-2 h-32">
        {data.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:opacity-80"
              style={{ height: `${(value / max) * 100}%` }}
            />
            <p className="text-xs text-gray-500 mt-2">Tuần {idx + 1}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Table Component
const SimpleTable = ({ 
  title, 
  columns, 
  data,
  showViewMore = false
}: { 
  title: string; 
  columns: string[]; 
  data: (string | number)[][];
  showViewMore?: boolean;
}) => (
  <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {showViewMore && (
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Xem thêm →
        </a>
      )}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 text-gray-900 dark:text-gray-300">
                  {cellIdx === row.length - 1 && typeof cell === "string" ? (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      cell === "Hoàn thành" || cell === "Đã duyệt" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      cell === "Đang xử lý" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                      cell === "Chờ xác nhận" || cell === "Chờ duyệt" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      cell === "Sắp đến" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      cell.includes("Sắp hết") ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      cell.includes("Cảnh báo") ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {cell}
                    </span>
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Alert Component
const AlertBox = ({ type = "warning", title, description }: { type?: "warning" | "danger" | "info"; title: string; description: string }) => {
  const colors = {
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700",
    danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
  };

  const textColors = {
    warning: "text-yellow-800 dark:text-yellow-300",
    danger: "text-red-800 dark:text-red-300",
    info: "text-blue-800 dark:text-blue-300",
  };

  return (
    <div className={`rounded-lg border ${colors[type]} p-4`}>
      <p className={`font-semibold ${textColors[type]}`}>{title}</p>
      <p className={`text-sm mt-1 ${textColors[type]}`}>{description}</p>
    </div>
  );
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

  const importChartData = [45, 52, 48, 65, 78, 82, 75];
  const exportChartData = [32, 38, 42, 55, 48, 62, 58];

  const recentImports = [
    ["PN001", "Nguyên liệu X", "50kg", "Hoàn thành"],
    ["PN002", "Nguyên liệu Y", "100kg", "Đang xử lý"],
    ["PN003", "Nguyên liệu Z", "75kg", "Hoàn thành"],
    ["PN004", "Nguyên liệu A", "60kg", "Hoàn thành"],
    ["PN005", "Nguyên liệu B", "80kg", "Đang xử lý"],
  ];

  const recentExports = [
    ["PX001", "Sản phẩm A", "30kg", "Hoàn thành"],
    ["PX002", "Sản phẩm B", "45kg", "Đang xử lý"],
    ["PX003", "Sản phẩm C", "20kg", "Chờ xác nhận"],
    ["PX004", "Sản phẩm D", "35kg", "Hoàn thành"],
    ["PX005", "Sản phẩm E", "50kg", "Hoàn thành"],
  ];

  const suppliers = [
    ["Công ty TNHH Thực phẩm Sạch Việt", "18", "420,000,000đ"],
    ["Công ty CP Thực phẩm 3F Việt Nam", "15", "315,000,000đ"],
    ["Công ty TNHH Gia vị Á Đông", "12", "245,500,000đ"],
    ["Công ty CP Đồ uống Tân Hiệp Phát", "10", "185,000,000đ"],
    ["Lê Quốc Hùng", "8", "125,000,000đ"],
  ];

  const lowStockItems = [
    ["Nguyên liệu A", "3kg", "🔴 Sắp hết", "Cần nhập ngay"],
    ["Nguyên liệu B", "8kg", "🟠 Cảnh báo", "Cần nhập trong tuần"],
    ["Nguyên liệu C", "12kg", "🟡 Cảnh báo", "Cần nhập trong 2 tuần"],
    ["Nguyên liệu D", "5kg", "🔴 Sắp hết", "Cần nhập ngay"],
  ];

  const purchaseOrders = [
    ["ĐO001", "Công ty ABC", "🔴 Chờ duyệt", "2024-02-10"],
    ["ĐO002", "Công ty XYZ", "🟢 Đã duyệt", "2024-02-15"],
    ["ĐO003", "Công ty DEF", "🟠 Sắp đến", "2024-02-08"],
    ["ĐO004", "Công ty ABC", "🟢 Đã duyệt", "2024-02-20"],
  ];

  return (
    <>
      <PageMeta 
        title="Warehouse Dashboard | Quản Lý Kho" 
        description="Dashboard quản lý kho toàn hệ thống"
      />
      <PageBreadcrumb pageTitle="Dashboard Kho" />

      {/* Quick Alerts */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <AlertBox type="danger" title="⚠️ Cảnh báo: Sắp hết hàng" description="4 nguyên liệu đang sắp hết. Cần nhập hàng để tránh gián đoạn sản xuất." />
        <AlertBox type="info" title="📋 Đơn mua chờ xử lý" description="1 đơn mua đang chờ duyệt. Vui lòng kiểm tra và xác nhận." />
      </div>

      {/* 1. Tổng Quan Hệ Thống */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">📊 Tổng Quan Hệ Thống</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Tổng Nguyên Liệu" value="156" icon="📦" color="blue" change="12 mới" />
          <StatCard title="Kho Hoạt Động" value="8" icon="🏭" color="green" change="2 kho" />
          <StatCard title="Phiếu Nhập (Kỳ)" value="342" icon="📥" color="orange" change="45 phiếu" />
          <StatCard title="Phiếu Xuất (Kỳ)" value="289" icon="📤" color="red" change="32 phiếu" trend="down" />
          <StatCard title="Tổng Giá Trị Nhập" value="2.45B" icon="💰" color="green" change="15%" />
          <StatCard title="Tổng Giá Trị Xuất" value="1.85B" icon="💸" color="purple" change="8%" />
        </div>
      </div>

      {/* 2. Thống Kê Theo Thời Gian */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">📈 Thống Kê Theo Thời Gian</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-6">
            <MiniChart data={importChartData} title="Giá Trị Nhập Kho (7 ngày gần đây - Triệu đ)" />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-6">
            <MiniChart data={exportChartData} title="Giá Trị Xuất Kho (7 ngày gần đây - Triệu đ)" />
          </div>
        </div>
      </div>

      {/* 3. Hoạt Động Nhập - Xuất Kho */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">📦 Hoạt Động Nhập - Xuất Kho</h2>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SimpleTable 
            title="Phiếu Nhập Kho Mới Nhất"
            columns={["Mã Phiếu", "Nguyên Liệu", "Số Lượng", "Trạng Thái"]}
            data={recentImports}
            showViewMore={true}
          />
          <SimpleTable 
            title="Phiếu Xuất Kho Mới Nhất"
            columns={["Mã Phiếu", "Sản Phẩm", "Số Lượng", "Trạng Thái"]}
            data={recentExports}
            showViewMore={true}
          />
        </div>
      </div>

      {/* 4. Tình Trạng Tồn Kho */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">⚠️ Tình Trạng Tồn Kho - Nguyên Liệu Sắp Hết</h2>
        <SimpleTable 
          title="Danh Sách Nguyên Liệu Cần Chú Ý"
          columns={["Tên Nguyên Liệu", "Số Lượng Tồn", "Mức Cảnh Báo", "Hành Động"]}
          data={lowStockItems}
          showViewMore={true}
        />
      </div>

      {/* 5. Nhà Cung Cấp */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">🤝 Nhà Cung Cấp Chính</h2>
        <SimpleTable 
          title="Thông Tin Nhà Cung Cấp"
          columns={["Tên NCC", "Số Đơn Nhập", "Tổng Giá Trị"]}
          data={suppliers}
          showViewMore={true}
        />
      </div>

      {/* 6. Đơn Mua Hàng */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">📋 Đơn Mua Hàng (Purchase Order)</h2>
        <SimpleTable 
          title="Tình Trạng Đơn Mua"
          columns={["Mã ĐO", "Nhà Cung Cấp", "Trạng Thái", "Ngày Giao Dự Kiến"]}
          data={purchaseOrders}
          showViewMore={true}
        />
      </div>

      {/* 7. Kiểm Kê Kho */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">🔍 Kiểm Kê Kho</h2>
        <div className="rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lịch Sử Kiểm Kê</h3>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">Xem lịch sử đầy đủ →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Ngày Kiểm</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Kho</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Hệ Thống</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Thực Tế</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Chênh Lệch</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Nguyên Liệu Sai Lệch</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["2024-02-04", "Kho 1", "1500kg", "1505kg", "🟢 +5kg", "Nguyên liệu A"],
                  ["2024-02-01", "Kho 2", "2200kg", "2192kg", "🔴 -8kg", "Nguyên liệu B, C"],
                  ["2024-01-28", "Kho 3", "1800kg", "1800kg", "🟢 ±0kg", "Không"],
                  ["2024-01-25", "Kho 1", "1480kg", "1475kg", "🔴 -5kg", "Nguyên liệu D"],
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {cellIdx === 4 ? (
                          <span className="font-semibold">{cell}</span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 rounded-xl border border-gray-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] p-6">
        <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">📊 Thống Kê Tổng Hợp Tháng Này</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng Nhập</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">2.45B đ</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% so tháng trước</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tổng Xuất</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">1.85B đ</p>
            <p className="text-xs text-green-600 mt-1">↑ 8% so tháng trước</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tồn Kho</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">4.2K kg</p>
            <p className="text-xs text-orange-600 mt-1">⚠️ 4 mục cảnh báo</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Chỉ Số Hiệu Suất</p>
            <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">87%</p>
            <p className="text-xs text-blue-600 mt-1">✓ Tốt</p>
          </div>
        </div>
      </div>
    </>
  );
}
