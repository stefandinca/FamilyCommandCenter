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

      case 'ADD_NOTE':
        this.state.notes = [...this.state.notes, payload];
        break;

      case 'UPDATE_NOTE':
        this.state.notes = this.state.notes.map(note =>
          note.id === payload.id ? payload : note
        );
        break;

      case 'DELETE_NOTE':
        this.state.notes = this.state.notes.filter(note =>
          note.id !== payload
        );
        break;

      case 'SET_RIGHT_PANE_VIEW':
        this.state.ui.rightPaneView = payload;
        break;

      case 'ADD_MEAL':
        this.state.meals = [...this.state.meals, payload];
        break;

      case 'UPDATE_MEAL':
        this.state.meals = this.state.meals.map(meal =>
          meal.id === payload.id ? payload : meal
        );
        break;

      case 'DELETE_MEAL':
        this.state.meals = this.state.meals.filter(meal =>
          meal.id !== payload
        );
        break;

      case 'UPDATE_MEMBER':
        this.state.members = this.state.members.map(member =>
          member.id === payload.id ? payload : member
        );
        break;

      case 'SET_VISIBLE_MEMBERS':
        this.state.ui.visibleMembers = payload;
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
      notes: [],
      meals: [],
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
        rightPaneView: 'up-next', // 'up-next', 'event-detail', 'notes', or 'menu'
        visibleMembers: [] // Empty array means show all members
      }
    };
  }
}

// Create singleton instance
const store = new Store(new Store().getInitialState());

export default store;
