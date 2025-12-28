# Deployment Guide

This guide explains what files to upload where.

## ⚙️ Important: Base Path Configuration

**Before building**, make sure the `base` path in `vite.config.js` matches your deployment location:

### Deploying to a Subdirectory
If deploying to `https://yoursite.com/familysync/`:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/familysync/', // ← Must match your subdirectory
})
```

### Deploying to Domain Root
If deploying to `https://yoursite.com/`:
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/', // ← For root deployment
})
```

**⚠️ After changing `base`, always rebuild:** `npm run build`

---

## 📦 What to Upload to GitHub

Upload the **entire project folder** to GitHub, including:

### ✅ Include These:
```
family-command-center/
├── src/                   # All source code
├── public/                # Static assets
├── .gitignore             # Git ignore rules
├── eslint.config.js       # Linting config
├── index.html             # HTML template
├── package.json           # Dependencies
├── package-lock.json      # Locked dependency versions
├── postcss.config.js      # PostCSS config
├── README.md              # Documentation
├── tailwind.config.js     # Tailwind config
└── vite.config.js         # Vite config
```

### ❌ Exclude These (already in .gitignore):
```
node_modules/              # Dependencies (regenerated with npm install)
dist/                      # Build output (regenerated with npm run build)
bugs/                      # Debug screenshots
.claude/                   # Claude AI settings
.env                       # Environment variables (if you create one)
```

**Why?** GitHub stores your source code. Other developers can clone your repo and run `npm install` to get dependencies.

---

## 🌐 What to Upload to Your Web Server

Upload ONLY the **build output** from the `dist/` folder:

### Step 1: Build for Production
```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### Step 2: Upload These Files from `dist/`:
```
dist/
├── index.html             # Main HTML file
├── assets/                # Bundled JS, CSS, images
│   ├── index-[hash].js    # JavaScript bundle
│   ├── index-[hash].css   # CSS bundle
│   └── [other assets]     # Images, fonts, etc.
└── vite.svg               # Favicon
```

**Upload to your server's public directory:**
- Usually `public_html/`, `www/`, or `htdocs/`
- All files from `dist/` go directly into this folder

### Step 3: Server Configuration

**For Apache**, create/edit `.htaccess`:
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

**For Nginx**, add to your server block:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 🔑 Summary

| Location | What to Upload | How |
|----------|---------------|-----|
| **GitHub** | Source code (`src/`, config files, `package.json`) | `git push` |
| **Web Server** | Built files (`dist/` contents only) | FTP/SSH upload |

## Common Mistakes to Avoid

❌ **Don't upload `node_modules/` to GitHub or your server**
- GitHub: Too large, unnecessary (regenerated with `npm install`)
- Server: Unnecessary, only needs built files

❌ **Don't upload source code to your web server**
- The server only needs the built `dist/` folder
- Users don't need to see your React source code

❌ **Don't commit `dist/` to GitHub**
- Build output changes every time you build
- Different environments may produce different builds
- Regenerate it when deploying

## Quick Reference

**For GitHub:**
```bash
git add .
git commit -m "Your message"
git push origin main
```

**For Web Server:**
```bash
npm run build
# Then upload dist/ contents via FTP/SSH
```

**For Firebase Hosting (easiest):**
```bash
npm run build
firebase deploy
```
