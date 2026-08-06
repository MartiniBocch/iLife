# iLife

A modern personal dashboard to organize daily tasks, track finances, log daily wellness, and manage life in one place. Built with React, Vite, and Tailwind CSS.

---

## 🚀 Quick Start

Follow these steps to run the project locally on your machine:

### 1. Prerequisites

Ensure you have **Node.js** (v18 or higher) installed on your system.

### 2. Installation

Install project dependencies:

```bash
npm install

```

### 3. Run Development Server

Start the local Vite development server:

```bash
npm run dev

```

Once running, open your browser and navigate to:

```text
http://localhost:5173/

```

---

## 🛠️ Features & Sections

* **Dashboard (Home):** High-level summary of your active tasks, daily logs, and overview metrics.
* **Tasks & Work:** Organize daily to-dos, track job logs, and manage active projects.
* **Finances:** Track income, monitor expenses, and keep tabs on budgets.
* **Wellness & Health:** Log daily health entries, breathing exercises, and personal cycle tracking.
* **Calendar & Planning:** Keep track of key dates and upcoming events.

---

## 🧰 Tech Stack

* **Framework:** [React](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
iLife/
├── src/
│   ├── components/  # Reusable UI components
│   ├── entities/    # Data models and mock helper services
│   ├── hooks/       # Custom React hooks
│   ├── pages/       # Core app pages (Home, Tasks, Finances, etc.)
│   ├── index.css    # Global CSS & Tailwind imports
│   └── App.jsx      # Root component & routing setup
├── public/          # Static assets
├── package.json     # Project dependencies & scripts
└── vite.config.js   # Vite configuration

```