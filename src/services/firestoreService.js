import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  setDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

// Collection References
const EVENTS_COLLECTION = "events";
const MEMBERS_COLLECTION = "users"; // Mapping members to users
const NOTES_COLLECTION = "notes";
const MEALS_COLLECTION = "meals";

// --- Real-time Listeners (Sync) ---

export const subscribeToEvents = (callback) => {
  const q = query(collection(db, EVENTS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(events);
  });
};

export const subscribeToMembers = (callback) => {
  const q = query(collection(db, MEMBERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(members);
  });
};

export const subscribeToNotes = (callback) => {
  const q = query(collection(db, NOTES_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notes);
  });
};

export const subscribeToMeals = (callback) => {
  const q = query(collection(db, MEALS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const meals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(meals);
  });
};

// --- CRUD Operations ---

// Events
export const addEvent = async (eventData) => {
  return await addDoc(collection(db, EVENTS_COLLECTION), eventData);
};

export const updateEvent = async (id, eventData) => {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await updateDoc(docRef, eventData);
};

export const deleteEvent = async (id) => {
  const docRef = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Members
export const addMember = async (memberData) => {
  return await addDoc(collection(db, MEMBERS_COLLECTION), memberData);
};

export const updateMember = async (id, memberData) => {
  const docRef = doc(db, MEMBERS_COLLECTION, id);
  await updateDoc(docRef, memberData);
};

export const deleteMember = async (id) => {
  const docRef = doc(db, MEMBERS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Notes
export const addNote = async (noteData) => {
  return await addDoc(collection(db, NOTES_COLLECTION), noteData);
};

export const updateNote = async (id, noteData) => {
  const docRef = doc(db, NOTES_COLLECTION, id);
  await updateDoc(docRef, noteData);
};

export const deleteNote = async (id) => {
  const docRef = doc(db, NOTES_COLLECTION, id);
  await deleteDoc(docRef);
};

// Meals
export const addMeal = async (mealData) => {
  return await addDoc(collection(db, MEALS_COLLECTION), mealData);
};

export const updateMeal = async (id, mealData) => {
  const docRef = doc(db, MEALS_COLLECTION, id);
  await updateDoc(docRef, mealData);
};

export const deleteMeal = async (id) => {
  const docRef = doc(db, MEALS_COLLECTION, id);
  await deleteDoc(docRef);
};

// --- Seeding ---

export const seedDatabase = async () => {
  const batch = writeBatch(db);

  // Helper to generate a random ID (or use Firestore's auto-id if we were inserting one by one, 
  // but for batch with relationships we might want to control IDs or just use references)
  // For simplicity here, we'll define some data and let Firestore generate IDs for most, 
  // but for members we might want specific IDs or just use setDoc.

  // Sample Members
  // Using public folder paths so they work in both dev and production
  const members = [
    {
      id: 'member-dad',
      name: 'Dad',
      role: 'parent',
      color: 'dad',
      avatar: '/familysync/avatars/dad.png',
      birthday: '1985-03-15',
      phone: '(555) 123-4567',
      email: 'dad@family.com',
      permissions: { canCreateEvents: true, requiresApproval: false }
    },
    {
      id: 'member-mom',
      name: 'Mom',
      role: 'parent',
      color: 'mom',
      avatar: '/familysync/avatars/mom.png',
      birthday: '1987-07-22',
      phone: '(555) 234-5678',
      email: 'mom@family.com',
      permissions: { canCreateEvents: true, requiresApproval: false }
    },
    {
      id: 'member-son',
      name: 'Son',
      role: 'child',
      color: 'kid1',
      avatar: '/familysync/avatars/son.png',
      birthday: '2015-09-10',
      permissions: { canCreateEvents: true, requiresApproval: true }
    }
  ];

  members.forEach(member => {
    const ref = doc(db, MEMBERS_COLLECTION, member.id);
    batch.set(ref, member);
  });

  // Sample Meals
  const mealsData = [
    {
      name: 'Spaghetti Bolognese',
      description: 'Classic Italian pasta with rich meat sauce',
      category: 'dinner',
      cuisine: 'Italian',
      ingredients: ['ground beef', 'spaghetti', 'tomato sauce'],
      isFavorite: true
    },
    {
      name: 'Chicken Tacos',
      description: 'Quick and easy weeknight tacos',
      category: 'dinner',
      cuisine: 'Mexican',
      isFavorite: true
    }
  ];
  
  // We need meal IDs to link to events, so we'll create refs first
  const mealRefs = mealsData.map(() => doc(collection(db, MEALS_COLLECTION)));
  mealsData.forEach((meal, index) => {
    batch.set(mealRefs[index], meal);
  });

  // Sample Events
  const today = new Date();
  const setTime = (h, m) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };

  const events = [
    {
      title: 'Soccer Practice',
      startTime: setTime(16, 0),
      endTime: setTime(17, 30),
      assignedTo: ['member-son'],
      color: 'kid1',
      location: { name: 'Riverside Park' },
      category: 'sports',
      status: 'confirmed'
    },
    {
      title: 'Family Dinner',
      startTime: setTime(18, 30),
      endTime: setTime(19, 30),
      assignedTo: ['member-dad', 'member-mom', 'member-son'],
      color: 'family',
      location: { name: 'Home' },
      category: 'meal',
      meal: mealRefs[0].id, // Link to Spaghetti
      status: 'confirmed'
    }
  ];

  events.forEach(event => {
    const ref = doc(collection(db, EVENTS_COLLECTION));
    batch.set(ref, event);
  });

  // Sample Notes
  const notes = [
    {
      title: 'Weekly Shopping List',
      content: '',
      type: 'shopping',
      color: 'green',
      pinned: true,
      items: [
        { id: '1', text: 'Milk', completed: false },
        { id: '2', text: 'Bread', completed: false }
      ]
    }
  ];

  notes.forEach(note => {
    const ref = doc(collection(db, NOTES_COLLECTION));
    batch.set(ref, note);
  });

  await batch.commit();
  console.log("Database seeded successfully!");
};
