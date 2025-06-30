import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Warehouses from "./pages/Warehouses";
import Employees from "./pages/Employees";
import Suppliers from "./pages/Suppliers";
import Customers from './pages/Customers';
import Products from "./pages/Products";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import SaleOrders from "./pages/SaleOrders";
import SaleOrderDetail from "./pages/SaleOrderDetail";
import Statistics from "./pages/Statistics";
// import UserProfile from "./pages/UserProfile"; 


function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    // Nếu chưa có token, redirect về login
    return <Navigate to="/" replace />;
  }
  return children;
}

function RedirectIfAuth({ children }) {
  const token = localStorage.getItem("token");
  if (token) {
    // Nếu đã login rồi, redirect về dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Trang đăng nhập */}
      <Route
        path="/"
        element={
          <RedirectIfAuth>
            <Login />
          </RedirectIfAuth>
        }
      />

      {/* Dashboard và các trang con */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      >
        {/* Mặc định vào /dashboard chuyển sang /dashboard/employees */}
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<Employees />} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="purchase-orders/:orderId" element={<PurchaseOrderDetail />} />
        <Route path="sale-orders" element={<SaleOrders />} />
        <Route path="sale-orders/:orderId" element={<SaleOrderDetail />} />
        <Route path="statistics" element={<Statistics />} />
        {/* <Route path="dashboard/profile" element={<UserProfile />} /> */}

      </Route>

      {/* Nếu vào URL không hợp lệ, redirect về login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
