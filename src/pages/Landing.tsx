import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { AuthButton } from "@/components/auth/AuthButton";
import { Button } from "@/components/ui/button";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { Link } from "react-router";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <HeroGeometric 
        badge="EventHub"
        title1="One App. Every Event."
        title2="Zero Hassle."
      />
      
      {/* Navigation overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tight text-white">EventHub</span>
            <Link to="/admin-signIn">
              <LiquidButton 
                className="text-white text-sm"
                size="sm"
              >
                Admin
              </LiquidButton>
            </Link>
          </div>
          <AuthButton 
            trigger={
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Get Started
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}