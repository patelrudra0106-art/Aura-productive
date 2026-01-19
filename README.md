# S1N PRODUCTIVE.

> **Focus. Execute. Repeat.** > An industrial-grade productivity suite blending strict task management with a gamified social economy.

## 📂 Project Overview

S1N Productive is a web-based application designed to gamify the "Deep Work" experience. Unlike standard to-do lists, S1N enforces a **5-Task Daily Limit** to prevent burnout and ensure prioritization. It features a complete economy where users earn "Credits" to purchase cosmetic badges and utility items.

### 🌟 Core Features

#### 1. Task Protocol 📋
* **Daily Cap:** Limit of 5 active protocols per day.
* **Ledger System:** Earn credits for on-time completion; lose credits for delays.
* **Strict Deletion:** Deleting tasks removes potential rewards.

#### 2. Focus System (Pomodoro) ⏱️
* **Visual Timer:** SVG-based progress ring.
* **Natural Soundscapes:** Integrated audio engine (Rain, Forest, White Noise, Ocean, Cafe).
* **Modes:** Focus (25m), Short Recharge (5m), Long Recharge (15m).
* **Background Sync:** Tracks minutes even when navigating tabs.

#### 3. Identity & Gamification 🏆
* **Economy:** Earn XP/Credits to climb the Global League.
* **Shop (The Market):** Buy badges (Crown, Star, Flame) and "Streak Restore" items.
* **Achievements:** Auto-unlocking trophy system (e.g., "Deep Work", "Capitalist").
* **Streaks:** Daily tracking to encourage consistency.

#### 4. Social Network 🌐
* **Global Leaderboard:** Compete against all agents.
* **Friend System:** Add/Remove connections.
* **Secure Chat:** Real-time messaging with visual notifications.
* **Profile Inspection:** View other users' stats and badge inventory.

#### 5. Admin Control 🛡️
* **User Management:** Ban/Unban users, reset passwords.
* **System Broadcasts:** Send global alerts to all active users.
* **Economy Control:** Manual credit adjustments.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Styling:** Tailwind CSS (CDN) + Custom Industrial CSS
* **Icons:** Lucide Icons
* **Backend / Database:** Google Firebase (Realtime Database)
* **Effects:** Canvas Confetti

## 🚀 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/yourusername/s1n-productive.git](https://github.com/yourusername/s1n-productive.git)
    cd s1n-productive
    ```

2.  **File Structure**
    Ensure your directory looks like this:
    ```
    /
    ├── index.html        # Main Entry Point (UI Structure)
    ├── style.css         # Custom Theme Overrides
    ├── app.js            # Task Logic
    ├── auth.js           # Firebase Auth & User Data
    ├── profile.js        # User Stats & Profile Modal
    ├── social.js         # Leaderboards & Friend System
    ├── chat.js           # Messaging Logic
    ├── shop.js           # Item Store & Purchasing
    ├── pomodoro.js       # Timer & Audio Engine
    ├── achievements.js   # Trophy Auto-Unlock Logic
    ├── notifications.js  # Toast Notification System
    ├── reports.js        # Analytics & Charts
    └── manifest.json     # (Optional) PWA Manifest
    ```

3.  **Firebase Configuration**
    * Open `index.html`.
    * Locate the `<script>` tag containing `firebaseConfig`.
    * Ensure your API Key and Database URL are correct.

4.  **Launch**
    * Simply open `index.html` in any modern browser.
    * No build step (`npm run build`) required.

## 🎨 Theme Customization

S1N Productive uses a strict **Industrial Monochrome** theme.
* **Light Mode:** Clean gray backgrounds, sharp black text.
* **Dark Mode:** OLED black backgrounds, white text, matte accents.
* **Accent Color:** Configurable in `style.css` (Default: Black/White).

## 🤝 Contribution

1.  Fork the project.
2.  Create your Feature Branch (`git checkout -b feature/NewProtocol`).
3.  Commit your changes (`git commit -m 'Add: New Feature'`).
4.  Push to the Branch (`git push origin feature/NewProtocol`).
5.  Open a Pull Request.

## Made by 

Patel rudra & Pingale kavan
---

*System Status: ALL SYSTEMS OPERATIONAL.*
