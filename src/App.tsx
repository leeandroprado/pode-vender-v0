import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Agentes from "./pages/Agentes";
import Produtos from "./pages/Produtos";
import Clientes from "./pages/Clientes";
import Atividades from "./pages/Atividades";
import Conta from "./pages/Conta";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/agentes" element={<DashboardLayout><Agentes /></DashboardLayout>} />
          <Route path="/produtos" element={<DashboardLayout><Produtos /></DashboardLayout>} />
          <Route path="/clientes" element={<DashboardLayout><Clientes /></DashboardLayout>} />
          <Route path="/atividades" element={<DashboardLayout><Atividades /></DashboardLayout>} />
          <Route path="/conta" element={<DashboardLayout><Conta /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
