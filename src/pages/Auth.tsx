import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/hooks/use-auth";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Spinner } from "@/components/ui/spinner";

function SignIn() {
  const { isLoading, isAuthenticated } = useAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  
  useEffect(() => {
    // Handle magic link token and email from URL parameters
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    
    if (token && email && !isAuthenticated && !isProcessingToken) {
      setIsProcessingToken(true);
      // Process the magic link token
      (async () => {
        try {
          await signIn("magic-link", { token, email });
          // Don't navigate immediately - let the auth state update first
        } catch (error) {
          console.error("Magic link authentication failed:", error);
          setIsProcessingToken(false);
        }
      })();
    }
  }, [searchParams, isAuthenticated, signIn, isProcessingToken]);

  useEffect(() => {
    // Only redirect once authentication is confirmed and not loading
    if (!isLoading && isAuthenticated && !searchParams.get("token")) {
      navigate(searchParams.get("redirect") || "/dashboard");
    }
    
    // Handle redirect after magic link authentication is complete
    if (!isLoading && isAuthenticated && isProcessingToken) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, searchParams, navigate, isProcessingToken]);

  // Show loading spinner while processing magic link token or during auth check
  if (isProcessingToken || (searchParams.get("token") && !isAuthenticated)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium">Signing you in...</p>
        </div>
      </div>
    );
  }

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