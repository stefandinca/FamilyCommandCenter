/**
 * FamilySync - Main Application Entry Point
 */

import store from './state/store.js';
import { loadSampleData } from './config/sampleData.js';
import LeftPane from './components/LeftPane.js';
import MiddlePane from './components/MiddlePane.js';
import RightPane from './components/RightPane.js';

class App {
  constructor() {
    this.init();
  }

  async init() {
    console.log('[App] Initializing FamilySync...');

    // Load state from localStorage
    store.load();

    // If no data exists, load sample data
    if (store.state.events.length === 0) {
      console.log('[App] No existing data, loading sample data');
      loadSampleData();
    }

    // Initialize components
    this.initComponents();

    // Register service worker (will be created in later phase)
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('[App] Service Worker registered');
      } catch (error) {
        console.log('[App] Service Worker registration skipped (not found yet)');
      }
    }

    console.log('[App] Initialization complete');
  }

  initComponents() {
    // Create component instances
    this.leftPane = new LeftPane();
    this.middlePane = new MiddlePane();
    this.rightPane = new RightPane();

    // Mount all components
    this.leftPane.mount();
    this.middlePane.mount();
    this.rightPane.mount();

    // Scroll to current time after a brief delay
    setTimeout(() => {
      this.middlePane.scrollToNow();
    }, 100);

    console.log('[App] All components mounted successfully');
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
