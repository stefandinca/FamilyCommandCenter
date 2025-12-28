import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { formatTime, formatFullDateTime, getTimeUntil } from '../modules/utils.js';
import { modal } from './Modal.js';
import EventForm from './EventForm.js';
import { deleteEvent as deleteEventModule, duplicateEvent } from '../modules/events.js';
import NotesView from './NotesView.js';
import MenuView from './MenuView.js';

export default class RightPane extends BaseComponent {
  constructor() {
    super('right-pane');

    this.notesView = new NotesView();
    this.menuView = new MenuView();

    // Subscribe to store changes
    store.subscribe('right-pane', (state, action) => {
      if (action === 'SELECT_EVENT' || action === 'ADD_EVENT' || action === 'UPDATE_EVENT' ||
          action === 'SET_RIGHT_PANE_VIEW' || action === 'ADD_NOTE' ||
          action === 'UPDATE_NOTE' || action === 'DELETE_NOTE' ||
          action === 'ADD_MEAL' || action === 'UPDATE_MEAL' || action === 'DELETE_MEAL') {
        this.update();
      }
    });

    // Listen for event selection
    this.on('event-selected', () => this.update());
  }

  render() {
    const selectedEventId = store.state.ui.selectedEventId;
    const view = store.state.ui.rightPaneView;

    return `
      <div class="flex flex-col h-full">
        ${this.renderViewTabs()}
        ${view === 'notes' ? this.renderNotes() :
          view === 'menu' ? this.renderMenu() : `
          ${this.renderWhosHome()}
          <div class="flex-1 overflow-y-auto p-6">
            ${selectedEventId ? this.renderEventDetails(selectedEventId) : this.renderUpNext()}
          </div>
        `}
      </div>
    `;
  }

  renderViewTabs() {
    const view = store.state.ui.rightPaneView;
    const selectedEventId = store.state.ui.selectedEventId;
    const currentView = selectedEventId ? 'event-detail' : view;

    return `
      <div class="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          class="view-tab flex-1 py-3 px-3 font-medium text-xs transition-colors ${
            currentView === 'up-next' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }"
          data-view="up-next"
        >
          📅 Up Next
        </button>
        <button
          class="view-tab flex-1 py-3 px-3 font-medium text-xs transition-colors ${
            currentView === 'notes' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600 hover:text-gray-900'
          }"
          data-view="notes"
        >
          📝 Notes
        </button>
        <button
          class="view-tab flex-1 py-3 px-3 font-medium text-xs transition-colors ${
            currentView === 'menu' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-gray-900'
          }"
          data-view="menu"
        >
          🍽️ Menu
        </button>
      </div>
    `;
  }

  renderNotes() {
    return this.notesView.render();
  }

  renderMenu() {
    return this.menuView.render();
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
                     hover:shadow-md transition-shadow cursor-pointer border-l-4"
              style="border-left-color: ${this.getEventColor(event.color)};"
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
        <div class="text-white -mx-6 -mt-6 p-6 mb-6 rounded-b-3xl"
             style="background-color: ${this.getEventColor(event.color)};">
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

        <!-- Meal Info -->
        ${event.meal ? `
          <div class="mb-6">
            <h3 class="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              🍽️ Meal
            </h3>
            ${this.renderMealInfo(event.meal)}
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
          <button class="btn-secondary" id="edit-event-btn">
            Edit
          </button>
          <button class="btn-secondary" id="duplicate-event-btn">
            Duplicate
          </button>
          <button class="btn-danger col-span-2" id="delete-event-btn">
            Delete Event
          </button>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // View tabs
    document.querySelectorAll('.view-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const view = tab.dataset.view;
        store.dispatch('SET_RIGHT_PANE_VIEW', view);
        store.dispatch('SELECT_EVENT', null); // Clear event selection when switching views
      });
    });

    // Attach notes view events if notes view is active
    if (store.state.ui.rightPaneView === 'notes') {
      this.notesView.attachEvents();
    }

    // Attach menu view events if menu view is active
    if (store.state.ui.rightPaneView === 'menu') {
      this.menuView.attachEvents();
    }

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

    // Edit event button
    document.getElementById('edit-event-btn')?.addEventListener('click', () => {
      const eventId = store.state.ui.selectedEventId;
      if (eventId) {
        const form = new EventForm('edit', eventId);
        modal.open(form.render());
        form.attachEvents();
      }
    });

    // Duplicate event button
    document.getElementById('duplicate-event-btn')?.addEventListener('click', () => {
      const eventId = store.state.ui.selectedEventId;
      if (eventId) {
        try {
          duplicateEvent(eventId);
          store.dispatch('SELECT_EVENT', null);
          this.showNotification('Event duplicated successfully!', 'success');
        } catch (error) {
          console.error('Error duplicating event:', error);
          alert(`Error: ${error.message}`);
        }
      }
    });

    // Delete event button
    document.getElementById('delete-event-btn')?.addEventListener('click', () => {
      const eventId = store.state.ui.selectedEventId;
      if (eventId) {
        if (confirm('Are you sure you want to delete this event?')) {
          try {
            deleteEventModule(eventId);
            store.dispatch('SELECT_EVENT', null);
            this.showNotification('Event deleted (30s to undo)', 'success');
          } catch (error) {
            console.error('Error deleting event:', error);
            alert(`Error: ${error.message}`);
          }
        }
      }
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

  renderMealInfo(mealId) {
    const meal = store.state.meals.find(m => m.id === mealId);
    if (!meal) return '<p class="text-gray-500 italic">Meal not found</p>';

    const totalTime = (meal.prepTime || 0) + (meal.cookTime || 0);

    return `
      <div class="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
        <h4 class="font-semibold text-gray-900 mb-2">${meal.name}</h4>
        ${meal.description ? `<p class="text-sm text-gray-700 mb-2">${meal.description}</p>` : ''}
        <div class="flex gap-3 text-xs text-gray-600 mb-3">
          ${totalTime > 0 ? `<span>⏱️ ${totalTime} min</span>` : ''}
          ${meal.servings ? `<span>👥 ${meal.servings} servings</span>` : ''}
        </div>
        ${meal.ingredients && meal.ingredients.length > 0 ? `
          <div class="text-sm">
            <p class="font-medium text-gray-700 mb-1">Ingredients:</p>
            <ul class="list-disc list-inside text-gray-600 space-y-1">
              ${meal.ingredients.slice(0, 5).map(ing => `<li class="text-xs">${ing}</li>`).join('')}
              ${meal.ingredients.length > 5 ? `<li class="text-xs text-gray-400">+${meal.ingredients.length - 5} more...</li>` : ''}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
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

  showNotification(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const bgColor = type === 'success' ? 'bg-green-500' :
                    type === 'error' ? 'bg-red-500' :
                    'bg-blue-500';

    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-2 animate-slide-up`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
