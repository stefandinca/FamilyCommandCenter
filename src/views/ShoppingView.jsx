import { useState } from 'react';
import { useStore } from '../store/useStore';
import { addNote, updateNote, deleteNote } from '../services/firestoreService';

const STORE_CATEGORIES = [
  { name: 'Grocery', icon: '🛒', color: 'green' },
  { name: 'Pharmacy', icon: '💊', color: 'red' },
  { name: 'Hardware', icon: '🔨', color: 'orange' },
  { name: 'Other', icon: '📦', color: 'gray' }
];

export default function ShoppingView() {
  const { notes } = useStore();
  const [isAddingList, setIsAddingList] = useState(false);
  const [editingListId, setEditingListId] = useState(null);

  // Filter for shopping type notes
  const shoppingLists = notes.filter(note => note.type === 'shopping');

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🛒 Shopping Lists</h1>
            <p className="text-gray-600 mt-1">Manage your shopping and errands</p>
          </div>
          <button
            onClick={() => setIsAddingList(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            + New List
          </button>
        </div>
      </div>

      {/* Shopping Lists Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {shoppingLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shoppingLists.map(list => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onEdit={() => setEditingListId(list.id)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-8xl mb-4">🛒</div>
            <p className="text-xl font-medium">No shopping lists yet</p>
            <p className="text-sm mt-2">Click "New List" to create your first shopping list</p>
          </div>
        )}
      </div>

      {/* Shopping List Editor Modal */}
      {(isAddingList || editingListId) && (
        <ShoppingListEditor
          listId={editingListId}
          onClose={() => {
            setIsAddingList(false);
            setEditingListId(null);
          }}
        />
      )}
    </div>
  );
}

function ShoppingListCard({ list, onEdit }) {
  const handleToggleItem = async (itemId) => {
    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    try {
      await updateNote(list.id, { items: updatedItems });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${list.title}"?`)) {
      try {
        await deleteNote(list.id);
      } catch (error) {
        console.error(error);
        alert("Error deleting shopping list: " + error.message);
      }
    }
  };

  const completedCount = list.items?.filter(item => item.completed).length || 0;
  const totalCount = list.items?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Determine category icon and color
  const category = STORE_CATEGORIES.find(c => c.name.toLowerCase() === list.category?.toLowerCase()) || STORE_CATEGORIES[0];

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-3xl">{category.icon}</span>
          <h3 className="font-bold text-lg text-gray-800">{list.title}</h3>
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-gray-700 p-1.5"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 p-1.5"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{completedCount} of {totalCount} items</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-${category.color}-600 h-2 rounded-full transition-all`}
              style={{ width: `${progress}%`, backgroundColor: category.color === 'green' ? '#16a34a' : category.color === 'red' ? '#dc2626' : category.color === 'orange' ? '#ea580c' : '#6b7280' }}
            />
          </div>
        </div>
      )}

      {/* Shopping Items */}
      {list.items && list.items.length > 0 && (
        <div className="space-y-2">
          {list.items.slice(0, 5).map(item => (
            <label key={item.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggleItem(item.id)}
                className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className={`text-sm ${item.completed ? 'line-through opacity-60' : 'text-gray-800'}`}>
                {item.text}
              </span>
            </label>
          ))}
          {list.items.length > 5 && (
            <p className="text-xs text-gray-500 font-medium pl-6">
              +{list.items.length - 5} more items
            </p>
          )}
        </div>
      )}

      {/* Empty list message */}
      {(!list.items || list.items.length === 0) && (
        <p className="text-sm text-gray-400 italic">No items added yet</p>
      )}
    </div>
  );
}

function ShoppingListEditor({ listId, onClose }) {
  const { notes } = useStore();
  const existingList = listId ? notes.find(n => n.id === listId) : null;

  const [formData, setFormData] = useState({
    title: existingList?.title || '',
    category: existingList?.category || 'Grocery',
    type: 'shopping',
    color: 'green',
    pinned: existingList?.pinned || false,
    items: existingList?.items || []
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
        items: [...prev.items, { id: Date.now().toString(), text: newItemText.trim(), completed: false }]
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
      if (listId) {
        await updateNote(listId, formData);
      } else {
        await addNote(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving shopping list: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">
            {listId ? 'Edit Shopping List' : 'New Shopping List'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">List Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Weekly Groceries, Pharmacy Run"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              {STORE_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="pinned"
                checked={formData.pinned}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Pin this list</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shopping Items</label>
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
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              {listId ? 'Save Changes' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
