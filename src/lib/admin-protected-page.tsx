import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function AdminProtected({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("adminUser");
    if (!storedUser) {
      navigate("/admin-signIn");
      return;
    }

    const user = JSON.parse(storedUser);

    const allowedRoles = ["admin", "teammember"];
    if (!allowedRoles.includes(user.role)) {
      navigate("/admin-signIn");
      return;
    }
    
    setIsAuthorized(true);

  }, [navigate]);

  if (!isAuthorized) {
    // You can return a loader here
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
}