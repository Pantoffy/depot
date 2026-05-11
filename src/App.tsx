import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ToastContainer } from "./components/common/Toast";
import { ConfirmDialog } from "./components/common/ConfirmDialog";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Import from "./pages/Forms/Import";
import PurchaseOrder from "./pages/Forms/PurchaseOrder";
import Export from "./pages/Forms/Export";
import StockCheck from "./pages/Forms/StockCheck";
import Materials from "./pages/Inventory/Materials";
import Suppliers from "./pages/Inventory/Suppliers";
import Warehouse from "./pages/Inventory/Warehouse";
import StockByWarehouse from "./pages/Inventory/StockByWarehouse";
import StockLedgerReport from "./pages/Inventory/StockLedgerReport";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer />
        <ConfirmDialog />
        <ScrollToTop />
        <Routes>
          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />

          {/* Dashboard Layout - Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/nhap-kho" element={<Import />} />
            <Route path="/xuat-kho" element={<Export />} />
            <Route path="/kiem-ke" element={<StockCheck />} />
            <Route path="/kiem-ke/tao-moi" element={<StockCheck />} />
            <Route path="/kiem-ke/chi-tiet/:receiptId" element={<StockCheck />} />
            <Route path="/don-dat-hang" element={<PurchaseOrder />} />

            {/* Inventory Management */}
            <Route path="/quan-ly-nguyen-lieu" element={<Materials />} />
            <Route path="/quan-ly-nha-cung-cap" element={<Suppliers />} />
            <Route path="/quan-ly-kho" element={<Warehouse />} />
            <Route path="/ton-kho-theo-kho" element={<StockByWarehouse />} />
            <Route path="/bao-cao-xuat-nhap-ton" element={<StockLedgerReport />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
