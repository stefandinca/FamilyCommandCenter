import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/useStore';

// Helper for formatting time (ported from utils)
const formatTime = (dateObj) => {
  return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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

export default function MiddlePane() {
  const { members, events, ui, setVisibleMembers, selectEvent, setRightPaneView } = useStore();
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
    <div className="h-full flex flex-col relative overflow-hidden">
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
                 <img src={member.avatar} className="w-8 h-8 rounded-full border border-gray-300" />
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
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative flex"
      >
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
                onEventClick={(id) => {
                    selectEvent(id);
                    setRightPaneView('up-next'); // Ensure correct view
                }}
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
               event.assignedTo.includes(member.id);
    });

    return (
        <div className="flex-1 relative border-r border-gray-200 min-h-[1520px]"> 
            {/* Header (Sticky inside the swimlane column, but needs to be careful with overflow) 
                Actually, simpler to put it at top of the flex column. 
                Wait, if we scroll the whole container, the headers scroll away.
                In the original code, the header was part of the scroll area but sticky?
                "top-0 z-30" works if the parent is scrollable.
            */}
            <div 
                onClick={onHeaderClick}
                className="sticky top-0 z-30 p-4 text-center border-b border-gray-300 cursor-pointer hover:opacity-90 transition-opacity bg-white/95 backdrop-blur-sm"
                style={{ 
                    borderTop: `4px solid ${memberColor}`
                }}
            >
                <img src={member.avatar} className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white shadow-md object-cover" />
                <h3 className="font-bold text-gray-800 text-sm">{member.name}</h3>
            </div>

            {/* Events Area */}
            <div className="relative w-full h-full">
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

    // Calculations: 1 minute = 1 pixel (roughly, to match original logic)
    // Offset by header height? In original, header was ~80px.
    // Here, we are placing events *relative* to the top of the scroll container.
    // The header is sticky, so it takes up space visually but flows with content.
    // To align with the HourGrid (absolute positioned), we usually start 0 at midnight.
    // But we need to account for the header height if the grid starts after it.
    // Let's assume the grid starts at Top 80px (approx header height).
    
    const HEADER_OFFSET = 88; // 80px + padding roughly
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const durationMinutes = (endTime - startTime) / 60000;
    
    const top = HEADER_OFFSET + startMinutes; 
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
             {/* Icons if tall enough */}
             {height > 50 && (
                <div className="flex gap-1 mt-1 text-[10px]">
                  {event.location && <span>📍</span>}
                  {event.checklist?.length > 0 && <span>✓</span>}
                </div>
            )}
        </div>
    );
}

function HourGrid() {
    // Renders horizontal lines for each hour
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const HEADER_OFFSET = 88;

    return (
        <div className="absolute inset-0 z-0 pointer-events-none w-full">
            {hours.map(hour => {
                const top = HEADER_OFFSET + (hour * 60);
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
        const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const HEADER_OFFSET = 88;
    const minutes = now.getHours() * 60 + now.getMinutes();
    const top = HEADER_OFFSET + minutes;

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
