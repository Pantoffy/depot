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
  [key: string]: unknown;
}

function extractUsername(decoded: DecodedToken): string {
  return (
    decoded.unique_name ||
    decoded.name ||
    decoded.sub ||
    decoded.email ||
    (decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] as string) ||
    (decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] as string) ||
    ""
  );
}

function extractRole(decoded: DecodedToken): string {
  return (
    decoded.role ||
    (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string) ||
    "Nhân viên kho"
  );
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
    const storedUsername = localStorage.getItem("username");

    if (storedToken && storedRefreshToken && storedUserId) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);

        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          // Token expired, try to refresh
          refreshAccessToken(storedRefreshToken, parseInt(storedUserId));
        } else {
          // Token still valid, restore session
          const decodedUser: AuthUser = {
            id: decoded.nameid || "",
            username: extractUsername(decoded) || storedUsername || "",
            role: extractRole(decoded) as AuthUser["role"],
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

      const decodedUser: AuthUser = {
        id: decoded.nameid || "",
        username: extractUsername(decoded),
        role: extractRole(decoded) as AuthUser["role"],
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

      const extractedUsername = extractUsername(decoded) || username;
      const extractedRole = extractRole(decoded);
      console.log("Role extracted:", extractedRole);
      console.log("Username extracted:", extractedUsername);
      console.log("JWT Token Claims:", decoded);

      const decodedUser: AuthUser = {
        id: decoded.nameid || "",
        username: extractedUsername,
        role: extractedRole as AuthUser["role"],
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
      localStorage.setItem("username", extractedUsername);
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
    localStorage.removeItem("username");
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
