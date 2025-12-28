import store from '../state/store.js';
import { generateUUID } from '../modules/utils.js';

/**
 * Load sample family data for testing
 */
export function loadSampleData() {
  // Create family members
  const dad = {
    id: 'member-dad',
    name: 'Dad',
    role: 'parent',
    color: 'dad',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dad',
    birthday: '1985-03-15',
    age: 39,
    phone: '(555) 123-4567',
    email: 'dad@family.com',
    allergies: null,
    medications: null,
    medicalNotes: null,
    emergencyContact: {
      name: 'John Smith',
      relationship: 'Brother',
      phone: '(555) 111-2222'
    },
    notes: 'Enjoys coaching soccer on weekends',
    permissions: {
      canCreateEvents: true,
      requiresApproval: false,
      canEditOthersEvents: true
    }
  };

  const mom = {
    id: 'member-mom',
    name: 'Mom',
    role: 'parent',
    color: 'mom',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mom',
    birthday: '1987-07-22',
    age: 37,
    phone: '(555) 234-5678',
    email: 'mom@family.com',
    allergies: 'Peanuts',
    medications: null,
    medicalNotes: 'Carries EpiPen',
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Sister',
      phone: '(555) 333-4444'
    },
    notes: 'Yoga instructor, vegetarian',
    permissions: {
      canCreateEvents: true,
      requiresApproval: false,
      canEditOthersEvents: true
    }
  };

  const son = {
    id: 'member-son',
    name: 'Son',
    role: 'child',
    color: 'kid1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=son',
    birthday: '2015-09-10',
    age: 9,
    phone: null,
    email: null,
    allergies: null,
    medications: null,
    medicalNotes: 'Dr. Smith - Pediatrician: (555) 345-6789',
    emergencyContact: {
      name: 'Grandma Mary',
      relationship: 'Grandmother',
      phone: '(555) 555-6666'
    },
    notes: 'Plays soccer, loves video games. School: Jefferson Elementary, Grade 4',
    permissions: {
      canCreateEvents: true,
      requiresApproval: true,
      canEditOthersEvents: false
    }
  };

  // Create sample events for today
  const today = new Date();
  const events = [
    {
      id: generateUUID(),
      title: 'Soccer Practice',
      startTime: setTime(today, 16, 0),
      endTime: setTime(today, 17, 30),
      assignedTo: ['member-son'],
      color: 'kid1',
      location: {
        name: 'Riverside Park',
        address: '123 Main St'
      },
      transportation: {
        type: 'parent',
        driver: 'member-dad',
        pickup: 'member-dad'
      },
      category: 'sports',
      status: 'confirmed',
      checklist: [
        { id: '1', text: 'Pack cleats', completed: false },
        { id: '2', text: 'Bring water bottle', completed: false }
      ],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      title: 'Dentist Appointment',
      startTime: setTime(today, 14, 0),
      endTime: setTime(today, 15, 0),
      assignedTo: ['member-mom'],
      color: 'mom',
      location: {
        name: 'Downtown Dental',
        address: '456 Oak Ave'
      },
      transportation: {
        type: null,
        driver: null,
        pickup: null
      },
      category: 'medical',
      status: 'confirmed',
      checklist: [],
      notes: 'Annual checkup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      title: 'Family Dinner',
      startTime: setTime(today, 18, 30),
      endTime: setTime(today, 19, 30),
      assignedTo: ['member-dad', 'member-mom', 'member-son'],
      color: 'family',
      location: {
        name: 'Home'
      },
      transportation: {
        type: null,
        driver: null,
        pickup: null
      },
      category: 'meal',
      meal: null, // Will be set after meals are created
      status: 'confirmed',
      checklist: [],
      notes: 'Spaghetti night!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Create sample notes
  const notes = [
    {
      id: generateUUID(),
      title: 'Weekly Shopping List',
      content: '',
      type: 'shopping',
      color: 'green',
      pinned: true,
      items: [
        { id: '1', text: 'Milk', completed: false },
        { id: '2', text: 'Bread', completed: false },
        { id: '3', text: 'Eggs', completed: true },
        { id: '4', text: 'Chicken', completed: false },
        { id: '5', text: 'Apples', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      title: 'Important Contacts',
      content: `Dr. Smith (Pediatrician): (555) 123-4567
Soccer Coach Martinez: (555) 234-5678
School Office: (555) 345-6789
Emergency: 911`,
      type: 'contact',
      color: 'blue',
      pinned: true,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      title: 'Weekend To-Do',
      content: '',
      type: 'general',
      color: 'yellow',
      pinned: false,
      items: [
        { id: '1', text: 'Clean garage', completed: false },
        { id: '2', text: 'Grocery shopping', completed: false },
        { id: '3', text: 'Soccer practice', completed: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Create sample meals
  const spaghetti = {
    id: generateUUID(),
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta with rich meat sauce',
    category: 'dinner',
    cuisine: 'Italian',
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      '1 lb ground beef',
      '1 onion, diced',
      '3 cloves garlic, minced',
      '28 oz crushed tomatoes',
      '2 tbsp tomato paste',
      '1 lb spaghetti',
      'Salt, pepper, Italian herbs',
      'Parmesan cheese'
    ],
    instructions: `1. Brown ground beef in large pot, drain excess fat
2. Add diced onion and garlic, cook until softened
3. Stir in crushed tomatoes and tomato paste
4. Season with salt, pepper, and Italian herbs
5. Simmer sauce for 30-40 minutes
6. Cook spaghetti according to package directions
7. Serve sauce over pasta, top with Parmesan`,
    notes: 'Can be made ahead and frozen. Kids love this!',
    tags: ['kid-friendly', 'freezer-friendly', 'family-favorite'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const chickenTacos = {
    id: generateUUID(),
    name: 'Chicken Tacos',
    description: 'Quick and easy weeknight tacos',
    category: 'dinner',
    cuisine: 'Mexican',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      '1.5 lbs chicken breast',
      'Taco seasoning',
      '8 taco shells',
      'Shredded lettuce',
      'Diced tomatoes',
      'Shredded cheese',
      'Sour cream',
      'Salsa'
    ],
    instructions: `1. Season chicken with taco seasoning
2. Cook chicken in skillet until done (165°F)
3. Dice or shred chicken
4. Warm taco shells
5. Assemble tacos with chicken and toppings
6. Serve immediately`,
    notes: 'Great for Taco Tuesday!',
    tags: ['quick', 'kid-friendly', 'customizable'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const pancakes = {
    id: generateUUID(),
    name: 'Fluffy Pancakes',
    description: 'Perfect weekend breakfast',
    category: 'breakfast',
    cuisine: 'American',
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      '2 cups flour',
      '2 tbsp sugar',
      '2 tsp baking powder',
      '1/2 tsp salt',
      '2 eggs',
      '1.5 cups milk',
      '1/4 cup melted butter',
      'Maple syrup and butter for serving'
    ],
    instructions: `1. Mix dry ingredients in bowl
2. Whisk eggs, milk, and melted butter in another bowl
3. Combine wet and dry ingredients (don't overmix)
4. Heat griddle over medium heat
5. Pour 1/4 cup batter per pancake
6. Flip when bubbles form on surface
7. Cook until golden brown on both sides
8. Serve with maple syrup and butter`,
    notes: 'Can add blueberries or chocolate chips',
    tags: ['breakfast', 'weekend', 'kid-friendly'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const grilledCheese = {
    id: generateUUID(),
    name: 'Grilled Cheese & Tomato Soup',
    description: 'Comfort food classic',
    category: 'lunch',
    cuisine: 'American',
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      '4 slices bread',
      '4 slices cheese',
      '2 tbsp butter',
      '1 can tomato soup',
      'Milk for soup'
    ],
    instructions: `1. Heat soup according to can directions
2. Butter one side of each bread slice
3. Place cheese between unbuttered sides
4. Grill in pan until golden and cheese melts
5. Serve with tomato soup`,
    notes: 'Perfect for rainy days',
    tags: ['quick', 'comfort-food', 'kid-friendly'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const meals = [spaghetti, chickenTacos, pancakes, grilledCheese];

  // Link Family Dinner event to Spaghetti meal
  const familyDinnerEvent = events.find(e => e.title === 'Family Dinner');
  if (familyDinnerEvent) {
    familyDinnerEvent.meal = spaghetti.id;
  }

  // Initialize state
  store.dispatch('INIT', {
    members: [dad, mom, son],
    events: events,
    notes: notes,
    meals: meals
  });

  console.log('[SampleData] Loaded', {
    members: 3,
    events: events.length,
    notes: notes.length,
    meals: meals.length
  });
}

/**
 * Helper to set time on a date
 */
function setTime(date, hours, minutes) {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}
