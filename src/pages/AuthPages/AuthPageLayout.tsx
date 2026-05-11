import React from "react";
import GridShape from "../../components/common/GridShape";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="app-unified-shell w-full max-w-[560px] p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
        <div className="relative hidden overflow-hidden border-l border-slate-200 bg-slate-950 lg:flex lg:items-center lg:justify-center dark:border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))]" />
          <GridShape />
          <div className="relative z-10 max-w-lg px-10 text-center text-white">
            <p className="app-page-kicker text-cyan-200">Warehouse Management</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              Một giao diện thống nhất cho toàn bộ đồ án
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Từ nhập kho, xuất kho đến báo cáo và kiểm kê, mọi màn hình đều đi cùng một hệ khung, cùng nhịp điệu và cùng cảm giác sử dụng.
            </p>
          </div>
        </div>
        <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
