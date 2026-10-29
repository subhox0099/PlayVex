import { NavLink } from "react-router-dom";
import {
  Home,
  Compass,
  Upload,
  Video,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import "./Sidebar.css";

const primarySection = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: Compass, label: "Explore", path: "/search" },
  { icon: Upload, label: "Upload", path: "/upload" },
];

const librarySection = [
  { icon: Video, label: "My Videos", path: "/my-videos" },
  { icon: User, label: "Profile", path: "/profile" },
];

const systemSection = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
      aria-label="Sidebar navigation"
    >
      <div className="sidebar__scrollable">
        {/* Primary Navigation */}
        <nav className="sidebar__section">
          {primarySection.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="sidebar__link-icon" />
              <span className="sidebar__link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Library Section */}
        <div className="sidebar__divider" />
        <nav className="sidebar__section">
          {!collapsed && <span className="sidebar__heading">You</span>}
          {librarySection.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="sidebar__link-icon" />
              <span className="sidebar__link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* System Section */}
        <div className="sidebar__divider" />
        <nav className="sidebar__section">
          {!collapsed && <span className="sidebar__heading">Preferences</span>}
          {systemSection.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="sidebar__link-icon" />
              <span className="sidebar__link-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Brand Tagline in Expanded Sidebar */}
        {!collapsed && (
          <div className="sidebar__footer">
            <div className="sidebar__footer-badge">
              <Sparkles size={13} />
              <span>PlayVex 2.0</span>
            </div>
            <p className="sidebar__tagline">A Universe of Entertainment.</p>
          </div>
        )}
      </div>

      {/* Collapse / Expand Toggle Button */}
      <button
        type="button"
        className="sidebar__toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;
