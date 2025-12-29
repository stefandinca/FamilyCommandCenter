import { useState } from 'react';
import { useStore } from '../store/useStore';
import { addNote, updateNote, deleteNote } from '../services/firestoreService';

const NOTE_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
  { name: 'green', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  { name: 'blue', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  { name: 'pink', bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
  { name: 'purple', bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
];

export default function NotesView() {
  const { notes } = useStore();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm p-4 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
              <span className="text-2xl md:text-4xl">📝</span>
              <span>Notes</span>
            </h1>
            <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-lg">Keep track of family notes and lists</p>
          </div>
          <button
            onClick={() => setIsAddingNote(true)}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span className="text-xl">+</span>
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4 flex items-center gap-2">
              📌 Pinned Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {pinnedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => setEditingNoteId(note.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Notes */}
        {unpinnedNotes.length > 0 && (
          <div>
            <h2 className="text-base md:text-lg font-semibold text-gray-700 mb-3 md:mb-4">
              All Notes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {unpinnedNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => setEditingNoteId(note.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-8xl mb-4">📝</div>
            <p className="text-xl font-medium">No notes yet</p>
            <p className="text-sm mt-2">Click "New Note" to get started</p>
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {(isAddingNote || editingNoteId) && (
        <NoteEditor
          noteId={editingNoteId}
          onClose={() => {
            setIsAddingNote(false);
            setEditingNoteId(null);
          }}
        />
      )}
    </div>
  );
}

function NoteCard({ note, onEdit }) {
  const colorConfig = NOTE_COLORS.find(c => c.name === note.color) || NOTE_COLORS[0];
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleItem = async (itemId) => {
    const updatedItems = note.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    try {
      await updateNote(note.id, { items: updatedItems });
    } catch (error) {
      console.error(error);
    }
  };

  const handleTogglePin = async () => {
    try {
      await updateNote(note.id, { pinned: !note.pinned });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this note?')) {
      try {
        await deleteNote(note.id);
      } catch (error) {
        console.error(error);
        alert("Error deleting note: " + error.message);
      }
    }
  };

  return (
    <div className={`${colorConfig.bg} border-2 ${colorConfig.border} rounded-xl p-5 shadow-md hover:shadow-xl transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className={`font-bold text-lg ${colorConfig.text} flex-1`}>{note.title}</h3>
        <div className="flex gap-1 ml-2">
          <button
            onClick={handleTogglePin}
            className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-white/50 rounded transition-colors"
            title={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned ? '📌' : '📍'}
          </button>
          <button
            onClick={onEdit}
            className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-white/50 rounded transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-600 hover:text-red-600 p-1.5 hover:bg-white/50 rounded transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Content */}
      {note.content && (
        <p className={`text-sm ${colorConfig.text} mb-3 whitespace-pre-wrap opacity-90`}>
          {note.content}
        </p>
      )}

      {/* Checklist Items */}
      {note.items && note.items.length > 0 && (
        <div className="space-y-2">
          {note.items.slice(0, isExpanded ? undefined : 5).map(item => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleItem(item.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className={`text-sm ${item.completed ? 'line-through opacity-60' : colorConfig.text}`}>
                {item.text}
              </span>
            </label>
          ))}
          {note.items.length > 5 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-xs ${colorConfig.text} font-medium hover:underline`}
            >
              {isExpanded ? 'Show less' : `Show ${note.items.length - 5} more items`}
            </button>
          )}
        </div>
      )}

      {/* Type Badge */}
      {note.type && (
        <div className="mt-4 pt-3 border-t border-current opacity-30">
          <span className={`text-xs font-semibold ${colorConfig.text} uppercase tracking-wide`}>
            {note.type}
          </span>
        </div>
      )}
    </div>
  );
}

function NoteEditor({ noteId, onClose }) {
  const { notes } = useStore();
  const existingNote = noteId ? notes.find(n => n.id === noteId) : null;

  const [formData, setFormData] = useState({
    title: existingNote?.title || '',
    content: existingNote?.content || '',
    type: existingNote?.type || 'general',
    color: existingNote?.color || 'yellow',
    pinned: existingNote?.pinned || false,
    items: existingNote?.items || []
  });

  const [newItemText, setNewItemText] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { id: Date.now().toString(), text: newItemText, completed: false }]
      }));
      setNewItemText('');
    }
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (noteId) {
        await updateNote(noteId, formData);
      } else {
        await addNote(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving note: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">
            {noteId ? 'Edit Note' : 'New Note'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Note title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Note content..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="general">General</option>
                <option value="shopping">Shopping</option>
                <option value="todo">To-Do</option>
                <option value="idea">Idea</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg capitalize"
              >
                {NOTE_COLORS.map(color => (
                  <option key={color.name} value={color.name}>{color.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="pinned"
                checked={formData.pinned}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Pin this note</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Items</label>
            <div className="space-y-2 mb-3">
              {formData.items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                placeholder="Add item..."
                className="flex-1 p-3 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              {noteId ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
