# FamilySync - Web MVP Development Roadmap

## Project Overview

**Tech Stack:**
- HTML5 (semantic markup)
- Vanilla JavaScript (ES6+ modules)
- TailwindCSS 3.x (utility-first styling)
- LocalStorage/IndexedDB (data persistence)
- No frameworks/libraries (except TailwindCSS)

**Target Device:**
- Primary: Tablet landscape mode (1024x768 - 1366x768)
- Secondary: Desktop browsers
- Responsive down to mobile (progressive enhancement)

**Design Principles:**
- Modern web app aesthetics (glassmorphism, smooth animations, generous whitespace)
- Component-based architecture (modular, reusable)
- Mobile-first CSS with tablet optimization
- Progressive Web App (PWA) capabilities

---

## Phase 1: Foundation & Core Infrastructure (Week 1-2)

### 1.1 Project Setup & Structure

**Objective:** Establish development environment and folder structure

**File Structure:**
```
FamilySync/
├── index.html                  # Main application entry
├── assets/
│   ├── css/
│   │   └── styles.css          # Custom CSS (Tailwind @layer directives)
│   ├── js/
│   │   ├── app.js              # Application initialization
│   │   ├── router.js           # Client-side routing
│   │   ├── state/
│   │   │   ├── store.js        # Central state management
│   │   │   └── localStorage.js # Persistence layer
│   │   ├── components/
│   │   │   ├── BaseComponent.js    # Component base class
│   │   │   ├── LeftPane.js         # Calendar & filters
│   │   │   ├── MiddlePane.js       # Timeline hero
│   │   │   ├── RightPane.js        # Details panel
│   │   │   ├── EventCard.js        # Event visualization
│   │   │   └── Modal.js            # Reusable modal
│   │   ├── modules/
│   │   │   ├── events.js           # Event CRUD operations
│   │   │   ├── members.js          # Family member management
│   │   │   └── utils.js            # Date/time helpers
│   │   └── config/
│   │       └── constants.js        # App constants & config
│   └── icons/                      # SVG icon library
├── manifest.json               # PWA manifest
├── service-worker.js           # Offline capabilities
└── tailwind.config.js          # Tailwind configuration
```

**Implementation Steps:**

1. **Initialize HTML Boilerplate** (`index.html`)
   - Include Tailwind CDN (development) or build process (production)
   - Set up viewport meta tags for tablet optimization
   - Add PWA manifest link
   - Create main app container with three-pane grid structure

2. **Configure TailwindCSS** (`tailwind.config.js`)
   - Extend color palette for family members (blue, pink, green, orange, purple)
   - Add custom breakpoints for tablet landscape (1024px, 1280px)
   - Configure custom spacing for timeline grid
   - Add animations for timeline "now" indicator

3. **Set up State Management** (`state/store.js`)
   - Implement observer pattern for reactive state updates
   - Define core data structures: events, members, settings
   - Create subscription system for component updates

4. **LocalStorage Wrapper** (`state/localStorage.js`)
   - Auto-save state changes to localStorage
   - Load initial state on app boot
   - Export/import functionality for data portability

**Acceptance Criteria:**
- [ ] Project structure created with all folders
- [ ] index.html loads with Tailwind styles applied
- [ ] State management stores and retrieves sample data
- [ ] Console logs confirm app initialization

---

## Phase 2: Three-Pane Layout & Responsive Design (Week 2-3)

### 2.1 Desktop/Tablet Layout Implementation

**Objective:** Build the core three-column dashboard layout optimized for landscape tablets

**Left Pane Component** (`components/LeftPane.js`)

**Features:**
- Mini monthly calendar with activity density dots
- "Today" floating action button
- Family member avatar filters with toggle states

**HTML Structure (Tailwind classes):**
```html
<aside class="w-64 lg:w-72 bg-white/80 backdrop-blur-md border-r border-gray-200 p-4 flex flex-col gap-6">
  <!-- Mini Calendar -->
  <div class="bg-white rounded-xl shadow-sm p-4">
    <div class="grid grid-cols-7 gap-1">
      <!-- Calendar cells -->
    </div>
  </div>

  <!-- Today Button -->
  <button class="btn-primary w-full py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
    Today
  </button>

  <!-- Member Filters -->
  <div class="flex flex-col gap-2">
    <!-- Avatar toggles -->
  </div>
</aside>
```

**JavaScript Responsibilities:**
- Generate calendar grid dynamically
- Calculate activity density dots from event data
- Handle filter toggle logic (All/Single/Multi selection)
- Emit filter change events to timeline

**Middle Pane Component** (`components/MiddlePane.js`)

**Features:**
- 24-hour vertical scrollable timeline
- Real-time "now" indicator (red line)
- Event blocks with proportional height
- Progressive time disclosure (collapsible quiet hours)

**HTML Structure:**
```html
<main class="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto relative">
  <!-- Timeline container -->
  <div class="timeline-grid relative px-8 py-4" style="min-height: 1440px;">
    <!-- Hour markers (0-23) -->
    <div class="hour-markers">
      <!-- Generated dynamically -->
    </div>

    <!-- "Now" indicator -->
    <div class="now-line absolute left-0 right-0 border-t-2 border-red-500 z-20" style="top: calc(...)">
      <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Now</span>
    </div>

    <!-- Event blocks -->
    <div class="events-container relative">
      <!-- EventCard components rendered here -->
    </div>
  </div>
</main>
```

**JavaScript Responsibilities:**
- Calculate pixel position for each hour (60px per hour = 1440px total)
- Position "now" line based on current time (update every minute)
- Render EventCard components with correct positioning and height
- Handle event click/tap to trigger detail view
- Auto-scroll to current time on load

**Right Pane Component** (`components/RightPane.js`)

**Features:**
- Default: "Up Next" summary view
- Active: Event detail panel
- "Who's Home" status board (pinned to top)

**HTML Structure:**
```html
<aside class="w-80 lg:w-96 bg-white/90 backdrop-blur-md border-l border-gray-200 overflow-y-auto">
  <!-- Who's Home Status -->
  <div class="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 z-10">
    <h3 class="font-semibold mb-2">Who's Home</h3>
    <div class="space-y-1 text-sm">
      <!-- Status items -->
    </div>
  </div>

  <!-- Dynamic Content Area -->
  <div id="right-pane-content" class="p-4">
    <!-- Switches between Up Next / Event Details -->
  </div>
</aside>
```

**JavaScript Responsibilities:**
- Render "Up Next" by filtering next 3 events from current time
- Switch to event detail view on timeline event selection
- Update "Who's Home" based on current event locations
- Provide action buttons (Edit, Delete, Duplicate)

### 2.2 Responsive Mobile Adaptation

**Breakpoint Strategy:**
- `sm` (640px): Single column, card-stack interface
- `md` (768px): Two-column hybrid
- `lg` (1024px+): Full three-pane layout (default)

**Mobile-Specific Components:**
- Bottom sheet modal for event details (slide up from bottom)
- Hamburger menu for left pane (filters, calendar)
- Swipeable timeline navigation
- Floating action button (FAB) for quick add

**Implementation:**
```html
<!-- Mobile: Hidden three-pane, show card stack -->
<div class="lg:hidden">
  <!-- Mobile UI -->
</div>

<!-- Desktop/Tablet: Three-pane layout -->
<div class="hidden lg:flex h-screen">
  <LeftPane />
  <MiddlePane />
  <RightPane />
</div>
```

**Acceptance Criteria:**
- [ ] Three-pane layout displays correctly on 1024x768+ screens
- [ ] Calendar renders with correct month/year
- [ ] Timeline shows 24 hour markers
- [ ] "Now" line appears at current time and updates every minute
- [ ] Layout collapses gracefully on mobile (<1024px)
- [ ] All panes scrollable independently

---

## Phase 3: Event System & Data Models (Week 3-4)

### 3.1 Event Data Model

**Objective:** Define core data structures and CRUD operations

**Event Object Schema** (`modules/events.js`)
```javascript
const Event = {
  id: 'uuid-v4',                      // Unique identifier
  title: 'Soccer Practice',           // Event name
  startTime: '2024-12-27T16:00:00',   // ISO 8601 format
  endTime: '2024-12-27T17:30:00',     // ISO 8601 format
  assignedTo: ['member-id-1'],        // Array of family member IDs
  color: 'green',                     // Color code (member's color)
  location: {
    name: 'Riverside Park',
    address: '123 Main St',
    coordinates: { lat: 40.7, lng: -74.0 }
  },
  transportation: {
    type: 'parent',                   // parent, self, carpool, walk, transit
    driver: 'member-id-parent',
    dropoff: 'member-id-parent',
    pickup: 'member-id-parent'
  },
  recurring: {
    enabled: false,
    pattern: 'weekly',                // daily, weekly, biweekly, monthly
    daysOfWeek: [2, 4],               // 0=Sunday, 6=Saturday
    endDate: '2025-05-30',
    exceptions: []                    // Dates to skip
  },
  checklist: [
    { id: 'item-1', text: 'Pack cleats', completed: false },
    { id: 'item-2', text: 'Bring water bottle', completed: true }
  ],
  notes: 'Bring sunscreen',
  category: 'sports',                 // sports, school, medical, social, etc.
  status: 'confirmed',                // pending, confirmed, cancelled
  createdBy: 'member-id-1',
  createdAt: '2024-12-20T10:00:00',
  updatedAt: '2024-12-27T08:30:00'
};
```

**Family Member Schema** (`modules/members.js`)
```javascript
const FamilyMember = {
  id: 'member-uuid',
  name: 'Leo',
  role: 'child',                      // parent, child
  color: 'green',                     // Timeline color
  avatar: 'path/to/avatar.jpg',
  permissions: {
    canCreateEvents: true,
    requiresApproval: true,           // For kids
    canEditOthersEvents: false
  },
  preferences: {
    notifications: true,
    defaultCalendarView: 'week'
  }
};
```

### 3.2 Event CRUD Operations

**Create Event** (`modules/events.js`)
```javascript
function createEvent(eventData) {
  const event = {
    id: generateUUID(),
    ...eventData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Validate required fields
  if (!event.title || !event.startTime || !event.endTime) {
    throw new Error('Missing required fields');
  }

  // Add to store
  store.dispatch('ADD_EVENT', event);

  // Handle recurring event generation
  if (event.recurring.enabled) {
    generateRecurringInstances(event);
  }

  return event;
}
```

**Read/Query Events**
```javascript
// Get all events for a specific date
function getEventsForDate(date) {
  const startOfDay = new Date(date).setHours(0,0,0,0);
  const endOfDay = new Date(date).setHours(23,59,59,999);

  return store.state.events.filter(event => {
    const eventStart = new Date(event.startTime).getTime();
    return eventStart >= startOfDay && eventStart <= endOfDay;
  });
}

// Get events for specific member
function getEventsForMember(memberId) {
  return store.state.events.filter(event =>
    event.assignedTo.includes(memberId)
  );
}

// Get next N upcoming events
function getUpcomingEvents(count = 3) {
  const now = new Date().getTime();
  return store.state.events
    .filter(event => new Date(event.startTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, count);
}
```

**Update Event**
```javascript
function updateEvent(eventId, updates) {
  const event = store.state.events.find(e => e.id === eventId);
  if (!event) throw new Error('Event not found');

  const updatedEvent = {
    ...event,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  store.dispatch('UPDATE_EVENT', updatedEvent);
  return updatedEvent;
}
```

**Delete Event**
```javascript
function deleteEvent(eventId) {
  // Soft delete (move to trash)
  const event = store.state.events.find(e => e.id === eventId);
  event.deletedAt = new Date().toISOString();

  store.dispatch('MOVE_TO_TRASH', event);

  // Auto-purge after 7 days
  setTimeout(() => {
    store.dispatch('PERMANENT_DELETE', eventId);
  }, 7 * 24 * 60 * 60 * 1000);
}
```

### 3.3 Event Card Component

**Visual Component** (`components/EventCard.js`)

**Features:**
- Proportional height based on duration
- Color-coded by assigned member
- Display title, time, icons
- Handle click events
- Opacity change for past events

**Implementation:**
```javascript
class EventCard extends BaseComponent {
  constructor(event) {
    super();
    this.event = event;
  }

  calculateDimensions() {
    const start = new Date(this.event.startTime);
    const end = new Date(this.event.endTime);
    const durationMinutes = (end - start) / (1000 * 60);
    const pixelsPerMinute = 60 / 60; // 60px per hour / 60 minutes

    return {
      height: durationMinutes * pixelsPerMinute,
      top: (start.getHours() * 60 + start.getMinutes()) * pixelsPerMinute
    };
  }

  isPast() {
    return new Date(this.event.endTime) < new Date();
  }

  render() {
    const { height, top } = this.calculateDimensions();
    const opacity = this.isPast() ? 'opacity-60' : 'opacity-100';
    const color = this.event.color;

    return `
      <div
        class="event-card absolute left-0 right-0 mx-2 rounded-lg p-2 cursor-pointer
               bg-${color}-500 hover:bg-${color}-600 ${opacity}
               transition-all duration-200 hover:scale-105 hover:shadow-lg"
        style="top: ${top}px; height: ${height}px; min-height: 20px;"
        data-event-id="${this.event.id}"
      >
        <div class="text-white text-sm font-medium truncate">${this.event.title}</div>
        <div class="text-white/80 text-xs">${this.formatTime()}</div>
        ${this.renderIcons()}
      </div>
    `;
  }

  renderIcons() {
    let icons = '';
    if (this.event.location) icons += '<span class="icon-location">📍</span>';
    if (this.event.transportation.driver) icons += '<span class="icon-car">🚗</span>';
    if (this.event.checklist.length > 0) icons += '<span class="icon-checklist">✓</span>';
    return `<div class="flex gap-1 mt-1">${icons}</div>`;
  }
}
```

**Acceptance Criteria:**
- [ ] Events can be created via modal form
- [ ] Events display on timeline at correct time positions
- [ ] Event height proportional to duration (1 hour = 60px)
- [ ] Past events appear semi-transparent
- [ ] Clicking event shows details in right pane
- [ ] Multiple events at same time display side-by-side

---

## Phase 4: Interactive Features & User Actions (Week 4-5)

### 4.1 Event Creation Modal

**Objective:** Build form for adding/editing events

**Modal Component** (`components/Modal.js`)

**Features:**
- Reusable modal base component
- Form validation
- Date/time pickers
- Member assignment multi-select
- Transportation options
- Location autocomplete (future: Google Places API)

**Form Fields:**
```html
<form id="event-form" class="space-y-4">
  <!-- Event Title -->
  <input
    type="text"
    name="title"
    placeholder="Event title"
    class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
    required
  />

  <!-- Date & Time -->
  <div class="grid grid-cols-2 gap-4">
    <input type="date" name="date" required />
    <div class="grid grid-cols-2 gap-2">
      <input type="time" name="startTime" required />
      <input type="time" name="endTime" required />
    </div>
  </div>

  <!-- Assigned Members (checkboxes) -->
  <div class="space-y-2">
    <label class="block font-medium">Assign to:</label>
    <div class="flex gap-4">
      <!-- Dynamic member checkboxes -->
    </div>
  </div>

  <!-- Location -->
  <input type="text" name="location" placeholder="Location (optional)" />

  <!-- Transportation -->
  <select name="driver">
    <option value="">No driver needed</option>
    <option value="parent1">Dad drives</option>
    <option value="parent2">Mom drives</option>
    <option value="carpool">Carpool</option>
  </select>

  <!-- Notes -->
  <textarea name="notes" placeholder="Notes (optional)" rows="3"></textarea>

  <!-- Recurring Options (collapsible) -->
  <details class="bg-gray-50 p-3 rounded-lg">
    <summary class="cursor-pointer font-medium">Repeat Event</summary>
    <div class="mt-3 space-y-2">
      <!-- Recurring pattern options -->
    </div>
  </details>

  <!-- Submit Buttons -->
  <div class="flex gap-3 justify-end">
    <button type="button" class="btn-secondary">Cancel</button>
    <button type="submit" class="btn-primary">Create Event</button>
  </div>
</form>
```

**Form Submission Handler:**
```javascript
document.getElementById('event-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const eventData = {
    title: formData.get('title'),
    startTime: combineDateTime(formData.get('date'), formData.get('startTime')),
    endTime: combineDateTime(formData.get('date'), formData.get('endTime')),
    assignedTo: Array.from(formData.getAll('assignedTo')),
    location: { name: formData.get('location') },
    transportation: { driver: formData.get('driver') },
    notes: formData.get('notes')
  };

  // Validation
  if (new Date(eventData.startTime) >= new Date(eventData.endTime)) {
    showError('End time must be after start time');
    return;
  }

  // Create event
  const newEvent = createEvent(eventData);

  // Close modal
  closeModal();

  // Refresh timeline
  renderTimeline();

  // Show success notification
  showNotification('Event created successfully!');
});
```

### 4.2 Family Member Filter System

**Objective:** Toggle timeline visibility by family member

**Filter State Management:**
```javascript
const filterState = {
  selectedMembers: ['all'], // 'all' or array of member IDs

  toggleMember(memberId) {
    if (memberId === 'all') {
      this.selectedMembers = ['all'];
    } else {
      // Remove 'all' if selecting individual
      this.selectedMembers = this.selectedMembers.filter(id => id !== 'all');

      // Toggle member
      if (this.selectedMembers.includes(memberId)) {
        this.selectedMembers = this.selectedMembers.filter(id => id !== memberId);
      } else {
        this.selectedMembers.push(memberId);
      }

      // If none selected, default to 'all'
      if (this.selectedMembers.length === 0) {
        this.selectedMembers = ['all'];
      }
    }

    // Trigger timeline re-render
    store.dispatch('UPDATE_FILTER', this.selectedMembers);
  },

  isVisible(event) {
    if (this.selectedMembers.includes('all')) return true;
    return event.assignedTo.some(id => this.selectedMembers.includes(id));
  }
};
```

**Visual Feedback:**
```javascript
// Avatar filter buttons
function renderMemberFilters() {
  const members = store.state.members;

  return `
    <div class="member-filters space-y-2">
      <!-- All Family button -->
      <button
        class="filter-btn ${filterState.selectedMembers.includes('all') ? 'active' : ''}"
        data-member="all"
      >
        <span class="text-2xl">👨‍👩‍👧‍👦</span>
        <span class="text-sm">All Family</span>
      </button>

      <!-- Individual member buttons -->
      ${members.map(member => `
        <button
          class="filter-btn ${filterState.selectedMembers.includes(member.id) ? 'active' : ''}"
          data-member="${member.id}"
        >
          <img src="${member.avatar}" class="w-10 h-10 rounded-full" />
          <span class="text-sm">${member.name}</span>
        </button>
      `).join('')}
    </div>
  `;
}
```

### 4.3 "Now" Indicator & Auto-Scroll

**Real-Time Updates:**
```javascript
// Update "now" line position every minute
function updateNowLine() {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const pixelsFromTop = minutesSinceMidnight * 1; // 1 pixel per minute (60px per hour)

  const nowLine = document.querySelector('.now-line');
  nowLine.style.top = `${pixelsFromTop}px`;

  // Update time label
  const timeLabel = nowLine.querySelector('.time-label');
  timeLabel.textContent = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Run immediately and then every minute
updateNowLine();
setInterval(updateNowLine, 60000);

// Auto-scroll to current time on page load
function scrollToNow() {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
  const pixelsFromTop = minutesSinceMidnight * 1;

  const timelineContainer = document.querySelector('.timeline-grid');
  timelineContainer.scrollTo({
    top: pixelsFromTop - 200, // Offset to center "now" line
    behavior: 'smooth'
  });
}
```

### 4.4 Right Pane Dynamic Content

**"Up Next" Default View:**
```javascript
function renderUpNext() {
  const upcomingEvents = getUpcomingEvents(3);

  return `
    <div class="up-next">
      <h3 class="text-lg font-semibold mb-4">Up Next</h3>
      ${upcomingEvents.map(event => `
        <div class="upcoming-card bg-white rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
             data-event-id="${event.id}">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">${event.title}</h4>
              <p class="text-sm text-gray-600">${formatEventTime(event)}</p>
            </div>
            <span class="text-2xl">${getEventIcon(event.category)}</span>
          </div>
          <div class="mt-2 text-xs text-gray-500">
            ${getTimeUntil(event.startTime)}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
```

**Event Detail View:**
```javascript
function renderEventDetails(eventId) {
  const event = store.state.events.find(e => e.id === eventId);
  if (!event) return;

  return `
    <div class="event-details">
      <!-- Header -->
      <div class="bg-${event.color}-500 text-white p-6 -m-4 mb-4 rounded-t-lg">
        <h2 class="text-2xl font-bold">${event.title}</h2>
        <p class="text-white/90">${formatFullDateTime(event.startTime)} - ${formatTime(event.endTime)}</p>
      </div>

      <!-- Location -->
      ${event.location ? `
        <div class="mb-4">
          <h3 class="font-semibold text-gray-700 mb-2">Location</h3>
          <div class="bg-gray-100 rounded-lg p-3">
            <p class="flex items-center gap-2">
              📍 ${event.location.name}
            </p>
            <button class="text-blue-600 text-sm mt-2">Get Directions →</button>
          </div>
        </div>
      ` : ''}

      <!-- Transportation -->
      ${event.transportation.driver ? `
        <div class="mb-4">
          <h3 class="font-semibold text-gray-700 mb-2">Transportation</h3>
          <p>🚗 ${getMemberName(event.transportation.driver)} driving</p>
        </div>
      ` : ''}

      <!-- Checklist -->
      ${event.checklist.length > 0 ? `
        <div class="mb-4">
          <h3 class="font-semibold text-gray-700 mb-2">Checklist</h3>
          <ul class="space-y-2">
            ${event.checklist.map(item => `
              <li class="flex items-center gap-2">
                <input
                  type="checkbox"
                  ${item.completed ? 'checked' : ''}
                  data-item-id="${item.id}"
                  class="w-4 h-4 text-blue-600 rounded"
                />
                <span class="${item.completed ? 'line-through text-gray-400' : ''}">${item.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Notes -->
      ${event.notes ? `
        <div class="mb-4">
          <h3 class="font-semibold text-gray-700 mb-2">Notes</h3>
          <p class="text-gray-600 bg-yellow-50 rounded-lg p-3">${event.notes}</p>
        </div>
      ` : ''}

      <!-- Actions -->
      <div class="flex gap-2 mt-6">
        <button class="btn-secondary flex-1" onclick="editEvent('${event.id}')">Edit</button>
        <button class="btn-secondary flex-1" onclick="duplicateEvent('${event.id}')">Duplicate</button>
        <button class="btn-danger flex-1" onclick="deleteEvent('${event.id}')">Delete</button>
      </div>
    </div>
  `;
}
```

**Acceptance Criteria:**
- [ ] Modal opens on "Add Event" button click
- [ ] Form validates required fields
- [ ] New events appear on timeline immediately
- [ ] Member filters hide/show events correctly
- [ ] "Now" line updates every minute
- [ ] Clicking timeline event shows details in right pane
- [ ] "Up Next" shows next 3 upcoming events

---

## Phase 5: Lists Module (Week 5-6)

### 5.1 List Data Model

**Objective:** Implement standalone lists (Groceries, To-Do, Custom)

**List Schema:**
```javascript
const List = {
  id: 'list-uuid',
  name: 'Groceries',
  type: 'groceries',           // groceries, todo, packing, gifts, custom
  items: [
    {
      id: 'item-uuid',
      text: 'Milk',
      quantity: '2 gallons',
      category: 'dairy',         // Auto-categorized for groceries
      completed: false,
      addedBy: 'member-id',
      addedAt: '2024-12-27T09:00:00'
    }
  ],
  createdAt: '2024-12-20T00:00:00',
  updatedAt: '2024-12-27T09:00:00'
};
```

### 5.2 List UI Component

**View:**
```html
<div class="lists-view p-6">
  <!-- List Tabs -->
  <div class="flex gap-2 mb-6 overflow-x-auto">
    <button class="tab active">Groceries</button>
    <button class="tab">To-Do</button>
    <button class="tab">Packing</button>
    <button class="tab">+ New List</button>
  </div>

  <!-- Active List -->
  <div class="list-container bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Groceries</h2>
      <button class="btn-secondary">Clear Completed</button>
    </div>

    <!-- Add Item -->
    <div class="add-item-form flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Add item..."
        class="flex-1 px-4 py-2 rounded-lg border"
        id="new-item-input"
      />
      <button class="btn-primary">Add</button>
    </div>

    <!-- Items -->
    <ul class="space-y-2">
      <!-- List items -->
    </ul>
  </div>
</div>
```

**Item Component:**
```javascript
function renderListItem(item) {
  return `
    <li class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <input
        type="checkbox"
        ${item.completed ? 'checked' : ''}
        onchange="toggleItem('${item.id}')"
        class="w-5 h-5 text-blue-600 rounded"
      />
      <span class="${item.completed ? 'line-through text-gray-400' : 'text-gray-900'} flex-1">
        ${item.text} ${item.quantity ? `<span class="text-gray-500">(${item.quantity})</span>` : ''}
      </span>
      <button onclick="deleteItem('${item.id}')" class="text-red-500 hover:text-red-700">
        ✕
      </button>
    </li>
  `;
}
```

### 5.3 Voice Input Integration

**Basic Voice Input (Web Speech API):**
```javascript
function enableVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    // Parse command: "Add milk to groceries"
    const match = transcript.match(/add (.+) to (groceries|todo|packing)/i);
    if (match) {
      const itemText = match[1];
      const listType = match[2].toLowerCase();

      addItemToList(listType, itemText);
      showNotification(`Added "${itemText}" to ${listType}`);
    }
  };

  // Trigger on button hold
  const voiceButton = document.getElementById('voice-btn');
  voiceButton.addEventListener('mousedown', () => recognition.start());
  voiceButton.addEventListener('mouseup', () => recognition.stop());
}
```

**Acceptance Criteria:**
- [ ] Multiple lists can be created (Groceries, To-Do, etc.)
- [ ] Items can be added, checked off, and deleted
- [ ] Completed items move to bottom or greyed out
- [ ] Voice input adds items to correct list
- [ ] Lists persist across sessions

---

## Phase 6: PWA & Offline Support (Week 6)

### 6.1 Progressive Web App Setup

**Manifest File** (`manifest.json`)
```json
{
  "name": "FamilySync",
  "short_name": "FamilySync",
  "description": "Family coordination dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "landscape",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 6.2 Service Worker

**Basic Caching Strategy** (`service-worker.js`)
```javascript
const CACHE_NAME = 'familysync-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/icons/icon-192.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 6.3 Install Prompt

**Add to Home Screen Prompt:**
```javascript
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show custom install button
  const installBtn = document.getElementById('install-btn');
  installBtn.style.display = 'block';

  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted install');
      }
      deferredPrompt = null;
    });
  });
});
```

**Acceptance Criteria:**
- [ ] App can be installed on tablet home screen
- [ ] Works offline with cached assets
- [ ] Data persists locally (IndexedDB/LocalStorage)
- [ ] Install prompt appears on compatible devices

---

## Phase 7: Recurring Events & Templates (Week 7)

### 7.1 Recurring Event Generation

**Algorithm:**
```javascript
function generateRecurringInstances(masterEvent) {
  const instances = [];
  const startDate = new Date(masterEvent.startTime);
  const endDate = new Date(masterEvent.recurring.endDate);

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Check if current date matches pattern
    if (matchesRecurringPattern(currentDate, masterEvent.recurring)) {
      // Create instance
      const instance = {
        ...masterEvent,
        id: generateUUID(),
        startTime: adjustDateTime(currentDate, startDate),
        endTime: adjustDateTime(currentDate, new Date(masterEvent.endTime)),
        recurringMasterId: masterEvent.id,
        isRecurringInstance: true
      };

      instances.push(instance);
    }

    // Increment based on pattern
    currentDate = incrementDate(currentDate, masterEvent.recurring.pattern);
  }

  // Add all instances to store
  store.dispatch('ADD_EVENTS_BATCH', instances);
  return instances;
}

function matchesRecurringPattern(date, recurring) {
  switch(recurring.pattern) {
    case 'daily':
      return true;
    case 'weekly':
      return recurring.daysOfWeek.includes(date.getDay());
    case 'biweekly':
      const weekNumber = getWeekNumber(date);
      return weekNumber % 2 === 0 && recurring.daysOfWeek.includes(date.getDay());
    case 'monthly':
      return date.getDate() === new Date(recurring.startDate).getDate();
    default:
      return false;
  }
}
```

### 7.2 Template System

**Save as Template:**
```javascript
function saveAsTemplate(event) {
  const template = {
    id: generateUUID(),
    name: event.title,
    template: {
      title: event.title,
      duration: getDuration(event.startTime, event.endTime),
      category: event.category,
      location: event.location,
      transportation: event.transportation,
      checklist: event.checklist,
      notes: event.notes
    },
    createdAt: new Date().toISOString()
  };

  store.dispatch('ADD_TEMPLATE', template);
  return template;
}
```

**Create from Template:**
```javascript
function createEventFromTemplate(templateId, startTime) {
  const template = store.state.templates.find(t => t.id === templateId);
  const duration = template.template.duration;

  const event = {
    ...template.template,
    id: generateUUID(),
    startTime: startTime,
    endTime: new Date(new Date(startTime).getTime() + duration),
    createdAt: new Date().toISOString()
  };

  createEvent(event);
  return event;
}
```

**Acceptance Criteria:**
- [ ] Recurring events can be created (daily, weekly, monthly)
- [ ] Instances generated correctly for date range
- [ ] Editing master updates all future instances
- [ ] Single instance can be edited without breaking series
- [ ] Templates can be saved and reused

---

## Phase 8: Conflict Detection & Warnings (Week 8)

### 8.1 Conflict Detection

**Overlap Detection:**
```javascript
function detectConflicts(newEvent) {
  const conflicts = [];
  const newStart = new Date(newEvent.startTime);
  const newEnd = new Date(newEvent.endTime);

  // Get events for affected family members
  const relevantEvents = store.state.events.filter(event =>
    event.assignedTo.some(memberId => newEvent.assignedTo.includes(memberId))
  );

  relevantEvents.forEach(existingEvent => {
    const existingStart = new Date(existingEvent.startTime);
    const existingEnd = new Date(existingEvent.endTime);

    // Check for overlap
    if (newStart < existingEnd && newEnd > existingStart) {
      conflicts.push({
        type: 'overlap',
        event: existingEvent,
        affectedMembers: newEvent.assignedTo.filter(id =>
          existingEvent.assignedTo.includes(id)
        )
      });
    }
  });

  return conflicts;
}
```

**Logistics Validation:**
```javascript
function validateLogistics(newEvent) {
  const warnings = [];

  // Check if previous event allows enough travel time
  const previousEvent = getPreviousEvent(newEvent);
  if (previousEvent && previousEvent.location && newEvent.location) {
    const travelTime = calculateTravelTime(
      previousEvent.location,
      newEvent.location
    );
    const gap = (new Date(newEvent.startTime) - new Date(previousEvent.endTime)) / 60000;

    if (gap < travelTime) {
      warnings.push({
        type: 'tight_transition',
        message: `Only ${gap} minutes between events, but ${travelTime} minutes drive time`,
        severity: 'warning'
      });
    }
  }

  return warnings;
}
```

### 8.2 Warning UI

**Conflict Dialog:**
```javascript
function showConflictWarning(conflicts, newEvent) {
  return `
    <div class="conflict-warning bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          ⚠️
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Scheduling Conflicts Detected</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <ul class="list-disc list-inside space-y-1">
              ${conflicts.map(conflict => `
                <li>Overlaps with "${conflict.event.title}" for ${getMemberNames(conflict.affectedMembers)}</li>
              `).join('')}
            </ul>
          </div>
          <div class="mt-4 flex gap-2">
            <button class="btn-secondary" onclick="adjustEventTime()">Adjust Time</button>
            <button class="btn-primary" onclick="saveAnyway()">Save Anyway</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
```

**Acceptance Criteria:**
- [ ] System detects overlapping events for same person
- [ ] Warnings shown before saving conflicting events
- [ ] Travel time validation between events
- [ ] User can choose to save anyway or adjust

---

## Phase 9: Additional Features (Week 9-10)

### 9.1 Mini-Calendar with Activity Density

**Visual Indicator:**
```javascript
function renderMiniCalendar(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let html = '<div class="calendar-grid grid grid-cols-7 gap-1">';

  // Day headers
  ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
    html += `<div class="text-center text-xs font-medium text-gray-500">${day}</div>`;
  });

  // Empty cells for first week
  for (let i = 0; i < firstDay.getDay(); i++) {
    html += '<div></div>';
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const eventsOnDay = getEventsForDate(date);
    const activityLevel = getActivityLevel(eventsOnDay.length);

    html += `
      <div class="calendar-day text-center py-2 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors
                  ${isToday(date) ? 'bg-blue-500 text-white' : 'text-gray-700'}"
           onclick="navigateToDate('${date.toISOString()}')">
        <div class="text-sm">${day}</div>
        <div class="activity-dots flex justify-center gap-0.5 mt-1">
          ${renderActivityDots(activityLevel)}
        </div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

function getActivityLevel(eventCount) {
  if (eventCount === 0) return 0;
  if (eventCount <= 2) return 1;  // Light
  if (eventCount <= 4) return 2;  // Medium
  return 3;                        // Heavy
}

function renderActivityDots(level) {
  const dots = [];
  for (let i = 0; i < level; i++) {
    dots.push('<span class="w-1 h-1 bg-blue-600 rounded-full"></span>');
  }
  return dots.join('');
}
```

### 9.2 "Who's Home" Status

**Location Inference:**
```javascript
function inferLocationStatus() {
  const now = new Date();
  const statuses = {};

  store.state.members.forEach(member => {
    const currentEvent = getCurrentEventForMember(member.id, now);

    if (currentEvent) {
      if (isAtEvent(currentEvent, now)) {
        statuses[member.id] = {
          location: currentEvent.location?.name || 'Event',
          status: 'at_event',
          event: currentEvent
        };
      } else if (isEnRoute(currentEvent, now)) {
        statuses[member.id] = {
          location: 'Driving',
          destination: currentEvent.location?.name,
          eta: currentEvent.startTime,
          status: 'in_transit'
        };
      }
    } else {
      // No current event, assume home
      statuses[member.id] = {
        location: 'Home',
        status: 'home'
      };
    }
  });

  return statuses;
}

function renderWhosHome() {
  const statuses = inferLocationStatus();

  return `
    <div class="whos-home bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
      <h3 class="font-semibold mb-3">Who's Home</h3>
      <div class="space-y-2">
        ${Object.entries(statuses).map(([memberId, status]) => {
          const member = getMember(memberId);
          return `
            <div class="flex items-center gap-2 text-sm">
              <img src="${member.avatar}" class="w-6 h-6 rounded-full" />
              <span class="font-medium">${member.name}:</span>
              <span class="text-white/90">${status.location}</span>
              ${status.eta ? `<span class="text-white/70 text-xs">(arrives ${formatTime(status.eta)})</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
```

### 9.3 Dark Mode

**CSS Variables:**
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
}
```

**Toggle:**
```javascript
function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Auto-detect system preference
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem('theme')) {
    document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  }
});
```

**Acceptance Criteria:**
- [ ] Calendar shows activity density dots
- [ ] "Who's Home" infers location from events
- [ ] Dark mode toggle works
- [ ] Theme persists across sessions

---

## Modern Design Trends for Web Apps (2024-2025)

### Design System Guidelines

**1. Glassmorphism**
- Semi-transparent backgrounds with backdrop blur
- Use for cards, modals, navigation bars
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

**2. Soft Shadows & Depth**
- Layered shadows for subtle depth
- Avoid harsh borders, prefer shadows
```css
.elevated-card {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 10px 20px rgba(0, 0, 0, 0.1);
}
```

**3. Rounded Corners**
- Large border-radius (12px - 24px) for modern feel
- Consistent rounding across components

**4. Micro-Interactions**
- Hover states with scale transform
- Button ripple effects
- Loading skeletons instead of spinners
```css
.interactive-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}
```

**5. Typography**
- System font stack for performance
- Clear hierarchy (size + weight)
- Generous line-height (1.6+)

**6. Color Palette**
- Primary: Blues/Purples (trust, calm)
- Accent: Bright colors for CTAs
- Neutral grays for text
- Semantic colors (green=success, red=danger, yellow=warning)

**7. Spacing System**
- 8px base unit (Tailwind default)
- Consistent padding/margins using scale (4, 8, 12, 16, 24, 32, 48, 64)

**8. Animations**
- 200-300ms for UI feedback
- Ease-in-out for natural feel
- Reduced motion support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing & Quality Assurance

### Browser Compatibility
- Chrome/Edge (Chromium)
- Safari (WebKit)
- Firefox

### Device Testing
- iPad (landscape): 1024x768, 1366x1024
- iPad Pro (landscape): 1366x1024
- Desktop: 1920x1080+
- Mobile fallback: 375x667+

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios

---

## Deployment

### Static Hosting Options
1. **Netlify** (recommended for MVP)
   - Automatic HTTPS
   - CDN distribution
   - Deploy from Git

2. **Vercel**
   - Serverless functions support (future API)
   - Edge caching

3. **GitHub Pages**
   - Free for public repos
   - Custom domain support

### Build Process
```bash
# Development
npx tailwindcss -i ./assets/css/input.css -o ./assets/css/styles.css --watch

# Production
npx tailwindcss -i ./assets/css/input.css -o ./assets/css/styles.css --minify
```

---

## Phase Summary & Timeline

| Phase | Duration | Deliverables | Priority |
|-------|----------|--------------|----------|
| 1: Foundation | Week 1-2 | Project structure, state management, localStorage | Critical |
| 2: Layout | Week 2-3 | Three-pane responsive layout | Critical |
| 3: Events | Week 3-4 | Event CRUD, timeline rendering | Critical |
| 4: Interactions | Week 4-5 | Modal forms, filters, detail views | Critical |
| 5: Lists | Week 5-6 | Standalone lists (groceries, to-do) | High |
| 6: PWA | Week 6 | Service worker, offline support | High |
| 7: Recurring | Week 7 | Recurring events, templates | Medium |
| 8: Conflicts | Week 8 | Conflict detection, warnings | Medium |
| 9: Polish | Week 9-10 | Calendar density, dark mode, "Who's Home" | Low |

**Total MVP Timeline: 10 weeks (2.5 months)**

---

## Next Steps

1. **Initialize project** using Phase 1 instructions
2. **Set up Git repository** for version control
3. **Create design mockups** (optional: Figma/Sketch)
4. **Begin Phase 1 development**
5. **Iterate based on user testing**

---

## References

- TailwindCSS Documentation: https://tailwindcss.com/docs
- Web Speech API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- PWA Guide: https://web.dev/progressive-web-apps/
- IndexedDB Guide: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

---

**Document Version:** 1.0
**Created:** December 2024
**Status:** Ready for Development
