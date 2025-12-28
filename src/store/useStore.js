import { create } from 'zustand';

const getInitialState = () => ({
  events: [],
  members: [], // This will eventually be fetched from Firebase Auth and Firestore users collection
  notes: [],
  meals: [],
  lists: [], // Not present in original initialState, but good to keep if lists are a feature
  templates: [], // Not present in original initialState
  activeView: 'home', // 'home', 'calendar', 'notes', 'meals', 'shopping', 'users'
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
    rightPaneView: 'up-next', // 'up-next', 'event-detail', 'notes', 'menu'
    visibleMembers: [] // Empty array means show all members
  }
});

export const useStore = create((set) => ({
  ...getInitialState(),

  // Actions will be ported from the original store's dispatch method
  init: (payload) => set((state) => ({ ...state, ...payload })),
  
  setEvents: (events) => set({ events }),
  setMembers: (members) => set({ members }),
  setNotes: (notes) => set({ notes }),
  setMeals: (meals) => set({ meals }),

  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (updatedEvent) => set((state) => ({
    events: state.events.map((event) =>
      event.id === updatedEvent.id ? updatedEvent : event
    ),
  })),
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter((event) => event.id !== eventId),
  })),
  addEventsBatch: (newEvents) => set((state) => ({ events: [...state.events, ...newEvents] })),

  updateFilter: (selectedMembers) => set((state) => ({
    filters: { ...state.filters, selectedMembers: selectedMembers },
  })),
  setCurrentDate: (date) => set((state) => ({
    ui: { ...state.ui, currentDate: date },
  })),
  selectEvent: (eventId) => set((state) => ({
    ui: { ...state.ui, selectedEventId: eventId },
  })),

  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (updatedNote) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    ),
  })),
  deleteNote: (noteId) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== noteId),
  })),

  setRightPaneView: (view) => set((state) => ({
    ui: { ...state.ui, rightPaneView: view },
  })),

  addMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
  updateMeal: (updatedMeal) => set((state) => ({
    meals: state.meals.map((meal) =>
      meal.id === updatedMeal.id ? updatedMeal : meal
    ),
  })),
  deleteMeal: (mealId) => set((state) => ({
    meals: state.meals.filter((meal) => meal.id !== mealId),
  })),

  updateMember: (updatedMember) => set((state) => ({
    members: state.members.map((member) =>
      member.id === updatedMember.id ? updatedMember : member
    ),
  })),
  setVisibleMembers: (visibleMembers) => set((state) => ({
    ui: { ...state.ui, visibleMembers: visibleMembers },
  })),
  setActiveView: (view) => set((state) => ({
    activeView: view,
  })),
}));
