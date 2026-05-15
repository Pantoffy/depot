interface FormHeroSectionProps {
  title: string;
  description: string;
  isCreate: boolean;
  statusBadges?: Array<{ label: string; color: "cyan" | "emerald" | "slate" }>;
}

export function FormHeroSection({
  title,
  description,
  isCreate,
  statusBadges = [],
}: FormHeroSectionProps) {
  const colorMap = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    slate:
      "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-100 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-cyan-500/20 dark:bg-slate-950/70 lg:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
            {isCreate ? "Tạo mới" : "Chỉnh sửa"}
          </span>
          {statusBadges.map((badge, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${colorMap[badge.color]}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white lg:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
