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
