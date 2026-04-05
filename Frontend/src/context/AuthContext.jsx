import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("❌ Error fetching user:", error.response?.data || error);
      clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      await fetchUser();
    };

    initAuth();
  }, [token, fetchUser]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error);

      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const response = await api.post("/auth/register", payload);
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("❌ Register failed:", error.response?.data || error);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("⚠️ Logout request failed:", error.response?.data || error);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
