import { motion } from "framer-motion";
import React from "react";

interface HeroStatItem {
  label: string;
  value: string | number;
}

interface FormLayoutWrapperProps {
  children: React.ReactNode;
  title: string;
  description: string;
  isCreate: boolean;
  heroStats?: HeroStatItem[];
  sidebarTitle?: string;
  sidebarDescription?: string;
  sidebarContent?: React.ReactNode;
  sidebarStats?: Array<{ label: string; value: string | number }>;
}

export default function FormLayoutWrapper({
  children,
  title,
  description,
  isCreate,
  heroStats = [],
  sidebarTitle = "Tóm tắt thông tin",
  sidebarDescription = "Theo dõi nhanh thông tin cốt lõi trước khi lưu.",
  sidebarContent,
  sidebarStats = [],
}: FormLayoutWrapperProps) {
  return (
    <motion.div
      className="module-view space-y-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="form-tone-sync rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-cyan-50/40 p-4 shadow-[0_20px_60px_-30px_rgba(14,116,144,0.35)] dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/70 lg:p-6">
        <div className="relative overflow-hidden rounded-[28px] border border-cyan-100 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-cyan-500/20 dark:bg-slate-950/70 lg:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
                  {isCreate ? "Tạo mới" : "Chỉnh sửa"}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white lg:text-3xl">
                  {title}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              </div>

              {heroStats.length > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {heroStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
                    >
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {sidebarStats.length > 0 && (
              <div className="grid gap-3 rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-4 shadow-sm dark:border-cyan-500/20 dark:from-cyan-500/10 dark:to-slate-950 lg:w-[280px]">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-300">
                    Nhanh
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Thông tin chính được hiển thị để dễ theo dõi.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {sidebarStats.map((stat, idx) => (
                    <div key={idx} className="rounded-2xl bg-white/90 p-3 shadow-sm dark:bg-slate-900/70">
                      <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                      <div className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_320px]">
          <div className="space-y-5">{children}</div>

          {sidebarContent && (
            <motion.aside
              className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-5 shadow-sm dark:border-cyan-500/20 dark:from-cyan-500/10 dark:via-slate-950 dark:to-emerald-500/10 lg:p-6 lg:sticky lg:top-24 lg:self-start"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.14, duration: 0.22 }}
            >
              <div className="mb-4 flex items-center justify-between border-b border-cyan-100 pb-4 dark:border-cyan-500/20">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {sidebarTitle}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sidebarDescription}
                  </p>
                </div>
              </div>
              {sidebarContent}
            </motion.aside>
          )}
        </div>
      </div>
    </motion.div>
  );
}
