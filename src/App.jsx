import { useEffect } from 'react';
import { useStore } from './store/useStore';
import {
  subscribeToEvents,
  subscribeToMembers,
  subscribeToNotes,
  subscribeToMeals,
  subscribeToBudgets,
  subscribeToExpenses,
  subscribeToBills,
  subscribeToBillPayments,
  seedDatabase
} from './services/firestoreService';
import MainLayout from './layouts/MainLayout';
import CalendarView from './views/CalendarView';
import HomeView from './views/HomeView';
import NotesView from './views/NotesView';
import MealsView from './views/MealsView';
import ShoppingView from './views/ShoppingView';
import UsersView from './views/UsersView';
import BudgetView from './views/BudgetView';
import BillsView from './views/BillsView';

function App() {
  const {
    setEvents, setMembers, setNotes, setMeals, setBudgets, setExpenses, setBills, setBillPayments, events, activeView
  } = useStore();

  useEffect(() => {
    // 1. Subscribe to Firestore collections
    const unsubEvents = subscribeToEvents(setEvents);
    const unsubMembers = subscribeToMembers(setMembers);
    const unsubNotes = subscribeToNotes(setNotes);
    const unsubMeals = subscribeToMeals(setMeals);
    const unsubBudgets = subscribeToBudgets(setBudgets);
    const unsubExpenses = subscribeToExpenses(setExpenses);
    const unsubBills = subscribeToBills(setBills);
    const unsubBillPayments = subscribeToBillPayments(setBillPayments);

    // 2. Cleanup listeners on unmount
    return () => {
      unsubEvents();
      unsubMembers();
      unsubNotes();
      unsubMeals();
      unsubBudgets();
      unsubExpenses();
      unsubBills();
      unsubBillPayments();
    };
  }, [setEvents, setMembers, setNotes, setMeals, setBudgets, setExpenses, setBills, setBillPayments]);

  const handleSeed = async () => {
    if (confirm("This will add sample data to your Firestore database. Continue?")) {
      try {
        await seedDatabase();
        alert("Database seeded!");
      } catch (error) {
        console.error(error);
        alert("Error seeding database: " + error.message);
      }
    }
  };

  // Render the appropriate view based on activeView
  const renderView = () => {
    // If no events loaded yet, show seed state
    if (events.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to FamilySync</h2>
            <p className="text-gray-600 mb-6">
              Your database appears empty. Let's get started.
            </p>
            <button
              onClick={handleSeed}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
            >
              Seed Database with Sample Data
            </button>
          </div>
        </div>
      );
    }

    // Render based on activeView
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'calendar':
        return <CalendarView />;
      case 'notes':
        return <NotesView />;
      case 'meals':
        return <MealsView />;
      case 'shopping':
        return <ShoppingView />;
      case 'budget':
        return <BudgetView />;
      case 'bills':
        return <BillsView />;
      case 'users':
        return <UsersView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <MainLayout>
      {renderView()}
    </MainLayout>
  );
}

export default App;