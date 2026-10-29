import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Bell, Menu, X } from "lucide-react";
import PlayVexLogo from "../common/PlayVexLogo";
import UserMenu from "./UserMenu";
import SearchBar from "./SearchBar";
import "./TopNavbar.css";

const TopNavbar = ({ onMenuToggle, sidebarOpen }) => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="topnav">
      <div className="topnav__left">
        <button
          className="topnav__menu-btn btn btn-icon btn-ghost"
          onClick={onMenuToggle}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/home" aria-label="PlayVex home" className="topnav__logo-link">
          <PlayVexLogo size="sm" />
        </Link>
      </div>

      <div className="topnav__center">
        <SearchBar />
      </div>

      <div className="topnav__right">
        <button
          className="topnav__search-mobile btn btn-icon btn-ghost"
          onClick={() => setShowSearch((v) => !v)}
          aria-label="Toggle search"
        >
          <Search size={20} />
        </button>

        <button
          className="btn btn-secondary btn-sm topnav__upload-btn"
          onClick={() => navigate("/upload")}
          title="Create or upload a video"
        >
          <Plus size={16} />
          <span>Create</span>
        </button>

        <button
          className="btn btn-icon btn-ghost topnav__notif-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="topnav__notif-dot" />
        </button>

        <UserMenu />
      </div>

      {showSearch && (
        <div className="topnav__mobile-search">
          <SearchBar autoFocus onSearch={() => setShowSearch(false)} />
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
