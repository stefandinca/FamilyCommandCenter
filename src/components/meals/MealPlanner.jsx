import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { addMeal, updateMeal, deleteMeal } from '../../services/firestoreService';

const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
const CUISINES = ['American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'Other'];

export default function MealPlanner() {
  const { meals } = useStore();
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredMeals = filterCategory === 'all'
    ? meals
    : meals.filter(meal => meal.category === filterCategory);

  const favoriteMeals = meals.filter(meal => meal.isFavorite);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">Meal Menu</h2>
          <button
            onClick={() => setIsAddingMeal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
          >
            + New Meal
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {MEAL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                filterCategory === category
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Meals List */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Favorites Section */}
        {favoriteMeals.length > 0 && filterCategory === 'all' && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              ⭐ Favorites
            </h3>
            <div className="space-y-3">
              {favoriteMeals.map(meal => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onEdit={() => setEditingMealId(meal.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Meals */}
        <div>
          {filterCategory !== 'all' && (
            <h3 className="text-sm font-semibold text-gray-600 mb-3 capitalize">
              {filterCategory}
            </h3>
          )}
          <div className="space-y-3">
            {filteredMeals.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                onEdit={() => setEditingMealId(meal.id)}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredMeals.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-lg">No meals found</p>
            <p className="text-sm">Add your favorite meals to get started</p>
          </div>
        )}
      </div>

      {/* Add/Edit Meal Modal */}
      {(isAddingMeal || editingMealId) && (
        <MealEditor
          mealId={editingMealId}
          onClose={() => {
            setIsAddingMeal(false);
            setEditingMealId(null);
          }}
        />
      )}
    </div>
  );
}

function MealCard({ meal, onEdit }) {
  const handleToggleFavorite = async () => {
    try {
      await updateMeal(meal.id, { isFavorite: !meal.isFavorite });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${meal.name}"?`)) {
      try {
        await deleteMeal(meal.id);
      } catch (error) {
        console.error(error);
        alert("Error deleting meal: " + error.message);
      }
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍝',
      snack: '🍪',
      dessert: '🍰'
    };
    return icons[category] || '🍽️';
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getCategoryIcon(meal.category)}</span>
            <h4 className="font-semibold text-gray-800">{meal.name}</h4>
          </div>
          {meal.cuisine && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {meal.cuisine}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleToggleFavorite}
            className={`p-1 ${meal.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:scale-110 transition-transform`}
            title={meal.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {meal.isFavorite ? '⭐' : '☆'}
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

      {/* Description */}
      {meal.description && (
        <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
      )}

      {/* Ingredients */}
      {meal.ingredients && meal.ingredients.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Ingredients:</p>
          <div className="flex flex-wrap gap-1">
            {meal.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MealEditor({ mealId, onClose }) {
  const { meals } = useStore();
  const existingMeal = mealId ? meals.find(m => m.id === mealId) : null;

  const [formData, setFormData] = useState({
    name: existingMeal?.name || '',
    description: existingMeal?.description || '',
    category: existingMeal?.category || 'dinner',
    cuisine: existingMeal?.cuisine || '',
    ingredients: existingMeal?.ingredients || [],
    isFavorite: existingMeal?.isFavorite || false
  });

  const [newIngredient, setNewIngredient] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mealId) {
        await updateMeal(mealId, formData);
      } else {
        await addMeal(formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving meal: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            {mealId ? 'Edit Meal' : 'New Meal'}
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Spaghetti Bolognese"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
              placeholder="Brief description of the meal..."
            />
          </div>

          {/* Category & Cuisine */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              >
                {MEAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
              <select
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select...</option>
                {CUISINES.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
            <div className="space-y-2 mb-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm">{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
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
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                placeholder="Add ingredient..."
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Favorite */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFavorite"
                checked={formData.isFavorite}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Mark as favorite ⭐</span>
            </label>
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
              className="flex-1 py-2 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {mealId ? 'Save Changes' : 'Create Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
