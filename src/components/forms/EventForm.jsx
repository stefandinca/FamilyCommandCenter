import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { addEvent, updateEvent } from '../../services/firestoreService';

// Helper to format Date -> "YYYY-MM-DD"
const formatDate = (isoString) => {
  if (!isoString) return new Date().toISOString().split('T')[0];
  return new Date(isoString).toISOString().split('T')[0];
};

// Helper to format Date -> "HH:MM"
const formatTime = (isoString) => {
  if (!isoString) return '12:00';
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function EventForm({ eventId, onClose }) {
  const { events, members, meals } = useStore();
  const isEdit = !!eventId;
  const existingEvent = isEdit ? events.find(e => e.id === eventId) : null;

  // Initial State
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '13:00',
    assignedTo: [],
    category: 'general',
    location: '',
    notes: '',
    checklist: [],
    meal: '',
    driver: ''
  });

  // Load existing data if editing
  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title,
        date: formatDate(existingEvent.startTime),
        startTime: formatTime(existingEvent.startTime),
        endTime: formatTime(existingEvent.endTime),
        assignedTo: existingEvent.assignedTo || [],
        category: existingEvent.category || 'general',
        location: existingEvent.location?.name || '',
        notes: existingEvent.notes || '',
        checklist: existingEvent.checklist || [],
        meal: existingEvent.meal || '',
        driver: existingEvent.transportation?.driver || ''
      });
    }
  }, [existingEvent]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => {
      const current = prev.assignedTo;
      const updated = current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId];
      return { ...prev, assignedTo: updated };
    });
  };

  const handleAddChecklistItem = () => {
    const text = prompt("Enter checklist item:");
    if (text) {
        setFormData(prev => ({
            ...prev,
            checklist: [...prev.checklist, { id: Date.now().toString(), text, completed: false }]
        }));
    }
  };

  const handleRemoveChecklistItem = (id) => {
      setFormData(prev => ({
          ...prev,
          checklist: prev.checklist.filter(item => item.id !== id)
      }));
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct Date Objects
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`).toISOString();

    const payload = {
      title: formData.title,
      startTime: startDateTime,
      endTime: endDateTime,
      assignedTo: formData.assignedTo,
      category: formData.category,
      notes: formData.notes,
      location: formData.location ? { name: formData.location } : null,
      meal: formData.meal || null,
      transportation: formData.driver ? { driver: formData.driver, type: 'parent' } : null,
      checklist: formData.checklist
    };

    try {
      if (isEdit) {
        await updateEvent(eventId, payload);
      } else {
        await addEvent(payload);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving event: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          placeholder="Soccer practice, dentist, etc."
        />
      </div>

      {/* Date & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="general">General</option>
            <option value="sports">Sports</option>
            <option value="education">Education</option>
            <option value="medical">Medical</option>
            <option value="meal">Meal</option>
            <option value="social">Social</option>
            <option value="work">Work</option>
          </select>
        </div>
      </div>

      {/* Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Members */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Assign To *</label>
        <div className="grid grid-cols-2 gap-3">
          {members.map(member => (
            <label 
              key={member.id}
              className={`flex items-center gap-3 p-2 rounded-lg border-2 cursor-pointer transition-colors
                ${formData.assignedTo.includes(member.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
              `}
            >
              <input
                type="checkbox"
                checked={formData.assignedTo.includes(member.id)}
                onChange={() => handleMemberToggle(member.id)}
                className="hidden"
              />
              <img src={member.avatar} className="w-8 h-8 rounded-full" />
              <span className="font-medium text-sm">{member.name}</span>
            </label>
          ))}
        </div>
      </div>

       {/* Location */}
       <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Address or place name"
              className="w-full p-2 border border-gray-300 rounded"
            />
        </div>

        {/* Meal Specific */}
        {formData.category === 'meal' && (
            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Select Meal</label>
                 <select
                    name="meal"
                    value={formData.meal}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                 >
                     <option value="">No meal selected</option>
                     {meals.map(m => (
                         <option key={m.id} value={m.id}>{m.name}</option>
                     ))}
                 </select>
            </div>
        )}

        {/* Checklist */}
        <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
             <div className="space-y-2 mb-2">
                 {formData.checklist.map(item => (
                     <div key={item.id} className="flex justify-between bg-gray-50 p-2 rounded text-sm">
                         <span>{item.text}</span>
                         <button type="button" onClick={() => handleRemoveChecklistItem(item.id)} className="text-red-500">×</button>
                     </div>
                 ))}
             </div>
             <button type="button" onClick={handleAddChecklistItem} className="text-sm text-blue-600 font-medium">
                 + Add Item
             </button>
        </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEdit ? 'Save Changes' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
