import { useStore } from '../../store/useStore';

export default function NavBar() {
  const { activeView, setActiveView } = useStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon() },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon() },
    { id: 'notes', label: 'Notes', icon: NotesIcon() },
    { id: 'meals', label: 'Meals', icon: MealsIcon() },
    { id: 'budget', label: 'Budget', icon: BudgetIcon() },
    { id: 'bills', label: 'Bills', icon: BillsIcon() },
    { id: 'shopping', label: 'Shopping Lists', icon: ShoppingIcon() },
    { id: 'users', label: 'Family Members', icon: UsersIcon() },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-700 text-white w-20 shadow-2xl">
      {/* Logo/App Icon */}
      <div className="flex items-center justify-center h-24 mb-4">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/30">
          👨‍👩‍👧‍👦
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3">
        <div className="flex flex-col gap-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-item flex items-center justify-center p-4 rounded-2xl transition-all duration-300 relative group
                ${activeView === item.id
                  ? 'bg-white text-violet-600 shadow-lg scale-110'
                  : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105'}`}
              title={item.label}
            >
              {item.icon}
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl
                           opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                           transition-all duration-200 z-50 shadow-xl font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 mb-4">
        <div className="w-full h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
          <span className="text-xs font-bold opacity-70">FamilySync</span>
        </div>
      </div>
    </div>
  );
}

// Icons
function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function MealsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function BudgetIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BillsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ShoppingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
