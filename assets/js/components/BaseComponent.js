/**
 * Base Component Class
 * All UI components extend this for consistent lifecycle and rendering
 */

export default class BaseComponent {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      console.error(`Container #${containerId} not found`);
    }

    this.state = {};
    this.mounted = false;
  }

  /**
   * Render component HTML
   * Override this in child classes
   */
  render() {
    return '<div>Base Component</div>';
  }

  /**
   * Mount component to DOM
   */
  mount() {
    if (!this.container) return;

    const html = this.render();
    this.container.innerHTML = html;
    this.mounted = true;

    // Attach event listeners after render
    this.attachEvents();

    console.log(`[${this.constructor.name}] Mounted`);
  }

  /**
   * Update component (re-render)
   */
  update() {
    if (!this.mounted) {
      this.mount();
    } else {
      const html = this.render();
      this.container.innerHTML = html;
      this.attachEvents();
    }
  }

  /**
   * Attach event listeners
   * Override this in child classes
   */
  attachEvents() {
    // Child classes implement this
  }

  /**
   * Unmount component
   */
  unmount() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.mounted = false;
  }

  /**
   * Emit custom event
   */
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  /**
   * Listen to custom event
   */
  on(eventName, callback) {
    document.addEventListener(eventName, callback);
  }
}
