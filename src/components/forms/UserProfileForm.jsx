import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { updateMember } from '../../services/firestoreService';

// Avatar paths from public folder
const AVAILABLE_AVATARS = [
  { name: 'dad', path: '/familysync/avatars/dad.png', label: 'Dad' },
  { name: 'mom', path: '/familysync/avatars/mom.png', label: 'Mom' },
  { name: 'son', path: '/familysync/avatars/son.png', label: 'Son' }
];

const COLORS = [
  { name: 'dad', label: 'Blue', value: '#3B82F6' },
  { name: 'mom', label: 'Pink', value: '#EC4899' },
  { name: 'kid1', label: 'Green', value: '#10B981' },
  { name: 'kid2', label: 'Orange', value: '#F59E0B' },
  { name: 'family', label: 'Purple', value: '#8B5CF6' }
];

export default function UserProfileForm({ memberId, onClose }) {
  const { members } = useStore();
  const member = members.find(m => m.id === memberId);

  const [formData, setFormData] = useState({
    name: '',
    role: 'child',
    color: 'kid1',
    avatar: '',
    birthday: '',
    phone: '',
    email: ''
  });

  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        role: member.role || 'child',
        color: member.color || 'kid1',
        avatar: member.avatar || '',
        birthday: member.birthday || '',
        phone: member.phone || '',
        email: member.email || ''
      });

      // Set selected avatar based on current avatar path
      setSelectedAvatar(member.avatar || '');
    }
  }, [member]);

  if (!member) return <div className="p-4">Member not found</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatarPath) => {
    setSelectedAvatar(avatarPath);
    setFormData(prev => ({ ...prev, avatar: avatarPath }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateMember(memberId, {
        name: formData.name,
        role: formData.role,
        color: formData.color,
        avatar: formData.avatar,
        birthday: formData.birthday,
        phone: formData.phone || null,
        email: formData.email || null
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error updating profile: " + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Avatar Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <img
            src={formData.avatar}
            alt={formData.name}
            className="w-24 h-24 rounded-full border-4 border-gray-200"
          />
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white"
            style={{ backgroundColor: COLORS.find(c => c.name === formData.color)?.value }}
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Role & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
          <select
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {COLORS.map(color => (
              <option key={color.name} value={color.name}>{color.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Avatar Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Choose Avatar</label>
        <div className="grid grid-cols-3 gap-3">
          {AVAILABLE_AVATARS.map(avatar => (
            <button
              key={avatar.name}
              type="button"
              onClick={() => handleAvatarSelect(avatar.path)}
              className={`p-2 rounded-lg border-2 transition-all ${
                selectedAvatar === avatar.path
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={avatar.path}
                alt={avatar.label}
                className="w-full h-full rounded object-cover"
              />
              <p className="text-xs text-center mt-1 font-medium text-gray-600">{avatar.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Birthday */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
        <input
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
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
          Save Changes
        </button>
      </div>
    </form>
  );
}
