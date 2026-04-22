import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const AuthContext = createContext(null);

/* =========================
   SAFE HELPERS
========================= */

function safeParseUser(rawUser) {
  if (!rawUser) return null;
  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function readStoredAuth() {
  const token = localStorage.getItem("token");
  const user = safeParseUser(localStorage.getItem("user"));

  return {
    token: token || null,
    user,
    role: user?.role || null,
    orgId: user?.organization_id ?? null,
  };
}

/* =========================
   AUTH PROVIDER
========================= */

function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    role: null,
    orgId: null,
  });

  const [loading, setLoading] = useState(true);

  /* =========================
     SYNC FROM STORAGE
  ========================= */
  const syncFromStorage = useCallback(() => {
    const data = readStoredAuth();
    setAuth(data);
  }, []);

  useEffect(() => {
    syncFromStorage();
    setLoading(false);

    const onStorage = (event) => {
      if (!event.key || ["token", "user"].includes(event.key)) {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncFromStorage]);

  /* =========================
     LOGIN
  ========================= */
  const login = useCallback((payloadOrToken, maybeUser) => {
    let payload =
      typeof payloadOrToken === "object" && payloadOrToken !== null
        ? payloadOrToken
        : { token: payloadOrToken, user: maybeUser };

    let token = payload?.token;
    let user = payload?.user;

    // 🔥 Handle different token formats
    if (typeof token === "object") {
      token = token.accessToken || token.token || null;
    }

    if (!token || !user) {
      console.error("Invalid login payload:", payload);
      throw new Error("login requires valid token and user");
    }

    // 🔐 Save to storage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // 🔄 Update state
    setAuth({
      token,
      user,
      role: user.role || null,
      orgId: user.organization_id ?? null,
    });
  }, []);

  /* =========================
     LOGOUT
  ========================= */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      token: null,
      user: null,
      role: null,
      orgId: null,
    });
  }, []);

  /* =========================
     CONTEXT VALUE
  ========================= */
  const value = useMemo(
    () => ({
      ...auth,
      loading, // ✅ IMPORTANT (for route guards)
      isAuthenticated: Boolean(auth.token && auth.user),
      login,
      logout,
      refreshAuth: syncFromStorage,
    }),
    [auth, loading, login, logout, syncFromStorage]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export default AuthProvider;