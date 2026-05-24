import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/src/context/AuthContext";
import pb from "@/src/lib/pocketbase";
import "./EditProfileModal.css";
function EditProfileModal({
  onClose
}) {
  const {
    user,
    updateProfile,
    authLoading,
    authError,
    setAuthError
  } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [readingListPublic, setReadingListPublic] = useState(user?.emailVisibility ?? true);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [localError, setLocalError] = useState("");
  const overlayRef = useRef(null);
  const handleOverlayClick = e => {
    if (e.target === overlayRef.current) onClose();
  };
  useEffect(() => {
    setAuthError("");
    setLocalError("");
    setSuccessMsg("");
  }, [setAuthError]);
  const joinDate = user?.created ? new Date(user.created).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "—";
  const handleUpdate = async e => {
    e.preventDefault();
    setLocalError("");
    setSuccessMsg("");
    setAuthError("");
    if (showPasswordSection) {
      if (!oldPassword) {
        setLocalError("Please enter your current password.");
        return;
      }
      if (newPassword.length < 8) {
        setLocalError("New password must be at least 8 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setLocalError("New passwords do not match.");
        return;
      }
    }
    const fields = {
      email: email.trim(),
      name: name.trim(),
      username: username.trim(),
      emailVisibility: readingListPublic
    };
    if (showPasswordSection && newPassword) {
      fields.oldPassword = oldPassword;
      fields.password = newPassword;
      fields.passwordConfirm = confirmPassword;
    }
    const ok = await updateProfile(fields);
    if (ok) {
      setSuccessMsg("Profile updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
    }
  };
  const avatarUrl = user?.avatar ? pb.files.getURL({
    id: user.id,
    collectionId: "_pb_users_auth_",
    collectionName: "users",
    avatar: user.avatar
  }, user.avatar, {
    thumb: "100x100"
  }) : null;
  const initials = (user?.name || user?.username || user?.email || "?")[0].toUpperCase();
  return <div className="ep-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Edit Profile">
               <div className="ep-modal">
                    <div className="ep-header">
                         <div className="ep-avatar-wrap">
                              {avatarUrl ? <img src={avatarUrl} alt={name || username} className="ep-avatar-img" /> : <div className="ep-avatar-fallback">{initials}</div>}
                         </div>
                         <div>
                              <h2 className="ep-title">Edit Profile</h2>
                              <p className="ep-subtitle">@{user?.name || user?.username || user?.email}</p>
                         </div>
                         <button className="ep-close" onClick={onClose} aria-label="Close">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                   <line x1="18" y1="6" x2="6" y2="18" />
                                   <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                         </button>
                    </div>

                    <form onSubmit={handleUpdate} className="ep-form">
                         <div className="ep-row">
                              <label className="ep-label">Join date</label>
                              <input className="ep-input ep-input--readonly" type="text" value={joinDate} readOnly tabIndex={-1} />
                         </div>

                         <div className="ep-row">
                              <label className="ep-label" htmlFor="ep-name">
                                   Display Name
                              </label>
                              <input id="ep-name" className="ep-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your display name" />
                         </div>

                         <div className="ep-row">
                              <label className="ep-label" htmlFor="ep-email">
                                   Email address
                              </label>
                              <input id="ep-email" className="ep-input" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                         </div>

                         <div className="ep-row">
                              <label className="ep-label" htmlFor="ep-username">
                                   Username
                              </label>
                              <input id="ep-username" className="ep-input" type="text" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
                         </div>

                         <div className="ep-row ep-row--visibility">
                              <label className="ep-label">Reading list visibility</label>
                              <div className="ep-visibility-wrap">
                                   <p className="ep-visibility-hint">
                                        Controls whether your watching list appears on your public profile and bookmarks URL.
                                   </p>
                                   <div className="ep-radio-group">
                                        <label className="ep-radio-label">
                                             <input type="radio" name="visibility" checked={!readingListPublic} onChange={() => setReadingListPublic(false)} />
                                             <span className="ep-radio-custom" />
                                             Private
                                        </label>
                                        <label className="ep-radio-label">
                                             <input type="radio" name="visibility" checked={readingListPublic} onChange={() => setReadingListPublic(true)} />
                                             <span className="ep-radio-custom ep-radio-custom--active" />
                                             Public
                                        </label>
                                   </div>
                              </div>
                         </div>

                         <div className="ep-row ep-row--password-toggle">
                              <label className="ep-label" />
                              <button type="button" className="ep-change-pw-btn" onClick={() => setShowPasswordSection(p => !p)}>
                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                   </svg>
                                   {showPasswordSection ? "Cancel password change" : "Change password"}
                              </button>
                         </div>

                         {showPasswordSection && <div className="ep-password-section">
                                   <div className="ep-row">
                                        <label className="ep-label" htmlFor="ep-old-pw">
                                             Current password
                                        </label>
                                        <input id="ep-old-pw" className="ep-input" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
                                   </div>
                                   <div className="ep-row">
                                        <label className="ep-label" htmlFor="ep-new-pw">
                                             New password
                                        </label>
                                        <input id="ep-new-pw" className="ep-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" />
                                   </div>
                                   <div className="ep-row">
                                        <label className="ep-label" htmlFor="ep-confirm-pw">
                                             Confirm new password
                                        </label>
                                        <input id="ep-confirm-pw" className="ep-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" />
                                   </div>
                              </div>}

                         {(localError || authError) && <p className="ep-msg ep-msg--error">{localError || authError}</p>}
                         {successMsg && <p className="ep-msg ep-msg--success">{successMsg}</p>}

                         <div className="ep-actions">
                              <button type="submit" className="ep-btn-update" disabled={authLoading}>
                                   {authLoading ? "Updating…" : "Update"}
                              </button>
                         </div>
                    </form>
               </div>
          </div>;
}
export default EditProfileModal;
