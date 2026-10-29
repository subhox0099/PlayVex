import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, LogOut, Video, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ProfileAvatar from "../profile/ProfileAvatar";
import "./UserMenu.css";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const items = [
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Video, label: "My Videos", path: "/my-videos" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="user-menu" ref={ref}>
      <button
        className="user-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User menu"
      >
        <ProfileAvatar username={user?.username || ""} size="sm" />
        <span className="user-menu__name">{user?.username || "Account"}</span>
        <ChevronDown
          size={14}
          className={`user-menu__chevron ${open ? "user-menu__chevron--open" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="user-menu__dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="user-menu__header">
              <ProfileAvatar username={user?.username || ""} size="md" />
              <div>
                <div className="user-menu__username">{user?.username}</div>
                <div className="user-menu__email">{user?.email}</div>
              </div>
            </div>
            <hr className="user-menu__divider" />
            {items.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                className="user-menu__item"
                onClick={() => { navigate(path); setOpen(false); }}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <hr className="user-menu__divider" />
            <button className="user-menu__item user-menu__item--danger" onClick={handleLogout}>
              <LogOut size={16} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
