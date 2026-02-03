import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-8">
              <span className="font-mono text-8xl text-muted-foreground/20">404</span>
            </div>
            <h1 className="text-2xl font-medium text-foreground mb-4">
              Signal Lost
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              The observation point you seek does not exist in this network. 
              The path may have dissolved, or never was.
            </p>
            <Link 
              to="/" 
              className="text-primary hover:underline font-mono text-sm"
            >
              Return to observatory
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
