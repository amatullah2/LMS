# Mini LMS — React Native Expo Assignment

A production-ready mini Learning Management System built with React Native Expo, TypeScript (strict mode), NativeWind, and Expo Router.

---

## Screenshots

> Run the app with `npx expo start` and scan with Expo Go to see all screens.

**Screens:** Login · Register · Course Catalog · Course Detail · WebView Content · Bookmarks · Profile

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for testing), or Android Studio / Xcode

### 1. Install dependencies

```bash
cd mini-lms
npm install
```

### 2. Environment

No `.env` file needed — the API base URL (`https://api.freeapi.app`) is configured directly in `lib/api/client.ts`.

### 3. Run the app

```bash
npx expo start
```

- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Scan QR code with **Expo Go** on your phone

### 4. Build APK (Development Build)

```bash
npx expo run:android
```

Or using EAS Build:

```bash
npm install -g eas-cli
eas build -p android --profile development
```

### Demo Credentials

```
Email:    johnd@mail.com
Password: m38rmF$
```

---

## Architecture

### Folder Structure

```
mini-lms/
├── app/                     # Expo Router (file-based navigation)
│   ├── _layout.tsx          # Root layout: providers + auth guard
│   ├── (auth)/              # Unauthenticated routes
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/              # Bottom tab navigator
│   │   ├── index.tsx        # Course catalog
│   │   ├── bookmarks.tsx    # Saved courses
│   │   └── profile.tsx      # User profile
│   └── course/
│       ├── [id].tsx         # Course detail
│       └── webview/[id].tsx # WebView content viewer
├── components/
│   ├── ui/                  # Button, Input, LoadingState, ErrorState, OfflineBanner
│   └── course/              # CourseCard, SearchBar
├── context/
│   ├── AuthContext.tsx      # Auth state + login/logout/register
│   ├── CoursesContext.tsx   # Courses, bookmarks, enrolled, search
│   └── NetworkContext.tsx   # Online/offline detection
├── lib/
│   ├── api/                 # Axios client + auth/courses endpoints
│   ├── storage/             # SecureStore + AsyncStorage wrappers
│   └── notifications/       # Expo Notifications setup + triggers
└── types/index.ts           # All shared TypeScript types
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | React Context + useReducer | No external lib needed; clear separation of auth/courses/network state |
| Sensitive storage | Expo SecureStore | Tokens encrypted at rest using device keychain |
| App data storage | AsyncStorage | Bookmarks, enrolled courses, cache, last-opened timestamp |
| Navigation | Expo Router v6 | File-based routing, typed routes, auth guard via useSegments |
| Styling | NativeWind v4 | Tailwind CSS for React Native; consistent design system |
| Forms | React Hook Form + Zod | Type-safe validation with minimal re-renders |
| API | Axios | Interceptors for token injection + exponential backoff retry |
| List optimization | FlatList with `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize` | Smooth scrolling without jank |
| WebView bridge | `injectedJavaScript` + `postMessage` | Bidirectional Native ↔ WebView communication |

### API Design

- **Base URL:** `https://api.freeapi.app`
- **Auth:** Bearer token injected via request interceptor
- **Retry:** 3 retries with exponential backoff (500ms, 1s, 2s) on network errors
- **Timeout:** 15 seconds per request
- **401 handling:** Clears tokens and redirects to login

### Storage Strategy

| Data | Storage | Reason |
|---|---|---|
| Access token | SecureStore | Sensitive — device keychain encryption |
| Refresh token | SecureStore | Sensitive |
| User object | SecureStore | PII data |
| Bookmarks | AsyncStorage | Non-sensitive, needs persistence across sessions |
| Enrolled courses | AsyncStorage | Non-sensitive |
| Course cache | AsyncStorage | Offline support |
| Last opened timestamp | AsyncStorage | 24hr inactivity notification trigger |

---

## Features Implemented

### Part 1: Authentication
- [x] Login with email/password via `/api/v1/users/login`
- [x] Register via `/api/v1/users/register`
- [x] Tokens stored in Expo SecureStore
- [x] Auto-login on app restart (token + user persisted)
- [x] Logout with token clearing
- [x] Profile picture update via Expo ImagePicker
- [x] User stats (enrolled, bookmarked, completed)

### Part 2: Course Catalog
- [x] Courses from `/api/v1/public/randomproducts`
- [x] Instructors from `/api/v1/public/randomusers`, merged with courses
- [x] Thumbnail, instructor name, title, description, bookmark icon
- [x] Pull-to-refresh
- [x] Search (title, description, category)
- [x] Course detail with full info
- [x] Enroll button with visual feedback + alert
- [x] Bookmark toggle persisted to AsyncStorage

### Part 3: WebView
- [x] Embedded WebView showing course content
- [x] Local HTML template built dynamically with course data
- [x] Native → WebView: `injectedJavaScript` passes course state
- [x] WebView → Native: `postMessage` for enroll action

### Part 4: Native Features
- [x] Notification permissions request on app launch
- [x] Notification fires when user bookmarks exactly 5 courses
- [x] 24-hour inactivity reminder (checks `lastOpenedAt` in AsyncStorage)
- [x] Future daily reminder scheduled via `TIME_INTERVAL` trigger

### Part 5: State Management & Performance
- [x] Global state via React Context + useReducer (auth, courses, network)
- [x] FlatList with `removeClippedSubviews`, `maxToRenderPerBatch=8`, `windowSize=10`
- [x] `React.memo` on CourseCard to prevent unnecessary re-renders
- [x] `useCallback` on all list callbacks
- [x] Offline course cache via AsyncStorage (serves stale data when offline)

### Part 6: Error Handling
- [x] Axios retry with exponential backoff (3 retries)
- [x] 15s request timeout
- [x] User-friendly error messages with retry button
- [x] Offline mode banner (polls connectivity every 5s)
- [x] WebView load error screen with retry button
- [x] Auth 401 → auto logout + redirect

---

## Known Issues / Limitations

- `/api/v1/users/self` uses POST (freeapi quirk) — profile is read from SecureStore cache
- `discountPercentage` from randomproducts is used as course discount
- No real course video/content — WebView renders a rich HTML template
- Notification 24hr reminder uses `TIME_INTERVAL` trigger (requires background task entitlement on iOS for production)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Expo SDK | ~54.0 | Core framework |
| React Native | 0.81.5 | Mobile runtime |
| TypeScript | ~5.9 | Strict typing |
| Expo Router | ~6.0 | File-based navigation |
| NativeWind | ^4.1 | Tailwind CSS for RN |
| Expo SecureStore | latest | Encrypted token storage |
| AsyncStorage | latest | App data persistence |
| Expo Notifications | latest | Push + local notifications |
| Expo Image | latest | Optimized image loading with cache |
| Expo ImagePicker | latest | Profile picture selection |
| expo-network | latest | Connectivity monitoring |
| react-native-webview | latest | Course content viewer |
| Axios | latest | HTTP client with interceptors |
| React Hook Form | latest | Form state management |
| Zod | latest | Schema validation |
