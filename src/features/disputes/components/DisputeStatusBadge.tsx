import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
}

const STATUS_MAP: Record<string, { labelKey: string; className: string }> = {
  Pending: {
    labelKey: "disputes.pending",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  Resolved: {
    labelKey: "disputes.resolved",
    className: "bg-success/15 text-success border-success/30",
  },
  Rejected: {
    labelKey: "disputes.rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  Cancelled: {
    labelKey: "disputes.cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const DisputeStatusBadge = memo<Props>(({ status }) => {
  const { t } = useTranslation();
  const config = STATUS_MAP[status] ?? { labelKey: status, className: "" };
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className)}
    >
      {t(config.labelKey)}
    </Badge>
  );
});

DisputeStatusBadge.displayName = "DisputeStatusBadge";
export default DisputeStatusBadge;
