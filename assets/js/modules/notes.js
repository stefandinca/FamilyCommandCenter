import store from '../state/store.js';
import { generateUUID } from './utils.js';

/**
 * Notes/Lists Management Module
 * Handles shopping lists, important info, contacts, etc.
 */

/**
 * Create a new note/list
 * @param {Object} noteData - Note properties
 * @returns {Object} Created note
 */
export function createNote(noteData) {
  const validation = validateNote(noteData);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const note = {
    id: generateUUID(),
    title: noteData.title,
    content: noteData.content || '',
    type: noteData.type || 'general', // general, shopping, contact, medical
    items: noteData.items || [], // For checklist-style notes
    pinned: noteData.pinned || false,
    color: noteData.color || 'blue',
    createdBy: noteData.createdBy || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.dispatch('ADD_NOTE', note);

  console.log('[Notes] Created:', note.title);
  return note;
}

/**
 * Update an existing note
 * @param {string} noteId - Note ID
 * @param {Object} updates - Properties to update
 * @returns {Object} Updated note
 */
export function updateNote(noteId, updates) {
  const note = store.state.notes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }

  const updatedNote = {
    ...note,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const validation = validateNote(updatedNote);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  store.dispatch('UPDATE_NOTE', updatedNote);

  console.log('[Notes] Updated:', updatedNote.title);
  return updatedNote;
}

/**
 * Delete a note
 * @param {string} noteId - Note ID
 */
export function deleteNote(noteId) {
  const note = store.state.notes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }

  store.dispatch('DELETE_NOTE', noteId);

  console.log('[Notes] Deleted:', note.title);
}

/**
 * Toggle a list item's completed status
 * @param {string} noteId - Note ID
 * @param {string} itemId - Item ID
 */
export function toggleNoteItem(noteId, itemId) {
  const note = store.state.notes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }

  const updatedItems = note.items.map(item =>
    item.id === itemId ? { ...item, completed: !item.completed } : item
  );

  updateNote(noteId, { items: updatedItems });
}

/**
 * Add an item to a list-type note
 * @param {string} noteId - Note ID
 * @param {string} text - Item text
 */
export function addNoteItem(noteId, text) {
  const note = store.state.notes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }

  const newItem = {
    id: generateUUID(),
    text: text.trim(),
    completed: false
  };

  const updatedItems = [...note.items, newItem];
  updateNote(noteId, { items: updatedItems });

  return newItem;
}

/**
 * Remove an item from a list-type note
 * @param {string} noteId - Note ID
 * @param {string} itemId - Item ID
 */
export function removeNoteItem(noteId, itemId) {
  const note = store.state.notes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }

  const updatedItems = note.items.filter(item => item.id !== itemId);
  updateNote(noteId, { items: updatedItems });
}

/**
 * Toggle pin status
 * @param {string} noteId - Note ID
 */
export function togglePin(noteId) {
  const note = store.state.notes.find(n => n.id === noteId);

  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }

  updateNote(noteId, { pinned: !note.pinned });
}

/**
 * Get notes by type
 * @param {string} type - Note type
 * @returns {Array} Filtered notes
 */
export function getNotesByType(type) {
  return store.state.notes.filter(note => note.type === type);
}

/**
 * Get pinned notes
 * @returns {Array} Pinned notes
 */
export function getPinnedNotes() {
  return store.state.notes.filter(note => note.pinned);
}

/**
 * Validate note data
 * @param {Object} note - Note to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateNote(note) {
  const errors = [];

  if (!note.title || note.title.trim() === '') {
    errors.push('Title is required');
  }

  if (note.title && note.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
