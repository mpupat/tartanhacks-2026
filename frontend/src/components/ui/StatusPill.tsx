import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Check, AlertCircle, Clock, XCircle } from 'lucide-react';

type Status =
  | 'ACTIVE'
  | 'UNCONFIGURED'
  | 'SETTLED'
  | 'BOUNCED'
  | 'LONG'
  | 'SHORT'
  | 'UNSET';

const statusConfig: Record<
  Status,
  { className: string; label: string; icon?: React.ElementType }
> = {
  ACTIVE: {
    className: 'badge-success',
    label: 'Active',
    icon: Check,
  },
  UNCONFIGURED: {
    className: 'badge-warning',
    label: 'Pending',
    icon: AlertCircle,
  },
  SETTLED: {
    className: 'badge-info',
    label: 'Settled',
    icon: Check,
  },
  BOUNCED: {
    className: 'badge-danger',
    label: 'Bounced',
    icon: XCircle,
  },
  LONG: {
    className: 'badge-long',
    label: 'Long',
    icon: ArrowUp,
  },
  SHORT: {
    className: 'badge-short',
    label: 'Short',
    icon: ArrowDown,
  },
  UNSET: {
    className: 'badge-neutral',
    label: 'Not Set',
    icon: Clock,
  },
};

interface StatusPillProps {
  status: Status;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusPill = ({ status, size = 'md', showIcon = true }: StatusPillProps) => {
  const config = statusConfig[status] || statusConfig.UNSET;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'badge',
        config.className,
        size === 'sm' && 'text-[10px] px-2 py-0.5'
      )}
    >
      {showIcon && Icon && <Icon className={cn('w-3 h-3', size === 'sm' && 'w-2.5 h-2.5')} />}
      <span>{config.label}</span>
    </span>
  );
};
