import { Protected } from "@/lib/protected-page";

export default function Profile() {
  return (
    <Protected>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <h1 className="text-3xl font-bold">Profile Page</h1>
      </div>
    </Protected>
  );
}