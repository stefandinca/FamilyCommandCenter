import { useState } from 'react';
import { useStore } from '../store/useStore';
import { addMember, updateMember, deleteMember } from '../services/firestoreService';

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

export default function UsersView() {
  const { members } = useStore();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-4xl">👥</span>
              <span>Family Members</span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your family member profiles</p>
          </div>
          <button
            onClick={() => setIsAddingMember(true)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        {members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={() => setEditingMemberId(member.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="text-8xl mb-4">👥</div>
            <p className="text-xl font-medium">No family members yet</p>
            <p className="text-sm mt-2">Click "Add Member" to get started</p>
          </div>
        )}
      </div>

      {/* Member Editor Modal */}
      {(isAddingMember || editingMemberId) && (
        <MemberEditorModal
          memberId={editingMemberId}
          onClose={() => {
            setIsAddingMember(false);
            setEditingMemberId(null);
          }}
        />
      )}
    </div>
  );
}

function MemberCard({ member, onEdit }) {
  const handleDelete = async () => {
    if (confirm(`Delete ${member.name}? This will remove all their events and data.`)) {
      try {
        await deleteMember(member.id);
      } catch (error) {
        console.error(error);
        alert("Error deleting member: " + error.message);
      }
    }
  };

  const colorConfig = COLORS.find(c => c.name === member.color);

  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-gray-200 hover:border-indigo-300">
      {/* Avatar and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          <img
            src={member.avatar}
            alt={member.name}
            className="w-20 h-20 rounded-full border-4 border-gray-200"
          />
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white"
            style={{ backgroundColor: colorConfig?.value || '#6B7280' }}
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Member Info */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
        <p className="text-sm text-gray-600 capitalize">
          <span className="font-medium">Role:</span> {member.role}
        </p>

        {member.birthday && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Birthday:</span>{' '}
            {new Date(member.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {member.phone && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Phone:</span> {member.phone}
          </p>
        )}

        {member.email && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {member.email}
          </p>
        )}

        {/* Permissions */}
        {member.permissions && (
          <div className="pt-3 border-t border-gray-200 mt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Permissions</p>
            <div className="flex flex-wrap gap-1">
              {member.permissions.canCreateEvents && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Can Create Events
                </span>
              )}
              {member.permissions.requiresApproval && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Requires Approval
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberEditorModal({ memberId, onClose }) {
  const { members } = useStore();
  const existingMember = memberId ? members.find(m => m.id === memberId) : null;

  const [formData, setFormData] = useState({
    name: existingMember?.name || '',
    role: existingMember?.role || 'child',
    color: existingMember?.color || 'kid1',
    avatar: existingMember?.avatar || AVAILABLE_AVATARS[0].path,
    birthday: existingMember?.birthday || '',
    phone: existingMember?.phone || '',
    email: existingMember?.email || '',
    canCreateEvents: existingMember?.permissions?.canCreateEvents ?? true,
    requiresApproval: existingMember?.permissions?.requiresApproval ?? false
  });

  const [selectedAvatar, setSelectedAvatar] = useState(existingMember?.avatar || AVAILABLE_AVATARS[0].path);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarSelect = (avatarPath) => {
    setSelectedAvatar(avatarPath);
    setFormData(prev => ({ ...prev, avatar: avatarPath }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const memberData = {
      name: formData.name,
      role: formData.role,
      color: formData.color,
      avatar: formData.avatar,
      birthday: formData.birthday || null,
      phone: formData.phone || null,
      email: formData.email || null,
      permissions: {
        canCreateEvents: formData.canCreateEvents,
        requiresApproval: formData.requiresApproval
      }
    };

    try {
      if (memberId) {
        await updateMember(memberId, memberData);
      } else {
        await addMember(memberData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving member: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-indigo-50">
          <h3 className="text-xl font-semibold text-gray-800">
            {memberId ? 'Edit Family Member' : 'Add Family Member'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={formData.avatar}
                alt="Avatar preview"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter name"
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
                className="w-full p-3 border border-gray-300 rounded-lg capitalize"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedAvatar === avatar.path
                      ? 'border-indigo-500 bg-indigo-50'
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
              className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
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
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Permissions */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="canCreateEvents"
                  checked={formData.canCreateEvents}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Can create events</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm text-gray-700">Requires approval for events</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              {memberId ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
