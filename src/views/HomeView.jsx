import { useState } from 'react';
import { useStore } from '../store/useStore';
import { updateNote, deleteEvent } from '../services/firestoreService';
import Modal from '../components/common/Modal';
import EventForm from '../components/forms/EventForm';

export default function HomeView() {
  const { events, members, notes } = useStore();
  const [viewingNoteId, setViewingNoteId] = useState(null);
  const [viewingShoppingListId, setViewingShoppingListId] = useState(null);
  const [viewingEventId, setViewingEventId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null);

  // Get current time
  const now = new Date();

  // Filter upcoming events (next 5 events from now)
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) >= now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5);

  // Get pinned notes (excluding shopping lists)
  const pinnedNotes = notes.filter(note => note.pinned && note.type !== 'shopping').slice(0, 3);

  // Get pinned shopping lists
  const pinnedShoppingLists = notes.filter(note => note.pinned && note.type === 'shopping').slice(0, 2);

  // Calculate who's where based on current events
  const getCurrentEvents = () => {
    return events.filter(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return start <= now && end >= now;
    });
  };

  const currentEvents = getCurrentEvents();

  const handleEditEvent = () => {
    setEditingEventId(viewingEventId);
    setViewingEventId(null);
  };

  // Map members to their current or next event
  const memberStatus = members.map(member => {
    // Find current event for this member
    const currentEvent = currentEvents.find(event =>
      event.assignedTo?.includes(member.id)
    );

    if (currentEvent) {
      return {
        member,
        status: 'current',
        event: currentEvent
      };
    }

    // Find next event for this member
    const nextEvent = upcomingEvents.find(event =>
      event.assignedTo?.includes(member.id)
    );

    return {
      member,
      status: nextEvent ? 'upcoming' : 'free',
      event: nextEvent
    };
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}!
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Here's what's happening with your family</p>
          </div>
          <div className="text-right bg-gradient-to-br from-violet-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <p className="text-sm font-medium opacity-90">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-3xl font-bold mt-1">
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Who's Where Section */}
          <div className="card-modern p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📍</span>
              <span>Who's Where</span>
            </h2>
            <div className="space-y-3">
              {memberStatus.map(({ member, status, event }) => (
                <MemberStatusCard
                  key={member.id}
                  member={member}
                  status={status}
                  event={event}
                />
              ))}
              {memberStatus.length === 0 && (
                <p className="text-gray-400 text-sm italic">No family members found</p>
              )}
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="card-modern p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <span>Upcoming Events</span>
            </h2>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <UpcomingEventCard
                  key={event.id}
                  event={event}
                  members={members}
                  onClick={() => setViewingEventId(event.id)}
                />
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-gray-400 text-sm italic">No upcoming events</p>
              )}
            </div>
          </div>

          {/* Pinned Notes Section */}
          <div className="card-modern p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📌</span>
              <span>Pinned Notes</span>
            </h2>
            <div className="space-y-3">
              {pinnedNotes.map(note => (
                <PinnedNoteCard
                  key={note.id}
                  note={note}
                  onClick={() => setViewingNoteId(note.id)}
                />
              ))}
              {pinnedNotes.length === 0 && (
                <p className="text-gray-400 text-sm italic">No pinned notes</p>
              )}
            </div>
          </div>

          {/* Shopping Lists Section */}
          <div className="card-modern p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">🛒</span>
              <span>Shopping Lists</span>
            </h2>
            <div className="space-y-3">
              {pinnedShoppingLists.map(list => (
                <ShoppingListCard
                  key={list.id}
                  list={list}
                  onClick={() => setViewingShoppingListId(list.id)}
                />
              ))}
              {pinnedShoppingLists.length === 0 && (
                <p className="text-gray-400 text-sm italic">No pinned shopping lists</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Note Viewer Modal */}
      {viewingNoteId && (
        <NoteViewerModal
          noteId={viewingNoteId}
          onClose={() => setViewingNoteId(null)}
        />
      )}

      {/* Shopping List Viewer Modal */}
      {viewingShoppingListId && (
        <ShoppingListViewerModal
          listId={viewingShoppingListId}
          onClose={() => setViewingShoppingListId(null)}
        />
      )}

      {/* Event Detail Viewer Modal */}
      {viewingEventId && (
        <EventDetailModal
          eventId={viewingEventId}
          onClose={() => setViewingEventId(null)}
          onEdit={handleEditEvent}
        />
      )}

      {/* Event Form Modal */}
      {editingEventId && (
        <Modal
          isOpen={true}
          onClose={() => setEditingEventId(null)}
          title="Edit Event"
        >
          <EventForm
            eventId={editingEventId}
            onClose={() => setEditingEventId(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function MemberStatusCard({ member, status, event }) {
  const getStatusColor = () => {
    switch (status) {
      case 'current':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = () => {
    if (status === 'current' && event) {
      return `At ${event.location?.name || 'event'}`;
    }
    if (status === 'upcoming' && event) {
      const timeUntil = new Date(event.startTime) - new Date();
      const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
      const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

      if (hoursUntil > 0) {
        return `Next: ${event.title} in ${hoursUntil}h`;
      } else {
        return `Next: ${event.title} in ${minutesUntil}m`;
      }
    }
    return 'Free';
  };

  const COLORS = {
    dad: '#3B82F6',
    mom: '#EC4899',
    kid1: '#10B981',
    kid2: '#F59E0B',
    family: '#8B5CF6'
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${getStatusColor()} transition-all hover:scale-[1.02] shadow-sm`}>
      <div className="relative">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-14 h-14 rounded-2xl border-3 border-white shadow-md"
        />
        <div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-sm"
          style={{ backgroundColor: COLORS[member.color] || '#6B7280' }}
        />
      </div>
      <div className="flex-1">
        <p className="font-bold text-base">{member.name}</p>
        <p className="text-sm opacity-80 mt-0.5">{getStatusText()}</p>
      </div>
    </div>
  );
}

function UpcomingEventCard({ event, members, onClick }) {
  const startTime = new Date(event.startTime);
  const isToday = startTime.toDateString() === new Date().toDateString();
  const isTomorrow = startTime.toDateString() === new Date(Date.now() + 86400000).toDateString();

  const getDateLabel = () => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const assignedMembers = members.filter(m => event.assignedTo?.includes(m.id));

  const COLORS = {
    dad: '#3B82F6',
    mom: '#EC4899',
    kid1: '#10B981',
    kid2: '#F59E0B',
    family: '#8B5CF6'
  };

  return (
    <div
      onClick={onClick}
      className="card-modern-hover p-5 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl px-4 py-3 text-center min-w-[80px] shadow-lg">
          <p className="text-xs font-bold opacity-90 uppercase">{getDateLabel()}</p>
          <p className="text-xl font-bold mt-1">
            {startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg group-hover:text-violet-600 transition-colors">{event.title}</h3>
          {event.location?.name && (
            <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
              <span>📍</span>
              <span>{event.location.name}</span>
            </p>
          )}
          {assignedMembers.length > 0 && (
            <div className="flex gap-2 mt-3 items-center">
              <div className="flex -space-x-2">
                {assignedMembers.slice(0, 3).map(member => (
                  <img
                    key={member.id}
                    src={member.avatar}
                    alt={member.name}
                    title={member.name}
                    className="w-8 h-8 rounded-full border-3 border-white shadow-sm"
                    style={{ borderColor: COLORS[member.color] || '#6B7280' }}
                  />
                ))}
              </div>
              {assignedMembers.length > 3 && (
                <span className="text-xs font-medium text-gray-500">+{assignedMembers.length - 3} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PinnedNoteCard({ note, onClick }) {
  const NOTE_COLORS = {
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900' },
    green: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-900' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-900' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900' },
  };

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;

  const completedCount = note.items?.filter(item => item.completed).length || 0;
  const totalCount = note.items?.length || 0;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 ${colorConfig.border} ${colorConfig.bg} cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]`}
    >
      <h3 className={`font-bold text-lg ${colorConfig.text} mb-2`}>{note.title}</h3>
      {note.content && (
        <p className={`text-sm ${colorConfig.text} opacity-80 mb-3 line-clamp-2`}>{note.content}</p>
      )}
      {totalCount > 0 && (
        <div className={`flex items-center gap-2 text-sm ${colorConfig.text} font-semibold`}>
          <div className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center text-xs">
            ✓
          </div>
          <span>{completedCount}/{totalCount} completed</span>
        </div>
      )}
    </div>
  );
}

function ShoppingListCard({ list, onClick }) {
  const completedCount = list.items?.filter(item => item.completed).length || 0;
  const totalCount = list.items?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-300 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-emerald-900">{list.title}</h3>
        <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded-full">
          {Math.round(progress)}%
        </span>
      </div>
      {totalCount > 0 && (
        <>
          <div className="w-full bg-emerald-200 rounded-full h-3 mb-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-emerald-800 font-semibold">
            {completedCount} of {totalCount} items
          </p>
        </>
      )}
      {totalCount === 0 && (
        <p className="text-xs text-green-700 italic">No items yet</p>
      )}
    </div>
  );
}

function NoteViewerModal({ noteId, onClose }) {
  const { notes } = useStore();
  const note = notes.find(n => n.id === noteId);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editText, setEditText] = useState('');

  if (!note) return null;

  const NOTE_COLORS = {
    yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-900' },
    green: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
    blue: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
    pink: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
    purple: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
  };

  const colorConfig = NOTE_COLORS[note.color] || NOTE_COLORS.yellow;

  const handleToggleItem = async (itemId) => {
    const updatedItems = note.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    try {
      await updateNote(note.id, { items: updatedItems });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false
    };

    const updatedItems = [...(note.items || []), newItem];

    try {
      await updateNote(note.id, { items: updatedItems });
      setNewItemText('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const updatedItems = note.items.filter(item => item.id !== itemId);
    try {
      await updateNote(note.id, { items: updatedItems });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = async (itemId) => {
    if (!editText.trim()) {
      setEditingItemId(null);
      return;
    }

    const updatedItems = note.items.map(item =>
      item.id === itemId ? { ...item, text: editText.trim() } : item
    );

    try {
      await updateNote(note.id, { items: updatedItems });
      setEditingItemId(null);
      setEditText('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditText('');
  };

  const completedCount = note.items?.filter(item => item.completed).length || 0;
  const totalCount = note.items?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border-4 ${colorConfig.border} ${colorConfig.bg}`}>
        <div className={`flex items-center justify-between p-6 border-b-2 ${colorConfig.border}`}>
          <h3 className={`text-2xl font-bold ${colorConfig.text}`}>{note.title}</h3>
          <button
            onClick={onClose}
            className={`${colorConfig.text} hover:opacity-70 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 text-2xl font-bold`}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Content */}
          {note.content && (
            <div className="mb-6">
              <p className={`${colorConfig.text} whitespace-pre-wrap text-base leading-relaxed`}>
                {note.content}
              </p>
            </div>
          )}

          {/* Checklist Items */}
          <div>
            {note.items && note.items.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${colorConfig.text} text-lg`}>Checklist</h4>
                  <span className={`text-sm ${colorConfig.text} opacity-80`}>
                    {completedCount}/{totalCount} completed
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  {note.items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg group hover:bg-white/50 transition-all ${colorConfig.bg}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      />
                      {editingItemId === item.id ? (
                        <>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(item.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className={`flex-1 px-2 py-1 border-2 ${colorConfig.border} rounded focus:ring-2 focus:ring-blue-500`}
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="text-green-600 hover:text-green-800 font-bold text-lg flex-shrink-0"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-500 hover:text-gray-700 font-bold text-lg flex-shrink-0"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <span className={`flex-1 text-base ${item.completed ? 'line-through opacity-60' : colorConfig.text}`}>
                            {item.text}
                          </span>
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-sm flex-shrink-0"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 font-bold text-lg flex-shrink-0"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Add New Item */}
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  placeholder="Add new item..."
                  className={`flex-1 px-3 py-2 border-2 ${colorConfig.border} rounded-lg focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={handleAddItem}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${colorConfig.bg} ${colorConfig.text} hover:opacity-80 border-2 ${colorConfig.border}`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Type Badge */}
          {note.type && (
            <div className="mt-6 pt-4 border-t-2 border-current opacity-30">
              <span className={`text-xs font-semibold ${colorConfig.text} uppercase tracking-wide`}>
                {note.type}
              </span>
            </div>
          )}
        </div>

        <div className={`p-4 border-t-2 ${colorConfig.border} bg-white/50`}>
          <button
            onClick={onClose}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${colorConfig.bg} ${colorConfig.text} hover:opacity-80`}
          >
            Close
          </button>
        </div>
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

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

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

function ShoppingListViewerModal({ listId, onClose }) {
  const { notes } = useStore();
  const list = notes.find(n => n.id === listId);
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editText, setEditText] = useState('');

  if (!list) return null;

  const handleToggleItem = async (itemId) => {
    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    try {
      await updateNote(list.id, { items: updatedItems });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false
    };

    const updatedItems = [...(list.items || []), newItem];

    try {
      await updateNote(list.id, { items: updatedItems });
      setNewItemText('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const updatedItems = list.items.filter(item => item.id !== itemId);
    try {
      await updateNote(list.id, { items: updatedItems });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = async (itemId) => {
    if (!editText.trim()) {
      setEditingItemId(null);
      return;
    }

    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, text: editText.trim() } : item
    );

    try {
      await updateNote(list.id, { items: updatedItems });
      setEditingItemId(null);
      setEditText('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditText('');
  };

  const completedCount = list.items?.filter(item => item.completed).length || 0;
  const totalCount = list.items?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border-4 border-green-300">
        <div className="flex items-center justify-between p-6 border-b-2 border-green-300 bg-green-50">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-900 mb-2">{list.title}</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-green-700 font-semibold whitespace-nowrap">
                {Math.round(progress)}% ({completedCount}/{totalCount})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-green-800 hover:text-green-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-100 text-2xl font-bold ml-4"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-green-50/30">
          {list.items && list.items.length > 0 && (
            <div className="space-y-3 mb-4">
              {list.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 rounded-lg group hover:bg-green-50 transition-all bg-white border-2 border-green-200"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item.id)}
                    className="w-6 h-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer flex-shrink-0"
                  />
                  {editingItemId === item.id ? (
                    <>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(item.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 px-3 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="text-green-600 hover:text-green-800 font-bold text-xl flex-shrink-0"
                        title="Save"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-gray-700 font-bold text-xl flex-shrink-0"
                        title="Cancel"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 text-lg ${item.completed ? 'line-through opacity-60 text-gray-600' : 'text-gray-800'}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 text-sm flex-shrink-0"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 font-bold text-lg flex-shrink-0"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Item */}
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Add item to shopping list..."
                className="flex-1 px-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-base"
              />
              <button
                onClick={handleAddItem}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t-2 border-green-300 bg-green-50">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
