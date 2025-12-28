# FamilySync - Family Command Center

A modern family scheduling and coordination app built with React, Firebase, and Tailwind CSS.

## Features

- 📅 **Timeline View** - Visual swimlane calendar with real-time event tracking
- 👥 **Family Members** - Manage profiles with custom avatars and colors
- 📝 **Notes** - Shared family notes with checklists and categories
- 🍽️ **Meal Planner** - Plan and organize family meals
- ⚡ **Real-time Sync** - Changes sync instantly across all devices via Firebase
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend:** React 19, Vite
- **Styling:** Tailwind CSS v3
- **Database:** Firebase Firestore
- **State Management:** Zustand
- **Deployment:** Firebase Hosting (or any static host)

## Prerequisites

- Node.js 18+ and npm
- Firebase account (free tier works)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd family-command-center
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Create a web app in Firebase project settings
   - Copy your Firebase config

4. **Configure Environment Variables:**
   - Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   - Open `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   - **⚠️ IMPORTANT:** Never commit the `.env` file to Git (it's already in `.gitignore`)

5. **Set Firestore Security Rules (for testing):**
   - Go to Firestore Database → Rules tab
   - Use these rules for testing (⚠️ make them more secure for production):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

## Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### First-time Setup

When you first run the app:
1. Click "Seed Database with Sample Data"
2. This creates sample family members, events, notes, and meals
3. Start exploring!

## Building for Production

1. **Build the app:**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` folder.

2. **Preview the build locally (optional):**
   ```bash
   npm run preview
   ```

## Deployment

**Important:** Your `.env` file is NOT included in the build. For production deployments, you need to set environment variables in your hosting platform:

- **Firebase Hosting:** Environment variables are automatically available during build (Firebase reads from your local `.env`)
- **Vercel/Netlify:** Add environment variables in project settings dashboard
- **Traditional Server:** Build locally with `.env` file, then upload the `dist/` folder

### Option 1: Firebase Hosting (Recommended)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting:**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to: `dist`
   - Configure as single-page app: `Yes`
   - Don't overwrite index.html: `No`

4. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

Your app will be live at: `https://your-project.web.app`

### Option 2: Traditional Web Server

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder contents to your web server:**
   - Upload all files from `dist/` to your server's public directory
   - Make sure your server is configured for SPAs (all routes should serve index.html)

**Server Configuration Examples:**

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Customization

### Adding Family Members

- Click the edit icon on member avatars
- Change name, role, color, and avatar
- Add custom avatars in `src/avatars/` and update `UserProfileForm.jsx`

### Changing Colors

Edit the color scheme in `src/components/forms/UserProfileForm.jsx`:
```javascript
const COLORS = [
  { name: 'dad', label: 'Blue', value: '#3B82F6' },
  // Add more colors...
];
```

## Project Structure

```
family-command-center/
├── src/
│   ├── components/        # React components
│   │   ├── common/        # Reusable components (Modal, etc.)
│   │   ├── forms/         # Form components
│   │   ├── layout/        # Layout components (NavBar, Sidebars)
│   │   ├── meals/         # Meal planner
│   │   ├── notes/         # Notes board
│   │   └── timeline/      # Timeline/swimlane view
│   ├── layouts/           # Page layouts
│   ├── services/          # Firebase services
│   ├── store/             # Zustand state management
│   ├── avatars/           # Member avatars
│   ├── firebase.js        # Firebase configuration
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── dist/                  # Build output (generated)
└── package.json           # Dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this project for your family!

## Support

For issues or questions:
- Open an issue on GitHub
- Check Firebase Console for database errors
- Review browser console for client-side errors
