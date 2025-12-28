import store from '../state/store.js';
import { modal } from './Modal.js';

export default class ProfileModal {
  constructor(memberId) {
    this.memberId = memberId;
    this.member = store.state.members.find(m => m.id === memberId);
  }

  render() {
    const member = this.member;

    return `
      <div class="profile-modal">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">Edit Profile</h2>

        <form id="profile-form" class="space-y-6">
          <!-- Avatar Preview -->
          <div class="flex items-center gap-4 mb-6">
            <img src="${member.avatar}" class="w-20 h-20 rounded-full border-4 border-gray-200" id="avatar-preview" />
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                id="member-avatar"
                name="avatar"
                value="${member.avatar}"
                placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=..."
                class="input"
              />
              <p class="text-xs text-gray-500 mt-1">Try <a href="https://www.dicebear.com/playground" target="_blank" class="text-blue-600 hover:underline">DiceBear</a> for avatars</p>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="member-name"
                name="name"
                value="${member.name}"
                placeholder="John Doe"
                class="input"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select id="member-role" name="role" class="input">
                <option value="parent" ${member.role === 'parent' ? 'selected' : ''}>Parent</option>
                <option value="child" ${member.role === 'child' ? 'selected' : ''}>Child</option>
              </select>
            </div>
          </div>

          <!-- Color -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Calendar Color
            </label>
            <select id="member-color" name="color" class="input">
              <option value="dad" ${member.color === 'dad' ? 'selected' : ''}>Blue</option>
              <option value="mom" ${member.color === 'mom' ? 'selected' : ''}>Pink</option>
              <option value="kid1" ${member.color === 'kid1' ? 'selected' : ''}>Green</option>
              <option value="kid2" ${member.color === 'kid2' ? 'selected' : ''}>Orange</option>
              <option value="family" ${member.color === 'family' ? 'selected' : ''}>Purple</option>
            </select>
          </div>

          <!-- Personal Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Birthday
              </label>
              <input
                type="date"
                id="member-birthday"
                name="birthday"
                value="${member.birthday || ''}"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                id="member-age"
                name="age"
                value="${member.age || ''}"
                min="0"
                max="120"
                placeholder="Optional"
                class="input"
              />
            </div>
          </div>

          <!-- Contact Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="member-phone"
                name="phone"
                value="${member.phone || ''}"
                placeholder="(555) 123-4567"
                class="input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="member-email"
                name="email"
                value="${member.email || ''}"
                placeholder="example@email.com"
                class="input"
              />
            </div>
          </div>

          <!-- Medical Info -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Allergies
            </label>
            <textarea
              id="member-allergies"
              name="allergies"
              rows="2"
              placeholder="List any allergies (food, medication, etc.)"
              class="input"
            >${member.allergies || ''}</textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Medications
            </label>
            <textarea
              id="member-medications"
              name="medications"
              rows="2"
              placeholder="Current medications and dosages"
              class="input"
            >${member.medications || ''}</textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Medical Notes
            </label>
            <textarea
              id="member-medical-notes"
              name="medicalNotes"
              rows="2"
              placeholder="Conditions, doctor info, insurance details, etc."
              class="input"
            >${member.medicalNotes || ''}</textarea>
          </div>

          <!-- Emergency Contact -->
          <div class="border-t pt-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  id="emergency-name"
                  name="emergencyContactName"
                  value="${member.emergencyContact?.name || ''}"
                  placeholder="Jane Doe"
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <input
                  type="text"
                  id="emergency-relationship"
                  name="emergencyContactRelationship"
                  value="${member.emergencyContact?.relationship || ''}"
                  placeholder="Grandmother, Friend, etc."
                  class="input"
                />
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Emergency Phone
              </label>
              <input
                type="tel"
                id="emergency-phone"
                name="emergencyContactPhone"
                value="${member.emergencyContact?.phone || ''}"
                placeholder="(555) 987-6543"
                class="input"
              />
            </div>
          </div>

          <!-- Additional Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="member-notes"
              name="notes"
              rows="3"
              placeholder="School info, hobbies, preferences, etc."
              class="input"
            >${member.notes || ''}</textarea>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              id="cancel-profile-btn"
              class="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary flex-1"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    `;
  }

  attachEvents() {
    const form = document.getElementById('profile-form');

    // Avatar preview update
    document.getElementById('member-avatar')?.addEventListener('input', (e) => {
      const preview = document.getElementById('avatar-preview');
      if (preview) {
        preview.src = e.target.value;
      }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(e);
    });

    // Cancel button
    document.getElementById('cancel-profile-btn')?.addEventListener('click', () => {
      modal.close();
    });
  }

  handleSubmit(e) {
    const formData = new FormData(e.target);

    const updatedMember = {
      ...this.member,
      name: formData.get('name'),
      role: formData.get('role'),
      color: formData.get('color'),
      avatar: formData.get('avatar'),
      birthday: formData.get('birthday') || null,
      age: formData.get('age') ? parseInt(formData.get('age')) : null,
      phone: formData.get('phone') || null,
      email: formData.get('email') || null,
      allergies: formData.get('allergies') || null,
      medications: formData.get('medications') || null,
      medicalNotes: formData.get('medicalNotes') || null,
      emergencyContact: {
        name: formData.get('emergencyContactName') || null,
        relationship: formData.get('emergencyContactRelationship') || null,
        phone: formData.get('emergencyContactPhone') || null
      },
      notes: formData.get('notes') || null
    };

    try {
      store.dispatch('UPDATE_MEMBER', updatedMember);
      this.showNotification('Profile updated successfully!', 'success');
      modal.close();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error: ${error.message}`);
    }
  }

  showNotification(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    const bgColor = type === 'success' ? 'bg-green-500' :
                    type === 'error' ? 'bg-red-500' :
                    'bg-blue-500';

    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg mb-2 animate-slide-up`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

export function showProfileModal(memberId) {
  const profileModal = new ProfileModal(memberId);
  modal.open(profileModal.render());
  profileModal.attachEvents();
}
