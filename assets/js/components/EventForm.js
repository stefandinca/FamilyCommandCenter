import { createEvent, updateEvent, detectConflicts, validateEvent } from '../modules/events.js';
import store from '../state/store.js';
import { modal } from './Modal.js';

export default class EventForm {
  constructor(mode = 'create', eventId = null) {
    this.mode = mode; // 'create' or 'edit'
    this.eventId = eventId;
    this.event = eventId ? store.state.events.find(e => e.id === eventId) : null;
  }

  render() {
    const event = this.event || {};

    return `
      <div class="event-form">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">
          ${this.mode === 'create' ? 'Create Event' : 'Edit Event'}
        </h2>

        <form id="event-form" class="space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="event-title"
              name="title"
              value="${event.title || ''}"
              placeholder="Soccer practice, dentist appointment, etc."
              class="input"
              required
              autofocus
            />
          </div>

          <!-- Date and Time -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                id="event-date"
                name="date"
                value="${event.startTime ? this.extractDate(event.startTime) : this.getTodayDate()}"
                class="input"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select id="event-category" name="category" class="input">
                <option value="general" ${event.category === 'general' ? 'selected' : ''}>General</option>
                <option value="sports" ${event.category === 'sports' ? 'selected' : ''}>Sports</option>
                <option value="education" ${event.category === 'education' ? 'selected' : ''}>Education</option>
                <option value="medical" ${event.category === 'medical' ? 'selected' : ''}>Medical</option>
                <option value="meal" ${event.category === 'meal' ? 'selected' : ''}>Meal</option>
                <option value="social" ${event.category === 'social' ? 'selected' : ''}>Social</option>
                <option value="work" ${event.category === 'work' ? 'selected' : ''}>Work</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id="event-start-time"
                name="startTime"
                value="${event.startTime ? this.extractTime(event.startTime) : ''}"
                class="input"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                id="event-end-time"
                name="endTime"
                value="${event.endTime ? this.extractTime(event.endTime) : ''}"
                class="input"
                required
              />
            </div>
          </div>

          <!-- Assigned Members -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Assign To *
            </label>
            <div class="grid grid-cols-2 gap-3">
              ${this.renderMemberCheckboxes(event.assignedTo || [])}
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="event-location"
              name="location"
              value="${event.location?.name || ''}"
              placeholder="Address or place name"
              class="input"
            />
          </div>

          <!-- Transportation -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Transportation
            </label>
            <select id="event-driver" name="driver" class="input">
              <option value="">No driver needed</option>
              ${this.renderDriverOptions(event.transportation?.driver)}
            </select>
          </div>

          <!-- Meal Selection (only for meal category) -->
          <div id="meal-selection-container" style="${event.category === 'meal' ? '' : 'display: none;'}">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Meal from Menu
            </label>
            <select id="event-meal" name="meal" class="input">
              <option value="">No meal selected</option>
              ${this.renderMealOptions(event.meal)}
            </select>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="event-notes"
              name="notes"
              rows="3"
              placeholder="Additional details..."
              class="input"
            >${event.notes || ''}</textarea>
          </div>

          <!-- Checklist -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Checklist
            </label>
            <div id="checklist-items" class="space-y-2 mb-2">
              ${this.renderChecklistItems(event.checklist || [])}
            </div>
            <button
              type="button"
              id="add-checklist-item"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add checklist item
            </button>
          </div>

          <!-- Conflict Warnings -->
          <div id="conflict-warnings"></div>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              id="cancel-btn"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary flex-1"
            >
              ${this.mode === 'create' ? 'Create Event' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderMemberCheckboxes(assignedTo) {
    return store.state.members.map(member => `
      <label class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer
                    transition-all hover:bg-gray-50
                    ${assignedTo.includes(member.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
        <input
          type="checkbox"
          name="assignedTo"
          value="${member.id}"
          ${assignedTo.includes(member.id) ? 'checked' : ''}
          class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <img src="${member.avatar}" class="w-8 h-8 rounded-full" />
        <span class="font-medium">${member.name}</span>
      </label>
    `).join('');
  }

  renderDriverOptions(selectedDriver) {
    return store.state.members
      .filter(m => m.role === 'parent')
      .map(member => `
        <option value="${member.id}" ${selectedDriver === member.id ? 'selected' : ''}>
          ${member.name} drives
        </option>
      `).join('');
  }

  renderMealOptions(selectedMealId) {
    const meals = store.state.meals || [];
    return meals.map(meal => `
      <option value="${meal.id}" ${selectedMealId === meal.id ? 'selected' : ''}>
        ${meal.name}
      </option>
    `).join('');
  }

  renderChecklistItems(checklist) {
    if (checklist.length === 0) {
      return '<p class="text-sm text-gray-500 italic">No checklist items yet</p>';
    }

    return checklist.map((item, index) => `
      <div class="flex items-center gap-2">
        <input
          type="text"
          value="${item.text}"
          data-checklist-index="${index}"
          placeholder="Checklist item"
          class="input flex-1"
        />
        <button
          type="button"
          class="remove-checklist-item text-red-500 hover:text-red-700"
          data-checklist-index="${index}"
        >
          ✕
        </button>
      </div>
    `).join('');
  }

  attachEvents() {
    const form = document.getElementById('event-form');

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(e);
    });

    // Cancel button
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      modal.close();
    });

    // Add checklist item
    document.getElementById('add-checklist-item')?.addEventListener('click', () => {
      this.addChecklistItem();
    });

    // Remove checklist items
    document.querySelectorAll('.remove-checklist-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.dataset.checklistIndex;
        this.removeChecklistItem(index);
      });
    });

    // Real-time conflict detection
    ['event-date', 'event-start-time', 'event-end-time'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.checkConflicts();
      });
    });

    document.querySelectorAll('input[name="assignedTo"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.checkConflicts();
      });
    });

    // Show/hide meal selection based on category
    document.getElementById('event-category')?.addEventListener('change', (e) => {
      const mealContainer = document.getElementById('meal-selection-container');
      if (mealContainer) {
        mealContainer.style.display = e.target.value === 'meal' ? 'block' : 'none';
      }
    });
  }

  handleSubmit(e) {
    const formData = new FormData(e.target);

    // Parse form data
    const eventData = {
      title: formData.get('title'),
      startTime: this.combineDateTime(formData.get('date'), formData.get('startTime')),
      endTime: this.combineDateTime(formData.get('date'), formData.get('endTime')),
      assignedTo: Array.from(formData.getAll('assignedTo')),
      category: formData.get('category'),
      meal: formData.get('meal') || null,
      location: formData.get('location') ? { name: formData.get('location') } : null,
      transportation: {
        type: formData.get('driver') ? 'parent' : null,
        driver: formData.get('driver') || null
      },
      notes: formData.get('notes'),
      checklist: this.getChecklistData()
    };

    // Validate
    const validation = validateEvent(eventData);
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }

    // Check conflicts
    const conflicts = detectConflicts(eventData);
    if (conflicts.length > 0) {
      const proceed = confirm(
        `This event conflicts with ${conflicts.length} other event(s). Do you want to save anyway?`
      );
      if (!proceed) return;
    }

    try {
      if (this.mode === 'create') {
        createEvent(eventData);
        this.showNotification('Event created successfully!', 'success');
      } else {
        updateEvent(this.eventId, eventData);
        this.showNotification('Event updated successfully!', 'success');
      }

      modal.close();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`Error: ${error.message}`);
    }
  }

  checkConflicts() {
    const form = document.getElementById('event-form');
    const formData = new FormData(form);

    const eventData = {
      id: this.eventId, // Include ID when editing to exclude self
      startTime: this.combineDateTime(formData.get('date'), formData.get('startTime')),
      endTime: this.combineDateTime(formData.get('date'), formData.get('endTime')),
      assignedTo: Array.from(formData.getAll('assignedTo'))
    };

    if (!eventData.startTime || !eventData.endTime || eventData.assignedTo.length === 0) {
      return; // Not enough data yet
    }

    const conflicts = detectConflicts(eventData);
    const warningsDiv = document.getElementById('conflict-warnings');

    if (conflicts.length > 0) {
      warningsDiv.innerHTML = `
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div class="flex">
            <div class="flex-shrink-0">⚠️</div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Scheduling Conflicts</h3>
              <ul class="mt-2 text-sm text-yellow-700 list-disc list-inside">
                ${conflicts.map(c => `
                  <li>${c.type === 'overlap' ? 'Overlaps with' : 'Tight transition to'} "${c.event.title}"</li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    } else {
      warningsDiv.innerHTML = '';
    }
  }

  addChecklistItem() {
    const container = document.getElementById('checklist-items');
    const newIndex = container.children.length;

    const itemHtml = `
      <div class="flex items-center gap-2">
        <input
          type="text"
          data-checklist-index="${newIndex}"
          placeholder="Checklist item"
          class="input flex-1"
        />
        <button
          type="button"
          class="remove-checklist-item text-red-500 hover:text-red-700"
          data-checklist-index="${newIndex}"
        >
          ✕
        </button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', itemHtml);

    // Re-attach events
    const removeBtn = container.querySelector(`[data-checklist-index="${newIndex}"].remove-checklist-item`);
    removeBtn.addEventListener('click', (e) => {
      this.removeChecklistItem(e.target.dataset.checklistIndex);
    });
  }

  removeChecklistItem(index) {
    const container = document.getElementById('checklist-items');
    const items = Array.from(container.children);
    if (items[index]) {
      items[index].remove();
    }
  }

  getChecklistData() {
    const inputs = document.querySelectorAll('#checklist-items input[type="text"]');
    return Array.from(inputs)
      .map(input => input.value.trim())
      .filter(text => text !== '')
      .map(text => ({
        id: this.generateId(),
        text,
        completed: false
      }));
  }

  combineDateTime(date, time) {
    if (!date || !time) return null;
    return new Date(`${date}T${time}`).toISOString();
  }

  extractDate(isoString) {
    return new Date(isoString).toISOString().split('T')[0];
  }

  extractTime(isoString) {
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  generateId() {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
