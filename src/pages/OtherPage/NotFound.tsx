import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="404 | Warehouse Management"
        description="Trang không tồn tại trong hệ thống quản lý kho"
      />
      <div className="min-h-screen bg-slate-50 p-4 text-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:p-6">
        <div className="app-unified-shell relative flex min-h-[calc(100vh-2rem)] items-center justify-center overflow-hidden p-6 sm:p-10">
          <GridShape />
          <div className="relative z-10 mx-auto w-full max-w-[620px] text-center">
            <p className="app-page-kicker">Warehouse Management</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Không tìm thấy trang này
            </h1>

            <img src="/images/error/404.svg" alt="404" className="mx-auto mt-8 max-w-[340px] dark:hidden" />
            <img
              src="/images/error/404-dark.svg"
              alt="404"
              className="mx-auto mt-8 hidden max-w-[340px] dark:block"
            />

            <p className="mt-8 text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Liên kết bạn truy cập không còn tồn tại hoặc đã bị chuyển đi.
            </p>

            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-cyan-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Warehouse Management
          </p>
        </div>
      </div>
    </>
  );
}
