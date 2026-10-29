# PlayVex — A Universe of Entertainment

PlayVex is a complete, production-quality React frontend for a video-sharing platform integrated with an existing Spring Boot backend.

---

## 🎨 Design System

| Element | Hex / Value |
| --- | --- |
| Main Background | `#0B0B0F` |
| Cards & Sidebar | `#17171F` |
| Elevated Surfaces | `#1E1E28` |
| Primary Brand Action | `#FF3B5C` |
| Primary Hover | `#FF5873` |
| Main Text | `#F5F5F7` |
| Secondary Text | `#A1A1AA` |
| Borders | `#2A2A33` |
| Typography | Inter (Google Fonts with system fallbacks) |
| Border Radii | Cards: 12px, Buttons: 10px |

Centralized variables are defined in `src/styles/variables.css`.

---

## 🛠️ Technology Stack

- **React 19** with JavaScript (ES Modules, JSX only — no TypeScript)
- **Vite 8**
- **React Router DOM 7** (with route-level code splitting & lazy loading)
- **Axios** (with automatic JWT bearer injection and 401 interception)
- **Framer Motion** (smooth micro-interactions, page transitions, toasts, modals)
- **Lucide React** (icons)
- **HTML5 Video Player** (with authenticated blob streaming buffer)
- **React Context** (`AuthContext` for user session & `ToastContext` for feedback)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ and npm installed
- Spring Boot backend running on `http://localhost:8080` (or configured URL)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your backend:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 📱 Responsive Layout Architecture

- **Desktop (> 1024px):** Persistent collapsible sidebar, top navigation with logo, search bar, upload button, user dropdown, and 4-column video grid.
- **Tablet (768px – 1024px):** Auto-collapsing sidebar in icon-only mode, adaptive search input, 2–3 column video grid.
- **Mobile (≤ 768px):** Dedicated **bottom navigation bar** (Home, Search, Upload, My Videos, Profile) with active indicator and iOS safe-area inset support (`env(safe-area-inset-bottom)`). Sidebar is hidden to prioritize screen real-estate.

---

## 📡 Backend API Integration

All endpoints correspond to the Spring Boot backend without modifying the server:

### Authentication
- `POST /api/auth/register` — Register a new account (`username`, `email`, `password`)
- `POST /api/auth/login` — Sign in and receive JWT token (`email`, `password`)

### Videos
- `GET /api/videos/allvideos` — Retrieve all uploaded video catalog
- `GET /api/videos/my-videos` — Retrieve authenticated user's uploaded videos
- `GET /api/videos/search?keyword={keyword}` — Search videos by title
- `GET /api/videos/{id}/play` — Fetch video stream/binary
- `POST /api/videos/upload` — Multipart video upload (`file`, `title`, `description`)
- `POST /api/videos/{id}/view` — Increment view count by 1 upon playback
- `PATCH /api/videos/{id}` — Update video title and/or description
- `DELETE /api/videos/{id}` — Delete video by ID

### User Profile & Settings
- `GET /api/users/profile` — User details (`username`, `email`, `role`, `profilePicture`, `totalVideos`)
- `PATCH /api/users/update-name` — Update username
- `PATCH /api/users/update-email` — Update email
- `PATCH /api/users/change-password` — Change password (`currentPassword`, `newPassword`)
- `PATCH /api/users/update-profile-picture` — Multipart upload for profile avatar
- `DELETE /api/users/delete-account` — Permanently delete account (`password`)

---

## 🔒 Security & Technical Considerations

1. **Token Storage & XSS Risk:**
   - The application stores the JWT in `sessionStorage` (`pv_token`) and clears it upon logout.
   - *Note:* Storing tokens in client-accessible storage (`sessionStorage`/`localStorage`) carries exposure to XSS vulnerabilities. In high-security production environments, `HttpOnly`, `Secure`, `SameSite` cookies set server-side are recommended.
2. **Authenticated HTML5 Video Playback:**
   - Standard HTML5 `<video src="...">` tags do not allow attaching custom HTTP headers (`Authorization: Bearer <token>`).
   - The frontend loads the video via an authenticated `Blob` request (`apiClient.get(..., { responseType: 'blob' })`) and mounts it using `URL.createObjectURL(blob)`.
   - The Object URL is cleaned up with `URL.revokeObjectURL(...)` on unmount to prevent browser memory leaks.
3. **Range Streaming Notice:**
   - The backend serves videos directly as a `byte[]` payload from `LONGBLOB` without HTTP `206 Partial Content` Range headers. For large multi-gigabyte videos, server-side HTTP range streaming or cloud object storage (e.g. AWS S3 / Cloudflare R2) is recommended.
4. **Email Changes & JWT Subject:**
   - The backend JWT subject is mapped to the user's email address. Updating your email updates the user record; the frontend prompts you accordingly if a re-login is required.
