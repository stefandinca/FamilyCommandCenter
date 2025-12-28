import { useState } from 'react';
import { useStore } from '../store/useStore';
import { addMeal, updateMeal, deleteMeal } from '../services/firestoreService';

const MEAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
const CUISINES = ['American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'Other'];

export default function MealsView() {
  const { meals } = useStore();
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [editingMealId, setEditingMealId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredMeals = filterCategory === 'all'
    ? meals
    : meals.filter(meal => meal.category === filterCategory);

  const favoriteMeals = meals.filter(meal => meal.isFavorite);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-4xl">🍽️</span>
              <span>Meal Menu</span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Plan and organize family meals</p>
          </div>
          <button
            onClick={() => setIsAddingMeal(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>New Meal</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              filterCategory === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
            }`}
          >
            All Meals
          </button>
          {MEAL_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                filterCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Favorites Section */}
        {favoriteMeals.length > 0 && filterCategory === 'all' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              ⭐ Favorite Meals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <h2 className="text-lg font-semibold text-gray-700 mb-4 capitalize">
              {filterCategory}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="text-8xl mb-4">🍽️</div>
            <p className="text-xl font-medium">No meals found</p>
            <p className="text-sm mt-2">Add your favorite meals to get started</p>
          </div>
        )}
      </div>

      {/* Meal Editor Modal */}
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
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-all border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{getCategoryIcon(meal.category)}</span>
            <h3 className="font-bold text-lg text-gray-800">{meal.name}</h3>
          </div>
          {meal.cuisine && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {meal.cuisine}
            </span>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 ${meal.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:scale-110 transition-transform`}
            title={meal.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {meal.isFavorite ? '⭐' : '☆'}
          </button>
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

      {meal.description && (
        <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
      )}

      {meal.ingredients && meal.ingredients.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Ingredients:</p>
          <div className="flex flex-wrap gap-1">
            {meal.ingredients.slice(0, 5).map((ingredient, index) => (
              <span
                key={index}
                className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full"
              >
                {ingredient}
              </span>
            ))}
            {meal.ingredients.length > 5 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{meal.ingredients.length - 5} more
              </span>
            )}
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">
            {mealId ? 'Edit Meal' : 'New Meal'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., Spaghetti Bolognese"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="Brief description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg capitalize"
              >
                {MEAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
              <select
                name="cuisine"
                value={formData.cuisine}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select...</option>
                {CUISINES.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
            <div className="space-y-2 mb-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm">{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
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
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                placeholder="Add ingredient..."
                className="flex-1 p-3 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

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
              className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              {mealId ? 'Save Changes' : 'Create Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
