import { createContext, useContext, useState, useEffect, useCallback } from "react";
import pb from "@/src/lib/pocketbase";
const AuthContext = createContext(null);
function buildUserFromRecord(record) {
  return {
    id: record.id,
    email: record.email,
    emailVisibility: record.emailVisibility,
    username: record.username || "",
    name: record.name || "",
    avatar: record.avatar || "",
    autoSkip: record.autoSkip ?? false,
    verified: record.verified ?? false,
    created: record.created,
    updated: record.updated
  };
}
export function AuthProvider({
  children
}) {
  const [user, setUser] = useState(() => {
    if (pb.authStore.isValid && pb.authStore.record) {
      return buildUserFromRecord(pb.authStore.record);
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  useEffect(() => {
    const unsub = pb.authStore.onChange((token, record) => {
      if (pb.authStore.isValid && record) {
        setUser(buildUserFromRecord(record));
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);
  const login = useCallback(async ({
    emailOrUsername,
    password
  }) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await pb.collection("users").authWithPassword(emailOrUsername.trim(), password);
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser(buildUserFromRecord(pb.authStore.record));
        return true;
      }
    } catch (err) {
      const msg = err?.response?.message || err?.message || "Login failed.";
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  }, []);
  const register = useCallback(async ({
    username,
    email,
    password,
    confirmPassword
  }) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      if (password !== confirmPassword) throw new Error("Passwords do not match.");
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      await pb.collection("users").create({
        username: username.trim(),
        email: email.trim(),
        password,
        passwordConfirm: confirmPassword,
        emailVisibility: false,
        autoSkip: false
      });
      await pb.collection("users").authWithPassword(email.trim(), password);
      if (pb.authStore.isValid && pb.authStore.record) {
        setUser(buildUserFromRecord(pb.authStore.record));
        return true;
      }
    } catch (err) {
      const data = err?.response?.data;
      if (data?.email?.message) {
        setAuthError("Email: " + data.email.message);
      } else if (data?.username?.message) {
        setAuthError("Username: " + data.username.message);
      } else if (data?.password?.message) {
        setAuthError("Password: " + data.password.message);
      } else {
        setAuthError(err?.response?.message || err?.message || "Registration failed.");
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);
  const forgotPassword = useCallback(async ({
    emailOrUsername
  }) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await pb.collection("users").requestPasswordReset(emailOrUsername.trim());
      return true;
    } catch (err) {
      setAuthError(err?.response?.message || err?.message || "Failed to send reset email.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);
  const updateProfile = useCallback(async fields => {
    if (!user?.id) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const updated = await pb.collection("users").update(user.id, fields);
      setUser(buildUserFromRecord(updated));
      return true;
    } catch (err) {
      setAuthError(err?.response?.message || err?.message || "Update failed.");
    } finally {
      setAuthLoading(false);
    }
  }, [user]);
  const getAvatarUrl = useCallback((record = pb.authStore.record, size = "100x100") => {
    if (!record?.avatar) return null;
    return pb.files.getURL(record, record.avatar, {
      thumb: size
    });
  }, []);
  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
  }, []);
  return <AuthContext.Provider value={{
    user,
    isAuthenticated: !!user,
    authLoading,
    authError,
    setAuthError,
    login,
    register,
    forgotPassword,
    updateProfile,
    getAvatarUrl,
    logout
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
export default AuthContext;
