import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const location = useLocation();
  const formRoutes = ["/form-elements", "/nhap-kho", "/xuat-kho", "/kiem-ke", "/don-dat-hang"];
  const inventoryRoutes = ["/quan-ly-nguyen-lieu", "/quan-ly-nha-cung-cap", "/quan-ly-kho", "/ton-kho-theo-kho"];

  const isFormRoute = formRoutes.some((route) => location.pathname === route || location.pathname.startsWith(`${route}/`));
  const isInventoryRoute = inventoryRoutes.some((route) =>
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  );
  const useUnifiedShell = isFormRoute || isInventoryRoute;

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div
          className={`mx-auto max-w-screen-2xl p-4 md:p-6 ${
            useUnifiedShell ? "app-unified-shell" : ""
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
