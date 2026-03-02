import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BookingStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { labelKey: string; classes: string }> = {
  PendingOwnerApproval: {
    labelKey: "bookings.pendingApproval",
    classes: "bg-warning/10 text-warning border-warning/30",
  },
  RejectedByOwner: {
    labelKey: "bookings.rejected",
    classes: "bg-destructive/10 text-destructive border-destructive/30",
  },
  PendingPayment: {
    labelKey: "bookings.pendingPayment",
    classes: "bg-warning/10 text-warning border-warning/30",
  },
  PaymentFailed: {
    labelKey: "bookings.paymentFailed",
    classes: "bg-destructive/10 text-destructive border-destructive/30",
  },
  PaymentReceived: {
    labelKey: "bookings.confirmed",
    classes: "bg-primary/10 text-primary border-primary/30",
  },
  Cancelled: {
    labelKey: "bookings.cancelled",
    classes: "bg-muted text-muted-foreground border-border",
  },
  CheckedIn: {
    labelKey: "bookings.checkedIn",
    classes: "bg-success/10 text-success border-success/30",
  },
  Completed: {
    labelKey: "bookings.completed",
    classes: "bg-success/10 text-success border-success/30",
  },
  Disputed: {
    labelKey: "bookings.disputed",
    classes: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

const BookingStatusBadge = memo(
  ({ status, className }: BookingStatusBadgeProps) => {
    const { t } = useTranslation();
    const config = statusConfig[status] ?? {
      labelKey: status,
      classes: "bg-muted text-muted-foreground border-border",
    };

    return (
      <Badge variant="outline" className={cn(config.classes, className)}>
        {t(config.labelKey)}
      </Badge>
    );
  },
);

BookingStatusBadge.displayName = "BookingStatusBadge";
export default BookingStatusBadge;
