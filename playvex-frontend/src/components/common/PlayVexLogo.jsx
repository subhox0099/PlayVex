import "./PlayVexLogo.css";

/**
 * PlayVex Logo — SVG wordmark + play-triangle icon.
 * Accepts `size` ("sm" | "md" | "lg") and `showTagline` (bool).
 */
const PlayVexLogo = ({ size = "md", showTagline = false, className = "" }) => {
  const sizeMap = {
    sm: { icon: 24, text: 18, tagline: 9 },
    md: { icon: 32, text: 24, tagline: 10 },
    lg: { icon: 48, text: 36, tagline: 13 },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`playvex-logo playvex-logo--${size} ${className}`}>
      {/* Icon: stylized play hexagon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Hexagon background */}
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          fill="#FF3B5C"
          opacity="0.15"
        />
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          stroke="#FF3B5C"
          strokeWidth="2"
          fill="none"
        />
        {/* Play triangle */}
        <path d="M16 13L30 20L16 27V13Z" fill="#FF3B5C" />
      </svg>

      {/* Wordmark */}
      <div className="playvex-logo__wordmark">
        <span className="playvex-logo__text" style={{ fontSize: s.text }}>
          <span className="playvex-logo__play">Play</span>
          <span className="playvex-logo__vex">Vex</span>
        </span>
        {showTagline && (
          <span className="playvex-logo__tagline" style={{ fontSize: s.tagline }}>
            A Universe of Entertainment
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayVexLogo;
