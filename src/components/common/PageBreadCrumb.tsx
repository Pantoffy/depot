import type { ReactNode } from "react";
import { Link } from "react-router";

interface BreadcrumbProps {
  pageTitle: string;
  action?: ReactNode;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, action }) => {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60">
      <div>
        <p className="app-page-kicker">Warehouse Management</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
          {pageTitle}
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {action}
        <nav aria-label="Breadcrumb">
          <ol className="app-page-breadcrumb flex items-center gap-1.5">
            <li>
              <Link className="inline-flex items-center gap-1.5 text-sm font-medium" to="/">
                Trang chủ
                <svg
                  className="stroke-current"
                  width="17"
                  height="16"
                  viewBox="0 0 17 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
            <li className="text-sm font-medium text-slate-900 dark:text-white">
              {pageTitle}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default PageBreadcrumb;
