// ═══════════════════════════════════════════════════════════════
//  FinancialCard — A single high-impact currency metric card.
//  memo-wrapped; will not re-render unless props change.
// ═══════════════════════════════════════════════════════════════
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

// ── Currency formatter (Egyptian Pound) ───────────────────────
const egpFormatter = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

interface FinancialCardProps {
  label: string;
  amount: number;
  icon: React.ElementType;
  /** Tailwind utility classes for the icon background + text colour */
  accentClass: string;
  /** Optional short descriptor shown below the amount */
  description?: string;
}

export const FinancialCard = memo(function FinancialCard({
  label,
  amount,
  icon: Icon,
  accentClass,
  description,
}: FinancialCardProps) {
  return (
    <Card className="border-border bg-card shadow-card hover:shadow-card-hover transition-shadow transition-premium">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {label}
            </p>
            <p className="text-3xl font-bold text-foreground tabular-nums leading-tight">
              {egpFormatter.format(amount)}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ml-4 ${accentClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FinancialCard.displayName = "FinancialCard";
export default FinancialCard;
