import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Lazy-loaded Pages for optimal performance and chunk splitting
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const WatchPage = lazy(() => import("./pages/WatchPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const MyVideosPage = lazy(() => import("./pages/MyVideosPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PageLoadingFallback = () => (
  <div
    style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    }}
  >
    <div className="spinner spinner--lg" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated application routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/home" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/my-videos" element={<MyVideosPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
