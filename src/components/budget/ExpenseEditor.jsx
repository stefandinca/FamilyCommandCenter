import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { addExpense, updateExpense } from '../../services/firestoreService';

const PAYMENT_METHODS = [
  { id: 'credit', label: 'Credit Card', icon: '💳' },
  { id: 'debit', label: 'Debit Card', icon: '💵' },
  { id: 'cash', label: 'Cash', icon: '💰' }
];

export default function ExpenseEditor({ budgetId, expenseId, onClose }) {
  const { budgets, expenses } = useStore();
  const budget = budgetId ? budgets.find(b => b.id === budgetId) : null;
  const existingExpense = expenseId ? expenses.find(e => e.id === expenseId) : null;

  // Initialize form data
  const [formData, setFormData] = useState({
    budgetId: existingExpense?.budgetId || budgetId || '',
    categoryId: existingExpense?.categoryId || (budget?.categories?.[0]?.id || ''),
    amount: existingExpense?.amount || '',
    description: existingExpense?.description || '',
    date: existingExpense?.date || new Date().toISOString().split('T')[0],
    paymentMethod: existingExpense?.paymentMethod || 'credit',
    tags: existingExpense?.tags || []
  });

  const [newTag, setNewTag] = useState('');

  // Handle basic form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        updatedAt: new Date().toISOString()
      };

      if (expenseId) {
        await updateExpense(expenseId, expenseData);
      } else {
        expenseData.createdAt = new Date().toISOString();
        await addExpense(expenseData);
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert('Error saving expense: ' + error.message);
    }
  };

  // Get category for current budget
  const categories = budget?.categories || [];
  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Amount - Prominent */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
              RON
            </span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full pl-20 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Weekly groceries at Walmart"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              <>
                <option value="">Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name} - {category.limit.toFixed(2)} RON limit
                  </option>
                ))}
              </>
            )}
          </select>
          {selectedCategory && (
            <p className="mt-2 text-sm text-gray-600">
              Budget: {selectedCategory.limit.toFixed(2)} RON
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.paymentMethod === method.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{method.icon}</div>
                <div className="text-sm font-medium text-gray-700">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>

          {/* Existing Tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-500 hover:text-red-600 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Tags help organize and filter expenses (e.g., "groceries", "weekly", "organic")
          </p>
        </div>
      </div>

      {/* Form Footer - Fixed */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          {expenseId ? 'Save Changes' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
