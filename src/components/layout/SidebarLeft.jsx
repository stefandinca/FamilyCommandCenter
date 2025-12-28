import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

// Helper to check if a date is today
const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

export default function SidebarLeft({ onAddEvent, onEditProfile }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const { members, events, setCurrentDate } = useStore();

  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setCurrentDate(today.toISOString());
  };

  return (
    <div className="flex flex-col h-full p-4 gap-6 border-r border-gray-200 bg-gray-50">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">FamilySync</h1>
        <p className="text-sm text-gray-500">Family Dashboard</p>
      </div>

      {/* Mini Calendar */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <CalendarHeader 
          currentMonth={currentMonth} 
          currentYear={currentYear} 
          onPrev={handlePrevMonth} 
          onNext={handleNextMonth} 
        />
        <CalendarGrid 
          currentMonth={currentMonth} 
          currentYear={currentYear} 
          events={events}
          onDateSelect={(date) => setCurrentDate(date.toISOString())}
        />
      </div>

      {/* Today Button */}
      <button
        onClick={handleToday}
        className="w-full py-3 px-4 bg-blue-500 text-white rounded-full font-medium
               shadow-lg hover:shadow-xl hover:bg-blue-600 active:scale-95
               transition-all duration-200"
      >
        📅 Today
      </button>

      {/* Family Member Avatars */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 overflow-y-auto">
        {members.map(member => (
          <MemberAvatar key={member.id} member={member} onEditProfile={onEditProfile} />
        ))}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <button
          type="button"
          className="w-full py-2 px-4 bg-green-500 text-white rounded-lg font-medium
                 hover:bg-green-600 active:scale-95 transition-all duration-200"
          onClick={onAddEvent}
        >
          + Add Event
        </button>
      </div>
    </div>
  );
}

function CalendarHeader({ currentMonth, currentYear, onPrev, onNext }) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrev}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        ←
      </button>
      <h3 className="font-semibold text-gray-800">
        {monthNames[currentMonth]} {currentYear}
      </h3>
      <button
        onClick={onNext}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        →
      </button>
    </div>
  );
}

function CalendarGrid({ currentMonth, currentYear, events, onDateSelect }) {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const days = [];

  // Empty cells
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDate = (day) => {
    if (!day) return [];
    const date = new Date(currentYear, currentMonth, day);
    const startOfDay = date.setHours(0, 0, 0, 0);
    const endOfDay = date.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const eventStart = new Date(event.startTime).getTime();
      return eventStart >= startOfDay && eventStart <= endOfDay;
    });
  };

  const getActivityLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    return 3;
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {dayNames.map((day, idx) => (
        <div key={`${day}-${idx}`} className="text-center text-xs font-medium text-gray-500 py-1">{day}</div>
      ))}
      
      {days.map((day, idx) => {
        if (!day) return <div key={`empty-${idx}`}></div>;
        
        const date = new Date(currentYear, currentMonth, day);
        const isTodayDate = isToday(date);
        const dayEvents = getEventsForDate(day);
        const activityLevel = getActivityLevel(dayEvents.length);

        return (
          <div
            key={day}
            onClick={() => onDateSelect(date)}
            className={`calendar-day text-center py-2 rounded-lg cursor-pointer
                 transition-all duration-200 hover:bg-blue-50
                 ${isTodayDate ? 'bg-blue-500 text-white font-bold' : 'text-gray-700'}`}
          >
            <div className="text-sm">{day}</div>
            <ActivityDots level={activityLevel} isToday={isTodayDate} />
          </div>
        );
      })}
    </div>
  );
}

function ActivityDots({ level, isToday }) {
  if (level === 0) return null;
  const dotColor = isToday ? 'bg-white' : 'bg-blue-500';
  
  return (
    <div className="flex justify-center gap-0.5 mt-1">
      {Array.from({ length: level }).map((_, i) => (
        <span key={i} className={`w-1 h-1 ${dotColor} rounded-full`}></span>
      ))}
    </div>
  );
}

function MemberAvatar({ member, onEditProfile }) {
  return (
    <div className="relative group">
      <button
        className="member-avatar-btn relative"
        title={member.name}
      >
        <img
          src={member.avatar}
          alt={member.name}
          className="w-20 h-20 rounded-full border-4 border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-110 shadow-md object-cover"
        />
        <div className="absolute inset-0 rounded-full bg-black opacity-0 hover:opacity-10 transition-opacity"></div>
      </button>
      <button
        className="edit-profile-btn absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center rounded-full
               bg-gray-700 hover:bg-gray-800 text-white opacity-0 group-hover:opacity-100
               transition-all duration-200 shadow-lg"
        title={`Edit ${member.name}'s profile`}
        onClick={(e) => {
            e.stopPropagation();
            onEditProfile(member.id);
        }}
      >
        ✏️
      </button>
    </div>
  );
}