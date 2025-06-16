import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import { useAuthStore } from "./store/authStore";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Admin pages
import Users from "./pages/admin/Users";
import Tickets from "./pages/admin/Tickets";
import KYC from "./pages/admin/KYC";
import Logs from "./pages/admin/Logs";
import AdminSettings from "./pages/admin/Settings";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

function App() {
  const { initialize } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize().finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="logs" element={<Logs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
