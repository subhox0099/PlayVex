import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { searchVideos } from "../api/videoService";
import VideoGrid from "../components/video/VideoGrid";
import ErrorState from "../components/common/ErrorState";
import { getErrorMessage } from "../utils/helpers";
import "./SearchPage.css";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [keyword, setKeyword] = useState(queryParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Sync input when URL parameter changes
  useEffect(() => {
    setKeyword(queryParam);
    if (queryParam.trim()) {
      executeSearch(queryParam.trim());
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [queryParam]);

  const executeSearch = async (term) => {
    if (!term) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchVideos(term);
      setResults(response.data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(getErrorMessage(err));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setKeyword("");
    setSearchParams({});
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="search-page">
      {/* Search Header Form */}
      <div className="search-page__header">
        <form onSubmit={handleSubmit} className="search-page__form" role="search">
          <div className="search-page__input-box">
            <SearchIcon size={20} className="search-page__icon" aria-hidden="true" />
            <input
              type="text"
              className="search-page__input"
              placeholder="Search by video title..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="Search keyword"
              autoFocus
            />
            {keyword && (
              <button
                type="button"
                className="search-page__clear-btn"
                onClick={handleClear}
                aria-label="Clear keyword"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !keyword.trim()}>
            Search
          </button>
        </form>

        {queryParam && (
          <div className="search-page__info">
            <span className="search-page__summary">
              {loading
                ? `Searching for "${queryParam}"...`
                : `${results.length} result${results.length === 1 ? "" : "s"} for "${queryParam}"`}
            </span>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && !loading && (
        <ErrorState
          message={`Failed to perform search: ${error}`}
          onRetry={() => executeSearch(queryParam)}
        />
      )}

      {/* Results Grid */}
      {!error && (
        <div className="search-page__content">
          <VideoGrid
            videos={results}
            loading={loading}
            skeletonCount={6}
            emptyTitle={hasSearched ? "No videos found" : "Explore videos"}
            emptyMessage={
              hasSearched
                ? `We couldn't find any videos matching "${queryParam}". Try searching for another title.`
                : "Enter a title keyword above to find videos across the PlayVex catalog."
            }
          />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
