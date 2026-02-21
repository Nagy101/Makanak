import { Link } from 'react-router-dom';
import {
  Building2, ArrowRight, Search, LayoutDashboard,
  CalendarCheck, PlusCircle, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNavbar from '@/components/UserNavbar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useProfile } from '@/features/auth/hooks/useAuth';

const Index = () => {
  const token = useAuthStore((s) => s.token);
  const { data: profileData } = useProfile();
  const storeUser = useAuthStore((s) => s.user);
  const user = profileData ?? storeUser;

  const isAuthenticated = !!token;
  const userTypeStr = (user?.role || user?.userType || '').toLowerCase();
  const isAdmin = userTypeStr === 'admin' || userTypeStr === 'administrator';
  const isOwner = userTypeStr === 'owner';
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  // --- Guest landing ---
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="text-center space-y-6 max-w-lg">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome to Makanak
          </h1>
          <p className="text-lg text-muted-foreground">
            Your trusted real estate platform. Find, book, and manage properties with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 font-semibold">
              <Link to="/properties">
                <Search className="mr-2 h-4 w-4" /> Browse Properties
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 font-semibold">
              <Link to="/login">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated — role-specific quick actions ---
  const quickActions = isAdmin
    ? [
        { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard, primary: true },
        { label: 'Manage Users', href: '/admin/users', icon: Users, primary: false },
        { label: 'Manage Properties', href: '/admin/properties', icon: Building2, primary: false },
      ]
    : isOwner
    ? [
        { label: 'My Properties', href: '/owner', icon: LayoutDashboard, primary: true },
        { label: 'Add Property', href: '/owner/properties/new', icon: PlusCircle, primary: false },
        { label: 'Incoming Bookings', href: '/owner/bookings', icon: CalendarCheck, primary: false },
      ]
    : [
        { label: 'Browse Properties', href: '/properties', icon: Search, primary: true },
        { label: 'My Bookings', href: '/my-bookings', icon: CalendarCheck, primary: false },
      ];

  const subtitle = isAdmin
    ? 'Manage users, properties, and platform health from the admin panel.'
    : isOwner
    ? 'Manage your properties, track bookings, and grow your portfolio.'
    : 'Discover and book your perfect stay from thousands of listed properties.';

  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="text-center space-y-6 max-w-lg">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-4">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {firstName ? `Hello, ${firstName}!` : 'Welcome back!'}
          </h1>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                asChild
                size="lg"
                variant={action.primary ? 'default' : 'outline'}
                className="h-12 px-6 font-semibold"
              >
                <Link to={action.href}>
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

