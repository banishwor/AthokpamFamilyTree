# 🌳 Athokpam Family Tree - Heritage & Genealogy Portal

<div align="center">
  <img src="assets/banner.png" alt="Athokpam Family Tree Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />
</div>

An elegant, interactive, and modern genealogy platform designed to map, explore, and preserve the rich history, lineage, and connections of the **Athokpam Family**.

Built as a high-performance React client-side application, it integrates with a serverless Google Apps Script backend to provide real-time updates directly from a Google Sheets database.

🔗 **Live Portal**: [https://banishwor.github.io/AthokpamFamilyTree/](https://banishwor.github.io/AthokpamFamilyTree/)

---

## ✨ Features

- **Interactive Family Tree Visualizer**: A responsive, zoomable, and draggable node tree powered by `react-d3-tree` to explore generations seamlessly.
- **Detailed Member Profiles**: Curated profiles containing key dates (birth, marriage, passing), bios, relationships, and embedded high-quality photos.
- **Smart Relationship Finder**: Dynamically trace and calculate the exact relationship path between any two family members (e.g., Grandfather, Aunt, Second Cousin).
- **Secure Admin Dashboard**: A clean, credential-protected admin panel to add, edit, or remove members and upload/assign profile pictures directly from the browser.
- **Media Optimization**: Integrated utility to transform standard Google Drive share links into embeddable stream URLs that bypass modern iframe security policies.
- **Dark Mode Support**: Harmonious dark/light theme switching with smooth transitions.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Data Engine**: Serverless API via [Google Apps Script](https://developers.google.com/apps-script) linked to a Google Sheets database.
- **Routing**: [React Router v7](https://reactrouter.com/) using `HashRouter` for zero-configuration routing compatibility on GitHub Pages.

---

## 💻 Local Development

### Prerequisites
*   [Node.js](https://nodejs.org/) (v20+ recommended)
*   [npm](https://www.npmjs.com/)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
The app will run at `http://localhost:3000`.

---

## 🌐 Production Deployment

The project is fully pre-configured for automatic deployment to **GitHub Pages** using GitHub Actions.

### Deployment Flow
Every time you push or merge a commit to the `main` (or `master`) branch:
1. The GitHub Actions runner checks out the repository.
2. It installs dependencies and runs the build command (`npm run build`).
3. The build output in the `dist/` directory is automatically pushed to the `gh-pages` branch.
4. GitHub Pages serves the build output statically.

### Setup Instructions for GitHub Pages
To make sure the automatic deployment works:
1. **Enable Write Permissions**: In your GitHub Repository, go to **Settings** -> **Actions** -> **General**. Under **Workflow permissions**, select **Read and write permissions** and click **Save**.
2. **Configure Pages Branch**: Go to **Settings** -> **Pages**. Under **Build and deployment**, set **Source** to `Deploy from a branch`, choose `gh-pages` and `/ (root)`, and click **Save**.

---

## 📂 Project Structure

```
athokpam-family-tree/
├── .github/workflows/   # CI/CD deployment pipelines
│   └── deploy.yml       # GitHub Actions deploy configuration
├── assets/              # Static media assets (banners, logos)
├── src/
│   ├── components/      # Reusable UI components (Navbar, Node tree, Cards)
│   ├── context/         # Theme and state providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page views (Home, Profile, Admin, Relationships)
│   ├── services/        # API layer pointing to Google Apps Script
│   ├── types.ts         # TypeScript interface definitions
│   └── utils.ts         # Utility functions
├── index.html           # HTML5 shell
├── vite.config.ts       # Vite build & plugin configurations
└── tsconfig.json        # TypeScript configurations
```

---
<div align="center">
  Generated with ❤️ to preserve heritage.
</div>
