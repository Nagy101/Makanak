import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import authHero from '@/assets/auth-hero.jpg';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      {/* Left: Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={authHero}
          alt="Luxury real estate"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-primary-foreground">
          <Link to="/" className="absolute top-8 left-8 flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">Makanak</span>
          </Link>
          <h2 className="text-4xl font-bold leading-tight mb-3">
            Find your perfect<br />place to call home
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Browse thousands of verified listings with confidence. Your dream property is just a few clicks away.
          </p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <Building2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">Makanak</span>
        </div>
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
