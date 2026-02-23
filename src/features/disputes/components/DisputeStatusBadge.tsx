import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Props {
  status: string;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/30' },
  Resolved: { label: 'Resolved', className: 'bg-success/15 text-success border-success/30' },
  Rejected: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  Cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
};

const DisputeStatusBadge = memo<Props>(({ status }) => {
  const config = STATUS_MAP[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', config.className)}>
      {config.label}
    </Badge>
  );
});

DisputeStatusBadge.displayName = 'DisputeStatusBadge';
export default DisputeStatusBadge;
