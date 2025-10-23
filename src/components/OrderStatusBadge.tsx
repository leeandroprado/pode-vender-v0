import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  PackageCheck, 
  XCircle 
} from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  },
  confirmed: {
    label: 'Confirmado',
    icon: CheckCircle2,
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  processing: {
    label: 'Processando',
    icon: Package,
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  shipped: {
    label: 'Enviado',
    icon: Truck,
    className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  delivered: {
    label: 'Entregue',
    icon: PackageCheck,
    className: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-500 border-red-500/20',
  },
};

export const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1.5 px-2.5 py-1`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
};
