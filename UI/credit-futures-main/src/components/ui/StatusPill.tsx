import { cn } from '@/lib/utils';
import { PositionStatus, PositionDirection } from '@/store/appStore';

interface StatusPillProps {
  status: PositionStatus | PositionDirection | 'PROFIT' | 'LOSS' | 'WARNING' | 'NEUTRAL';
  size?: 'sm' | 'md';
}

export const StatusPill = ({ status, size = 'sm' }: StatusPillProps) => {
  const getStyles = () => {
    switch (status) {
      case 'ACTIVE':
      case 'LONG':
      case 'PROFIT':
        return 'status-profit';
      case 'BOUNCED':
      case 'SHORT':
      case 'LOSS':
        return 'status-loss';
      case 'UNCONFIGURED':
      case 'UNSET':
      case 'WARNING':
        return 'status-warning';
      case 'SETTLED':
      case 'NEUTRAL':
      default:
        return 'status-neutral';
    }
  };

  return (
    <span
      className={cn(
        'status-pill',
        getStyles(),
        size === 'sm' && 'text-[10px] px-1.5 py-0.5',
        size === 'md' && 'text-xs px-2 py-1'
      )}
    >
      {status}
    </span>
  );
};
