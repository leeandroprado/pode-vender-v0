import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import { SuperAdminRoute } from "./components/SuperAdminRoute";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Agentes = lazy(() => import("./pages/Agentes"));
const Produtos = lazy(() => import("./pages/Produtos"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Conversas = lazy(() => import("./pages/Conversas"));
const Atividades = lazy(() => import("./pages/Atividades"));
const Conta = lazy(() => import("./pages/Conta"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SetPassword = lazy(() => import("./pages/SetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SystemSettings = lazy(() => import("./pages/SystemSettings"));
const Equipe = lazy(() => import("./pages/Equipe"));
const Logs = lazy(() => import("./pages/Logs"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Carregando...</div>}>
              <Routes>
                <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
              <Route path="/agentes" element={<ProtectedRoute><DashboardLayout><Agentes /></DashboardLayout></ProtectedRoute>} />
              <Route path="/produtos" element={<ProtectedRoute><DashboardLayout><Produtos /></DashboardLayout></ProtectedRoute>} />
              <Route path="/clientes" element={<ProtectedRoute><DashboardLayout><Clientes /></DashboardLayout></ProtectedRoute>} />
              <Route path="/conversas" element={<ProtectedRoute><DashboardLayout><Conversas /></DashboardLayout></ProtectedRoute>} />
              <Route path="/atividades" element={<ProtectedRoute><DashboardLayout><Atividades /></DashboardLayout></ProtectedRoute>} />
              <Route path="/conta" element={<ProtectedRoute><DashboardLayout><Conta /></DashboardLayout></ProtectedRoute>} />
              <Route path="/equipe" element={<ProtectedRoute><DashboardLayout><Equipe /></DashboardLayout></ProtectedRoute>} />
              <Route path="/logs" element={<ProtectedRoute><DashboardLayout><Logs /></DashboardLayout></ProtectedRoute>} />
              <Route path="/settings-system" element={<ProtectedRoute><SuperAdminRoute><SystemSettings /></SuperAdminRoute></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
