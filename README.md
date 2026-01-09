# 🌟 Aura Productivity

**Aura** is a comprehensive productivity application that combines a smart task manager with a gamified focus timer. Built to help users build consistent habits, it features a sleek dark/light mode UI, XP rewards system, and a simulated social leaderboard.

## ✨ Features

### 📝 Smart Task Management
* **ToDo List:** Add tasks with optional due dates and specific times.
* **Intelligent Reminders:** Audio alarms and visual notifications when tasks are due.
* **Filtering:** View All, Active, or Completed tasks.
* **Task Linking:** One-click to start a "Focus Session" specifically for a selected task.

### ⏱️ Focus Timer (Pomodoro)
* **Flexible Modes:** Preset intervals for **Focus Time** (25m), **Short Break** (5m), and **Long Break** (15m).
* **Visual Timer:** Circular progress ring with smooth animations.
* **Session History:** Logs duration and task labels for every completed session.
* **Background Support:** Utilizes the Wake Lock API to keep the screen active during focus sessions.

### 🎮 Gamification & Social
* **XP System:** Earn points for completing tasks (20pts), finishing early (50pts), and completing focus sessions (50pts).
* **Streaks:** Daily streak counter to encourage consistency.
* **Global Contest:** A simulated leaderboard to compete with other users.
* **User Profiles:** Track your total points, current streak, and rank.

### 🎨 Modern UI/UX
* **Adaptive Theme:** Toggle between **Light Mode** and **Dark Mode** (persists in LocalStorage).
* **Glassmorphism:** Modern design with backdrop blur effects and smooth transitions.
* **PWA Ready:** Includes `manifest.json` and a Service Worker for installability on mobile/desktop.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (via CDN)
* **Icons:** [Lucide Icons](https://lucide.dev/)
* **Animations:** CSS Transitions & [Canvas Confetti](https://www.kirilv.com/canvas-confetti/)
* **Data Storage:** Browser `localStorage` (No backend required).

---

## 🚀 Getting Started

Since Aura is built with vanilla web technologies, no build process is required.

### Prerequisites
A modern web browser (Chrome, Edge, Firefox, Safari).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/aura-productivity.git](https://github.com/yourusername/aura-productivity.git)
    cd aura-productivity
    ```

2.  **Run the application:**
    * **Simple Method:** Open `index.html` directly in your browser.
    * **PWA Method (Recommended):** To ensure the Service Worker functions correctly, use a local server:
        ```bash
        # Python 3
        python -m http.server 8000
        # Or using VS Code "Live Server" extension
        ```
        Then visit `http://localhost:8000`.

---

## 📂 Project Structure

```text
aura-productivity/
├── index.html          # Main application layout and PWA entry
├── style.css           # Global styles and animations
├── manifest.json       # PWA metadata
├── service-worker.js   # Offline caching capabilities
├── auth.js             # User login/signup simulation
├── app.js              # Task management logic
├── pomodoro.js         # Timer logic and settings
├── profile.js          # Gamification (Points & Streaks)
├── social.js           # Leaderboard logic
└── notifications.js    # In-app toast notification system
