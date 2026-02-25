// ═══════════════════════════════════════════════════════════════
//  StatCardSkeleton — Pulse placeholder for financial metric cards
// ═══════════════════════════════════════════════════════════════
import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        </div>
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </CardContent>
    </Card>
  );
});

StatCardSkeleton.displayName = 'StatCardSkeleton';
export default StatCardSkeleton;
