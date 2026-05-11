import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

export interface AuthUser {
  id: string;
  username: string;
  role: "Admin" | "Nhân viên kho" | "Quản lý kho";
}

interface DecodedToken {
  nameid?: string;
  unique_name?: string;
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  hasRole: (role: string) => boolean;
  canApprove: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUserId = localStorage.getItem("userId");

    if (storedToken && storedRefreshToken && storedUserId) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);

        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          // Token expired, try to refresh
          refreshAccessToken(storedRefreshToken, parseInt(storedUserId));
        } else {
          // Token still valid, restore session
          const roleFromToken = decoded.role || (decoded as any)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Nhân viên kho";
          const decodedUser: AuthUser = {
            id: decoded.nameid || "",
            username: decoded.unique_name || "",
            role: roleFromToken as AuthUser["role"],
          };
          setUser(decodedUser);
          setAccessToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUserId(parseInt(storedUserId));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        // Clear invalid token
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
      }
    }
    setIsLoading(false);
  }, []);

  const refreshAccessToken = async (
    refreshTokenValue: string,
    userIdValue: number
  ) => {
    try {
      const response = await fetch("/api/Auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdValue,
          refreshToken: refreshTokenValue,
        }),
      });

      if (!response.ok) throw new Error("Refresh failed");

      const data = await response.json();
      const decoded = jwtDecode<DecodedToken>(data.accessToken);

      // Try multiple possible role claim names
      const roleFromToken = decoded.role || (decoded as any)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Nhân viên kho";
      
      // Try multiple possible username claim names
      const usernameFromToken = decoded.unique_name || decoded.sub || decoded.email || decoded.name || "";

      const decodedUser: AuthUser = {
        id: decoded.nameid || "",
        username: usernameFromToken,
        role: roleFromToken as AuthUser["role"],
      };

      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(decodedUser);
      setIsAuthenticated(true);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
    } catch (error) {
      console.error("Refresh token failed:", error);
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      const decoded = jwtDecode<DecodedToken>(data.accessToken);
      
      // Debug: Log all claims in token
      console.log("JWT Token Claims:", decoded);

      // Try multiple possible role claim names
      const roleFromToken = decoded.role || (decoded as any)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Nhân viên kho";
      
      // Try multiple possible username claim names
      const usernameFromToken = decoded.unique_name || decoded.sub || decoded.email || decoded.name || username;
      
      console.log("Role extracted:", roleFromToken);
      console.log("Username extracted:", usernameFromToken);

      // Extract user info from JWT claims
      const decodedUser: AuthUser = {
        id: decoded.nameid || "",
        username: usernameFromToken,
        role: roleFromToken as AuthUser["role"],
      };

      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(decodedUser);
      setIsAuthenticated(true);

      // Assuming userId is embedded in the token or returned separately
      // If not, you may need to extract it from the username or another source
      const userIdFromToken = parseInt(decoded.nameid || "0");
      setUserId(userIdFromToken);

      // Store tokens in localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userId", userIdFromToken.toString());
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAccessToken(null);
    setRefreshToken(null);
    setUserId(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const canApprove = () => {
    return user?.role === "Quản lý kho";
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    accessToken,
    refreshToken,
    userId,
    hasRole,
    canApprove,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
