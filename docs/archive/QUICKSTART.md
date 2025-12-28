# FamilySync - Quick Start Guide

## What You're Building

A web-based family coordination dashboard optimized for tablets that replaces the kitchen whiteboard. Think of it as a shared calendar on steroids with smart features like:

- **3-pane dashboard** with live timeline showing "now"
- **Visual event blocks** color-coded by family member
- **Smart filters** to see individual or whole family schedules
- **Conflict detection** to prevent double-booking
- **Checklists** attached to events
- **Lists** for groceries, to-dos, packing, etc.

---

## Tech Stack (Keeping It Simple)

- **HTML5** - Structure
- **Vanilla JavaScript (ES6 modules)** - Logic (no React, no Vue, no framework!)
- **TailwindCSS** - Styling (utility-first, modern look)
- **LocalStorage/IndexedDB** - Data persistence
- **PWA** - Installable, works offline

**Why vanilla JS?** Maximum control, no dependencies, easy to refactor, learns fundamentals.

---

## Project Structure at a Glance

```
FamilySync/
├── index.html                      # Entry point
├── manifest.json                   # PWA config
├── service-worker.js              # Offline support
├── assets/
│   ├── css/
│   │   ├── input.css              # Tailwind source
│   │   └── styles.css             # Built CSS
│   ├── js/
│   │   ├── app.js                 # Application entry
│   │   ├── state/
│   │   │   └── store.js           # State management
│   │   ├── components/
│   │   │   ├── LeftPane.js        # Calendar & filters
│   │   │   ├── MiddlePane.js      # Timeline
│   │   │   ├── RightPane.js       # Details panel
│   │   │   ├── Modal.js           # Modal container
│   │   │   └── EventForm.js       # Event creation
│   │   ├── modules/
│   │   │   ├── events.js          # Event CRUD
│   │   │   └── utils.js           # Helpers
│   │   └── config/
│   │       └── sampleData.js      # Demo data
│   └── icons/                     # App icons
└── docs/                          # Phase guides
    ├── PHASE1_FOUNDATION_GUIDE.md
    ├── PHASE2_LAYOUT_GUIDE.md
    └── PHASE3_EVENTS_GUIDE.md
```

---

## Development Phases (MVP)

### Phase 1: Foundation (Week 1-2) - START HERE ⭐
**Goal:** Set up project structure, state management, and dev environment

**Deliverables:**
- ✅ Folder structure created
- ✅ Tailwind configured
- ✅ State store with localStorage persistence
- ✅ Sample data loading
- ✅ PWA manifest

**Guide:** `docs/PHASE1_FOUNDATION_GUIDE.md`

**Estimated Time:** 6-8 hours

---

### Phase 2: Layout (Week 2-3)
**Goal:** Build the visual three-pane dashboard

**Deliverables:**
- ✅ Left pane with mini calendar and filters
- ✅ Middle pane with 24-hour timeline
- ✅ Right pane with "Up Next" and event details
- ✅ "Now" line that updates every minute
- ✅ Responsive mobile adaptation

**Guide:** `docs/PHASE2_LAYOUT_GUIDE.md`

**Estimated Time:** 10-12 hours

---

### Phase 3: Events (Week 3-4)
**Goal:** Implement event creation, editing, deletion

**Deliverables:**
- ✅ Event CRUD module
- ✅ Modal component system
- ✅ Event form with validation
- ✅ Conflict detection
- ✅ Checklist management

**Guide:** `docs/PHASE3_EVENTS_GUIDE.md`

**Estimated Time:** 8-10 hours

---

### Phase 4: Lists (Week 5)
**Goal:** Add standalone lists (groceries, to-do, etc.)

**Deliverables:**
- ✅ List data model
- ✅ List UI with tabs
- ✅ Voice input (Web Speech API)
- ✅ Smart categorization

**Guide:** See `DEVELOPMENT_ROADMAP.md` Phase 5

**Estimated Time:** 6-8 hours

---

### Phase 5: PWA & Offline (Week 6)
**Goal:** Make app installable and work offline

**Deliverables:**
- ✅ Service worker with caching
- ✅ Install prompt
- ✅ Offline functionality
- ✅ App icons

**Guide:** See `DEVELOPMENT_ROADMAP.md` Phase 6

**Estimated Time:** 4-6 hours

---

## Getting Started (15 Minutes)

### Step 1: Create Project Folder
```bash
mkdir FamilySync
cd FamilySync
```

### Step 2: Create index.html
Copy the HTML template from `docs/PHASE1_FOUNDATION_GUIDE.md` Step 2.

### Step 3: Start Local Server
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# Option 3: VS Code Live Server extension
```

### Step 4: Open Browser
Navigate to `http://localhost:8000`

You should see a basic three-pane layout.

---

## Key Concepts

### 1. State Management (The Brain)

**All app data lives in one central store:**
```javascript
const store = {
  state: {
    events: [],       // All calendar events
    members: [],      // Family member profiles
    lists: [],        // Groceries, to-dos, etc.
    filters: { selectedMembers: ['all'] },
    ui: { currentDate, selectedEventId }
  }
};
```

**Components subscribe to changes:**
```javascript
store.subscribe('timeline', (state) => {
  // Re-render timeline when state changes
});
```

**Update state with actions:**
```javascript
store.dispatch('ADD_EVENT', newEvent);
```

### 2. Component Pattern (The Body)

**Every UI component extends BaseComponent:**
```javascript
class LeftPane extends BaseComponent {
  render() {
    return `<div>HTML goes here</div>`;
  }

  attachEvents() {
    // Set up click handlers, etc.
  }
}
```

**Components communicate via events:**
```javascript
// Component A emits
this.emit('event-selected', { eventId });

// Component B listens
this.on('event-selected', (e) => {
  console.log(e.detail.eventId);
});
```

### 3. Timeline Math (The Heart)

**Key calculation:** 1 pixel = 1 minute

```javascript
// Position event on timeline
const startMinutes = (hours * 60) + minutes;
const topPosition = startMinutes + 'px';

// Event height
const durationMinutes = (endTime - startTime) / 60000;
const height = durationMinutes + 'px';
```

**"Now" line updates:**
```javascript
setInterval(() => {
  const minutesSinceMidnight = (hours * 60) + minutes;
  nowLine.style.top = minutesSinceMidnight + 'px';
}, 60000); // Every minute
```

---

## Modern Design Principles

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
```

### Soft Shadows
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
            0 10px 20px rgba(0, 0, 0, 0.1);
```

### Smooth Transitions
```css
transition: all 0.2s ease-in-out;
hover:scale-105
active:scale-95
```

### Generous Spacing
- Use 8px base unit (Tailwind default)
- p-4 (16px), p-6 (24px), p-8 (32px)
- Large border-radius: rounded-xl (12px), rounded-2xl (16px)

### Color System
```javascript
const colors = {
  dad: '#3B82F6',    // Blue
  mom: '#EC4899',    // Pink
  kid1: '#10B981',   // Green
  kid2: '#F59E0B',   // Orange
  family: '#8B5CF6'  // Purple (shared events)
};
```

---

## Testing Checklist (After Each Phase)

### Phase 1 ✅
- [ ] All folders created
- [ ] index.html loads without errors
- [ ] Tailwind classes work
- [ ] Console shows "Initialization complete"
- [ ] localStorage has "familysync-state" key

### Phase 2 ✅
- [ ] Three panes visible on screen
- [ ] Calendar shows current month
- [ ] Activity dots appear on days with events
- [ ] Timeline shows 24 hours (0:00 to 23:59)
- [ ] "Now" line at current time
- [ ] Sample events render at correct positions
- [ ] Clicking event shows details in right pane
- [ ] Filters hide/show events correctly

### Phase 3 ✅
- [ ] "Add Event" opens modal
- [ ] Can create event and see it on timeline
- [ ] Can edit event and changes persist
- [ ] Can delete event with confirmation
- [ ] Form validates required fields
- [ ] Conflict warnings appear for overlaps
- [ ] Checklist items can be added/removed
- [ ] Events saved to localStorage

---

## Common Issues & Solutions

### Issue: Tailwind classes not working
**Solution:** Check CDN script tag in `<head>`, or run build process if using CLI

### Issue: ES6 modules not loading
**Solution:**
- Ensure `type="module"` in script tag
- Use http server (not file://)
- Check file paths (case-sensitive!)

### Issue: State not persisting
**Solution:**
- Check `store.persist()` is called
- Verify no localStorage quota errors
- Check browser privacy settings

### Issue: Timeline events wrong position
**Solution:**
- Verify time calculation: `hours * 60 + minutes`
- Check CSS: `position: absolute`, `top: Xpx`
- Ensure container has `position: relative`

### Issue: "Now" line not updating
**Solution:**
- Check interval is running: `console.log` in interval
- Verify calculation matches timeline pixels
- Check z-index (should be 20+)

---

## Development Workflow

### Daily Routine
1. **Start server:** `python -m http.server 8000`
2. **Open DevTools:** F12 or Cmd+Opt+I
3. **Work in phases:** Don't skip ahead!
4. **Test frequently:** After every feature
5. **Commit often:** `git add . && git commit -m "Feature X"`

### Debugging Tips
- **Use console.log liberally** - Log everything!
- **Check Application tab** - View localStorage data
- **Network tab** - Check if files load
- **Elements tab** - Inspect Tailwind classes
- **Sources tab** - Set breakpoints in JS

### Performance Tips
- **Debounce expensive operations** (search, filter)
- **Use CSS transforms** instead of position changes
- **Minimize DOM updates** - batch changes
- **Lazy load** images and heavy components

---

## Deployment Options

### Option 1: Netlify (Recommended)
```bash
# Deploy via drag-and-drop or CLI
netlify deploy --prod
```
- Free tier
- Automatic HTTPS
- CDN distribution

### Option 2: Vercel
```bash
vercel --prod
```
- Serverless functions support (future)
- Edge caching

### Option 3: GitHub Pages
- Free for public repos
- Push to gh-pages branch

---

## What's Next After MVP?

### Phase 4-5 (Essential)
- Recurring events (weekly soccer, etc.)
- Meal planning integration
- Lists module (groceries, to-do)

### Phase 6-8 (Nice to Have)
- Carpool coordination
- Conflict detection improvements
- Dark mode
- Voice commands (Web Speech API)

### Phase 9-10 (Advanced)
- Photo attachments to events
- Budget tracking
- External calendar sync (Google Cal, etc.)
- Weather integration

---

## Resources

### Documentation
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org)
- [Web.dev (PWA)](https://web.dev/progressive-web-apps/)

### Design Inspiration
- [Dribbble - Dashboard](https://dribbble.com/search/dashboard)
- [Behance - Calendar UI](https://www.behance.net/search/projects?search=calendar)

### Tools
- [TailwindCSS Playground](https://play.tailwindcss.com/)
- [SVG Icons - Heroicons](https://heroicons.com/)
- [Color Palette - Coolors](https://coolors.co/)

---

## Support

### Getting Help
1. Check `DEVELOPMENT_ROADMAP.md` for detailed phase instructions
2. Review phase-specific guides in `docs/`
3. Search MDN for Web API documentation
4. Use browser DevTools console for debugging

### Project Timeline
- **Week 1-2:** Foundation + Layout (Phases 1-2)
- **Week 3-4:** Events + Interactions (Phase 3)
- **Week 5:** Lists (Phase 4)
- **Week 6:** PWA (Phase 5)
- **Week 7-10:** Polish + Additional features

**Total MVP Time:** ~10 weeks (part-time)
**Difficulty:** Intermediate (requires HTML/CSS/JS fundamentals)

---

## Final Tips

1. **Start simple** - Get Phase 1 working before moving on
2. **Test constantly** - Don't write 100 lines without testing
3. **Use version control** - Git commit after every phase
4. **Read the docs** - Phase guides have detailed instructions
5. **Don't over-engineer** - Build what you need, when you need it
6. **Keep it modular** - Each component should be independent
7. **Focus on UX** - Make it beautiful AND functional
8. **Have fun!** - This is a real, useful app you'll actually use

---

## Quick Commands Reference

```bash
# Start dev server
python -m http.server 8000

# Build Tailwind CSS (if using CLI)
npx tailwindcss -i ./assets/css/input.css -o ./assets/css/styles.css --watch

# Git workflow
git init
git add .
git commit -m "Phase X complete"

# Check what's running
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows
```

---

**Happy coding! You've got this! 🚀**

Start with `docs/PHASE1_FOUNDATION_GUIDE.md` and work your way through. Each phase builds on the last. By the end, you'll have a real, working family coordination app that looks amazing on tablets.
