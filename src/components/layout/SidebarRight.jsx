import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { deleteEvent as deleteEventService, updateEvent as updateEventService } from '../../services/firestoreService';
import NotesBoard from '../notes/NotesBoard';
import MealPlanner from '../meals/MealPlanner';

// Utilities (ported inline for now, can be extracted later)
const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatFullDateTime = (isoString) => {
  return new Date(isoString).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

const getTimeUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'Started';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)} days`;
  if (hours > 0) return `${hours} hrs`;
  return `${Math.floor(diff / (1000 * 60))} mins`;
};

export default function SidebarRight({ onEditEvent }) {
  const { ui, setRightPaneView, selectEvent, events, notes, members, meals } = useStore();
  const { selectedEventId, rightPaneView } = ui;
  const currentView = selectedEventId ? 'event-detail' : rightPaneView;

  // View state rendering
  const renderContent = () => {
    if (selectedEventId) return <EventDetail eventId={selectedEventId} onEditEvent={onEditEvent} />;
    if (rightPaneView === 'notes') return <NotesBoard />;
    if (rightPaneView === 'menu') return <MealPlanner />;
    return <UpNextView />;
  };

  return (
    <div className="flex flex-col h-full border-l border-gray-200 bg-gray-50">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          className={`flex-1 py-3 px-3 font-medium text-xs transition-colors ${
            currentView === 'up-next' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => {
            setRightPaneView('up-next');
            selectEvent(null);
          }}
        >
          📅 Up Next
        </button>
        <button
          className={`flex-1 py-3 px-3 font-medium text-xs transition-colors ${
            currentView === 'notes' ? 'border-b-2 border-purple-500 text-purple-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => {
            setRightPaneView('notes');
            selectEvent(null);
          }}
        >
          📝 Notes
        </button>
        <button
          className={`flex-1 py-3 px-3 font-medium text-xs transition-colors ${
            currentView === 'menu' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => {
            setRightPaneView('menu');
            selectEvent(null);
          }}
        >
          🍽️ Menu
        </button>
      </div>

      {/* Whos Home (Only show on default views, not specific detail/notes view if desired, but original showed it always unless notes/menu) */}
      {!selectedEventId && rightPaneView === 'up-next' && <WhosHome members={members} events={events} />}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${rightPaneView === 'up-next' ? 'p-0' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
}

function WhosHome({ members, events }) {
  const inferLocation = (memberId) => {
    const now = new Date();
    const currentEvent = events.find(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return event.assignedTo.includes(memberId) && now >= start && now <= end;
    });

    if (currentEvent && currentEvent.location) {
      return { location: currentEvent.location.name, status: 'at_event' };
    }
    return { location: 'Home', status: 'home' };
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 sticky top-0 z-10">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Who's Home</h3>
      <div className="space-y-2">
        {members.map(member => {
          const status = inferLocation(member.id);
          return (
            <div key={member.id} className="flex items-center gap-2 text-sm">
              <img src={member.avatar} className="w-6 h-6 rounded-full border-2 border-white/30" alt={member.name} />
              <span className="font-medium">{member.name}:</span>
              <span className="text-white/90">{status.location}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UpNextView() {
  const { events, selectEvent } = useStore();

  const upcomingEvents = events
    .filter(event => new Date(event.startTime).getTime() > new Date().getTime())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3);

  const getEventColor = (colorName) => {
      const colors = {
        'dad': '#3B82F6',
        'mom': '#EC4899',
        'kid1': '#10B981',
        'kid2': '#F59E0B',
        'family': '#8B5CF6'
      };
      return colors[colorName] || '#6B7280';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      sports: '⚽',
      education: '📚',
      medical: '🏥',
      meal: '🍽️',
      social: '🎉',
      work: '💼'
    };
    return icons[category] || '📅';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Up Next</h2>

      {upcomingEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-500">No upcoming events!</p>
          <p className="text-sm text-gray-400 mt-2">Enjoy your free time</p>
        </div>
      )}

      <div className="space-y-3">
        {upcomingEvents.map(event => (
          <div
            key={event.id}
            onClick={() => selectEvent(event.id)}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4"
            style={{ borderLeftColor: getEventColor(event.color) }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{formatFullDateTime(event.startTime)}</p>
                {event.location && <p className="text-sm text-gray-500 mt-1">📍 {event.location.name}</p>}
              </div>
              <div className="text-right">
                <span className="text-3xl">{getCategoryIcon(event.category)}</span>
              </div>
            </div>
            <div className="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {getTimeUntil(event.startTime)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventDetail({ eventId, onEditEvent }) {
  const { events, meals, members, selectEvent, updateEvent } = useStore();
  const event = events.find(e => e.id === eventId);

  if (!event) return <div className="p-4">Event not found</div>;

  const getEventColor = (colorName) => {
      const colors = {
        'dad': '#3B82F6',
        'mom': '#EC4899',
        'kid1': '#10B981',
        'kid2': '#F59E0B',
        'family': '#8B5CF6'
      };
      return colors[colorName] || '#6B7280';
  };

  const getMemberName = (id) => {
    const m = members.find(m => m.id === id);
    return m ? m.name : 'Unknown';
  };

  const handleDelete = async () => {
    if (confirm('Delete this event?')) {
        await deleteEventService(eventId);
        selectEvent(null);
    }
  };

  const toggleChecklist = async (itemId) => {
      const updatedChecklist = event.checklist.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      await updateEventService(eventId, { checklist: updatedChecklist });
  };

  return (
    <div className="event-details bg-white min-h-full">
        {/* Header */}
        <div className="text-white p-6 mb-6" style={{ backgroundColor: getEventColor(event.color) }}>
            <button onClick={() => selectEvent(null)} className="float-right text-white/80 hover:text-white text-2xl leading-none">×</button>
            <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
            <p className="text-white/90">
                {formatFullDateTime(event.startTime)}
                <br />
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </p>
        </div>

        <div className="p-6 pt-0 space-y-6">
            {/* Location */}
            {event.location && (
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">📍 Location</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900">{event.location.name}</p>
                        {event.location.address && <p className="text-sm text-gray-600 mt-1">{event.location.address}</p>}
                    </div>
                </div>
            )}

            {/* Checklist */}
            {event.checklist && event.checklist.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        ✓ Checklist
                        <span className="text-sm font-normal text-gray-500">
                             ({event.checklist.filter(i => i.completed).length}/{event.checklist.length})
                        </span>
                    </h3>
                    <ul className="space-y-2">
                        {event.checklist.map(item => (
                            <li key={item.id} className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={item.completed} 
                                    onChange={() => toggleChecklist(item.id)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                                />
                                <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-900'}>
                                    {item.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* Meal Info (if exists) */}
            {event.meal && (() => {
                const meal = meals.find(m => m.id === event.meal);
                if (!meal) return null;
                return (
                    <div>
                         <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">🍽️ Meal</h3>
                         <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                            <h4 className="font-semibold text-gray-900 mb-2">{meal.name}</h4>
                            <p className="text-sm text-gray-700">{meal.description}</p>
                         </div>
                    </div>
                );
            })()}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-8 pt-4 border-t">
                <button
                    onClick={() => onEditEvent(eventId)}
                    className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-50"
                >
                    Edit
                </button>
                <button 
                    onClick={() => alert('Duplicate coming later')}
                    className="py-2 px-4 border border-gray-300 rounded hover:bg-gray-50"
                >
                    Duplicate
                </button>
                <button 
                    onClick={handleDelete}
                    className="col-span-2 py-2 px-4 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                >
                    Delete Event
                </button>
            </div>
        </div>
    </div>
  );
}
