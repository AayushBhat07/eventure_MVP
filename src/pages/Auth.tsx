import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/hooks/use-auth";
import { Suspense, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";

function SignIn() {
  const { isLoading, isAuthenticated } = useAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Handle magic link token and email from URL parameters
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    
    if (token && email && !isAuthenticated) {
      // Process the magic link token
      (async () => {
        try {
          await signIn("magic-link", { token, email });
          // Authentication will be handled by the useEffect below
        } catch (error) {
          console.error("Magic link authentication failed:", error);
        }
      })();
    }
    
    if (!isLoading && isAuthenticated) {
      navigate(searchParams.get("redirect") || "/");
    }
  }, [isLoading, isAuthenticated, searchParams, navigate, signIn]);

  return (
    <div className="flex h-screen items-center justify-center">
      <AuthCard />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}
