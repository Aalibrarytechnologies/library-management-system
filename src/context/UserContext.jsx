import { createContext, useContext, useEffect, useState } from "react";
import { retryFetch } from "../utils/retryFetch";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // NEW

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken).finally(() => setLoading(false)); // NEW
    } else {
      setLoading(false); // NEW
    }
  }, []);

  // Fetch authenticated user's profile
  const fetchUser = async (authToken) => {
    try {
      const res = await retryFetch(
        "https://libarybackend.vercel.app/users/me/",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        }
      );

      const userData = await res.json();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (err) {
      console.error("Error loading user:", err);
      logout();
    }
  };

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  };

  const updateUser = async (fieldsToUpdate) => {
    if (!token) return;

    try {
      const res = await fetch("https://libarybackend.vercel.app/users/me/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fieldsToUpdate),
      });

      if (!res.ok) throw new Error("Update failed");

      const updatedUser = await res.json();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error updating user:", err.message);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, token, loading, login, logout, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
