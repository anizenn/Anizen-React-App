import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/src/context/AuthContext";
import { useAuthModal } from "@/src/context/AuthModalContext";
import "./AuthModal.css";
const TURNSTILE_SITE_KEY = "0x4AAAAADVP0htEK_D8Gd0i";
function useTurnstile(containerRef) {
  const widgetIdRef = useRef(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);
  const reset = useCallback(() => {
    setToken(null);
    if (widgetIdRef.current !== null && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  }, []);
  useEffect(() => {
    let script = document.getElementById("cf-turnstile-script");
    const render = () => {
      if (!containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "dark",
        callback: t => {
          setToken(t);
          setReady(true);
        },
        "expired-callback": () => {
          setToken(null);
          setReady(false);
        },
        "error-callback": () => {
          setToken(null);
          setReady(false);
        }
      });
    };
    if (!script) {
      script = document.createElement("script");
      script.id = "cf-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      render();
    } else {
      script.addEventListener("load", render);
    }
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      setToken(null);
      setReady(false);
    };
  }, [containerRef]);
  return {
    token,
    ready,
    reset
  };
}
function LoginView({
  switchView
}) {
  const {
    login,
    authLoading,
    authError,
    setAuthError
  } = useAuth();
  const {
    closeModal
  } = useAuthModal();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const cfRef = useRef(null);
  const {
    token: cfToken,
    reset: cfReset
  } = useTurnstile(cfRef);
  useEffect(() => {
    setAuthError("");
  }, [setAuthError]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!emailOrUsername.trim() || !password) {
      setAuthError("Please fill in all fields.");
      return;
    }
    if (!cfToken) {
      setAuthError("Please complete the security check.");
      return;
    }
    const success = await login({
      emailOrUsername: emailOrUsername.trim(),
      password,
      cfToken
    });
    if (success) closeModal();else cfReset();
  };
  return <>
      <h2 className="auth-title">Welcome back!</h2>
      {authError && <div className="auth-error">{authError}</div>}
      <form onSubmit={handleSubmit} autoComplete="on">
        <div className="auth-field">
          <label>Email Address</label>
          <input type="text" placeholder="Username or email" value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} autoComplete="username" disabled={authLoading} />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" disabled={authLoading} />
        </div>
        <div className="auth-forgot">
          <button type="button" onClick={() => switchView("forgot")}>
            Forgot password?
          </button>
        </div>
        <div className="auth-turnstile" ref={cfRef} />
        <button type="submit" className={`auth-submit${authLoading ? " loading" : ""}`} disabled={authLoading}>
          {authLoading ? <><span className="auth-spinner" />Signing in…</> : "Login"}
        </button>
      </form>
      <div className="auth-switch">
        Don&apos;t have an account?
        <button type="button" onClick={() => switchView("register")}>Register</button>
      </div>
    </>;
}
function RegisterView({
  switchView
}) {
  const {
    register,
    authLoading,
    authError,
    setAuthError
  } = useAuth();
  const {
    closeModal
  } = useAuthModal();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const cfRef = useRef(null);
  const {
    token: cfToken,
    reset: cfReset
  } = useTurnstile(cfRef);
  useEffect(() => {
    setAuthError("");
  }, [setAuthError]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }
    if (!cfToken) {
      setAuthError("Please complete the security check.");
      return;
    }
    const success = await register({
      username: username.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      cfToken
    });
    if (success) closeModal();else cfReset();
  };
  return <>
      <h2 className="auth-title">Create an Account</h2>
      {authError && <div className="auth-error">{authError}</div>}
      <form onSubmit={handleSubmit} autoComplete="on">
        <div className="auth-field">
          <label>Username</label>
          <input type="text" placeholder="Name" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" disabled={authLoading} />
        </div>
        <div className="auth-field">
          <label>Email Address</label>
          <input type="email" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" disabled={authLoading} />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" disabled={authLoading} />
        </div>
        <div className="auth-field">
          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" disabled={authLoading} />
        </div>
        <div className="auth-turnstile" ref={cfRef} />
        <button type="submit" className={`auth-submit${authLoading ? " loading" : ""}`} disabled={authLoading}>
          {authLoading ? <><span className="auth-spinner" />Creating account…</> : "Register"}
        </button>
      </form>
      <div className="auth-switch">
        Have an account?
        <button type="button" onClick={() => switchView("login")}>Login</button>
      </div>
    </>;
}
function ForgotView({
  switchView
}) {
  const {
    forgotPassword,
    authLoading,
    authError,
    setAuthError
  } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [sent, setSent] = useState(false);
  const cfRef = useRef(null);
  const {
    token: cfToken,
    reset: cfReset
  } = useTurnstile(cfRef);
  useEffect(() => {
    setAuthError("");
  }, [setAuthError]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      setAuthError("Please enter your email or username.");
      return;
    }
    if (!cfToken) {
      setAuthError("Please complete the security check.");
      return;
    }
    const ok = await forgotPassword({
      emailOrUsername: emailOrUsername.trim(),
      cfToken
    });
    if (ok) setSent(true);else cfReset();
  };
  return <>
      <h2 className="auth-title">Reset Password</h2>
      {authError && <div className="auth-error">{authError}</div>}
      {sent ? <div className="auth-success">
          If that account exists, a reset link has been sent. Please check your email.
        </div> : <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Your Email</label>
            <input type="text" placeholder="Email or Username" value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} disabled={authLoading} />
          </div>
          <div className="auth-turnstile" ref={cfRef} />
          <button type="submit" className={`auth-submit${authLoading ? " loading" : ""}`} disabled={authLoading}>
            {authLoading ? <><span className="auth-spinner" />Sending…</> : "Submit"}
          </button>
        </form>}
      <div className="auth-back">
        <button type="button" onClick={() => switchView("login")}>
          ← Back to Sign-in
        </button>
      </div>
    </>;
}
export default function AuthModal() {
  const {
    modal,
    closeModal,
    switchView
  } = useAuthModal();
  useEffect(() => {
    if (!modal) return;
    const onKey = e => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);
  useEffect(() => {
    if (!modal) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [modal]);
  if (!modal) return null;
  return createPortal(<div className="auth-overlay" onClick={e => {
    if (e.target === e.currentTarget) closeModal();
  }} role="dialog" aria-modal="true">
      <div className="auth-modal">
        <button className="auth-close" onClick={closeModal} aria-label="Close">✕</button>
        {modal === "login" && <LoginView switchView={switchView} />}
        {modal === "register" && <RegisterView switchView={switchView} />}
        {modal === "forgot" && <ForgotView switchView={switchView} />}
      </div>
    </div>, document.body);
}
