import { memo, useMemo } from 'react';
import { Users, Building2, UserCheck, UserX, Clock, Newspaper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStats } from '../useAdmin';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const StatCard = memo<StatCardProps>(({ label, value, icon: Icon, color }) => (
  <Card className="border-border">
    <CardContent className="flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
));
StatCard.displayName = 'StatCard';

const AdminDashboardPage = memo(() => {
  const { data: stats, isLoading } = useAdminStats();

  const cards = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-primary/10 text-primary' },
      { label: 'Tenants', value: stats.tenantsCount, icon: Users, color: 'bg-primary/10 text-primary' },
      { label: 'Owners', value: stats.ownersCount, icon: Building2, color: 'bg-accent/10 text-accent' },
      { label: 'Admins', value: stats.adminsCount, icon: UserCheck, color: 'bg-success/10 text-success' },
      { label: 'Pending', value: stats.pendingUsers, icon: Clock, color: 'bg-warning/10 text-warning' },
      { label: 'Active', value: stats.activeUsers, icon: UserCheck, color: 'bg-success/10 text-success' },
      { label: 'Rejected', value: stats.rejectsCount, icon: UserX, color: 'bg-destructive/10 text-destructive' },
      { label: 'Banned', value: stats.bannedsCount, icon: UserX, color: 'bg-destructive/10 text-destructive' },
      { label: 'News', value: stats.newsCount, icon: Newspaper, color: 'bg-primary/10 text-primary' },
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your platform</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      )}
    </div>
  );
});

AdminDashboardPage.displayName = 'AdminDashboardPage';
export default AdminDashboardPage;
