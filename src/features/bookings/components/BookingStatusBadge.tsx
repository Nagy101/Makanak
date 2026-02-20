import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BookingStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  PendingOwnerApproval: {
    label: 'Pending Approval',
    classes: 'bg-warning/10 text-warning border-warning/30',
  },
  RejectedByOwner: {
    label: 'Rejected',
    classes: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  PendingPayment: {
    label: 'Pending Payment',
    classes: 'bg-warning/10 text-warning border-warning/30',
  },
  PaymentFailed: {
    label: 'Payment Failed',
    classes: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  PaymentReceived: {
    label: 'Payment Received',
    classes: 'bg-primary/10 text-primary border-primary/30',
  },
  Cancelled: {
    label: 'Cancelled',
    classes: 'bg-muted text-muted-foreground border-border',
  },
  CheckedIn: {
    label: 'Checked In',
    classes: 'bg-success/10 text-success border-success/30',
  },
  Completed: {
    label: 'Completed',
    classes: 'bg-success/10 text-success border-success/30',
  },
  Disputed: {
    label: 'Disputed',
    classes: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

const BookingStatusBadge = memo(({ status, className }: BookingStatusBadgeProps) => {
  const config = statusConfig[status] ?? {
    label: status,
    classes: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Badge variant="outline" className={cn(config.classes, className)}>
      {config.label}
    </Badge>
  );
});

BookingStatusBadge.displayName = 'BookingStatusBadge';
export default BookingStatusBadge;
