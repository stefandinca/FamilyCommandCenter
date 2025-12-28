import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { formatTime } from '../modules/utils.js';

export default class MiddlePane extends BaseComponent {
  constructor() {
    super('middle-pane');

    this.nowLineInterval = null;

    // Subscribe to store changes
    store.subscribe('middle-pane', (state, action) => {
      if (action === 'ADD_EVENT' || action === 'UPDATE_EVENT' || action === 'DELETE_EVENT' ||
          action === 'UPDATE_FILTER' || action === 'SET_VISIBLE_MEMBERS') {
        this.update();
      }
    });

    // Listen for navigation events
    this.on('navigate-to-today', () => this.scrollToNow());
    this.on('navigate-to-date', (e) => this.scrollToTime(0)); // Scroll to midnight
  }

  render() {
    const allMembers = store.state.members;
    const visibleMemberIds = store.state.ui.visibleMembers;

    // If visibleMembers is empty, show all members
    const membersToShow = visibleMemberIds.length === 0
      ? allMembers
      : allMembers.filter(m => visibleMemberIds.includes(m.id));

    const hiddenMembers = visibleMemberIds.length > 0
      ? allMembers.filter(m => !visibleMemberIds.includes(m.id))
      : [];

    return `
      <div class="timeline-container relative flex" style="min-height: 1440px;">
        ${this.renderHiddenMemberAvatars(hiddenMembers)}
        ${membersToShow.map(member => this.renderSwimlane(member)).join('')}
        ${this.renderNowLine()}
      </div>
    `;
  }

  renderHiddenMemberAvatars(hiddenMembers) {
    if (hiddenMembers.length === 0) return '';

    return `
      <div class="hidden-members-bar sticky top-0 z-40 bg-gray-100 border-b-2 border-gray-300 p-3 flex items-center gap-3 shadow-md" style="left: 0; right: 0;">
        <span class="text-sm font-medium text-gray-600">Add:</span>
        ${hiddenMembers.map(member => `
          <button
            class="add-member-btn hover:scale-110 transition-transform duration-200"
            data-member-id="${member.id}"
            title="Show ${member.name}'s swimlane"
          >
            <img src="${member.avatar}" class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-500 shadow-sm" />
          </button>
        `).join('')}
        <button
          id="show-all-members-btn"
          class="ml-auto px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
        >
          Show All
        </button>
      </div>
    `;
  }

  renderSwimlane(member) {
    const memberColor = this.getMemberColor(member.color);

    return `
      <div class="swimlane flex-1 relative border-r border-gray-200" style="min-height: 1440px;">
        <!-- Swimlane Header -->
        <div class="swimlane-header sticky top-0 z-30 p-4 text-center border-b border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
             style="background: linear-gradient(135deg, ${memberColor}dd, ${memberColor}99);"
             data-member-id="${member.id}">
          <img src="${member.avatar}" class="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white shadow-md" />
          <h3 class="font-bold text-white text-sm">${member.name}</h3>
          <p class="text-xs text-white opacity-75 mt-1">Click to filter</p>
        </div>

        <!-- Hour Markers -->
        ${this.renderHourMarkers()}

        <!-- Events for this member -->
        ${this.renderEventsForMember(member.id)}
      </div>
    `;
  }

  renderHourMarkers() {
    let html = '<div class="hour-markers absolute inset-0">';

    for (let hour = 0; hour < 24; hour++) {
      const topPosition = 80 + (hour * 60); // 80px offset for header + 60px per hour
      const displayHour = hour === 0 ? '12 AM' :
                         hour < 12 ? `${hour} AM` :
                         hour === 12 ? '12 PM' :
                         `${hour - 12} PM`;

      html += `
        <div
          class="hour-marker border-t border-gray-200"
          style="position: absolute; top: ${topPosition}px; left: 0; right: 0; height: 60px;"
        >
          <span class="absolute -top-3 left-2 bg-gray-50 px-2 text-xs font-medium text-gray-500">
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
    const topPosition = 80 + minutesSinceMidnight; // 80px header offset + 1px per minute

    return `
      <div
        id="now-line"
        class="now-line absolute left-0 right-0 z-20 pointer-events-none"
        style="top: ${topPosition}px;"
      >
        <div class="flex items-center">
          <div class="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
          <div class="flex-1 border-t-2 border-red-500"></div>
          <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium mr-2">
            ${formatTime(now.toISOString())}
          </span>
        </div>
      </div>
    `;
  }

  renderEventsForMember(memberId) {
    const events = this.getFilteredEvents();
    const currentDate = new Date(store.state.ui.currentDate);

    // Filter events for this member and current date
    const memberEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === currentDate.toDateString() &&
             event.assignedTo.includes(memberId);
    });

    let html = '<div class="events-container absolute inset-0 px-2" style="top: 80px;">';

    memberEvents.forEach(event => {
      html += this.renderEventCard(event);
    });

    html += '</div>';
    return html;
  }

  renderEventCard(event) {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const durationMinutes = (endTime - startTime) / 60000;

    const top = startMinutes; // 1px per minute
    const height = Math.max(durationMinutes, 30); // Minimum 30px height

    const isPast = endTime < new Date();
    const opacity = isPast ? 0.6 : 1;

    // Get color values
    const bgColor = this.getEventColor(event.color);
    const hoverColor = this.getEventColorHover(event.color);

    return `
      <div
        class="event-card absolute rounded-lg p-2 cursor-pointer
               shadow-md hover:shadow-lg hover:scale-102
               transition-all duration-200"
        style="top: ${top}px;
               height: ${height}px;
               left: 0;
               right: 0;
               background-color: ${bgColor};
               opacity: ${opacity};"
        data-event-id="${event.id}"
        onmouseenter="this.style.backgroundColor='${hoverColor}'"
        onmouseleave="this.style.backgroundColor='${bgColor}'"
      >
        <div class="text-white">
          <div class="font-semibold text-xs truncate">${event.title}</div>
          <div class="text-xs opacity-90">${formatTime(event.startTime)}</div>
          ${height > 50 ? `
            <div class="flex gap-1 mt-1 text-xs">
              ${event.location ? '📍' : ''}
              ${event.transportation?.driver ? '🚗' : ''}
              ${event.checklist?.length > 0 ? '✓' : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  getEventColor(colorName) {
    const colors = {
      'dad': '#3B82F6',
      'mom': '#EC4899',
      'kid1': '#10B981',
      'kid2': '#F59E0B',
      'family': '#8B5CF6'
    };
    return colors[colorName] || '#6B7280';
  }

  getEventColorHover(colorName) {
    const colors = {
      'dad': '#2563EB',
      'mom': '#DB2777',
      'kid1': '#059669',
      'kid2': '#D97706',
      'family': '#7C3AED'
    };
    return colors[colorName] || '#4B5563';
  }

  getMemberColor(colorName) {
    const colors = {
      'dad': '#3B82F6',
      'mom': '#EC4899',
      'kid1': '#10B981',
      'kid2': '#F59E0B',
      'family': '#8B5CF6'
    };
    return colors[colorName] || '#6B7280';
  }

  attachEvents() {
    // Click event cards
    document.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const eventId = card.dataset.eventId;
        store.dispatch('SELECT_EVENT', eventId);
        store.dispatch('SET_RIGHT_PANE_VIEW', 'up-next');
        this.emit('event-selected', { eventId });
      });
    });

    // Click swimlane headers to filter
    document.querySelectorAll('.swimlane-header').forEach(header => {
      header.addEventListener('click', () => {
        const memberId = header.dataset.memberId;
        store.dispatch('SET_VISIBLE_MEMBERS', [memberId]);
      });
    });

    // Click hidden member avatars to add them
    document.querySelectorAll('.add-member-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const memberId = btn.dataset.memberId;
        const currentVisible = store.state.ui.visibleMembers;
        store.dispatch('SET_VISIBLE_MEMBERS', [...currentVisible, memberId]);
      });
    });

    // Show all members button
    const showAllBtn = document.getElementById('show-all-members-btn');
    if (showAllBtn) {
      showAllBtn.addEventListener('click', () => {
        store.dispatch('SET_VISIBLE_MEMBERS', []);
      });
    }

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

    nowLine.style.top = `${80 + minutesSinceMidnight}px`;
    nowLine.querySelector('span').textContent = formatTime(now.toISOString());
  }

  scrollToNow() {
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

    this.scrollToTime(80 + minutesSinceMidnight);
  }

  scrollToTime(pixels) {
    const container = this.container;
    if (!container) return;

    container.scrollTo({
      top: pixels - 200, // Offset to center view
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
