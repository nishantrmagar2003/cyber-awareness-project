import { useState, useEffect } from "react";

export function useAuth() {

  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {

    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setRole(user.role);
    }

  }, []);

  return { token, role };

}