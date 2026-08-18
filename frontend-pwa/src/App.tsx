import { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Properties } from './pages/Properties';
import { PropertyDetail } from './pages/PropertyDetail';
import { Buildings } from './pages/manage/Buildings';
import { BuildingDetail } from './pages/manage/BuildingDetail';
import { ManageProperties } from './pages/manage/ManageProperties';
import { Tenants } from './pages/manage/Tenants';
import { TenantDetail } from './pages/manage/TenantDetail';
import { Contracts } from './pages/manage/Contracts';
import { ContractDetail } from './pages/manage/ContractDetail';
import { Payments } from './pages/manage/Payments';
import { Expenses } from './pages/manage/Expenses';
import { Maintenance } from './pages/manage/Maintenance';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Spinner } from './components/Spinner';
import { canAccessDashboard } from './utils/roles';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="center page">
        <Spinner />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function ManagementRoute({ children }: { children: React.ReactNode }) {
  const { user, isGuest, loading } = useAuth();
  if (loading) {
    return (
      <div className="center page">
        <Spinner />
      </div>
    );
  }
  if (isGuest || !user || !canAccessDashboard(user)) {
    return <Navigate to="/properties" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <ManagementRoute>
                  <Dashboard />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/buildings"
            element={
              <Protected>
                <ManagementRoute>
                  <Buildings />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/buildings/:id"
            element={
              <Protected>
                <ManagementRoute>
                  <BuildingDetail />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/properties"
            element={
              <Protected>
                <ManagementRoute>
                  <ManageProperties />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/tenants"
            element={
              <Protected>
                <ManagementRoute>
                  <Tenants />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/tenants/:id"
            element={
              <Protected>
                <ManagementRoute>
                  <TenantDetail />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/contracts"
            element={
              <Protected>
                <ManagementRoute>
                  <Contracts />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/contracts/:id"
            element={
              <Protected>
                <ManagementRoute>
                  <ContractDetail />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/payments"
            element={
              <Protected>
                <ManagementRoute>
                  <Payments />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/expenses"
            element={
              <Protected>
                <ManagementRoute>
                  <Expenses />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route
            path="/manage/maintenance"
            element={
              <Protected>
                <ManagementRoute>
                  <Maintenance />
                </ManagementRoute>
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">IMMOFASO © {new Date().getFullYear()}</footer>
    </ToastProvider>
  );
}