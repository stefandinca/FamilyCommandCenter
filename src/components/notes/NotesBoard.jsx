import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { addNote, updateNote, deleteNote } from '../../services/firestoreService';

const NOTE_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  { name: 'green', bg: 'bg-green-100', border: 'border-green-300' },
  { name: 'blue', bg: 'bg-blue-100', border: 'border-blue-300' },
  { name: 'pink', bg: 'bg-pink-100', border: 'border-pink-300' },
  { name: 'purple', bg: 'bg-purple-100', border: 'border-purple-300' },
];

export default function NotesBoard() {
  const { notes } = useStore();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const pinnedNotes = notes.filter(note => note.pinned);
  const unpinnedNotes = notes.filter(note => !note.pinned);

  const handleAddNote = async (noteData) => {
    try {
      await addNote(noteData);
      setIsAddingNote(false);
    } catch (error) {
      console.error(error);
      alert("Error adding note: " + error.message);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Notes</h2>
          <button
            onClick={() => setIsAddingNote(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + New Note
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              📌 Pinned
            </h3>
            <div className="grid grid-cols-1 gap-3">
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
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              All Notes
            </h3>
            <div className="grid grid-cols-1 gap-3">
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
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg">No notes yet</p>
            <p className="text-sm">Click "New Note" to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {(isAddingNote || editingNoteId) && (
        <NoteEditor
          noteId={editingNoteId}
          onClose={() => {
            setIsAddingNote(false);
            setEditingNoteId(null);
          }}
          onSave={handleAddNote}
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
    <div className={`${colorConfig.bg} border-2 ${colorConfig.border} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-800 flex-1">{note.title}</h4>
        <div className="flex gap-1">
          <button
            onClick={handleTogglePin}
            className="text-gray-500 hover:text-gray-700 p-1"
            title={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned ? '📌' : '📍'}
          </button>
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 p-1"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Content */}
      {note.content && (
        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{note.content}</p>
      )}

      {/* Checklist Items */}
      {note.items && note.items.length > 0 && (
        <div className="space-y-2">
          {note.items.slice(0, isExpanded ? undefined : 3).map(item => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleItem(item.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {item.text}
              </span>
            </label>
          ))}
          {note.items.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {isExpanded ? 'Show less' : `Show ${note.items.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {/* Type badge */}
      {note.type && (
        <div className="mt-3 pt-2 border-t border-gray-300">
          <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
            {note.type}
          </span>
        </div>
      )}
    </div>
  );
}

function NoteEditor({ noteId, onClose, onSave }) {
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
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving note: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            {noteId ? 'Edit Note' : 'New Note'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Note title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Note content..."
            />
          </div>

          {/* Type & Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
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
                className="w-full p-2 border border-gray-300 rounded"
              >
                {NOTE_COLORS.map(color => (
                  <option key={color.name} value={color.name}>{color.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pinned */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="pinned"
                checked={formData.pinned}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Pin this note</span>
            </label>
          </div>

          {/* Checklist Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Items</label>
            <div className="space-y-2 mb-2">
              {formData.items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
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
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {noteId ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
