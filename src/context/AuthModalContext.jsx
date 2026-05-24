import { createContext, useContext, useState, useCallback } from "react";
const AuthModalContext = createContext(null);
export function AuthModalProvider({
  children
}) {
  const [modal, setModal] = useState(null);
  const openLogin = useCallback(() => setModal("login"), []);
  const openRegister = useCallback(() => setModal("register"), []);
  const openForgot = useCallback(() => setModal("forgot"), []);
  const closeModal = useCallback(() => setModal(null), []);
  const switchView = useCallback(view => setModal(view), []);
  return <AuthModalContext.Provider value={{
    modal,
    openLogin,
    openRegister,
    openForgot,
    closeModal,
    switchView
  }}>
               {children}
          </AuthModalContext.Provider>;
}
export function useAuthModal() {
  return useContext(AuthModalContext);
}
