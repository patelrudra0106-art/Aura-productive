// --- STATE ---
let tasks = JSON.parse(localStorage.getItem('auraTasks')) || [
    { id: 1, text: 'Welcome to Aura! 👋', date: '', time: '', completed: false, notified: false }
];
let streak = JSON.parse(localStorage.getItem('auraStreak')) || { count: 0, lastLogin: '' };
let currentFilter = 'all';

// --- ELEMENTS ---
const taskListEl = document.getElementById('task-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const timeInput = document.getElementById('time-input');
const addBtn = document.getElementById('add-btn');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Logic
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('auraTheme', 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem('auraTheme', 'dark');
            }
        });
    }

    // 2. Notification Button Listener
    const notifBtn = document.getElementById('enable-notifs-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', requestNotificationPermission);
    }
    
    // 3. Check Status on Load
    checkPermissionStatus();

    // 4. Start App Logic
    checkStreak(); 
    renderTasks();
    setInterval(checkReminders, 2000); // Check every 2 seconds
});

// --- NOTIFICATION SYSTEM (Status Bar) ---

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("Notifications are not supported on this specific browser/mode.");
        return;
    }

    Notification.requestPermission().then((permission) => {
        checkPermissionStatus();
        if (permission === "granted") {
            // Send a test notification to prove it works
            new Notification("Aura Connected", { 
                body: "Notifications are set up correctly!", 
                icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png'
            });
        } else {
            alert("Permission denied. You may need to reset site settings.");
        }
    });
}

function checkPermissionStatus() {
    const btn = document.getElementById('enable-notifs-btn');
    if(!btn) return;

    if (Notification.permission === "granted") {
        btn.textContent = "Active ✅";
        btn.classList.remove('bg-slate-200', 'dark:bg-slate-600', 'text-slate-600');
        btn.classList.add('bg-emerald-100', 'text-emerald-700', 'dark:bg-emerald-900/30', 'dark:text-emerald-400');
    } else if (Notification.permission === "denied") {
        btn.textContent = "Blocked ❌";
        btn.classList.add('bg-rose-100', 'text-rose-700');
    } else {
        btn.textContent = "Enable";
    }
}

function checkReminders() {
    const now = new Date();
    // Use manual date formatting for consistency (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;
    
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const localTime = `${hours}:${minutes}`;
    
    tasks.forEach(task => {
        if (task.date === localDate && task.time === localTime && !task.completed && !task.notified) {
            triggerAlarm(task);
        }
    });
}

function triggerAlarm(task) {
    task.notified = true;
    saveTasks();
    
    // 1. Play Sound
    const audio = document.getElementById('alarm-sound');
    if(!audio.src || audio.src === window.location.href) {
        audio.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
    }
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio waiting for interaction"));

    // 2. TRIGGER SYSTEM NOTIFICATION (Status Bar)
    if (Notification.permission === "granted") {
        try {
            const notif = new Notification("Aura Task 🔔", { 
                body: task.text, 
                icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239952.png',
                vibrate: [200, 100, 200], // Buzz the phone
                tag: 'aura-' + task.id   // Unique tag
            });
            
            notif.onclick = function() {
                window.focus();
                this.close();
            };
        } catch (e) {
            console.error("System notification failed:", e);
        }
    }
    
    renderTasks();
}

// --- STREAK SYSTEM ---
function checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (streak.lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (streak.lastLogin !== yesterdayStr && streak.lastLogin) streak.count = 0;
    }
    updateStreakUI();
}

window.incrementStreak = function() {
    const today = new Date().toISOString().split('T')[0];
    if (streak.lastLogin !== today) {
        streak.count++;
        streak.lastLogin = today;
        localStorage.setItem('auraStreak', JSON.stringify(streak));
        updateStreakUI();
        if(window.confetti) confetti({ particleCount: 30, spread: 50, origin: { y: 0.1 }, colors: ['#f97316'] });
    }
}

function updateStreakUI() {
    const el = document.getElementById('streak-count');
    if(el) el.textContent = streak.count;
}

// --- CORE FUNCTIONS ---
function renderTasks() {
    taskListEl.innerHTML = '';
    
    const filtered = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filtered.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

    filtered.forEach(task => {
        const li = document.createElement('li');
        
        // Highlight logic for recently notified tasks
        const isRinging = task.notified && !task.completed && (task.date === new Date().toISOString().split('T')[0]);
        const ringClass = isRinging 
            ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/40 animate-pulse-fast bg-indigo-50 dark:bg-slate-800' 
            : 'border border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800';

        li.className = `group flex items-center justify-between p-4 rounded-2xl transition-all ${ringClass} animate-fade-in ${task.completed ? 'opacity-60' : ''}`;
        
        let metaHtml = '';
        if (task.date || task.time) {
            metaHtml = `
                <div class="flex items-center gap-3 mt-1 text-[10px] uppercase font-bold tracking-wider ${task.completed ? 'text-slate-400' : 'text-indigo-500'}">
                    ${task.date ? `<span><i data-lucide="calendar" class="w-3 h-3 inline mb-0.5"></i> ${task.date}</span>` : ''}
                    ${task.time ? `<span><i data-lucide="clock" class="w-3 h-3 inline mb-0.5"></i> ${formatTime(task.time)}</span>` : ''}
                </div>
            `;
        }

        li.innerHTML = `
            <div class="flex items-center gap-4 flex-1 overflow-hidden">
                <button onclick="toggleTask(${task.id})" class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}">
                    ${task.completed ? '<i data-lucide="check" class="w-3.5 h-3.5 text-white"></i>' : ''}
                </button>
                <div class="flex-1 min-w-0">
                    <p class="truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}">${escapeHtml(task.text)}</p>
                    ${metaHtml}
                </div>
            </div>
            
            <div class="flex items-center gap-1 pl-2">
                ${!task.completed ? `
                <button onclick="startFocusOnTask(${task.id}, '${escapeHtml(task.text)}')" class="p-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 rounded-lg transition-colors" title="Focus on this task">
                    <i data-lucide="play" class="w-4 h-4 fill-current"></i>
                </button>` : ''}
                
                <button onclick="deleteTask(${task.id})" class="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        taskListEl.appendChild(li);
    });
    
    if(window.lucide) lucide.createIcons();
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hour, min] = timeStr.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${min} ${ampm}`;
}

function saveTasks() {
    localStorage.setItem('auraTasks', JSON.stringify(tasks));
    renderTasks();
}

function addTask(text, date, time) {
    tasks.unshift({ id: Date.now(), text, date, time, completed: false, notified: false });
    saveTasks();
}

function toggleTask(id) {
    tasks = tasks.map(t => {
        if(t.id === id) {
            const isCompleted = !t.completed;
            if(isCompleted) {
                if(window.confetti) confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#6366f1'] });
                window.incrementStreak(); 
            }
            return {...t, completed: isCompleted};
        }
        return t;
    });
    saveTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

window.startFocusOnTask = function(id, text) {
    if(window.switchView) window.switchView('focus');
    if(window.setFocusTask) window.setFocusTask(text);
}

// --- LISTENERS ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if(taskInput.value.trim()) {
        addTask(taskInput.value.trim(), dateInput.value, timeInput.value);
        taskInput.value = '';
        addBtn.disabled = true;
    }
});
taskInput.addEventListener('input', (e) => addBtn.disabled = !e.target.value.trim());

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.className = "filter-btn px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all");
        btn.className = "filter-btn active px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 transition-all";
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
