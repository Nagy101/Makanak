import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Dispute } from "../dispute.types";
import DisputeStatusBadge from "./DisputeStatusBadge";
import { format } from "date-fns";
import { encodeId } from "@/lib/idEncoder";

interface Props {
  dispute: Dispute;
}

const toUrl = (path: string) => (path.startsWith("http") ? path : `/${path}`);

const DisputeDetailsView = memo<Props>(({ dispute }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {dispute.propertyName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("bookings.ref")} {encodeId(dispute.bookingId)}
          </p>
        </div>
        <DisputeStatusBadge status={dispute.status} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">{t("disputes.complainant")}</p>
          <p className="font-medium text-foreground">
            {dispute.complainantName}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("disputes.defendant")}</p>
          <p className="font-medium text-foreground">{dispute.defendantName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("disputes.reason")}</p>
          <p className="font-medium text-foreground">{dispute.reason}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("disputes.filed")}</p>
          <p className="font-medium text-foreground">
            {format(new Date(dispute.createdAt), "MMM dd, yyyy")}
          </p>
        </div>
        {dispute.resolvedAt && (
          <div className="col-span-2">
            <p className="text-muted-foreground">{t("disputes.resolvedAt")}</p>
            <p className="font-medium text-foreground">
              {format(new Date(dispute.resolvedAt), "MMM dd, yyyy")}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {t("disputes.description")}
        </p>
        <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3">
          {dispute.description}
        </p>
      </div>

      {/* Admin Comment */}
      {dispute.adminComment && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {t("disputes.adminComment")}
          </p>
          <p className="text-sm text-foreground bg-primary/5 rounded-lg p-3 border border-primary/10">
            {dispute.adminComment}
          </p>
        </div>
      )}

      {/* Images */}
      {dispute.images?.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {t("disputes.attachedImages")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dispute.images.map((img, i) => (
              <a
                key={i}
                href={toUrl(img)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={toUrl(img)}
                  alt={`Evidence ${i + 1}`}
                  className="h-28 w-full object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                  loading="lazy"
                  width={200}
                  height={112}
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

DisputeDetailsView.displayName = "DisputeDetailsView";
export default DisputeDetailsView;
