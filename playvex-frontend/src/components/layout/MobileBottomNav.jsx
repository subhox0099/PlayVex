import { NavLink } from "react-router-dom";
import { Home, Search, PlusCircle, Video, User } from "lucide-react";
import "./MobileBottomNav.css";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: PlusCircle, label: "Upload", path: "/upload", primary: true },
  { icon: Video, label: "My Videos", path: "/my-videos" },
  { icon: User, label: "Profile", path: "/profile" },
];

const MobileBottomNav = () => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav__container">
        {navItems.map(({ icon: Icon, label, path, primary }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `mobile-bottom-nav__item ${isActive ? "mobile-bottom-nav__item--active" : ""} ${
                primary ? "mobile-bottom-nav__item--primary" : ""
              }`
            }
          >
            <div className="mobile-bottom-nav__icon-wrapper">
              <Icon size={primary ? 26 : 22} />
            </div>
            <span className="mobile-bottom-nav__label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

