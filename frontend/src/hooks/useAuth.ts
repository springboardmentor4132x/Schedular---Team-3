import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const { user, setUser, logout, setMockRole } = useAuthStore();
  return { user, setUser, logout, setMockRole, isAuthenticated: !!user };
}
