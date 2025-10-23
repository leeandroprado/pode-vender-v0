import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Agentes from "./pages/Agentes";
import Produtos from "./pages/Produtos";
import Clientes from "./pages/Clientes";
import Conversas from "./pages/Conversas";
import Pedidos from "./pages/Pedidos";
import Atividades from "./pages/Atividades";
import Agenda from "./pages/Agenda";
import Conta from "./pages/Conta";
import Equipe from "./pages/Equipe";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AceitarConvite from "./pages/AceitarConvite";
import NotFound from "./pages/NotFound";
import SystemSettings from "./pages/SystemSettings";
import ApiTokens from "./pages/ApiTokens";
import ApiDocs from "./pages/ApiDocs";
import { SuperAdminRoute } from "./components/SuperAdminRoute";
import { AdminRoute } from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/aceitar-convite" element={<AceitarConvite />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/agentes" element={<ProtectedRoute><AdminRoute><DashboardLayout><Agentes /></DashboardLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/produtos" element={<ProtectedRoute><DashboardLayout><Produtos /></DashboardLayout></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><DashboardLayout><Clientes /></DashboardLayout></ProtectedRoute>} />
            <Route path="/conversas" element={<ProtectedRoute><DashboardLayout><Conversas /></DashboardLayout></ProtectedRoute>} />
            <Route path="/pedidos" element={<ProtectedRoute><DashboardLayout><Pedidos /></DashboardLayout></ProtectedRoute>} />
            <Route path="/atividades" element={<ProtectedRoute><AdminRoute><DashboardLayout><Atividades /></DashboardLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/agenda" element={<ProtectedRoute><DashboardLayout><Agenda /></DashboardLayout></ProtectedRoute>} />
            <Route path="/conta" element={<ProtectedRoute><DashboardLayout><Conta /></DashboardLayout></ProtectedRoute>} />
            <Route path="/equipe" element={<ProtectedRoute><AdminRoute><DashboardLayout><Equipe /></DashboardLayout></AdminRoute></ProtectedRoute>} />
            <Route path="/api-tokens" element={<ProtectedRoute><AdminRoute><ApiTokens /></AdminRoute></ProtectedRoute>} />
            <Route path="/api-docs" element={<ProtectedRoute><DashboardLayout><ApiDocs /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings-system" element={<ProtectedRoute><SuperAdminRoute><SystemSettings /></SuperAdminRoute></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
