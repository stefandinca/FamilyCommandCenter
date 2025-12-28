import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { addEvent, updateEvent, deleteEvent } from '../services/firestoreService';
import Modal from '../components/common/Modal';
import EventForm from '../components/forms/EventForm';

// Helper for formatting time
const formatTime = (dateObj) => {
  return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

// Helper to check if a date is today
const isToday = (someDate) => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

// Colors mapping
const getMemberColor = (colorName) => {
  const colors = {
    'dad': '#3B82F6',
    'mom': '#EC4899',
    'kid1': '#10B981',
    'kid2': '#F59E0B',
    'family': '#8B5CF6'
  };
  return colors[colorName] || '#6B7280';
};

export default function CalendarView() {
  const { members, events, ui, setCurrentDate, setVisibleMembers } = useStore();
  const { currentDate } = ui;
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [viewingEventId, setViewingEventId] = useState(null);

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

  const handleEventClick = (eventId) => {
    setViewingEventId(eventId);
  };

  const handleEditEvent = () => {
    setEditingEventId(viewingEventId);
    setViewingEventId(null);
  };

  const selectedDate = new Date(currentDate);
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header with Calendar Selector */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Left: Date selector */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleToday}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all"
            >
              Today
            </button>
            <CalendarSelector
              currentMonth={currentMonth}
              currentYear={currentYear}
              events={events}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
              onDateSelect={(date) => setCurrentDate(date.toISOString())}
            />
          </div>

          {/* Right: Add Event button */}
          <button
            onClick={() => setIsAddingEvent(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            + Add Event
          </button>
        </div>

        {/* Selected Date Display */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">{formattedDate}</h2>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-hidden">
        <Timeline onEventClick={handleEventClick} />
      </div>

      {/* Event Form Modal */}
      {(isAddingEvent || editingEventId) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddingEvent(false);
            setEditingEventId(null);
          }}
          title={editingEventId ? "Edit Event" : "Create New Event"}
        >
          <EventForm
            eventId={editingEventId}
            onClose={() => {
              setIsAddingEvent(false);
              setEditingEventId(null);
            }}
          />
        </Modal>
      )}

      {/* Event Detail Viewer Modal */}
      {viewingEventId && (
        <EventDetailModal
          eventId={viewingEventId}
          onClose={() => setViewingEventId(null)}
          onEdit={handleEditEvent}
        />
      )}
    </div>
  );
}

function CalendarSelector({ currentMonth, currentYear, events, onPrev, onNext, onDateSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition-all flex items-center gap-2"
      >
        📅 {monthNames[currentMonth]} {currentYear}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl p-6 z-50 border border-gray-200 min-w-[320px]">
            <CalendarHeader
              currentMonth={currentMonth}
              currentYear={currentYear}
              onPrev={onPrev}
              onNext={onNext}
            />
            <CalendarGrid
              currentMonth={currentMonth}
              currentYear={currentYear}
              events={events}
              onDateSelect={(date) => {
                onDateSelect(date);
                setIsOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function CalendarHeader({ currentMonth, currentYear, onPrev, onNext }) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPrev}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl w-10 h-10 flex items-center justify-center"
      >
        ←
      </button>
      <h3 className="font-bold text-gray-800 text-lg">
        {monthNames[currentMonth]} {currentYear}
      </h3>
      <button
        onClick={onNext}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-2xl w-10 h-10 flex items-center justify-center"
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
    <div className="grid grid-cols-7 gap-2">
      {dayNames.map((day, idx) => (
        <div key={`${day}-${idx}`} className="text-center text-sm font-semibold text-gray-600 py-2">{day}</div>
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
            className={`text-center py-3 px-2 rounded-lg cursor-pointer min-h-[44px] flex flex-col items-center justify-center
                 transition-all duration-200 hover:bg-blue-50 hover:scale-105
                 ${isTodayDate ? 'bg-blue-500 text-white font-bold shadow-md' : 'text-gray-700 hover:shadow-sm'}`}
          >
            <div className="text-base font-medium">{day}</div>
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
    <div className="flex justify-center gap-1 mt-1.5">
      {Array.from({ length: level }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 ${dotColor} rounded-full`}></span>
      ))}
    </div>
  );
}

function Timeline({ onEventClick }) {
  const { members, events, ui, setVisibleMembers } = useStore();
  const { visibleMembers, currentDate } = ui;
  const scrollRef = useRef(null);

  // Logic to determine which members to show
  const membersToShow = visibleMembers.length === 0
    ? members
    : members.filter(m => visibleMembers.includes(m.id));

  const hiddenMembers = visibleMembers.length > 0
    ? members.filter(m => !visibleMembers.includes(m.id))
    : [];

  // Scroll to "Now" on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      scrollRef.current.scrollTop = Math.max(0, minutes - 200);
    }
  }, []);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-white">
      {/* Hidden Members Bar (if any) */}
      {hiddenMembers.length > 0 && (
        <div className="sticky top-0 z-40 bg-gray-100 border-b border-gray-300 p-2 flex items-center gap-3 shadow-sm h-14">
          <span className="text-xs font-medium text-gray-600">Hidden:</span>
          {hiddenMembers.map(member => (
            <button
              key={member.id}
              onClick={() => setVisibleMembers([...visibleMembers, member.id])}
              className="hover:scale-110 transition-transform"
              title={`Show ${member.name}`}
            >
              <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full border border-gray-300" />
            </button>
          ))}
          <button
            onClick={() => setVisibleMembers([])}
            className="ml-auto px-3 py-1 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded-full"
          >
            Show All
          </button>
        </div>
      )}

      {/* Main Timeline Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative flex">
        {/* Background Grid (Hour Markers) */}
        <HourGrid />

        {/* Current Time Line */}
        <NowLine />

        {/* Swimlanes */}
        {membersToShow.map(member => (
          <Swimlane
            key={member.id}
            member={member}
            events={events}
            currentDate={currentDate}
            onEventClick={onEventClick}
            onHeaderClick={() => setVisibleMembers([member.id])}
          />
        ))}
      </div>
    </div>
  );
}

function Swimlane({ member, events, currentDate, onEventClick, onHeaderClick }) {
  const memberColor = getMemberColor(member.color);

  // Filter events for this member on this day
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    const targetDate = new Date(currentDate);
    return eventDate.toDateString() === targetDate.toDateString() &&
           event.assignedTo?.includes(member.id);
  });

  // Fixed header height: p-4 (32px) + img (48px) + mb-2 (8px) + text (~20px) + border (4px) = ~112px
  const HEADER_HEIGHT = 112;

  return (
    <div className="flex-1 relative border-r border-gray-200 min-h-[1520px]">
      <div
        onClick={onHeaderClick}
        className="sticky top-0 z-30 p-4 text-center border-b border-gray-300 cursor-pointer hover:opacity-90 transition-opacity bg-white/95 backdrop-blur-sm"
        style={{ borderTop: `4px solid ${memberColor}` }}
      >
        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white shadow-md object-cover" />
        <h3 className="font-bold text-gray-800 text-sm">{member.name}</h3>
      </div>

      {/* Events Area - positioned absolutely to align with hour grid */}
      <div className="absolute left-0 right-0" style={{ top: `${HEADER_HEIGHT}px`, bottom: 0 }}>
        {dayEvents.map(event => (
          <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event, onClick }) {
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);

  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const durationMinutes = (endTime - startTime) / 60000;

  const top = startMinutes;
  const height = Math.max(durationMinutes, 30);

  const isPast = endTime < new Date();
  const opacity = isPast ? 0.6 : 1;
  const bgColor = getMemberColor(event.color);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="absolute left-1 right-1 rounded-md p-2 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] transition-all z-10 text-white overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: bgColor,
        opacity
      }}
      title={event.title}
    >
      <div className="font-semibold text-xs leading-tight">{event.title}</div>
      <div className="text-[10px] opacity-90 mt-0.5">{formatTime(startTime)}</div>
      {height > 50 && (
        <div className="flex gap-1 mt-1 text-[10px]">
          {event.location?.name && <span>📍</span>}
          {event.checklist?.length > 0 && <span>✓</span>}
        </div>
      )}
    </div>
  );
}

function HourGrid() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const HEADER_HEIGHT = 112;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full">
      {hours.map(hour => {
        const top = HEADER_HEIGHT + (hour * 60);
        const displayHour = hour === 0 ? '12 AM' :
                            hour < 12 ? `${hour} AM` :
                            hour === 12 ? '12 PM' :
                            `${hour - 12} PM`;
        return (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-gray-100 flex items-center"
            style={{ top: `${top}px`, height: '60px' }}
          >
            <span className="absolute -top-3 left-2 bg-white/50 px-1 text-[10px] font-medium text-gray-400 rounded">
              {displayHour}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function NowLine() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const HEADER_HEIGHT = 112;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = HEADER_HEIGHT + minutes;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
      style={{ top: `${top}px` }}
    >
      <div className="w-full border-t-2 border-red-500 relative">
        <span className="absolute -top-3 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
          {formatTime(now)}
        </span>
        <div className="w-3 h-3 bg-red-500 rounded-full absolute -top-1.5 -left-1.5"></div>
      </div>
    </div>
  );
}

function EventDetailModal({ eventId, onClose, onEdit }) {
  const { events, members } = useStore();
  const event = events.find(e => e.id === eventId);

  if (!event) return null;

  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const assignedMembers = members.filter(m => event.assignedTo?.includes(m.id));

  const handleDelete = async () => {
    if (confirm(`Delete "${event.title}"?`)) {
      try {
        await deleteEvent(event.id);
        onClose();
      } catch (error) {
        console.error(error);
        alert("Error deleting event: " + error.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="p-6 border-b-4"
          style={{ borderColor: getMemberColor(event.color) }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h2>
              <p className="text-gray-600">
                {startTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Time */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Time</h3>
            <p className="text-lg text-gray-800">
              {formatTime(startTime)} - {formatTime(endTime)}
            </p>
          </div>

          {/* Assigned Members */}
          {assignedMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Assigned To</h3>
              <div className="flex flex-wrap gap-3">
                {assignedMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                    <span className="font-medium text-gray-800">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {event.location?.name && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Location</h3>
              <p className="text-lg text-gray-800">📍 {event.location.name}</p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Category */}
          {event.category && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Category</h3>
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                {event.category}
              </span>
            </div>
          )}

          {/* Status */}
          {event.status && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Status</h3>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                {event.status}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
          >
            Delete Event
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Edit Event
          </button>
        </div>
      </div>
    </div>
  );
}
