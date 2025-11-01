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
  const [tokenProcessed, setTokenProcessed] = useState(false);
  
  useEffect(() => {
    // Handle magic link token and email from URL parameters
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    
    if (token && email && !tokenProcessed) {
      setIsProcessingToken(true);
      setTokenProcessed(true);
      
      // Process the magic link token
      (async () => {
        try {
          console.log("Processing magic link with token:", token, "and email:", email);
          const result = await signIn("magic-link", { token, email });
          console.log("Sign in result:", result);
          
          // Check if sign-in was successful
          if (result && !result.signingIn) {
            console.log("Sign-in completed, waiting for auth state...");
            // Wait longer for auth state to propagate
            setTimeout(() => {
              console.log("Navigating to dashboard after successful sign-in");
              navigate("/dashboard");
            }, 3000);
          } else {
            console.error("Sign-in did not complete successfully:", result);
            setIsProcessingToken(false);
            setTokenProcessed(false);
          }
        } catch (error) {
          console.error("Magic link authentication failed:", error);
          setIsProcessingToken(false);
          setTokenProcessed(false);
        }
      })();
    }
  }, [searchParams, signIn, navigate, tokenProcessed]);

  useEffect(() => {
    // Redirect if already authenticated and no token in URL
    if (!isLoading && isAuthenticated && !searchParams.get("token")) {
      navigate(searchParams.get("redirect") || "/dashboard");
    }
  }, [isLoading, isAuthenticated, searchParams, navigate]);

  // Show loading spinner while processing magic link token
  if (isProcessingToken || searchParams.get("token")) {
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