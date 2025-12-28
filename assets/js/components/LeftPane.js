import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { isToday } from '../modules/utils.js';
import { modal } from './Modal.js';
import EventForm from './EventForm.js';
import { showProfileModal } from './ProfileModal.js';

export default class LeftPane extends BaseComponent {
  constructor() {
    super('left-pane');

    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();

    // Subscribe to store changes
    store.subscribe('left-pane', (state, action) => {
      if (action === 'UPDATE_MEMBER' || action === 'UPDATE_FILTER' ||
          action === 'ADD_EVENT' || action === 'UPDATE_EVENT' || action === 'DELETE_EVENT') {
        this.update();
      }
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

        <!-- Family Member Avatars -->
        <div class="flex-1 flex flex-col items-center justify-center gap-4 py-8">
          ${this.renderMemberAvatars()}
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

  renderMemberAvatars() {
    const members = store.state.members;

    return members.map(member => `
      <div class="relative group">
        <button
          class="member-avatar-btn relative"
          data-member="${member.id}"
          title="${member.name}"
        >
          <img
            src="${member.avatar}"
            class="w-20 h-20 rounded-full border-4 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-110 shadow-md"
          />
          <div class="absolute inset-0 rounded-full bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
        </button>
        <button
          class="edit-profile-btn absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full
                 bg-gray-700 hover:bg-gray-800 text-white opacity-0 group-hover:opacity-100
                 transition-all duration-200 shadow-lg"
          data-member="${member.id}"
          title="Edit ${member.name}'s profile"
        >
          ✏️
        </button>
      </div>
    `).join('');
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

    // Member avatar clicks - no longer toggle filters, just for reference
    document.querySelectorAll('.member-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Avatars are now display-only, filtering happens in middle pane
      });
    });

    // Edit profile buttons
    document.querySelectorAll('.edit-profile-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const memberId = btn.dataset.member;
        showProfileModal(memberId);
      });
    });

    // Add event button
    document.getElementById('add-event-btn')?.addEventListener('click', () => {
      const form = new EventForm('create');
      modal.open(form.render());
      form.attachEvents();
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
}
