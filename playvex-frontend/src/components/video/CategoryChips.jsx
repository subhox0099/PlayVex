import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./CategoryChips.css";

const CATEGORIES = [
  "All",
  "Recently Uploaded",
  "Popular",
  "Gaming",
  "Music",
  "Entertainment",
  "Trailers",
  "Tech & Code",
  "Comedy",
  "Education",
  "Cinematic",
];

const CategoryChips = ({ activeCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="category-chips-wrapper">
      {showLeftArrow && (
        <button
          type="button"
          className="category-chips__arrow category-chips__arrow--left"
          onClick={() => handleScroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div
        ref={scrollRef}
        className="category-chips"
        onScroll={checkScroll}
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              className={`category-chip ${isActive ? "category-chip--active" : ""}`}
              onClick={() => onSelectCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      {showRightArrow && (
        <button
          type="button"
          className="category-chips__arrow category-chips__arrow--right"
          onClick={() => handleScroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

export default CategoryChips;

