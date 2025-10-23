import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useOrganizations } from "@/hooks/useOrganizations";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationDetailsDialog } from "@/components/OrganizationDetailsDialog";
import { Input } from "@/components/ui/input";
import { Building2, Search, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Organization } from "@/hooks/useOrganizations";

export default function Organizacoes() {
  const { organizations, isLoading } = useOrganizations();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const filteredOrgs = organizations?.filter((org) =>
    org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: organizations?.length || 0,
    active: organizations?.filter((o) => o.subscription?.status === 'active').length || 0,
    trial: organizations?.filter((o) => o.subscription?.status === 'trial').length || 0,
    blocked: organizations?.filter((o) => o.subscription?.status === 'blocked').length || 0,
  };

  const handleViewDetails = (org: Organization) => {
    setSelectedOrg(org);
    setDetailsOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Organizações
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie todas as organizações do sistema
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Trial</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.trial}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bloqueadas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Organizations Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando organizações...
          </div>
        ) : filteredOrgs && filteredOrgs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map((org) => (
              <OrganizationCard
                key={org.id}
                organization={org}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchTerm ? "Nenhuma organização encontrada" : "Nenhuma organização cadastrada"}
          </div>
        )}
      </div>

      <OrganizationDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        organization={selectedOrg}
      />
    </DashboardLayout>
  );
}
