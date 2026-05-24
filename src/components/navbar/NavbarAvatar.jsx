import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import pb from "@/src/lib/pocketbase";
import EditProfileModal from "@/src/components/editprofile/EditProfileModal";
function NavbarAvatar() {
     const {
          user,
          logout
     } = useAuth();
     const [open, setOpen] = useState(false);
     const [editOpen, setEditOpen] = useState(false);
     const containerRef = useRef(null);
     useEffect(() => {
          if (!open) return;
          const handleClickOutside = e => {
               if (containerRef.current && !containerRef.current.contains(e.target)) {
                    setOpen(false);
               }
          };
          document.addEventListener("mousedown", handleClickOutside);
          return () => document.removeEventListener("mousedown", handleClickOutside);
     }, [open]);
     if (!user) return null;
     const avatarUrl = user.avatar ? pb.files.getURL({
          id: user.id,
          collectionId: user.collectionId || "_pb_users_auth_",
          collectionName: "users",
          avatar: user.avatar
     }, user.avatar, {
          thumb: "100x100"
     }) : null;
     const initials = (user.name || user.username || user.email || "?")[0].toUpperCase();
     const openEditProfile = () => {
          setOpen(false);
          setEditOpen(true);
     };
     return <>
          <div ref={containerRef} style={{
               position: "relative",
               marginRight: "8px"
          }}>
               <button onClick={() => setOpen(prev => !prev)} aria-label="Account menu" style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "none",
                    background: "rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0
               }}>
                    {avatarUrl ? <img src={avatarUrl} alt={user.username} style={{
                         width: "100%",
                         height: "100%",
                         objectFit: "cover"
                    }} onError={e => {
                         e.currentTarget.style.display = "none";
                         e.currentTarget.parentElement.setAttribute("data-initials", initials);
                    }} /> : <span style={{
                         color: "rgba(255,255,255,0.8)",
                         fontSize: "15px",
                         fontWeight: 700,
                         lineHeight: 1,
                         userSelect: "none"
                    }}>
                         {initials}
                    </span>}
               </button>

               {open && <div style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "230px",
                    background: "rgba(42, 44, 49, 0.95)",
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    zIndex: 9999999,
                    fontSize: "15px",
                    color: "#e0e0e0"
               }}>
                    <div style={{
                         paddingBottom: "10px",
                         borderBottom: "1px solid rgba(255,255,255,0.15)"
                    }}>
                         <p style={{
                              margin: 0,
                              lineHeight: 1.4
                         }}>
                              Hello,{" "}
                              <span style={{
                                   color: "#cae962",
                                   fontWeight: 600
                              }}>
                                   @{user.name || user.username || user.email}
                              </span>
                         </p>
                    </div>

                    <Link to={`/profile/${user.username || user.id}`} onClick={() => setOpen(false)} style={{
                         display: "flex",
                         alignItems: "center",
                         gap: "8px",
                         color: "#e0e0e0",
                         textDecoration: "none",
                         padding: "6px 0",
                         borderBottom: "1px solid rgba(255,255,255,0.15)",
                         paddingBottom: "12px"
                    }}>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                         </svg>
                         <span>Profile</span>
                    </Link>

                    <button onClick={openEditProfile} style={{
                         display: "flex",
                         alignItems: "center",
                         gap: "8px",
                         background: "none",
                         border: "none",
                         color: "#e0e0e0",
                         cursor: "pointer",
                         padding: "6px 0",
                         paddingBottom: "12px",
                         fontSize: "15px",
                         width: "100%",
                         textAlign: "left",
                         borderBottom: "1px solid rgba(255,255,255,0.15)"
                    }}>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                         </svg>
                         <span>Edit Profile</span>
                    </button>

                    <button onClick={() => {
                         setOpen(false);
                         logout();
                    }} style={{
                         display: "flex",
                         alignItems: "center",
                         gap: "8px",
                         background: "none",
                         border: "none",
                         color: "#e0e0e0",
                         cursor: "pointer",
                         padding: "6px 0",
                         fontSize: "15px",
                         width: "100%",
                         textAlign: "left"
                    }}>
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                         </svg>
                         <span>Logout</span>
                    </button>
               </div>}
          </div>

          {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
     </>;
}
export default NavbarAvatar;