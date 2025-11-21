import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getUserById } from "@/services/userService";

interface AuthContextType {
  isAuthenticated: boolean;
  userId: number | null;
  username: string | null;
  login: (userId: number) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedUserId = localStorage.getItem("userId");
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      
      if (storedUserId && isLoggedIn) {
        try {
          const user = await getUserById(parseInt(storedUserId));
          if (user) {
            setIsAuthenticated(true);
            setUserId(user.id);
            setUsername(user.username);
          } else {
            // User not found, clear auth data
            localStorage.removeItem("userId");
            localStorage.removeItem("isLoggedIn");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          // Clear auth data on error
          localStorage.removeItem("userId");
          localStorage.removeItem("isLoggedIn");
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (id: number) => {
    setIsAuthenticated(true);
    setUserId(id);
    localStorage.setItem("userId", id.toString());
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setUsername(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");
  };

  const value = {
    isAuthenticated,
    userId,
    username,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
