import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_URL = "https://phoenix-rewear.onrender.com/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // {id,email,isAdmin}
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  // load profile if token exists on mount
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    fetch(API_URL + "/user/profile", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(async (res) => {
        if (!res.ok) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
        } else {
          const data = await res.json();
          setUser({
            id: data._id,
            email: data.email,
            isAdmin: data.isAdmin,
            points: data.points,
            fullName: data.profileDetails.fullName,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    const res = await fetch(API_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);

      // user state will get loaded from useEffect fetching profile
      return { success: true };
    } else {
      const msg = await res.json();
      setLoading(false);
      return { success: false, message: msg.message || "Login failed" };
    }
  };

  const signup = async (email, password, fullName) => {
    setLoading(true);
    const res = await fetch(API_URL + "/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      return { success: true };
    } else {
      const msg = await res.json();
      setLoading(false);
      return { success: false, message: msg.message || "Signup failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
