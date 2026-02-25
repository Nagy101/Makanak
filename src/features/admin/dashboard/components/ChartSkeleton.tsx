// ═══════════════════════════════════════════════════════════════
//  ChartSkeleton — Pulse placeholder shown while a chart section
//  is loading (either fetching data or lazy-loading the bundle).
// ═══════════════════════════════════════════════════════════════
import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ChartSkeletonProps {
  /** Approximate height of the chart area in px. Default 260. */
  height?: number;
  /** Optional title shown in the card header skeleton. */
  showTitle?: boolean;
}

export const ChartSkeleton = memo(function ChartSkeleton({
  height = 260,
  showTitle = true,
}: ChartSkeletonProps) {
  return (
    <Card className="border-border">
      {showTitle && (
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-3 w-28 rounded mt-1" />
        </CardHeader>
      )}
      <CardContent>
        <Skeleton className="w-full rounded-lg" style={{ height }} />
      </CardContent>
    </Card>
  );
});

ChartSkeleton.displayName = 'ChartSkeleton';
export default ChartSkeleton;
