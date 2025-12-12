import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/wellwell/Layout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Page not found</p>
        <Button variant="brand" onClick={() => navigate("/")}>
          <Home className="w-4 h-4" />
          Return Home
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
