import BaseComponent from './BaseComponent.js';

export default class Modal extends BaseComponent {
  constructor() {
    super('modal-root');
    this.isOpen = false;
    this.content = '';
    this.onClose = null;
  }

  open(content, options = {}) {
    this.content = content;
    this.onClose = options.onClose || null;
    this.isOpen = true;

    this.mount();

    // Add body overflow hidden
    document.body.style.overflow = 'hidden';

    // Focus trap
    this.setupFocusTrap();
  }

  close() {
    this.isOpen = false;
    this.unmount();

    // Restore body overflow
    document.body.style.overflow = '';

    // Call onClose callback
    if (this.onClose) {
      this.onClose();
    }

    this.emit('modal-closed');
  }

  render() {
    if (!this.isOpen) return '';

    return `
      <div class="modal-overlay fixed inset-0 z-50 flex items-center justify-center
                  bg-black/50 backdrop-blur-sm animate-fade-in"
           id="modal-overlay">
        <div class="modal-content bg-white rounded-2xl shadow-2xl
                    max-w-2xl w-full max-h-[90vh] overflow-y-auto
                    mx-4 animate-slide-up"
             id="modal-content">
          <!-- Close button -->
          <button
            id="modal-close-btn"
            class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center
                   rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <span class="text-2xl text-gray-600">×</span>
          </button>

          <!-- Content -->
          <div class="p-8">
            ${this.content}
          </div>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Close on overlay click
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') {
        this.close();
      }
    });

    // Close button
    document.getElementById('modal-close-btn')?.addEventListener('click', () => {
      this.close();
    });

    // Close on Escape key
    this.handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.handleEscape);
  }

  setupFocusTrap() {
    const modalContent = document.getElementById('modal-content');
    if (!modalContent) return;

    const focusableElements = modalContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  unmount() {
    // Remove escape handler
    if (this.handleEscape) {
      document.removeEventListener('keydown', this.handleEscape);
    }

    super.unmount();
  }
}

// Export singleton instance
export const modal = new Modal();
