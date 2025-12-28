# Phase 2: Three-Pane Layout & Components - Implementation Guide

## Overview
Build the visual interface of FamilySync with the three-column dashboard layout optimized for tablet landscape mode. This phase creates the shell that all future features will plug into.

**Duration:** Week 2-3
**Prerequisites:** Phase 1 complete

---

## Architecture Overview

The three-pane layout consists of:

1. **Left Pane (280px)**: Mini calendar + family member filters
2. **Middle Pane (flex-1)**: 24-hour timeline with "now" indicator
3. **Right Pane (384px)**: Context panel (Up Next / Event Details)

**Component Communication:**
- User clicks filter → Left Pane emits event → Middle Pane updates timeline
- User clicks event → Middle Pane emits event → Right Pane shows details
- User clicks calendar date → Left Pane updates store → Middle Pane scrolls to date

---

## Step 1: Create Base Component Class

### 1.1 Create assets/js/components/BaseComponent.js

Every component will extend this base class for consistent behavior.

```javascript
/**
 * Base Component Class
 * All UI components extend this for consistent lifecycle and rendering
 */

export default class BaseComponent {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`Container #${containerId} not found`);
    }

    this.state = {};
    this.mounted = false;
  }

  /**
   * Render component HTML
   * Override this in child classes
   */
  render() {
    return '<div>Base Component</div>';
  }

  /**
   * Mount component to DOM
   */
  mount() {
    if (!this.container) return;

    const html = this.render();
    this.container.innerHTML = html;
    this.mounted = true;

    // Attach event listeners after render
    this.attachEvents();

    console.log(`[${this.constructor.name}] Mounted`);
  }

  /**
   * Update component (re-render)
   */
  update() {
    if (!this.mounted) {
      this.mount();
    } else {
      const html = this.render();
      this.container.innerHTML = html;
      this.attachEvents();
    }
  }

  /**
   * Attach event listeners
   * Override this in child classes
   */
  attachEvents() {
    // Child classes implement this
  }

  /**
   * Unmount component
   */
  unmount() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.mounted = false;
  }

  /**
   * Emit custom event
   */
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  /**
   * Listen to custom event
   */
  on(eventName, callback) {
    document.addEventListener(eventName, callback);
  }
}
```

---

## Step 2: Build Left Pane Component

### 2.1 Create assets/js/components/LeftPane.js

```javascript
import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { isToday } from '../modules/utils.js';

export default class LeftPane extends BaseComponent {
  constructor() {
    super('left-pane');

    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();

    // Subscribe to store changes
    store.subscribe('left-pane', (state) => {
      this.update();
    });
  }

  render() {
    return `
      <div class="flex flex-col h-full p-4 gap-6">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-2xl font-bold text-gray-800">FamilySync</h1>
          <p class="text-sm text-gray-500">Family Dashboard</p>
        </div>

        <!-- Mini Calendar -->
        <div class="bg-white rounded-xl shadow-sm p-4">
          ${this.renderCalendarHeader()}
          ${this.renderCalendar()}
        </div>

        <!-- Today Button -->
        <button
          id="today-btn"
          class="w-full py-3 px-4 bg-blue-500 text-white rounded-full font-medium
                 shadow-lg hover:shadow-xl hover:bg-blue-600 active:scale-95
                 transition-all duration-200"
        >
          📅 Today
        </button>

        <!-- Member Filters -->
        <div class="flex-1 overflow-y-auto">
          <h3 class="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
            Show Calendar For
          </h3>
          ${this.renderMemberFilters()}
        </div>

        <!-- Footer Actions -->
        <div class="border-t border-gray-200 pt-4 space-y-2">
          <button
            id="add-event-btn"
            class="w-full py-2 px-4 bg-green-500 text-white rounded-lg font-medium
                   hover:bg-green-600 active:scale-95 transition-all duration-200"
          >
            + Add Event
          </button>
        </div>
      </div>
    `;
  }

  renderCalendarHeader() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return `
      <div class="flex items-center justify-between mb-4">
        <button
          id="prev-month"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          ←
        </button>
        <h3 class="font-semibold text-gray-800">
          ${monthNames[this.currentMonth]} ${this.currentYear}
        </h3>
        <button
          id="next-month"
          class="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          →
        </button>
      </div>
    `;
  }

  renderCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    let html = '<div class="grid grid-cols-7 gap-1">';

    // Day headers
    dayNames.forEach(day => {
      html += `<div class="text-center text-xs font-medium text-gray-500 py-1">${day}</div>`;
    });

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div></div>';
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const events = this.getEventsForDate(date);
      const activityLevel = this.getActivityLevel(events.length);
      const isTodayDate = isToday(date);

      html += `
        <div
          class="calendar-day text-center py-2 rounded-lg cursor-pointer
                 transition-all duration-200 hover:bg-blue-50
                 ${isTodayDate ? 'bg-blue-500 text-white font-bold' : 'text-gray-700'}"
          data-date="${date.toISOString()}"
        >
          <div class="text-sm">${day}</div>
          ${this.renderActivityDots(activityLevel, isTodayDate)}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  renderActivityDots(level, isTodayDate) {
    if (level === 0) return '';

    const dotColor = isTodayDate ? 'bg-white' : 'bg-blue-500';
    let html = '<div class="flex justify-center gap-0.5 mt-1">';

    for (let i = 0; i < level; i++) {
      html += `<span class="w-1 h-1 ${dotColor} rounded-full"></span>`;
    }

    html += '</div>';
    return html;
  }

  renderMemberFilters() {
    const members = store.state.members;
    const selectedMembers = store.state.filters.selectedMembers;

    const isAllSelected = selectedMembers.includes('all');

    let html = `
      <!-- All Family Button -->
      <button
        class="filter-btn w-full mb-2 p-3 rounded-lg flex items-center gap-3
               transition-all duration-200 hover:scale-102
               ${isAllSelected ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
        data-member="all"
      >
        <span class="text-2xl">👨‍👩‍👧‍👦</span>
        <span class="font-medium">All Family</span>
      </button>
    `;

    members.forEach(member => {
      const isSelected = selectedMembers.includes(member.id);

      html += `
        <button
          class="filter-btn w-full mb-2 p-3 rounded-lg flex items-center gap-3
                 transition-all duration-200 hover:scale-102
                 ${isSelected ? `bg-${member.color}-500 text-white shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
          data-member="${member.id}"
        >
          <img src="${member.avatar}" class="w-8 h-8 rounded-full" />
          <span class="font-medium">${member.name}</span>
          ${member.role === 'child' ? '<span class="ml-auto text-xs opacity-70">👶</span>' : ''}
        </button>
      `;
    });

    return html;
  }

  attachEvents() {
    // Today button
    const todayBtn = document.getElementById('today-btn');
    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        const today = new Date();
        store.dispatch('SET_CURRENT_DATE', today.toISOString());
        this.emit('navigate-to-today');
      });
    }

    // Month navigation
    document.getElementById('prev-month')?.addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.update();
    });

    document.getElementById('next-month')?.addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.update();
    });

    // Calendar day clicks
    document.querySelectorAll('.calendar-day').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        const dateStr = dayEl.dataset.date;
        store.dispatch('SET_CURRENT_DATE', dateStr);
        this.emit('navigate-to-date', { date: dateStr });
      });
    });

    // Member filter clicks
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const memberId = btn.dataset.member;
        this.toggleMemberFilter(memberId);
      });
    });

    // Add event button
    document.getElementById('add-event-btn')?.addEventListener('click', () => {
      this.emit('open-event-modal', { mode: 'create' });
    });
  }

  toggleMemberFilter(memberId) {
    let selectedMembers = [...store.state.filters.selectedMembers];

    if (memberId === 'all') {
      selectedMembers = ['all'];
    } else {
      // Remove 'all' if selecting individual
      selectedMembers = selectedMembers.filter(id => id !== 'all');

      // Toggle member
      if (selectedMembers.includes(memberId)) {
        selectedMembers = selectedMembers.filter(id => id !== memberId);
      } else {
        selectedMembers.push(memberId);
      }

      // If none selected, default to 'all'
      if (selectedMembers.length === 0) {
        selectedMembers = ['all'];
      }
    }

    store.dispatch('UPDATE_FILTER', selectedMembers);
  }

  getEventsForDate(date) {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);

    return store.state.events.filter(event => {
      const eventStart = new Date(event.startTime).getTime();
      return eventStart >= startOfDay && eventStart <= endOfDay;
    });
  }

  getActivityLevel(eventCount) {
    if (eventCount === 0) return 0;
    if (eventCount <= 2) return 1;  // Light
    if (eventCount <= 4) return 2;  // Medium
    return 3;                        // Heavy
  }
}
```

---

## Step 3: Build Middle Pane (Timeline)

### 3.1 Create assets/js/components/MiddlePane.js

```javascript
import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { formatTime } from '../modules/utils.js';

export default class MiddlePane extends BaseComponent {
  constructor() {
    super('middle-pane');

    this.nowLineInterval = null;

    // Subscribe to store changes
    store.subscribe('middle-pane', (state, action) => {
      if (action === 'ADD_EVENT' || action === 'UPDATE_EVENT' || action === 'DELETE_EVENT' || action === 'UPDATE_FILTER') {
        this.update();
      }
    });

    // Listen for navigation events
    this.on('navigate-to-today', () => this.scrollToNow());
    this.on('navigate-to-date', (e) => this.scrollToTime(0)); // Scroll to midnight
  }

  render() {
    return `
      <div class="timeline-container relative" style="min-height: 1440px;">
        ${this.renderHourMarkers()}
        ${this.renderNowLine()}
        ${this.renderEvents()}
      </div>
    `;
  }

  renderHourMarkers() {
    let html = '<div class="hour-markers">';

    for (let hour = 0; hour < 24; hour++) {
      const topPosition = hour * 60; // 60px per hour
      const displayHour = hour === 0 ? '12 AM' :
                         hour < 12 ? `${hour} AM` :
                         hour === 12 ? '12 PM' :
                         `${hour - 12} PM`;

      html += `
        <div
          class="hour-marker absolute left-0 right-0 border-t border-gray-200"
          style="top: ${topPosition}px; height: 60px;"
        >
          <span class="absolute -top-3 left-4 bg-gray-50 px-2 text-xs font-medium text-gray-500">
            ${displayHour}
          </span>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  renderNowLine() {
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    const topPosition = minutesSinceMidnight; // 1px per minute

    return `
      <div
        id="now-line"
        class="now-line absolute left-0 right-0 z-20"
        style="top: ${topPosition}px;"
      >
        <div class="flex items-center">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <div class="flex-1 border-t-2 border-red-500"></div>
          <span class="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
            ${formatTime(now.toISOString())}
          </span>
        </div>
      </div>
    `;
  }

  renderEvents() {
    const events = this.getFilteredEvents();
    const currentDate = new Date(store.state.ui.currentDate);

    // Filter events for current date
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === currentDate.toDateString();
    });

    let html = '<div class="events-container absolute left-16 right-4 top-0">';

    // Group overlapping events
    const eventColumns = this.layoutOverlappingEvents(todayEvents);

    eventColumns.forEach((column, columnIndex) => {
      column.forEach(event => {
        html += this.renderEventCard(event, columnIndex, eventColumns.length);
      });
    });

    html += '</div>';
    return html;
  }

  renderEventCard(event, columnIndex, totalColumns) {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const durationMinutes = (endTime - startTime) / 60000;

    const top = startMinutes; // 1px per minute
    const height = Math.max(durationMinutes, 20); // Minimum 20px height

    const isPast = endTime < new Date();
    const opacity = isPast ? 'opacity-60' : 'opacity-100';

    // Calculate width for overlapping events
    const widthPercent = 100 / totalColumns;
    const leftPercent = columnIndex * widthPercent;

    return `
      <div
        class="event-card absolute rounded-lg p-3 cursor-pointer
               shadow-md hover:shadow-lg hover:scale-105
               transition-all duration-200 ${opacity}
               bg-${event.color}-500 hover:bg-${event.color}-600"
        style="top: ${top}px;
               height: ${height}px;
               left: ${leftPercent}%;
               width: calc(${widthPercent}% - 4px);"
        data-event-id="${event.id}"
      >
        <div class="text-white">
          <div class="font-semibold text-sm truncate">${event.title}</div>
          <div class="text-xs opacity-90">${formatTime(event.startTime)}</div>
          <div class="flex gap-1 mt-1">
            ${event.location ? '📍' : ''}
            ${event.transportation?.driver ? '🚗' : ''}
            ${event.checklist?.length > 0 ? '✓' : ''}
          </div>
        </div>
      </div>
    `;
  }

  layoutOverlappingEvents(events) {
    // Sort events by start time
    const sorted = [...events].sort((a, b) =>
      new Date(a.startTime) - new Date(b.startTime)
    );

    const columns = [];

    sorted.forEach(event => {
      // Find column where this event fits
      let placed = false;

      for (let column of columns) {
        // Check if event overlaps with any in this column
        const overlaps = column.some(e => this.eventsOverlap(e, event));

        if (!overlaps) {
          column.push(event);
          placed = true;
          break;
        }
      }

      // Create new column if needed
      if (!placed) {
        columns.push([event]);
      }
    });

    return columns;
  }

  eventsOverlap(event1, event2) {
    const start1 = new Date(event1.startTime);
    const end1 = new Date(event1.endTime);
    const start2 = new Date(event2.startTime);
    const end2 = new Date(event2.endTime);

    return start1 < end2 && start2 < end1;
  }

  attachEvents() {
    // Click event cards
    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        store.dispatch('SELECT_EVENT', eventId);
        this.emit('event-selected', { eventId });
      });
    });

    // Start now line updates
    this.startNowLineUpdates();
  }

  startNowLineUpdates() {
    // Clear existing interval
    if (this.nowLineInterval) {
      clearInterval(this.nowLineInterval);
    }

    // Update every minute
    this.nowLineInterval = setInterval(() => {
      this.updateNowLine();
    }, 60000);
  }

  updateNowLine() {
    const nowLine = document.getElementById('now-line');
    if (!nowLine) return;

    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

    nowLine.style.top = `${minutesSinceMidnight}px`;
    nowLine.querySelector('span').textContent = formatTime(now.toISOString());
  }

  scrollToNow() {
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

    this.scrollToTime(minutesSinceMidnight);
  }

  scrollToTime(minutes) {
    const container = this.container;
    if (!container) return;

    container.scrollTo({
      top: minutes - 200, // Offset to center view
      behavior: 'smooth'
    });
  }

  getFilteredEvents() {
    const allEvents = store.state.events;
    const selectedMembers = store.state.filters.selectedMembers;

    if (selectedMembers.includes('all')) {
      return allEvents;
    }

    return allEvents.filter(event =>
      event.assignedTo.some(memberId => selectedMembers.includes(memberId))
    );
  }

  unmount() {
    super.unmount();
    if (this.nowLineInterval) {
      clearInterval(this.nowLineInterval);
    }
  }
}
```

---

## Step 4: Build Right Pane Component

### 4.1 Create assets/js/components/RightPane.js

```javascript
import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { formatTime, formatFullDateTime, getTimeUntil } from '../modules/utils.js';

export default class RightPane extends BaseComponent {
  constructor() {
    super('right-pane');

    // Subscribe to store changes
    store.subscribe('right-pane', (state, action) => {
      if (action === 'SELECT_EVENT' || action === 'ADD_EVENT' || action === 'UPDATE_EVENT') {
        this.update();
      }
    });

    // Listen for event selection
    this.on('event-selected', () => this.update());
  }

  render() {
    const selectedEventId = store.state.ui.selectedEventId;

    return `
      <div class="flex flex-col h-full">
        ${this.renderWhosHome()}
        <div class="flex-1 overflow-y-auto p-6">
          ${selectedEventId ? this.renderEventDetails(selectedEventId) : this.renderUpNext()}
        </div>
      </div>
    `;
  }

  renderWhosHome() {
    const statuses = this.inferLocationStatus();

    return `
      <div class="whos-home bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 sticky top-0 z-10">
        <h3 class="font-semibold mb-3 text-sm uppercase tracking-wide">Who's Home</h3>
        <div class="space-y-2">
          ${Object.entries(statuses).map(([memberId, status]) => {
            const member = this.getMember(memberId);
            return `
              <div class="flex items-center gap-2 text-sm">
                <img src="${member.avatar}" class="w-6 h-6 rounded-full border-2 border-white/30" />
                <span class="font-medium">${member.name}:</span>
                <span class="text-white/90">${status.location}</span>
                ${status.eta ? `<span class="text-white/70 text-xs">(${formatTime(status.eta)})</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderUpNext() {
    const upcomingEvents = this.getUpcomingEvents(3);

    return `
      <div class="up-next">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Up Next</h2>

        ${upcomingEvents.length === 0 ? `
          <div class="text-center py-12">
            <div class="text-6xl mb-4">🎉</div>
            <p class="text-gray-500">No upcoming events!</p>
            <p class="text-sm text-gray-400 mt-2">Enjoy your free time</p>
          </div>
        ` : ''}

        <div class="space-y-3">
          ${upcomingEvents.map(event => `
            <div
              class="upcoming-card bg-white rounded-xl p-4 shadow-sm
                     hover:shadow-md transition-shadow cursor-pointer border-l-4 border-${event.color}-500"
              data-event-id="${event.id}"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">${event.title}</h3>
                  <p class="text-sm text-gray-600 mt-1">${formatFullDateTime(event.startTime)}</p>
                  ${event.location ? `
                    <p class="text-sm text-gray-500 mt-1">📍 ${event.location.name}</p>
                  ` : ''}
                </div>
                <div class="text-right">
                  <span class="text-3xl">${this.getCategoryIcon(event.category)}</span>
                </div>
              </div>
              <div class="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                ${getTimeUntil(event.startTime)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderEventDetails(eventId) {
    const event = store.state.events.find(e => e.id === eventId);
    if (!event) return '<p>Event not found</p>';

    return `
      <div class="event-details">
        <!-- Header -->
        <div class="bg-${event.color}-500 text-white -mx-6 -mt-6 p-6 mb-6 rounded-b-3xl">
          <button
            id="close-detail"
            class="float-right text-white/80 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
          <h2 class="text-2xl font-bold mb-2">${event.title}</h2>
          <p class="text-white/90">
            ${formatFullDateTime(event.startTime)}
            <br>
            ${formatTime(event.startTime)} - ${formatTime(event.endTime)}
          </p>
        </div>

        <!-- Location -->
        ${event.location ? `
          <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              📍 Location
            </h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-gray-900">${event.location.name}</p>
              ${event.location.address ? `
                <p class="text-sm text-gray-600 mt-1">${event.location.address}</p>
              ` : ''}
              <button class="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700">
                Get Directions →
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Transportation -->
        ${event.transportation?.driver ? `
          <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              🚗 Transportation
            </h3>
            <p class="text-gray-900">${this.getMember(event.transportation.driver).name} driving</p>
          </div>
        ` : ''}

        <!-- Checklist -->
        ${event.checklist && event.checklist.length > 0 ? `
          <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              ✓ Checklist
              <span class="text-sm font-normal text-gray-500">
                (${event.checklist.filter(i => i.completed).length}/${event.checklist.length})
              </span>
            </h3>
            <ul class="space-y-2">
              ${event.checklist.map(item => `
                <li class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    ${item.completed ? 'checked' : ''}
                    data-item-id="${item.id}"
                    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="${item.completed ? 'line-through text-gray-400' : 'text-gray-900'}">
                    ${item.text}
                  </span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Notes -->
        ${event.notes ? `
          <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2">📝 Notes</h3>
            <p class="text-gray-700 bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
              ${event.notes}
            </p>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-3 mt-8">
          <button class="btn-secondary" onclick="editEvent('${event.id}')">
            Edit
          </button>
          <button class="btn-secondary" onclick="duplicateEvent('${event.id}')">
            Duplicate
          </button>
          <button class="btn-danger col-span-2" onclick="deleteEvent('${event.id}')">
            Delete Event
          </button>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Close detail view
    document.getElementById('close-detail')?.addEventListener('click', () => {
      store.dispatch('SELECT_EVENT', null);
    });

    // Click upcoming cards
    document.querySelectorAll('.upcoming-card').forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        store.dispatch('SELECT_EVENT', eventId);
      });
    });

    // Checklist items
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const itemId = e.target.dataset.itemId;
        this.toggleChecklistItem(itemId);
      });
    });
  }

  toggleChecklistItem(itemId) {
    const event = store.state.events.find(e => e.id === store.state.ui.selectedEventId);
    if (!event) return;

    const updatedChecklist = event.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    store.dispatch('UPDATE_EVENT', {
      ...event,
      checklist: updatedChecklist
    });
  }

  getUpcomingEvents(count = 3) {
    const now = new Date().getTime();
    return store.state.events
      .filter(event => new Date(event.startTime).getTime() > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, count);
  }

  inferLocationStatus() {
    const now = new Date();
    const statuses = {};

    store.state.members.forEach(member => {
      const currentEvent = this.getCurrentEventForMember(member.id, now);

      if (currentEvent && currentEvent.location) {
        statuses[member.id] = {
          location: currentEvent.location.name,
          status: 'at_event'
        };
      } else {
        statuses[member.id] = {
          location: 'Home',
          status: 'home'
        };
      }
    });

    return statuses;
  }

  getCurrentEventForMember(memberId, now) {
    return store.state.events.find(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return event.assignedTo.includes(memberId) && now >= start && now <= end;
    });
  }

  getMember(memberId) {
    return store.state.members.find(m => m.id === memberId) || { name: 'Unknown', avatar: '' };
  }

  getCategoryIcon(category) {
    const icons = {
      sports: '⚽',
      education: '📚',
      medical: '🏥',
      meal: '🍽️',
      social: '🎉',
      work: '💼'
    };
    return icons[category] || '📅';
  }
}
```

---

## Step 5: Initialize Components in App

### 5.1 Update assets/js/app.js

```javascript
import store from './state/store.js';
import { loadSampleData } from './config/sampleData.js';
import LeftPane from './components/LeftPane.js';
import MiddlePane from './components/MiddlePane.js';
import RightPane from './components/RightPane.js';

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

    // Initialize components
    this.initComponents();

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('[App] Service Worker registered');
      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
      }
    }

    console.log('[App] Initialization complete');
  }

  initComponents() {
    // Create component instances
    this.leftPane = new LeftPane();
    this.middlePane = new MiddlePane();
    this.rightPane = new RightPane();

    // Mount all components
    this.leftPane.mount();
    this.middlePane.mount();
    this.rightPane.mount();

    // Scroll to current time
    setTimeout(() => {
      this.middlePane.scrollToNow();
    }, 100);

    console.log('[App] Components mounted');
  }
}

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
```

---

## Step 6: Test the Layout

### 6.1 Start Dev Server

```bash
python -m http.server 8000
# or
npx http-server -p 8000
```

### 6.2 Open Browser

Navigate to `http://localhost:8000`

### 6.3 Expected Results

You should see:
- ✅ Left pane with mini calendar showing current month
- ✅ Activity dots on days with events
- ✅ Family member filter buttons
- ✅ Middle pane with 24-hour timeline
- ✅ Red "now" line at current time
- ✅ Sample events displayed at correct times
- ✅ Right pane showing "Up Next" with 3 upcoming events
- ✅ "Who's Home" status bar at top

### 6.4 Test Interactions

- Click "Today" button → Timeline scrolls to current time
- Click family member filter → Timeline shows only their events
- Click calendar date → Timeline updates (placeholder)
- Click event on timeline → Right pane shows event details
- Click "X" on detail → Right pane returns to "Up Next"

---

## Checklist for Phase 2 Completion

- [ ] BaseComponent class created
- [ ] LeftPane renders with calendar
- [ ] Calendar shows activity density dots
- [ ] Member filters toggle correctly
- [ ] MiddlePane shows 24-hour timeline
- [ ] "Now" line appears at current time and updates
- [ ] Events display at correct positions with correct heights
- [ ] Past events appear semi-transparent
- [ ] Overlapping events display side-by-side
- [ ] RightPane shows "Up Next" by default
- [ ] Clicking event shows detail view
- [ ] "Who's Home" infers location from events
- [ ] Layout is responsive (test on different screen sizes)
- [ ] No console errors

---

## Troubleshooting

### Events not appearing
- Check console for errors
- Verify sampleData.js loaded correctly
- Check filter state (might be filtering out events)

### Timeline scroll issues
- Verify container has `overflow-y-auto`
- Check scroll position calculation
- Test with different screen heights

### "Now" line not updating
- Check interval is running
- Verify calculation: `hours * 60 + minutes`
- Check z-index layering

---

**Phase 2 Estimated Time:** 10-12 hours
**Difficulty:** Intermediate

**Next:** Proceed to Phase 3 - Event System & CRUD Operations
