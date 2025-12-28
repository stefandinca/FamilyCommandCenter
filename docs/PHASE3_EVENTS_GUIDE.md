# Phase 3: Event System & CRUD Operations - Implementation Guide

## Overview
Implement the complete event management system including creation, editing, deletion, and the event modal form. This is the core functionality of FamilySync.

**Duration:** Week 3-4
**Prerequisites:** Phase 1 & 2 complete

---

## Architecture Overview

This phase builds:
1. **Event Module** (`modules/events.js`) - Business logic for CRUD operations
2. **Modal Component** (`components/Modal.js`) - Reusable modal container
3. **EventForm Component** (`components/EventForm.js`) - Event creation/editing form
4. **Validation** - Form validation and conflict detection

---

## Step 1: Create Event Module

### 1.1 Create assets/js/modules/events.js

This module handles all event operations and business logic.

```javascript
import store from '../state/store.js';
import { generateUUID } from './utils.js';

/**
 * Event Management Module
 * Handles CRUD operations for events
 */

/**
 * Create a new event
 * @param {Object} eventData - Event properties
 * @returns {Object} Created event
 */
export function createEvent(eventData) {
  // Validate required fields
  const validation = validateEvent(eventData);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const event = {
    id: generateUUID(),
    title: eventData.title,
    startTime: eventData.startTime,
    endTime: eventData.endTime,
    assignedTo: eventData.assignedTo || [],
    color: eventData.color || inferEventColor(eventData.assignedTo),
    location: eventData.location || null,
    transportation: eventData.transportation || {
      type: null,
      driver: null,
      pickup: null,
      dropoff: null
    },
    recurring: eventData.recurring || {
      enabled: false,
      pattern: null,
      daysOfWeek: [],
      endDate: null,
      exceptions: []
    },
    checklist: eventData.checklist || [],
    notes: eventData.notes || '',
    category: eventData.category || 'general',
    status: eventData.status || 'confirmed',
    createdBy: eventData.createdBy || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Add to store
  store.dispatch('ADD_EVENT', event);

  console.log('[Events] Created:', event.title);
  return event;
}

/**
 * Update an existing event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Properties to update
 * @returns {Object} Updated event
 */
export function updateEvent(eventId, updates) {
  const event = store.state.events.find(e => e.id === eventId);

  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  const updatedEvent = {
    ...event,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Re-validate
  const validation = validateEvent(updatedEvent);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  store.dispatch('UPDATE_EVENT', updatedEvent);

  console.log('[Events] Updated:', updatedEvent.title);
  return updatedEvent;
}

/**
 * Delete an event (soft delete)
 * @param {string} eventId - Event ID
 */
export function deleteEvent(eventId) {
  const event = store.state.events.find(e => e.id === eventId);

  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  // Mark as deleted (soft delete for undo functionality)
  const deletedEvent = {
    ...event,
    deletedAt: new Date().toISOString()
  };

  store.dispatch('UPDATE_EVENT', deletedEvent);

  // Actually remove from active events after 30 seconds (undo window)
  setTimeout(() => {
    const current = store.state.events.find(e => e.id === eventId);
    if (current && current.deletedAt) {
      store.dispatch('DELETE_EVENT', eventId);
      console.log('[Events] Permanently deleted:', event.title);
    }
  }, 30000);

  console.log('[Events] Soft deleted (30s undo window):', event.title);
  return deletedEvent;
}

/**
 * Duplicate an event
 * @param {string} eventId - Event to duplicate
 * @param {Object} overrides - Properties to override
 * @returns {Object} New event
 */
export function duplicateEvent(eventId, overrides = {}) {
  const original = store.state.events.find(e => e.id === eventId);

  if (!original) {
    throw new Error(`Event not found: ${eventId}`);
  }

  const duplicated = {
    ...original,
    id: generateUUID(),
    title: `${original.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };

  delete duplicated.deletedAt;

  store.dispatch('ADD_EVENT', duplicated);

  console.log('[Events] Duplicated:', duplicated.title);
  return duplicated;
}

/**
 * Get events for a specific date
 * @param {Date} date - Target date
 * @returns {Array} Events on that date
 */
export function getEventsForDate(date) {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);

  return store.state.events.filter(event => {
    if (event.deletedAt) return false;

    const eventStart = new Date(event.startTime).getTime();
    return eventStart >= startOfDay && eventStart <= endOfDay;
  });
}

/**
 * Get events for a specific member
 * @param {string} memberId - Family member ID
 * @returns {Array} Events assigned to that member
 */
export function getEventsForMember(memberId) {
  return store.state.events.filter(event =>
    !event.deletedAt && event.assignedTo.includes(memberId)
  );
}

/**
 * Get upcoming events
 * @param {number} count - Number of events to return
 * @returns {Array} Next N events
 */
export function getUpcomingEvents(count = 5) {
  const now = new Date().getTime();

  return store.state.events
    .filter(event => !event.deletedAt && new Date(event.startTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, count);
}

/**
 * Validate event data
 * @param {Object} event - Event to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateEvent(event) {
  const errors = [];

  // Required fields
  if (!event.title || event.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!event.startTime) {
    errors.push('Start time is required');
  }

  if (!event.endTime) {
    errors.push('End time is required');
  }

  // Logical validations
  if (event.startTime && event.endTime) {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (start >= end) {
      errors.push('End time must be after start time');
    }

    // Warn if event is very long (>12 hours)
    const durationHours = (end - start) / (1000 * 60 * 60);
    if (durationHours > 12) {
      errors.push('Event duration exceeds 12 hours - is this correct?');
    }
  }

  if (!event.assignedTo || event.assignedTo.length === 0) {
    errors.push('At least one family member must be assigned');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check for scheduling conflicts
 * @param {Object} newEvent - Event to check
 * @returns {Array} Conflicting events
 */
export function detectConflicts(newEvent) {
  const conflicts = [];
  const newStart = new Date(newEvent.startTime);
  const newEnd = new Date(newEvent.endTime);

  // Get events for affected members
  const relevantEvents = store.state.events.filter(event =>
    !event.deletedAt &&
    event.id !== newEvent.id && // Exclude self when editing
    event.assignedTo.some(memberId => newEvent.assignedTo.includes(memberId))
  );

  relevantEvents.forEach(existingEvent => {
    const existingStart = new Date(existingEvent.startTime);
    const existingEnd = new Date(existingEvent.endTime);

    // Check for time overlap
    if (newStart < existingEnd && newEnd > existingStart) {
      conflicts.push({
        type: 'overlap',
        event: existingEvent,
        affectedMembers: newEvent.assignedTo.filter(id =>
          existingEvent.assignedTo.includes(id)
        )
      });
    }

    // Check for tight transitions (less than 15 mins between events)
    const gapMinutes = Math.abs(existingEnd - newStart) / (1000 * 60);
    if (gapMinutes > 0 && gapMinutes < 15) {
      conflicts.push({
        type: 'tight_transition',
        event: existingEvent,
        gapMinutes: Math.floor(gapMinutes),
        affectedMembers: newEvent.assignedTo.filter(id =>
          existingEvent.assignedTo.includes(id)
        )
      });
    }
  });

  return conflicts;
}

/**
 * Infer event color from assigned members
 * @param {Array} assignedTo - Member IDs
 * @returns {string} Color name
 */
function inferEventColor(assignedTo) {
  if (!assignedTo || assignedTo.length === 0) return 'gray';
  if (assignedTo.length > 1) return 'family'; // Multiple members = family event

  const member = store.state.members.find(m => m.id === assignedTo[0]);
  return member ? member.color : 'gray';
}
```

---

## Step 2: Create Modal Component

### 2.1 Create assets/js/components/Modal.js

A reusable modal container for forms and dialogs.

```javascript
import BaseComponent from './BaseComponent.js';

export default class Modal extends BaseComponent {
  constructor() {
    super('modal-root');
    this.isOpen = false;
    this.content = '';
    this.onClose = null;
  }

  open(content, options = {}) {
    this.content = content;
    this.onClose = options.onClose || null;
    this.isOpen = true;

    this.mount();

    // Add body overflow hidden
    document.body.style.overflow = 'hidden';

    // Focus trap
    this.setupFocusTrap();
  }

  close() {
    this.isOpen = false;
    this.unmount();

    // Restore body overflow
    document.body.style.overflow = '';

    // Call onClose callback
    if (this.onClose) {
      this.onClose();
    }

    this.emit('modal-closed');
  }

  render() {
    if (!this.isOpen) return '';

    return `
      <div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center
                  bg-black/50 backdrop-blur-sm animate-fade-in"
           id="modal-overlay">
        <div class="modal-content bg-white rounded-2xl shadow-2xl
                    max-w-2xl w-full max-h-[90vh] overflow-y-auto
                    mx-4 animate-slide-up"
             id="modal-content">
          <!-- Close button -->
          <button
            id="modal-close-btn"
            class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center
                   rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <span class="text-2xl text-gray-600">×</span>
          </button>

          <!-- Content -->
          <div class="p-8">
            ${this.content}
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Close on overlay click
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        this.close();
      }
    });

    // Close button
    document.getElementById('modal-close-btn')?.addEventListener('click', () => {
      this.close();
    });

    // Close on Escape key
    this.handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEscape);
  }

  setupFocusTrap() {
    const modalContent = document.getElementById('modal-content');
    if (!modalContent) return;

    const focusableElements = modalContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  unmount() {
    // Remove escape handler
    if (this.handleEscape) {
      document.removeEventListener('keydown', this.handleEscape);
    }

    super.unmount();
  }
}

// Export singleton instance
export const modal = new Modal();
```

---

## Step 3: Create Event Form Component

### 3.1 Create assets/js/components/EventForm.js

```javascript
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
                <option value="sports" ${event.category === 'sports' ? 'selected' : ''}>⚽ Sports</option>
                <option value="education" ${event.category === 'education' ? 'selected' : ''}>📚 Education</option>
                <option value="medical" ${event.category === 'medical' ? 'selected' : ''}>🏥 Medical</option>
                <option value="meal" ${event.category === 'meal' ? 'selected' : ''}>🍽️ Meal</option>
                <option value="social" ${event.category === 'social' ? 'selected' : ''}>🎉 Social</option>
                <option value="work" ${event.category === 'work' ? 'selected' : ''}>💼 Work</option>
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
```

---

## Step 4: Wire Up Event Modal

### 4.1 Update LeftPane to open modal

In `assets/js/components/LeftPane.js`, update the add event button handler:

```javascript
import { modal } from './Modal.js';
import EventForm from './EventForm.js';

// In attachEvents method:
document.getElementById('add-event-btn')?.addEventListener('click', () => {
  const form = new EventForm('create');
  modal.open(form.render());
  form.attachEvents();
});
```

### 4.2 Update RightPane to open edit modal

In `assets/js/components/RightPane.js`, add global functions:

```javascript
import { modal } from './Modal.js';
import EventForm from './EventForm.js';
import { deleteEvent as deleteEventModule } from '../modules/events.js';

// Add to window for inline onclick handlers
window.editEvent = function(eventId) {
  const form = new EventForm('edit', eventId);
  modal.open(form.render());
  form.attachEvents();
};

window.duplicateEvent = function(eventId) {
  import('../modules/events.js').then(({ duplicateEvent }) => {
    duplicateEvent(eventId);
    modal.close();
  });
};

window.deleteEvent = function(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    deleteEventModule(eventId);
    store.dispatch('SELECT_EVENT', null);
  }
};
```

---

## Step 5: Test Event CRUD

### 5.1 Test Create Event

1. Click "Add Event" button in left pane
2. Modal should appear with empty form
3. Fill in:
   - Title: "Test Event"
   - Date: Today
   - Start time: 10:00 AM
   - End time: 11:00 AM
   - Assign to: Any member
4. Click "Create Event"
5. Modal closes
6. Event appears on timeline at 10:00 AM
7. Check localStorage - event should be persisted

### 5.2 Test Edit Event

1. Click existing event on timeline
2. Right pane shows event details
3. Click "Edit" button
4. Modal opens with pre-filled form
5. Change title to "Updated Test Event"
6. Click "Save Changes"
7. Event updates on timeline
8. Check localStorage - changes persisted

### 5.3 Test Delete Event

1. Click event on timeline
2. Click "Delete Event" in right pane
3. Confirm deletion
4. Event disappears from timeline
5. Within 30 seconds, undo is possible via store

### 5.4 Test Conflict Detection

1. Create event: 2:00 PM - 3:00 PM
2. Create another event: 2:30 PM - 3:30 PM for same person
3. Yellow warning should appear: "Scheduling Conflicts"
4. Can still save if desired

---

## Checklist for Phase 3 Completion

- [ ] events.js module created with CRUD functions
- [ ] Modal.js component created and functional
- [ ] EventForm.js renders correctly
- [ ] Can create new events via modal
- [ ] Can edit existing events
- [ ] Can delete events (with confirmation)
- [ ] Can duplicate events
- [ ] Form validation works (required fields, time logic)
- [ ] Conflict detection shows warnings
- [ ] Checklist items can be added/removed
- [ ] Member assignment checkboxes work
- [ ] Driver assignment dropdown works
- [ ] Events persist to localStorage
- [ ] Modal closes on Escape key
- [ ] Modal closes on overlay click
- [ ] Toast notifications appear on success
- [ ] No console errors

---

## Troubleshooting

### Modal not opening
- Check if modal.js is imported correctly
- Verify modal-root div exists in index.html
- Check console for errors

### Form submission not working
- Check form validation logic
- Verify event.js functions are imported
- Check store dispatch is working

### Events not persisting
- Verify store.persist() is called
- Check localStorage in DevTools
- Verify no quota exceeded errors

### Conflicts not detecting
- Check date/time parsing
- Verify member assignment logic
- Test with simple overlapping times

---

**Phase 3 Estimated Time:** 8-10 hours
**Difficulty:** Intermediate-Advanced

**Next:** Proceed to Phase 4 - Lists Module or Phase 5 - PWA Setup
