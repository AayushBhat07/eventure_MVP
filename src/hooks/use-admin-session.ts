/**
 * Helper to get admin session data from sessionStorage.
 * Used across admin pages to determine role-based access.
 */
export interface AdminSession {
  _id: string;
  email: string;
  role: string;
  name?: string;
}

export function getAdminSession(): AdminSession | null {
  try {
    const stored = sessionStorage.getItem("adminUser");
    if (stored) {
      return JSON.parse(stored) as AdminSession;
    }
  } catch {}
  return null;
}

export function isAdminRole(): boolean {
  const session = getAdminSession();
  return session?.role === "admin";
}

export function isTeamMemberRole(): boolean {
  const session = getAdminSession();
  return session?.role === "teammember";
}
