# Phase 1: Foundation & Core Infrastructure - Implementation Guide

## Overview
This phase establishes the project foundation, development environment, and core architecture patterns that all future modules will build upon.

**Duration:** Week 1-2
**Prerequisites:** Code editor, Node.js (for Tailwind build), basic understanding of ES6 modules

---

## Step 1: Create Project Structure

### 1.1 Create All Directories

```bash
mkdir -p FamilySync/{assets/{css,js/{components,modules,state,config},icons},docs}
cd FamilySync
```

### 1.2 Verify Structure
Your folder tree should look like:
```
FamilySync/
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── components/
│   │   ├── modules/
│   │   ├── state/
│   │   └── config/
│   └── icons/
├── docs/
├── index.html
├── manifest.json
└── tailwind.config.js
```

---

## Step 2: Initialize index.html

Create `index.html` with this starter template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#3B82F6">

  <title>FamilySync - Family Command Center</title>

  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/icons/favicon.svg">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>

  <!-- Custom Styles -->
  <link rel="stylesheet" href="/assets/css/styles.css">

  <!-- Tailwind Config Inline (development) -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'dad': '#3B82F6',      // Blue
            'mom': '#EC4899',      // Pink
            'kid1': '#10B981',     // Green
            'kid2': '#F59E0B',     // Orange
            'family': '#8B5CF6'    // Purple
          },
          spacing: {
            'timeline': '60px'     // 60px per hour
          }
        }
      }
    }
  </script>
</head>
<body class="bg-gray-50 font-sans antialiased">

  <!-- App Container -->
  <div id="app" class="h-screen overflow-hidden">
    <!-- Three-pane layout will be injected here -->
    <div class="flex h-full">
      <!-- Left Pane -->
      <aside id="left-pane" class="w-72 bg-white/80 backdrop-blur-md border-r border-gray-200">
        <!-- Left pane content -->
      </aside>

      <!-- Middle Pane (Timeline) -->
      <main id="middle-pane" class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
        <!-- Timeline content -->
      </main>

      <!-- Right Pane -->
      <aside id="right-pane" class="w-96 bg-white/90 backdrop-blur-md border-l border-gray-200 overflow-y-auto">
        <!-- Right pane content -->
      </aside>
    </div>
  </div>

  <!-- Modals will be rendered here -->
  <div id="modal-root"></div>

  <!-- Toast notifications -->
  <div id="toast-container" class="fixed bottom-4 right-4 z-50"></div>

  <!-- App Script (ES6 Module) -->
  <script type="module" src="/assets/js/app.js"></script>

</body>
</html>
```

**Key Features:**
- Viewport meta tags optimized for tablets
- PWA meta tags for installability
- Tailwind CDN (switch to build process in production)
- Extended color palette for family members
- Three-pane layout skeleton

---

## Step 3: Configure TailwindCSS

### 3.1 Install Tailwind (Production Build)

If you want a production build process (recommended):

```bash
npm init -y
npm install -D tailwindcss
npx tailwindcss init
```

### 3.2 Create tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./assets/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        dad: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // Primary
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        mom: {
          500: '#ec4899',  // Primary pink
        },
        kid1: {
          500: '#10b981',  // Green
        },
        kid2: {
          500: '#f59e0b',  // Orange
        },
        family: {
          500: '#8b5cf6',  // Purple
        }
      },
      spacing: {
        'timeline': '60px'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in'
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
```

### 3.3 Create assets/css/input.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS layers */
@layer base {
  :root {
    --timeline-hour-height: 60px;
  }

  body {
    overflow: hidden;
  }
}

@layer components {
  /* Glassmorphism effect */
  .glass {
    @apply bg-white/70 backdrop-blur-md border border-white/20;
  }

  /* Button styles */
  .btn-primary {
    @apply px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
           hover:bg-blue-600 active:scale-95 transition-all duration-200
           shadow-md hover:shadow-lg;
  }

  .btn-secondary {
    @apply px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium
           hover:bg-gray-200 active:scale-95 transition-all duration-200;
  }

  .btn-danger {
    @apply px-6 py-3 bg-red-500 text-white rounded-lg font-medium
           hover:bg-red-600 active:scale-95 transition-all duration-200;
  }

  /* Input styles */
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
           transition-all duration-200;
  }

  /* Card styles */
  .card {
    @apply bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200;
  }

  /* Timeline specific */
  .timeline-hour {
    @apply h-timeline border-b border-gray-200 relative;
  }

  .now-line {
    @apply absolute left-0 right-0 border-t-2 border-red-500 z-20
           after:content-[''] after:w-3 after:h-3 after:bg-red-500 after:rounded-full
           after:absolute after:left-0 after:-top-1.5;
  }
}

@layer utilities {
  /* Custom scrollbar */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    @apply bg-gray-100;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    @apply bg-gray-400 rounded-full;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500;
  }

  /* Hide scrollbar but keep functionality */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

/* Responsive tweaks */
@media (max-width: 1024px) {
  #left-pane,
  #right-pane {
    position: fixed;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  #left-pane.open,
  #right-pane.open {
    transform: translateX(0);
  }
}
```

### 3.4 Build CSS (if using build process)

```bash
npx tailwindcss -i ./assets/css/input.css -o ./assets/css/styles.css --watch
```

---

## Step 4: State Management System

### 4.1 Create assets/js/state/store.js

This is the heart of your application - a simple reactive state management system.

```javascript
/**
 * Centralized State Store with Observer Pattern
 * Manages all application state and notifies components of changes
 */

class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Map(); // Component subscriptions
    this.history = []; // For undo functionality
    this.maxHistory = 50;
  }

  /**
   * Get current state (read-only)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Dispatch an action to update state
   * @param {string} action - Action type
   * @param {*} payload - Data to update
   */
  dispatch(action, payload) {
    console.log(`[Store] Dispatching: ${action}`, payload);

    // Save to history for undo
    this.history.push({ ...this.state });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Handle different actions
    switch(action) {
      case 'INIT':
        this.state = { ...this.state, ...payload };
        break;

      case 'ADD_EVENT':
        this.state.events = [...this.state.events, payload];
        break;

      case 'UPDATE_EVENT':
        this.state.events = this.state.events.map(event =>
          event.id === payload.id ? payload : event
        );
        break;

      case 'DELETE_EVENT':
        this.state.events = this.state.events.filter(event =>
          event.id !== payload
        );
        break;

      case 'ADD_EVENTS_BATCH':
        this.state.events = [...this.state.events, ...payload];
        break;

      case 'UPDATE_FILTER':
        this.state.filters.selectedMembers = payload;
        break;

      case 'SET_CURRENT_DATE':
        this.state.ui.currentDate = payload;
        break;

      case 'SELECT_EVENT':
        this.state.ui.selectedEventId = payload;
        break;

      default:
        console.warn(`Unknown action: ${action}`);
    }

    // Persist to localStorage
    this.persist();

    // Notify all subscribers
    this.notify(action, payload);
  }

  /**
   * Subscribe to state changes
   * @param {string} componentId - Unique component identifier
   * @param {Function} callback - Called when state changes
   */
  subscribe(componentId, callback) {
    this.listeners.set(componentId, callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(componentId);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  notify(action, payload) {
    this.listeners.forEach((callback, componentId) => {
      try {
        callback(this.state, action, payload);
      } catch (error) {
        console.error(`Error in subscriber ${componentId}:`, error);
      }
    });
  }

  /**
   * Persist state to localStorage
   */
  persist() {
    try {
      const serialized = JSON.stringify(this.state);
      localStorage.setItem('familysync-state', serialized);
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  load() {
    try {
      const serialized = localStorage.getItem('familysync-state');
      if (serialized) {
        const loaded = JSON.parse(serialized);
        this.state = { ...this.state, ...loaded };
        console.log('[Store] State loaded from localStorage');
        this.notify('LOAD', this.state);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }

  /**
   * Clear all state
   */
  clear() {
    this.state = this.getInitialState();
    localStorage.removeItem('familysync-state');
    this.notify('CLEAR', null);
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.history.length > 0) {
      this.state = this.history.pop();
      this.persist();
      this.notify('UNDO', this.state);
    }
  }

  /**
   * Get initial/default state structure
   */
  getInitialState() {
    return {
      events: [],
      members: [],
      lists: [],
      templates: [],
      settings: {
        theme: 'light',
        notifications: true,
        timeFormat: '12h'
      },
      filters: {
        selectedMembers: ['all']
      },
      ui: {
        currentDate: new Date().toISOString(),
        selectedEventId: null,
        rightPaneView: 'up-next' // 'up-next' or 'event-detail'
      }
    };
  }
}

// Create singleton instance
const store = new Store(new Store().getInitialState());

export default store;
```

---

## Step 5: Initialize Application

### 5.1 Create assets/js/app.js

```javascript
/**
 * FamilySync - Main Application Entry Point
 */

import store from './state/store.js';
import { loadSampleData } from './config/sampleData.js';

class App {
  constructor() {
    this.init();
  }

  async init() {
    console.log('[App] Initializing FamilySync...');

    // Load state from localStorage
    store.load();

    // If no data exists, load sample data
    if (store.state.events.length === 0) {
      console.log('[App] No existing data, loading sample data');
      loadSampleData();
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('[App] Service Worker registered');
      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
      }
    }

    // Initialize components
    this.initComponents();

    // Set up event listeners
    this.attachEventListeners();

    console.log('[App] Initialization complete');
  }

  initComponents() {
    // Components will be imported and initialized here in later phases
    console.log('[App] Components initialized');
  }

  attachEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + N: New event
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        console.log('New event shortcut triggered');
        // Will open modal in later phases
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        console.log('Escape pressed');
        // Will close modals in later phases
      }
    });

    console.log('[App] Event listeners attached');
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
```

---

## Step 6: Sample Data Configuration

### 6.1 Create assets/js/config/sampleData.js

```javascript
import store from '../state/store.js';
import { generateUUID } from '../modules/utils.js';

/**
 * Load sample family data for testing
 */
export function loadSampleData() {
  // Create family members
  const dad = {
    id: 'member-dad',
    name: 'Dad',
    role: 'parent',
    color: 'dad',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dad',
    permissions: {
      canCreateEvents: true,
      requiresApproval: false,
      canEditOthersEvents: true
    }
  };

  const mom = {
    id: 'member-mom',
    name: 'Mom',
    role: 'parent',
    color: 'mom',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom',
    permissions: {
      canCreateEvents: true,
      requiresApproval: false,
      canEditOthersEvents: true
    }
  };

  const leo = {
    id: 'member-leo',
    name: 'Leo',
    role: 'child',
    color: 'kid1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leo',
    permissions: {
      canCreateEvents: true,
      requiresApproval: true,
      canEditOthersEvents: false
    }
  };

  const emma = {
    id: 'member-emma',
    name: 'Emma',
    role: 'child',
    color: 'kid2',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    permissions: {
      canCreateEvents: true,
      requiresApproval: true,
      canEditOthersEvents: false
    }
  };

  // Create sample events for today
  const today = new Date();
  const events = [
    {
      id: generateUUID(),
      title: 'Soccer Practice',
      startTime: setTime(today, 16, 0),
      endTime: setTime(today, 17, 30),
      assignedTo: ['member-leo'],
      color: 'kid1',
      location: {
        name: 'Riverside Park',
        address: '123 Main St'
      },
      transportation: {
        type: 'parent',
        driver: 'member-dad',
        pickup: 'member-dad'
      },
      category: 'sports',
      status: 'confirmed',
      checklist: [
        { id: '1', text: 'Pack cleats', completed: false },
        { id: '2', text: 'Bring water bottle', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      title: 'Piano Lesson',
      startTime: setTime(today, 14, 0),
      endTime: setTime(today, 15, 0),
      assignedTo: ['member-emma'],
      color: 'kid2',
      location: {
        name: 'Music Academy',
        address: '456 Oak Ave'
      },
      transportation: {
        type: 'parent',
        driver: 'member-mom',
        pickup: 'member-mom'
      },
      category: 'education',
      status: 'confirmed',
      checklist: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      title: 'Family Dinner',
      startTime: setTime(today, 18, 30),
      endTime: setTime(today, 19, 30),
      assignedTo: ['member-dad', 'member-mom', 'member-leo', 'member-emma'],
      color: 'family',
      location: {
        name: 'Home'
      },
      category: 'meal',
      status: 'confirmed',
      notes: 'Spaghetti night!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Initialize state
  store.dispatch('INIT', {
    members: [dad, mom, leo, emma],
    events: events
  });

  console.log('[SampleData] Loaded', {
    members: 4,
    events: events.length
  });
}

/**
 * Helper to set time on a date
 */
function setTime(date, hours, minutes) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}
```

### 6.2 Create assets/js/modules/utils.js

```javascript
/**
 * Utility functions used throughout the app
 */

/**
 * Generate UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format date/time helpers
 */
export function formatTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatFullDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * Get time until a future date
 */
export function getTimeUntil(isoString) {
  const now = new Date();
  const target = new Date(isoString);
  const diff = target - now;

  if (diff < 0) return 'Past';

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
  return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const today = new Date();
  const check = new Date(date);
  return today.toDateString() === check.toDateString();
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

---

## Step 7: Create PWA Manifest

### 7.1 Create manifest.json

```json
{
  "name": "FamilySync - Family Command Center",
  "short_name": "FamilySync",
  "description": "Coordinate your family's schedule with an intelligent dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "any",
  "categories": ["lifestyle", "productivity"],
  "icons": [
    {
      "src": "/assets/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/assets/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/assets/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

---

## Step 8: Test Foundation

### 8.1 Open in Browser

1. Start a local server:
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (if you have http-server installed)
npx http-server -p 8000

# Option 3: VS Code Live Server extension
```

2. Open `http://localhost:8000` in your browser

### 8.2 Open Browser DevTools Console

You should see:
```
[App] Initializing FamilySync...
[App] No existing data, loading sample data
[SampleData] Loaded { members: 4, events: 3 }
[App] Components initialized
[App] Event listeners attached
[App] Initialization complete
```

### 8.3 Test State in Console

Open browser console and type:
```javascript
// Access the store (you'll need to expose it globally in app.js temporarily)
console.log(window.store.state);

// Should show:
// {
//   events: [...],
//   members: [...],
//   settings: {...},
//   filters: {...}
// }
```

### 8.4 Test LocalStorage Persistence

1. Open Application tab in DevTools
2. Expand Local Storage
3. You should see `familysync-state` key with JSON data

---

## Checklist for Phase 1 Completion

- [ ] All folders created correctly
- [ ] index.html renders with three-pane layout skeleton
- [ ] TailwindCSS loads (check if utility classes work)
- [ ] Store.js loads and initializes
- [ ] Sample data populates on first load
- [ ] State persists to localStorage
- [ ] Console shows no errors
- [ ] Can access store.state in console
- [ ] manifest.json is valid (test with Lighthouse)

---

## Troubleshooting

### Issue: Tailwind classes not applying
- Verify CDN script tag in index.html
- Check browser console for 404 errors
- Clear browser cache

### Issue: ES6 modules not working
- Ensure `type="module"` in script tag
- Check file paths are correct (case-sensitive!)
- Serve via HTTP server (not file://)

### Issue: localStorage not persisting
- Check browser privacy settings
- Verify no errors in console
- Check Application > Local Storage in DevTools

### Issue: Sample data not loading
- Check console for errors
- Verify sampleData.js and utils.js import paths
- Check generateUUID function works

---

## Next Steps

Once Phase 1 is complete and all checks pass:
1. Commit to Git: `git add . && git commit -m "Phase 1: Foundation complete"`
2. Proceed to **Phase 2: Three-Pane Layout**
3. Begin building actual components

---

**Phase 1 Estimated Time:** 6-8 hours
**Difficulty:** Beginner-Intermediate
