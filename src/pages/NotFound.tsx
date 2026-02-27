import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Building2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-muted p-6">
            <img
              src="/Makanak_logo.ico"
              alt="Makanak Logo"
              className="h-14 object-contain opacity-40 grayscale"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold text-foreground tracking-tight">
            404
          </h1>
          <p className="text-xl font-semibold text-foreground">
            Page not found
          </p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild size="lg" className="h-12 px-8 font-semibold">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
