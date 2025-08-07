import { Navigate } from "react-router";

export function AdminProtected({ children }: { children: React.ReactNode }) {
  const storedUserJSON = sessionStorage.getItem("adminUser");

  if (storedUserJSON) {
    try {
      const user = JSON.parse(storedUserJSON);
      const allowedRoles = ["admin", "teammember"];
      const userRole = user.role ? String(user.role).toLowerCase().trim() : "";
      
      if (allowedRoles.includes(userRole)) {
        // User is authenticated and authorized
        return <>{children}</>;
      }
    } catch (e) {
      console.error("AdminProtected: Failed to parse user from session storage.", e);
      // Proceed to cleanup and redirect
    }
  }

  // If we reach here, the user is not authorized.
  // Clean up any potentially corrupted session data and redirect.
  sessionStorage.removeItem("adminUser");
  return <Navigate to="/admin-signIn" replace />;
}