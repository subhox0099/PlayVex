# 🎬 VideoPlayer Backend API

A **Spring Boot** REST API for a video-sharing platform with JWT-based authentication, user profile management, and video management.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Authentication](#-authentication)
- [API Reference](#-api-reference)
  - [Auth APIs](#1-auth-apis----apauth)
  - [User APIs](#2-user-apis----apiusers)
  - [Video APIs](#3-video-apis----apivideos)
- [Request & Response Examples](#-request--response-examples)
- [Error Handling](#-error-handling)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17+ |
| Framework | Spring Boot 3.x |
| Security | Spring Security + JWT (JJWT) |
| Database | MySQL 8 |
| ORM | Spring Data JPA / Hibernate |
| Build Tool | Maven |
| Validation | Jakarta Bean Validation |

---

## 📁 Project Structure

```
src/main/java/video/player/videoplayer/
├── Controller/
│   ├── AuthController.java        # Register & Login
│   ├── UserController.java        # User profile management
│   └── VideoController.java       # Video CRUD + search
├── Service/
│   ├── AuthService.java           # Registration & login logic
│   ├── userService.java           # User profile operations
│   ├── VideoService.java          # Video operations
│   ├── CustomUserDetailService.java
│   └── jwtService.java            # JWT generation & validation
├── Entity/
│   ├── user.java                  # User entity (id, username, email, role, profilePicture)
│   └── video.java                 # Video entity (id, title, description, views, ...)
├── Repository/
│   ├── userRepository.java
│   └── VideoRepository.java
├── DTO/
│   ├── registerRequest.java
│   ├── LoginRequest.java
│   ├── UpdateNameRequest.java
│   ├── UpdateEmailRequest.java
│   ├── ChangePasswordRequest.java
│   ├── UserProfileResponse.java
│   ├── UpdateVideoRequest.java
│   └── videoResponse.java
└── config/
    ├── SecurityConfig.java
    └── jwtAuthenticationFilter.java
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- MySQL 8 running locally
- Maven

### Configuration

Edit `src/main/resources/application.properties`:

```properties
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/VideoData
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# File upload limits
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB

# JWT
jwt.secret=YOUR_SECRET_KEY_MIN_32_CHARS
jwt.expiration=3600000    # 1 hour in milliseconds
```

### Run

```bash
./mvnw spring-boot:run
```

The server starts at **`http://localhost:8080`**.

---

## 🔐 Authentication

This API uses **stateless JWT authentication**.

### How It Works

1. Register or login to receive a JWT token.
2. Include the token in the `Authorization` header for all protected routes:

```
Authorization: Bearer <your_jwt_token>
```

### Token Details
- **Algorithm**: HMAC-SHA (HS256)
- **Subject**: User's email address
- **Expiration**: 1 hour (configurable via `jwt.expiration`)
- **Claims**: `user` (user ID), `iat` (issued at), `exp` (expiry)

### Route Access

| Route Pattern | Access |
|---|---|
| `POST /api/auth/register` | 🌐 Public |
| `POST /api/auth/login` | 🌐 Public |
| `GET/PATCH/DELETE /api/users/**` | 🔒 JWT Required |
| `GET/POST/PATCH/DELETE /api/videos/**` | 🔒 JWT Required |

---

## 📡 API Reference

---

### 1. Auth APIs — `/api/auth`

#### `POST /api/auth/register`

Registers a new user account.

**Access:** Public  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Validation Rules:**
- `username`: required, 3–50 characters
- `email`: required, must be valid email format, max 150 characters
- `password`: required, 6–100 characters

**Success Response — `201 Created`:**
```json
{
  "message": "user registered successfully"
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | Validation failed (missing/invalid fields) |
| `409 Conflict` | Username or email already taken |

---

#### `POST /api/auth/login`

Authenticates a user and returns a JWT token.

**Access:** Public  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "login successful",
  "username": "johndoe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userid": 1
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `401 Unauthorized` | Password is incorrect |
| `500 Internal Server Error` | User not found (no account with that email) |

---

### 2. User APIs — `/api/users`

> **All endpoints require** `Authorization: Bearer <token>` header.

---

#### `GET /api/users/profile`

Returns the full profile of the currently authenticated user.

**Success Response — `200 OK`:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "profilePicture": "profile-pictures/abc123.jpg",
  "totalVideos": 5
}
```

---

#### `PATCH /api/users/update-name`

Changes the authenticated user's username.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "john_new"
}
```

**Validation Rules:**
- `username`: required, 3–50 characters

**Success Response — `200 OK`:**
```json
{
  "id": 1,
  "username": "john_new",
  "email": "john@example.com",
  "role": "USER",
  "profilePicture": null,
  "totalVideos": 5
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | Validation failed |
| `409 Conflict` | Username already taken by another account |

---

#### `PATCH /api/users/update-email`

Changes the authenticated user's email address.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "email": "newemail@example.com"
}
```

**Validation Rules:**
- `email`: required, must be valid email format

**Success Response — `200 OK`:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "newemail@example.com",
  "role": "USER",
  "profilePicture": null,
  "totalVideos": 5
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | Invalid email format |
| `409 Conflict` | Email already registered to another account |

---

#### `PATCH /api/users/change-password`

Securely changes the user's password. Requires the current password for verification.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "currentPassword": "secret123",
  "newPassword": "newSecret456"
}
```

**Validation Rules:**
- `currentPassword`: required
- `newPassword`: required, minimum 6 characters, must differ from current

**Success Response — `200 OK`:**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | New password same as current, or validation failed |
| `401 Unauthorized` | Current password is incorrect |

---

#### `PATCH /api/users/update-profile-picture`

Uploads and sets a new profile picture for the authenticated user.  
The image is saved to disk under the `profile-pictures/` directory.

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✅ | Image file (JPEG, PNG, GIF, WebP, etc.) |

**Success Response — `200 OK`:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "profilePicture": "profile-pictures/a1b2c3d4-uuid.jpg",
  "totalVideos": 5
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | File is empty or not an image file |
| `500 Internal Server Error` | Failed to save file to disk |

---

#### `DELETE /api/users/delete-account`

Permanently deletes the authenticated user's account and all associated data.  
Requires password confirmation to prevent accidental deletion.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "password": "secret123"
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | Password field missing from body |
| `401 Unauthorized` | Password is incorrect |

---

### 3. Video APIs — `/api/videos`

> **All endpoints require** `Authorization: Bearer <token>` header.

---

#### `GET /api/videos/allvideos`

Fetches all videos from all users (public feed).

**Success Response — `200 OK`:**
```json
[
  {
    "id": 1,
    "title": "My First Video",
    "description": "A short description",
    "fileName": "video.mp4",
    "contentType": "video/mp4",
    "filesize": 10485760,
    "views": 42
  }
]
```

---

#### `GET /api/videos/my-videos`

Returns only the videos uploaded by the currently authenticated user.

**Success Response — `200 OK`:**
```json
[
  {
    "id": 3,
    "title": "My Tutorial",
    "description": "Step by step guide",
    "fileName": "tutorial.mp4",
    "contentType": "video/mp4",
    "filesize": 52428800,
    "views": 100
  }
]
```

---

#### `GET /api/videos/search?keyword={keyword}`

Searches all videos whose **title contains** the given keyword (case-insensitive).

**Query Parameter:**
| Param | Type | Required | Description |
|---|---|---|---|
| `keyword` | String | ✅ | Search term to match against video titles |

**Example:**
```
GET /api/videos/search?keyword=tutorial
```

**Success Response — `200 OK`:**
```json
[
  {
    "id": 3,
    "title": "My Tutorial",
    "description": "Step by step guide",
    "fileName": "tutorial.mp4",
    "contentType": "video/mp4",
    "filesize": 52428800,
    "views": 100
  }
]
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | Keyword is empty or blank |

---

#### `GET /api/videos/{id}/play`

Streams/plays the video binary data directly in the browser.  
Returns raw video bytes with appropriate content headers.

**Path Parameter:** `id` — the video ID

**Success Response — `200 OK`:**
- **Content-Type**: `video/mp4` (or whatever the uploaded content type is)
- **Content-Disposition**: `inline; filename="video.mp4"`
- **Body**: Raw video binary data

**Error Responses:**
| Status | Reason |
|---|---|
| `404 Not Found` | Video with given ID does not exist |

---

#### `POST /api/videos/upload`

Uploads a new video file. Stores video data as binary (BLOB) in the database.

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✅ | Video file (must have `video/*` MIME type) |
| `title` | String | ✅ | Title of the video |
| `description` | String | ❌ | Optional description |

**Success Response — `201 Created`:**
```json
{
  "id": 5,
  "title": "My New Video",
  "description": "Some description",
  "fileName": "myvideo.mp4",
  "contentType": "video/mp4",
  "filesize": 20971520,
  "views": 0,
  "uploadedAt": "2026-10-29T03:00:00"
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | File is empty, title is empty, or file is not a video |
| `404 Not Found` | Authenticated user not found |
| `500 Internal Server Error` | Failed to read/save file bytes |

---

#### `POST /api/videos/{id}/view`

Increments the view count of a video by **1**.  
Call this when a user starts playing a video to track view statistics.

**Path Parameter:** `id` — the video ID

**Success Response — `200 OK`:**
```json
{
  "message": "View count updated",
  "videoId": 5,
  "views": 43
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `404 Not Found` | Video with given ID does not exist |

---

#### `PATCH /api/videos/{id}/title`

Updates **only the title** of a video. The authenticated user must own the video.

**Path Parameter:** `id` — the video ID  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "title": "Updated Video Title"
}
```

**Success Response — `200 OK`:**
```json
{
  "id": 5,
  "title": "Updated Video Title",
  "description": "Some description",
  "fileName": "myvideo.mp4",
  "contentType": "video/mp4",
  "filesize": 20971520,
  "views": 43
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | Title is empty or blank |
| `403 Forbidden` | User does not own this video |
| `404 Not Found` | Video or user not found |

---

#### `PATCH /api/videos/{id}/description`

Updates **only the description** of a video. The authenticated user must own the video.

**Path Parameter:** `id` — the video ID  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "description": "This is the new description for this video."
}
```

**Success Response — `200 OK`:**
```json
{
  "id": 5,
  "title": "Updated Video Title",
  "description": "This is the new description for this video.",
  "fileName": "myvideo.mp4",
  "contentType": "video/mp4",
  "filesize": 20971520,
  "views": 43
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `403 Forbidden` | User does not own this video |
| `404 Not Found` | Video or user not found |

---

#### `PATCH /api/videos/{id}`

Updates **title and/or description** of a video in one request.  
Both fields are optional — only the fields you include will be updated.

**Path Parameter:** `id` — the video ID  
**Content-Type:** `application/json`

**Request Body (both fields):**
```json
{
  "title": "New Title",
  "description": "New description"
}
```

**Request Body (title only):**
```json
{
  "title": "New Title"
}
```

**Success Response — `200 OK`:**
```json
{
  "id": 5,
  "title": "New Title",
  "description": "New description",
  "fileName": "myvideo.mp4",
  "contentType": "video/mp4",
  "filesize": 20971520,
  "views": 43
}
```

**Error Responses:**
| Status | Reason |
|---|---|
| `400 Bad Request` | Title field provided but is empty/blank |
| `403 Forbidden` | User does not own this video |
| `404 Not Found` | Video or user not found |

---

#### `DELETE /api/videos/{id}`

Permanently deletes a video. The authenticated user must own the video.

**Path Parameter:** `id` — the video ID

**Success Response — `200 OK`:** *(empty body)*

**Error Responses:**
| Status | Reason |
|---|---|
| `403 Forbidden` | User does not own this video |
| `404 Not Found` | Video with given ID does not exist |

---

## 📦 Request & Response Examples

### Full Workflow Example

```bash
# 1. Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"secret123"}'

# 2. Login and get token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
# → Save the "token" from the response

TOKEN="eyJhbGciOiJIUzI1NiJ9..."

# 3. Upload a video
curl -X POST http://localhost:8080/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/video.mp4" \
  -F "title=My First Video" \
  -F "description=A cool video"

# 4. Get all videos
curl http://localhost:8080/api/videos/allvideos \
  -H "Authorization: Bearer $TOKEN"

# 5. Search videos
curl "http://localhost:8080/api/videos/search?keyword=first" \
  -H "Authorization: Bearer $TOKEN"

# 6. Increment view count (call before playing)
curl -X POST http://localhost:8080/api/videos/1/view \
  -H "Authorization: Bearer $TOKEN"

# 7. Play video (stream in browser)
curl http://localhost:8080/api/videos/1/play \
  -H "Authorization: Bearer $TOKEN"

# 8. Update video title + description
curl -X PATCH http://localhost:8080/api/videos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","description":"New description"}'

# 9. View your profile
curl http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 10. Change username
curl -X PATCH http://localhost:8080/api/users/update-name \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"john_updated"}'

# 11. Change password
curl -X PATCH http://localhost:8080/api/users/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"secret123","newPassword":"newSecret456"}'

# 12. Delete account (requires password)
curl -X DELETE http://localhost:8080/api/users/delete-account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"newSecret456"}'
```

---

## ❌ Error Handling

All errors follow a consistent format from Spring Boot's default error handling:

```json
{
  "timestamp": "2026-10-29T03:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "You are not allowed to modify this video",
  "path": "/api/videos/5"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid input / validation failed |
| `401 Unauthorized` | Missing, expired, or invalid JWT token |
| `403 Forbidden` | Authenticated but not authorized (e.g. not your video) |
| `404 Not Found` | Resource doesn't exist |
| `409 Conflict` | Duplicate username or email |
| `500 Internal Server Error` | Server-side failure (e.g. file I/O error) |

---

## 📊 API Summary Table

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | 🌐 Public | Register a new user |
| `POST` | `/api/auth/login` | 🌐 Public | Login and get JWT token |
| `GET` | `/api/users/profile` | 🔒 JWT | Get own profile |
| `PATCH` | `/api/users/update-name` | 🔒 JWT | Change username |
| `PATCH` | `/api/users/update-email` | 🔒 JWT | Change email |
| `PATCH` | `/api/users/change-password` | 🔒 JWT | Change password |
| `PATCH` | `/api/users/update-profile-picture` | 🔒 JWT | Upload profile picture |
| `DELETE` | `/api/users/delete-account` | 🔒 JWT | Delete account |
| `GET` | `/api/videos/allvideos` | 🔒 JWT | Get all videos |
| `GET` | `/api/videos/my-videos` | 🔒 JWT | Get own videos |
| `GET` | `/api/videos/search?keyword=` | 🔒 JWT | Search videos by title |
| `GET` | `/api/videos/{id}/play` | 🔒 JWT | Stream/play a video |
| `POST` | `/api/videos/upload` | 🔒 JWT | Upload a new video |
| `POST` | `/api/videos/{id}/view` | 🔒 JWT | Increment view count |
| `PATCH` | `/api/videos/{id}/title` | 🔒 JWT | Update video title only |
| `PATCH` | `/api/videos/{id}/description` | 🔒 JWT | Update video description only |
| `PATCH` | `/api/videos/{id}` | 🔒 JWT | Update title and/or description |
| `DELETE` | `/api/videos/{id}` | 🔒 JWT | Delete a video |
