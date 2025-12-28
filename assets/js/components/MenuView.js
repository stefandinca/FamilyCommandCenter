import BaseComponent from './BaseComponent.js';
import store from '../state/store.js';
import { createMeal, updateMeal, deleteMeal, toggleFavorite, getTotalTime } from '../modules/meals.js';
import { modal } from './Modal.js';

export default class MenuView extends BaseComponent {
  constructor() {
    super('menu-view');
  }

  render() {
    const meals = store.state.meals || [];
    const favoriteMeals = meals.filter(m => m.isFavorite);
    const otherMeals = meals.filter(m => !m.isFavorite);

    return `
      <div class="menu-view h-full flex flex-col">
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold">Family Menu</h2>
            <button id="add-meal-btn" class="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
              + New Meal
            </button>
          </div>
          <p class="text-orange-100 text-sm">Recipes, ingredients, and meal planning</p>
        </div>

        <!-- Meals List -->
        <div class="flex-1 overflow-y-auto p-6">
          ${meals.length === 0 ? `
            <div class="text-center py-12">
              <div class="text-6xl mb-4">🍽️</div>
              <p class="text-gray-500 mb-2">No meals yet</p>
              <p class="text-sm text-gray-400">Add your family's favorite recipes</p>
            </div>
          ` : ''}

          ${favoriteMeals.length > 0 ? `
            <div class="mb-6">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                ⭐ Favorites
              </h3>
              <div class="grid grid-cols-1 gap-3">
                ${favoriteMeals.map(meal => this.renderMealCard(meal)).join('')}
              </div>
            </div>
          ` : ''}

          ${otherMeals.length > 0 ? `
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">All Meals</h3>
              <div class="grid grid-cols-1 gap-3">
                ${otherMeals.map(meal => this.renderMealCard(meal)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderMealCard(meal) {
    const categoryIcons = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍿',
      dessert: '🍰'
    };

    const difficultyColors = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700'
    };

    const totalTime = getTotalTime(meal);

    return `
      <div class="meal-card bg-white border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all"
           data-meal-id="${meal.id}">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2 flex-1">
            <span class="text-2xl">${categoryIcons[meal.category] || '🍽️'}</span>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">${meal.name}</h3>
              ${meal.cuisine ? `<p class="text-xs text-gray-500">${meal.cuisine}</p>` : ''}
            </div>
          </div>
          <div class="flex gap-2">
            <button class="favorite-meal-btn text-xl transition-transform hover:scale-125"
                    data-meal-id="${meal.id}"
                    title="${meal.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
              ${meal.isFavorite ? '⭐' : '☆'}
            </button>
            <button class="delete-meal-btn text-gray-400 hover:text-red-500 transition-colors"
                    data-meal-id="${meal.id}"
                    title="Delete">
              🗑️
            </button>
          </div>
        </div>

        ${meal.description ? `
          <p class="text-sm text-gray-600 mb-3">${meal.description}</p>
        ` : ''}

        <div class="flex items-center gap-3 text-xs text-gray-600 mb-3">
          ${totalTime > 0 ? `
            <span class="flex items-center gap-1">
              ⏱️ ${totalTime} min
            </span>
          ` : ''}
          ${meal.servings ? `
            <span class="flex items-center gap-1">
              👥 ${meal.servings} servings
            </span>
          ` : ''}
          ${meal.difficulty ? `
            <span class="px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[meal.difficulty]}">
              ${meal.difficulty}
            </span>
          ` : ''}
        </div>

        ${meal.ingredients && meal.ingredients.length > 0 ? `
          <div class="text-xs text-gray-500">
            ${meal.ingredients.length} ingredient${meal.ingredients.length !== 1 ? 's' : ''}
          </div>
        ` : ''}

        ${meal.tags && meal.tags.length > 0 ? `
          <div class="flex gap-1 mt-2 flex-wrap">
            ${meal.tags.slice(0, 3).map(tag => `
              <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">${tag}</span>
            `).join('')}
            ${meal.tags.length > 3 ? `<span class="text-xs text-gray-400">+${meal.tags.length - 3}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  attachEvents() {
    // Add meal button
    document.getElementById('add-meal-btn')?.addEventListener('click', () => {
      this.showMealModal();
    });

    // Click meal cards to view/edit
    document.querySelectorAll('.meal-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on buttons
        if (e.target.closest('button')) {
          return;
        }
        const mealId = card.dataset.mealId;
        this.showMealModal(mealId, true); // true = view mode
      });
    });

    // Delete meal buttons
    document.querySelectorAll('.delete-meal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mealId = btn.dataset.mealId;
        if (confirm('Delete this meal?')) {
          deleteMeal(mealId);
          this.update();
        }
      });
    });

    // Favorite meal buttons
    document.querySelectorAll('.favorite-meal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mealId = btn.dataset.mealId;
        toggleFavorite(mealId);
        this.update();
      });
    });
  }

  showMealModal(mealId = null, viewMode = false) {
    const meal = mealId ? store.state.meals.find(m => m.id === mealId) : null;

    // If clicking a meal card, show view mode first
    if (mealId && viewMode) {
      this.showMealViewModal(meal);
      return;
    }

    const mode = mealId ? 'edit' : 'create';

    const modalContent = `
      <div class="meal-modal">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">
          ${mode === 'create' ? 'New Meal' : 'Edit Meal'}
        </h2>

        <form id="meal-form" class="space-y-6">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Meal Name *
            </label>
            <input
              type="text"
              id="meal-name"
              name="name"
              value="${meal?.name || ''}"
              placeholder="Spaghetti Bolognese, Chicken Tacos, etc."
              class="input"
              required
              autofocus
            />
          </div>

          <!-- Category, Cuisine, Difficulty -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select id="meal-category" name="category" class="input">
                <option value="breakfast" ${meal?.category === 'breakfast' ? 'selected' : ''}>🍳 Breakfast</option>
                <option value="lunch" ${meal?.category === 'lunch' ? 'selected' : ''}>🥗 Lunch</option>
                <option value="dinner" ${meal?.category === 'dinner' ? 'selected' : ''}>🍽️ Dinner</option>
                <option value="snack" ${meal?.category === 'snack' ? 'selected' : ''}>🍿 Snack</option>
                <option value="dessert" ${meal?.category === 'dessert' ? 'selected' : ''}>🍰 Dessert</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cuisine
              </label>
              <input
                type="text"
                id="meal-cuisine"
                name="cuisine"
                value="${meal?.cuisine || ''}"
                placeholder="Italian, Mexican, etc."
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select id="meal-difficulty" name="difficulty" class="input">
                <option value="easy" ${meal?.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                <option value="medium" ${meal?.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="hard" ${meal?.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
              </select>
            </div>
          </div>

          <!-- Time and Servings -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Prep Time (min)
              </label>
              <input
                type="number"
                id="meal-prep-time"
                name="prepTime"
                value="${meal?.prepTime || 0}"
                min="0"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cook Time (min)
              </label>
              <input
                type="number"
                id="meal-cook-time"
                name="cookTime"
                value="${meal?.cookTime || 0}"
                min="0"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Servings
              </label>
              <input
                type="number"
                id="meal-servings"
                name="servings"
                value="${meal?.servings || 4}"
                min="1"
                class="input"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="meal-description"
              name="description"
              rows="2"
              placeholder="Brief description of the dish..."
              class="input"
            >${meal?.description || ''}</textarea>
          </div>

          <!-- Ingredients -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ingredients
            </label>
            <div id="meal-ingredients" class="space-y-2 mb-2">
              ${this.renderIngredients(meal?.ingredients || [])}
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                id="add-ingredient"
                class="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                + Add ingredient
              </button>
            </div>
          </div>

          <!-- Instructions -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Recipe Instructions
            </label>
            <textarea
              id="meal-instructions"
              name="instructions"
              rows="6"
              placeholder="Step-by-step cooking instructions..."
              class="input"
            >${meal?.instructions || ''}</textarea>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="meal-tags"
              name="tags"
              value="${meal?.tags ? meal.tags.join(', ') : ''}"
              placeholder="vegetarian, gluten-free, kid-friendly"
              class="input"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="meal-notes"
              name="notes"
              rows="2"
              placeholder="Storage tips, substitutions, etc..."
              class="input"
            >${meal?.notes || ''}</textarea>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              id="cancel-meal-btn"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary flex-1"
            >
              ${mode === 'create' ? 'Create Meal' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    `;

    modal.open(modalContent);
    this.attachModalEvents(mode, mealId);
  }

  renderIngredients(ingredients) {
    if (ingredients.length === 0) {
      return '<p class="text-sm text-gray-500 italic">No ingredients yet</p>';
    }

    return ingredients.map((ingredient, index) => `
      <div class="flex items-center gap-2">
        <input
          type="text"
          value="${ingredient}"
          data-ingredient-index="${index}"
          placeholder="1 cup flour, 2 eggs, etc."
          class="input flex-1"
        />
        <button
          type="button"
          class="remove-ingredient text-red-500 hover:text-red-700"
          data-ingredient-index="${index}"
        >
          ✕
        </button>
      </div>
    `).join('');
  }

  attachModalEvents(mode, mealId) {
    const form = document.getElementById('meal-form');

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleMealSubmit(e, mode, mealId);
    });

    // Cancel button
    document.getElementById('cancel-meal-btn')?.addEventListener('click', () => {
      modal.close();
    });

    // Add ingredient button
    document.getElementById('add-ingredient')?.addEventListener('click', () => {
      this.addIngredientToForm();
    });

    // Remove ingredient buttons
    document.querySelectorAll('.remove-ingredient').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.dataset.ingredientIndex;
        this.removeIngredientFromForm(index);
      });
    });
  }

  handleMealSubmit(e, mode, mealId) {
    const formData = new FormData(e.target);

    const tagsString = formData.get('tags') || '';
    const tags = tagsString.split(',').map(t => t.trim()).filter(t => t !== '');

    const mealData = {
      name: formData.get('name'),
      category: formData.get('category'),
      cuisine: formData.get('cuisine'),
      difficulty: formData.get('difficulty'),
      prepTime: parseInt(formData.get('prepTime')) || 0,
      cookTime: parseInt(formData.get('cookTime')) || 0,
      servings: parseInt(formData.get('servings')) || 4,
      description: formData.get('description'),
      ingredients: this.getFormIngredients(),
      instructions: formData.get('instructions'),
      tags: tags,
      notes: formData.get('notes')
    };

    try {
      if (mode === 'create') {
        createMeal(mealData);
        this.showNotification('Meal created!', 'success');
      } else {
        updateMeal(mealId, mealData);
        this.showNotification('Meal updated!', 'success');
      }

      modal.close();
      this.update();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert(`Error: ${error.message}`);
    }
  }

  getFormIngredients() {
    const inputs = document.querySelectorAll('#meal-ingredients input[type="text"]');
    return Array.from(inputs)
      .map(input => input.value.trim())
      .filter(text => text !== '');
  }

  addIngredientToForm() {
    const container = document.getElementById('meal-ingredients');
    const newIndex = container.children.length;

    const ingredientHtml = `
      <div class="flex items-center gap-2">
        <input
          type="text"
          data-ingredient-index="${newIndex}"
          placeholder="1 cup flour, 2 eggs, etc."
          class="input flex-1"
        />
        <button
          type="button"
          class="remove-ingredient text-red-500 hover:text-red-700"
          data-ingredient-index="${newIndex}"
        >
          ✕
        </button>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', ingredientHtml);

    // Re-attach event
    const removeBtn = container.querySelector(`[data-ingredient-index="${newIndex}"].remove-ingredient`);
    removeBtn.addEventListener('click', (e) => {
      this.removeIngredientFromForm(e.target.dataset.ingredientIndex);
    });
  }

  removeIngredientFromForm(index) {
    const container = document.getElementById('meal-ingredients');
    const items = Array.from(container.children);
    if (items[index]) {
      items[index].remove();
    }
  }

  showMealViewModal(meal) {
    const totalTime = (meal.prepTime || 0) + (meal.cookTime || 0);
    const difficultyColors = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700'
    };

    const modalContent = `
      <div class="meal-view-modal">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">${meal.name}</h2>
        ${meal.description ? `<p class="text-gray-600 mb-4">${meal.description}</p>` : ''}

        <div class="flex gap-3 text-sm mb-6">
          ${meal.cuisine ? `<span class="text-gray-600">🌍 ${meal.cuisine}</span>` : ''}
          ${totalTime > 0 ? `<span class="text-gray-600">⏱️ ${totalTime} min</span>` : ''}
          ${meal.servings ? `<span class="text-gray-600">👥 ${meal.servings} servings</span>` : ''}
          ${meal.difficulty ? `<span class="px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[meal.difficulty]}">${meal.difficulty}</span>` : ''}
        </div>

        <!-- Ingredients with checkboxes -->
        ${meal.ingredients && meal.ingredients.length > 0 ? `
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900">Ingredients</h3>
              <div class="flex gap-2">
                <button
                  type="button"
                  id="select-all-ingredients"
                  class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <button
                  type="button"
                  id="deselect-all-ingredients"
                  class="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div id="ingredients-checklist" class="space-y-2 bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              ${meal.ingredients.map((ingredient, index) => `
                <label class="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    class="ingredient-checkbox w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                    data-ingredient="${ingredient}"
                    checked
                  />
                  <span class="text-gray-700">${ingredient}</span>
                </label>
              `).join('')}
            </div>
            <button
              type="button"
              id="add-to-shopping-list-btn"
              class="mt-3 w-full py-2 px-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              🛒 Add Selected to Shopping List
            </button>
          </div>
        ` : ''}

        <!-- Instructions -->
        ${meal.instructions ? `
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
            <div class="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
              ${meal.instructions}
            </div>
          </div>
        ` : ''}

        <!-- Notes -->
        ${meal.notes ? `
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
            <div class="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400 text-gray-700">
              ${meal.notes}
            </div>
          </div>
        ` : ''}

        <!-- Tags -->
        ${meal.tags && meal.tags.length > 0 ? `
          <div class="mb-6">
            <div class="flex gap-2 flex-wrap">
              ${meal.tags.map(tag => `
                <span class="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full">${tag}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4 border-t">
          <button
            type="button"
            id="edit-meal-btn"
            class="btn-secondary flex-1"
          >
            ✏️ Edit Recipe
          </button>
          <button
            type="button"
            id="close-meal-view-btn"
            class="btn-primary flex-1"
          >
            Close
          </button>
        </div>
      </div>
    `;

    modal.open(modalContent);
    this.attachViewModalEvents(meal);
  }

  attachViewModalEvents(meal) {
    // Select all ingredients
    document.getElementById('select-all-ingredients')?.addEventListener('click', () => {
      document.querySelectorAll('.ingredient-checkbox').forEach(cb => cb.checked = true);
    });

    // Deselect all ingredients
    document.getElementById('deselect-all-ingredients')?.addEventListener('click', () => {
      document.querySelectorAll('.ingredient-checkbox').forEach(cb => cb.checked = false);
    });

    // Add to shopping list
    document.getElementById('add-to-shopping-list-btn')?.addEventListener('click', () => {
      this.addIngredientsToShoppingList();
    });

    // Edit meal button
    document.getElementById('edit-meal-btn')?.addEventListener('click', () => {
      modal.close();
      this.showMealModal(meal.id, false); // Open in edit mode
    });

    // Close button
    document.getElementById('close-meal-view-btn')?.addEventListener('click', () => {
      modal.close();
    });
  }

  addIngredientsToShoppingList() {
    const selectedIngredients = [];
    document.querySelectorAll('.ingredient-checkbox:checked').forEach(checkbox => {
      selectedIngredients.push(checkbox.dataset.ingredient);
    });

    if (selectedIngredients.length === 0) {
      alert('Please select at least one ingredient');
      return;
    }

    // Find existing shopping list or create new one
    const notes = store.state.notes || [];
    let shoppingList = notes.find(note => note.type === 'shopping');

    if (shoppingList) {
      // Add to existing shopping list
      const newItems = selectedIngredients.map(ing => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: ing,
        completed: false
      }));

      const updatedItems = [...shoppingList.items, ...newItems];

      import('../modules/notes.js').then(({ updateNote }) => {
        updateNote(shoppingList.id, { items: updatedItems });
        this.showNotification(`Added ${selectedIngredients.length} item(s) to shopping list!`, 'success');
        modal.close();
      });
    } else {
      // Create new shopping list
      import('../modules/notes.js').then(({ createNote }) => {
        const items = selectedIngredients.map(ing => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          text: ing,
          completed: false
        }));

        createNote({
          title: 'Shopping List',
          type: 'shopping',
          color: 'green',
          pinned: true,
          items: items,
          content: ''
        });

        this.showNotification(`Created shopping list with ${selectedIngredients.length} item(s)!`, 'success');
        modal.close();
      });
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
