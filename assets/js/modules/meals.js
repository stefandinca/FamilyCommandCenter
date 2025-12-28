import store from '../state/store.js';
import { generateUUID } from './utils.js';

/**
 * Meals/Menu Management Module
 * Handles family meal planning and recipes
 */

/**
 * Create a new meal
 * @param {Object} mealData - Meal properties
 * @returns {Object} Created meal
 */
export function createMeal(mealData) {
  const validation = validateMeal(mealData);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  const meal = {
    id: generateUUID(),
    name: mealData.name,
    description: mealData.description || '',
    category: mealData.category || 'dinner', // breakfast, lunch, dinner, snack, dessert
    cuisine: mealData.cuisine || '',
    prepTime: mealData.prepTime || 0, // minutes
    cookTime: mealData.cookTime || 0, // minutes
    servings: mealData.servings || 4,
    difficulty: mealData.difficulty || 'medium', // easy, medium, hard
    ingredients: mealData.ingredients || [],
    instructions: mealData.instructions || '',
    notes: mealData.notes || '',
    tags: mealData.tags || [], // vegetarian, gluten-free, etc.
    isFavorite: mealData.isFavorite || false,
    image: mealData.image || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.dispatch('ADD_MEAL', meal);

  console.log('[Meals] Created:', meal.name);
  return meal;
}

/**
 * Update an existing meal
 * @param {string} mealId - Meal ID
 * @param {Object} updates - Properties to update
 * @returns {Object} Updated meal
 */
export function updateMeal(mealId, updates) {
  const meal = store.state.meals.find(m => m.id === mealId);

  if (!meal) {
    throw new Error(`Meal not found: ${mealId}`);
  }

  const updatedMeal = {
    ...meal,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const validation = validateMeal(updatedMeal);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }

  store.dispatch('UPDATE_MEAL', updatedMeal);

  console.log('[Meals] Updated:', updatedMeal.name);
  return updatedMeal;
}

/**
 * Delete a meal
 * @param {string} mealId - Meal ID
 */
export function deleteMeal(mealId) {
  const meal = store.state.meals.find(m => m.id === mealId);

  if (!meal) {
    throw new Error(`Meal not found: ${mealId}`);
  }

  store.dispatch('DELETE_MEAL', mealId);

  console.log('[Meals] Deleted:', meal.name);
}

/**
 * Toggle favorite status
 * @param {string} mealId - Meal ID
 */
export function toggleFavorite(mealId) {
  const meal = store.state.meals.find(m => m.id === mealId);

  if (!meal) {
    throw new Error(`Meal not found: ${mealId}`);
  }

  updateMeal(mealId, { isFavorite: !meal.isFavorite });
}

/**
 * Get meals by category
 * @param {string} category - Meal category
 * @returns {Array} Filtered meals
 */
export function getMealsByCategory(category) {
  return store.state.meals.filter(meal => meal.category === category);
}

/**
 * Get favorite meals
 * @returns {Array} Favorite meals
 */
export function getFavoriteMeals() {
  return store.state.meals.filter(meal => meal.isFavorite);
}

/**
 * Search meals by name or tags
 * @param {string} query - Search query
 * @returns {Array} Matching meals
 */
export function searchMeals(query) {
  const lowerQuery = query.toLowerCase();
  return store.state.meals.filter(meal =>
    meal.name.toLowerCase().includes(lowerQuery) ||
    meal.description.toLowerCase().includes(lowerQuery) ||
    meal.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get total time for a meal
 * @param {Object} meal - Meal object
 * @returns {number} Total time in minutes
 */
export function getTotalTime(meal) {
  return (meal.prepTime || 0) + (meal.cookTime || 0);
}

/**
 * Validate meal data
 * @param {Object} meal - Meal to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateMeal(meal) {
  const errors = [];

  if (!meal.name || meal.name.trim() === '') {
    errors.push('Meal name is required');
  }

  if (meal.name && meal.name.length > 100) {
    errors.push('Meal name must be less than 100 characters');
  }

  if (meal.prepTime && meal.prepTime < 0) {
    errors.push('Prep time cannot be negative');
  }

  if (meal.cookTime && meal.cookTime < 0) {
    errors.push('Cook time cannot be negative');
  }

  if (meal.servings && meal.servings < 1) {
    errors.push('Servings must be at least 1');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
