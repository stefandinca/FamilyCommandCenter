import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { addBudget, updateBudget } from '../../services/firestoreService';

// Predefined categories with icons and colors
const PREDEFINED_CATEGORIES = [
  { name: 'Groceries', color: '#10B981', icon: '🛒' },
  { name: 'Entertainment', color: '#8B5CF6', icon: '🎬' },
  { name: 'Transportation', color: '#3B82F6', icon: '🚗' },
  { name: 'Healthcare', color: '#EF4444', icon: '🏥' },
  { name: 'Utilities', color: '#F59E0B', icon: '💡' },
  { name: 'Dining Out', color: '#EC4899', icon: '🍽️' },
  { name: 'Shopping', color: '#06B6D4', icon: '🛍️' },
  { name: 'Education', color: '#6366F1', icon: '📚' },
  { name: 'Other', color: '#6B7280', icon: '📦' }
];

export default function BudgetEditor({ budgetId, onClose }) {
  const { budgets } = useStore();
  const existingBudget = budgetId ? budgets.find(b => b.id === budgetId) : null;

  // Initialize form data
  const [formData, setFormData] = useState({
    name: existingBudget?.name || '',
    period: existingBudget?.period || 'monthly',
    startDate: existingBudget?.startDate || new Date().toISOString().split('T')[0],
    endDate: existingBudget?.endDate || '',
    categories: existingBudget?.categories || [],
    isActive: existingBudget?.isActive !== undefined ? existingBudget.isActive : true
  });

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Calculate total limit from all categories
  const totalLimit = formData.categories.reduce((sum, cat) => sum + (parseFloat(cat.limit) || 0), 0);

  // Handle basic form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add predefined category
  const handleAddCategory = (predefinedCat) => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: predefinedCat.name,
      limit: 0,
      color: predefinedCat.color,
      icon: predefinedCat.icon,
      isCustom: false
    };

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
    setShowCategoryPicker(false);
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) return;

    const newCategory = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      limit: 0,
      color: '#6B7280',
      icon: '📦',
      isCustom: true
    };

    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  };

  // Update category limit
  const handleCategoryLimitChange = (categoryId, limit) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, limit: parseFloat(limit) || 0 } : cat
      )
    }));
  };

  // Remove category
  const handleRemoveCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a budget name');
      return;
    }

    if (formData.categories.length === 0) {
      alert('Please add at least one category');
      return;
    }

    try {
      const budgetData = {
        ...formData,
        totalLimit,
        updatedAt: new Date().toISOString()
      };

      if (budgetId) {
        await updateBudget(budgetId, budgetData);
      } else {
        budgetData.createdAt = new Date().toISOString();
        await addBudget(budgetData);
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert('Error saving budget: ' + error.message);
    }
  };

  // Filter out already added categories
  const availableCategories = PREDEFINED_CATEGORIES.filter(
    predefinedCat => !formData.categories.some(cat => cat.name === predefinedCat.name)
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Budget Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="e.g., January 2025 Budget"
          />
        </div>

        {/* Period and Active Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active Budget</span>
            </label>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Budget Categories *
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                + Add Category
              </button>
              <button
                type="button"
                onClick={handleAddCustomCategory}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                + Custom
              </button>
            </div>
          </div>

          {/* Category Picker */}
          {showCategoryPicker && availableCategories.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-3">SELECT A CATEGORY:</p>
              <div className="grid grid-cols-3 gap-2">
                {availableCategories.map((cat, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAddCategory(cat)}
                    className="flex items-center gap-2 p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm"
                  >
                    <span>{cat.icon}</span>
                    <span className="font-medium text-gray-700">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category List */}
          {formData.categories.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No categories yet. Add your first category above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.categories.map(category => (
                <div key={category.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{category.name}</p>
                    {category.isCustom && (
                      <span className="text-xs text-gray-500">Custom</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={category.limit}
                      onChange={(e) => handleCategoryLimitChange(category.id, e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                    <span className="text-sm font-medium text-gray-600">RON</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category.id)}
                    className="text-red-500 hover:text-red-700 font-bold text-xl p-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Total Budget */}
          {formData.categories.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Total Budget</span>
                <span className="text-2xl font-bold text-green-600">{totalLimit.toFixed(2)} RON</span>
              </div>
            </div>
          )}
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
          {budgetId ? 'Save Changes' : 'Create Budget'}
        </button>
      </div>
    </form>
  );
}
