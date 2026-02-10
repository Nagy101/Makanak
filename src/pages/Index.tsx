import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
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
          Your trusted real estate platform. Find, buy, and sell properties with ease.
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
};

export default Index;
