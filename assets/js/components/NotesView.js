import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { createNote, updateNote, deleteNote, toggleNoteItem, addNoteItem, removeNoteItem, togglePin } from '../modules/notes.js';
import { modal } from './Modal.js';

export default class NotesView extends BaseComponent {
  constructor() {
    super('notes-view');
    this.selectedNoteId = null;
  }

  render() {
    const notes = store.state.notes || [];
    const pinnedNotes = notes.filter(n => n.pinned);
    const unpinnedNotes = notes.filter(n => !n.pinned);

    return `
      <div class="notes-view h-full flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold">Family Notes</h2>
            <button id="add-note-btn" class="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
              + New Note
            </button>
          </div>
          <p class="text-purple-100 text-sm">Shared lists, contacts, and important info</p>
        </div>

        <!-- Notes List -->
        <div class="flex-1 overflow-y-auto p-6">
          ${notes.length === 0 ? `
            <div class="text-center py-12">
              <div class="text-6xl mb-4">📝</div>
              <p class="text-gray-500 mb-2">No notes yet</p>
              <p class="text-sm text-gray-400">Create your first note to get started</p>
            </div>
          ` : ''}

          ${pinnedNotes.length > 0 ? `
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pinned</h3>
              <div class="space-y-3">
                ${pinnedNotes.map(note => this.renderNoteCard(note)).join('')}
              </div>
            </div>
          ` : ''}

          ${unpinnedNotes.length > 0 ? `
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">All Notes</h3>
              <div class="space-y-3">
                ${unpinnedNotes.map(note => this.renderNoteCard(note)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderNoteCard(note) {
    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      pink: 'bg-pink-50 border-pink-200',
      purple: 'bg-purple-50 border-purple-200'
    };

    const typeIcons = {
      general: '📝',
      shopping: '🛒',
      contact: '👤',
      medical: '🏥'
    };

    const completedCount = note.items.filter(item => item.completed).length;
    const totalCount = note.items.length;

    return `
      <div class="note-card border-2 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${colorClasses[note.color] || colorClasses.blue}"
           data-note-id="${note.id}">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2 flex-1">
            <span class="text-xl">${typeIcons[note.type] || typeIcons.general}</span>
            <h3 class="font-semibold text-gray-900 truncate">${note.title}</h3>
          </div>
          <div class="flex gap-2">
            <button class="pin-note-btn text-gray-400 hover:text-yellow-500 transition-colors"
                    data-note-id="${note.id}"
                    title="${note.pinned ? 'Unpin' : 'Pin'}">
              ${note.pinned ? '📌' : '📍'}
            </button>
            <button class="delete-note-btn text-gray-400 hover:text-red-500 transition-colors"
                    data-note-id="${note.id}"
                    title="Delete">
              🗑️
            </button>
          </div>
        </div>

        ${note.content ? `
          <p class="text-sm text-gray-700 mb-3 whitespace-pre-wrap">${note.content}</p>
        ` : ''}

        ${note.items.length > 0 ? `
          <div class="space-y-2 mb-3">
            ${note.items.slice(0, 3).map(item => `
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox"
                       class="note-item-checkbox w-4 h-4 rounded"
                       data-note-id="${note.id}"
                       data-item-id="${item.id}"
                       ${item.completed ? 'checked' : ''} />
                <span class="${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}">${item.text}</span>
              </label>
            `).join('')}
            ${note.items.length > 3 ? `
              <p class="text-xs text-gray-500 ml-6">+${note.items.length - 3} more items</p>
            ` : ''}
          </div>
          ${totalCount > 0 ? `
            <div class="text-xs text-gray-500">
              ${completedCount}/${totalCount} completed
            </div>
          ` : ''}
        ` : ''}

        <div class="text-xs text-gray-400 mt-2">
          ${new Date(note.updatedAt).toLocaleDateString()}
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Add note button
    document.getElementById('add-note-btn')?.addEventListener('click', () => {
      this.showNoteModal();
    });

    // Click note cards to edit
    document.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on checkbox or buttons
        if (e.target.type === 'checkbox' || e.target.closest('button')) {
          return;
        }
        const noteId = card.dataset.noteId;
        this.showNoteModal(noteId);
      });
    });

    // Delete note buttons
    document.querySelectorAll('.delete-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const noteId = btn.dataset.noteId;
        if (confirm('Delete this note?')) {
          deleteNote(noteId);
          this.update();
        }
      });
    });

    // Pin note buttons
    document.querySelectorAll('.pin-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const noteId = btn.dataset.noteId;
        togglePin(noteId);
        this.update();
      });
    });

    // Checkbox toggles
    document.querySelectorAll('.note-item-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        const noteId = checkbox.dataset.noteId;
        const itemId = checkbox.dataset.itemId;
        toggleNoteItem(noteId, itemId);
        this.update();
      });
    });
  }

  showNoteModal(noteId = null) {
    const note = noteId ? store.state.notes.find(n => n.id === noteId) : null;
    const mode = noteId ? 'edit' : 'create';

    const modalContent = `
      <div class="note-modal">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">
          ${mode === 'create' ? 'New Note' : 'Edit Note'}
        </h2>

        <form id="note-form" class="space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="note-title"
              name="title"
              value="${note?.title || ''}"
              placeholder="Shopping list, important contacts, etc."
              class="input"
              required
              autofocus
            />
          </div>

          <!-- Type and Color -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select id="note-type" name="type" class="input">
                <option value="general" ${note?.type === 'general' ? 'selected' : ''}>📝 General</option>
                <option value="shopping" ${note?.type === 'shopping' ? 'selected' : ''}>🛒 Shopping</option>
                <option value="contact" ${note?.type === 'contact' ? 'selected' : ''}>👤 Contact</option>
                <option value="medical" ${note?.type === 'medical' ? 'selected' : ''}>🏥 Medical</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <select id="note-color" name="color" class="input">
                <option value="blue" ${note?.color === 'blue' ? 'selected' : ''}>Blue</option>
                <option value="green" ${note?.color === 'green' ? 'selected' : ''}>Green</option>
                <option value="yellow" ${note?.color === 'yellow' ? 'selected' : ''}>Yellow</option>
                <option value="pink" ${note?.color === 'pink' ? 'selected' : ''}>Pink</option>
                <option value="purple" ${note?.color === 'purple' ? 'selected' : ''}>Purple</option>
              </select>
            </div>
          </div>

          <!-- Content -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Note Content
            </label>
            <textarea
              id="note-content"
              name="content"
              rows="4"
              placeholder="Additional details..."
              class="input"
            >${note?.content || ''}</textarea>
          </div>

          <!-- List Items -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Checklist Items
            </label>
            <div id="note-items" class="space-y-2 mb-2">
              ${this.renderNoteItems(note?.items || [])}
            </div>
            <button
              type="button"
              id="add-note-item"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add item
            </button>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              id="cancel-note-btn"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary flex-1"
            >
              ${mode === 'create' ? 'Create Note' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    `;

    modal.open(modalContent);
    this.attachModalEvents(mode, noteId);
  }

  renderNoteItems(items) {
    if (items.length === 0) {
      return '<p class="text-sm text-gray-500 italic">No items yet</p>';
    }

    return items.map((item, index) => `
      <div class="flex items-center gap-2">
        <input
          type="text"
          value="${item.text}"
          data-item-index="${index}"
          placeholder="List item"
          class="input flex-1"
        />
        <button
          type="button"
          class="remove-note-item text-red-500 hover:text-red-700"
          data-item-index="${index}"
        >
          ✕
        </button>
      </div>
    `).join('');
  }

  attachModalEvents(mode, noteId) {
    const form = document.getElementById('note-form');

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNoteSubmit(e, mode, noteId);
    });

    // Cancel button
    document.getElementById('cancel-note-btn')?.addEventListener('click', () => {
      modal.close();
    });

    // Add item button
    document.getElementById('add-note-item')?.addEventListener('click', () => {
      this.addItemToForm();
    });

    // Remove item buttons
    document.querySelectorAll('.remove-note-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.dataset.itemIndex;
        this.removeItemFromForm(index);
      });
    });
  }

  handleNoteSubmit(e, mode, noteId) {
    const formData = new FormData(e.target);

    const noteData = {
      title: formData.get('title'),
      type: formData.get('type'),
      color: formData.get('color'),
      content: formData.get('content'),
      items: this.getFormItems()
    };

    try {
      if (mode === 'create') {
        createNote(noteData);
        this.showNotification('Note created!', 'success');
      } else {
        updateNote(noteId, noteData);
        this.showNotification('Note updated!', 'success');
      }

      modal.close();
      this.update();
    } catch (error) {
      console.error('Error saving note:', error);
      alert(`Error: ${error.message}`);
    }
  }

  getFormItems() {
    const inputs = document.querySelectorAll('#note-items input[type="text"]');
    return Array.from(inputs)
      .map(input => input.value.trim())
      .filter(text => text !== '')
      .map(text => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        completed: false
      }));
  }

  addItemToForm() {
    const container = document.getElementById('note-items');
    const newIndex = container.children.length;

    const itemHtml = `
      <div class="flex items-center gap-2">
        <input
          type="text"
          data-item-index="${newIndex}"
          placeholder="List item"
          class="input flex-1"
        />
        <button
          type="button"
          class="remove-note-item text-red-500 hover:text-red-700"
          data-item-index="${newIndex}"
        >
          ✕
        </button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', itemHtml);

    // Re-attach event
    const removeBtn = container.querySelector(`[data-item-index="${newIndex}"].remove-note-item`);
    removeBtn.addEventListener('click', (e) => {
      this.removeItemFromForm(e.target.dataset.itemIndex);
    });
  }

  removeItemFromForm(index) {
    const container = document.getElementById('note-items');
    const items = Array.from(container.children);
    if (items[index]) {
      items[index].remove();
    }
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
