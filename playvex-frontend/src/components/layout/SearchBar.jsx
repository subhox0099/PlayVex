import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import "./SearchBar.css";

const SearchBar = ({ autoFocus = false, onSearch }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    onSearch?.();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-bar__inner">
        <input
          type="search"
          className="search-bar__input"
          placeholder="Search videos in the universe..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={autoFocus}
          aria-label="Search videos"
        />
        {value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={() => setValue("")}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
      <button type="submit" className="search-bar__btn" aria-label="Search">
        <Search size={18} />
      </button>
    </form>
  );
};

export default SearchBar;
