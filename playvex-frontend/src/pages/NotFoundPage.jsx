import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card card">
        <div className="not-found-icon">
          <Compass size={48} />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Lost in the Universe</h2>
        <p className="not-found-desc">
          The entertainment coordinate you are looking for does not exist or has drifted away.
        </p>
        <Link to="/home" className="btn btn-primary">
          <Home size={16} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

