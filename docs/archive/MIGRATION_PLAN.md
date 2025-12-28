# Migration Plan: Family Command Center (Vanilla JS -> React + Firebase)

## Project Overview
**Goal:** Port the existing vanilla JS "Family Command Center" to a modern React application.
**Tech Stack:** 
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Firebase (Firestore, Auth, Hosting)
- **State Management:** Zustand (replaces `store.js`)

---

## Phase 1: Environment & Foundation
**Goal:** Initialize the project and connect to the cloud.

1.  **Scaffold Project:**
    - Run `npm create vite@latest family-command-center -- --template react`
    - Install Tailwind CSS (`npm install -D tailwindcss postcss autoprefixer`, `npx tailwindcss init -p`).
    - Configure Tailwind to look at `./src/**/*.{js,jsx,ts,tsx}`.

2.  **Firebase Setup:**
    - Create a new project in the Firebase Console.
    - Enable **Authentication** (Google & Email/Password).
    - Enable **Firestore Database** (start in Test mode).
    - Install SDK: `npm install firebase`.
    - Create `src/firebase.js` to initialize the app and export `db` and `auth`.

3.  **Asset Migration:**
    - Copy images/icons from `assets/` to `src/assets/`.
    - (Optional) Copy `styles.css` content to `src/index.css` initially, but plan to replace with Tailwind utility classes.

---

## Phase 2: Data Layer & State Management
**Goal:** Replace `store.js` and `sampleData.js` with a robust data layer.

1.  **Firestore Schema Design:**
    - Create collections in Firestore mirroring `sampleData.js`:
        - `users` (profiles, avatars, colors)
        - `events` (title, start, end, assignedTo array)
        - `notes` (content, category)
        - `meals` (date, type, description)
    - *Tip:* Use Firestore `Timestamp` for dates.

2.  **State Management (Zustand):**
    - Install: `npm install zustand`
    - Create `src/store/useStore.js`.
    - Port logic from `assets/js/state/store.js`.
    - Create actions: `setEvents`, `addEvent`, `toggleMember`, `setCurrentView`.
    - **Crucial:** Create a `useEffect` hook in `App.jsx` that listens to Firestore updates (`onSnapshot`) and dispatches data to the store.

---

## Phase 3: Application Shell & Navigation
**Goal:** Create the visual skeleton.

1.  **Main Layout:**
    - Create `src/layouts/MainLayout.jsx`.
    - Replicate the 3-column CSS Grid structure from your original `index.html`/`styles.css`.
    - Use Tailwind grid classes: `grid grid-cols-[250px_1fr_300px] h-screen`.

2.  **Components:**
    - `SidebarLeft.jsx`: Port `LeftPane.js`.
    - `SidebarRight.jsx`: Port `RightPane.js`.
    - `NavBar.jsx`: Port `NavBar.js`.

3.  **Routing (Optional):**
    - If strictly SPA (Single Page App) like the original, use conditional rendering in `MainLayout` based on `currentView` from the store.

---

## Phase 4: Core Feature - The Dashboard (Middle Pane)
**Goal:** Rebuild the complex timeline view.

1.  **Timeline Component (`MiddlePane.jsx`):**
    - This is the most complex part. Use CSS Grid for the swimlanes instead of absolute positioning if possible, or keep the absolute logic if it offers better precision for time.
    - **Logic:** Port `renderSwimlane` logic.
    - **State:** Read `events` and `members` from the Zustand store.

2.  **Interactive Elements:**
    - Replicate the "Current Time" line using a simple `div` positioned by a helper function that calculates `%` of the day passed.
    - Click handlers for events should open the `EventDetailModal`.

---

## Phase 5: Forms & Interactivity
**Goal:** Allow users to add/edit data.

1.  **Modals:**
    - Create a reusable `Modal` component (using React Portals or a library like `headlessui`).
    - Port `EventForm.js` to `AddEventModal.jsx`.
    - Port `ProfileModal.js` to `UserProfileModal.jsx`.

2.  **Form Logic:**
    - Connect forms to Firestore `addDoc` and `updateDoc` functions.
    - Ensure forms validate input before submitting.

---

## Phase 6: Secondary Views & Polish
**Goal:** Complete the remaining modules.

1.  **Meals & Notes:**
    - Port `NotesView.js` -> `src/components/Notes/NotesBoard.jsx`.
    - Port `meals.js` logic -> `src/components/Meals/MealPlanner.jsx`.

2.  **Refinement:**
    - Replace any remaining `style.css` rules with Tailwind classes.
    - Ensure responsive design (add a mobile layout, possibly hiding sidebars behind a hamburger menu).

3.  **Deployment:**
    - Run `npm run build`.
    - Run `firebase init hosting` and deploy.

---

## Prompt for AI Assistant
*When you are ready to start coding, copy and paste the specific phase details above to your AI assistant. For example:*

> "I am working on Phase 1 of my migration plan. Please help me generate the `npm create vite` command and the initial `firebase.js` configuration file. Here are my project details..."
