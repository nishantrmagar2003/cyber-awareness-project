import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [orgId, setOrgId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setToken(storedToken);
      setUser(parsedUser);
      setRole(parsedUser.role);
      setOrgId(parsedUser.organization_id);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
    setRole(data.user.role);
    setOrgId(data.user.organization_id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setRole(null);
    setOrgId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        orgId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;