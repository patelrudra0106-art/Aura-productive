/* S1N Industrial Theme (Colorful Update) */

// --- POMODORO CONFIG ---
let settings = JSON.parse(localStorage.getItem('auraTimerSettings')) || {
    work: 25,
    short: 5,
    long: 15
};

let MODES = {
    work: { time: settings.work * 60, label: 'FOCUS PROTOCOL' },
    short: { time: settings.short * 60, label: 'SHORT RECHARGE' },
    long: { time: settings.long * 60, label: 'LONG RECHARGE' }
};

// --- SOUNDS SYSTEM ---
let SOUND_URLS = {}; 
let ambientAudio = new Audio();
ambientAudio.loop = true;

// --- STATE ---
let timeLeft = MODES.work.time;
let currentMode = 'work';
let isRunning = false;
let timerInterval = null;
let stats = JSON.parse(localStorage.getItem('auraStats')) || { sessions: 0, minutes: 0 };
let history = JSON.parse(localStorage.getItem('auraHistory')) || [];
let currentFocusTask = null;

// --- ELEMENTS ---
const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const toggleBtn = document.getElementById('timer-toggle');
const resetBtn = document.getElementById('timer-reset');
const progressRing = document.getElementById('progress-ring');
const soundSelector = document.getElementById('sound-selector');
const modeBtns = {
    work: document.getElementById('mode-work'),
    short: document.getElementById('mode-short'),
    long: document.getElementById('mode-long')
};
const activeTaskDisplay = document.getElementById('active-task-display');
const focusTaskText = document.getElementById('focus-task-text');

// --- CONSTANTS ---
const CIRCLE_RADIUS = 118;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

// --- INIT ---
function initPomodoro() {
    if(progressRing) {
        progressRing.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`;
        progressRing.style.strokeDashoffset = 0;
    }
    
    updateDisplay();
    renderHistory(); 
    setupModeListeners();
    setupSoundSystem();
}

// --- SOUND SYSTEM LOGIC ---
function setupSoundSystem() {
    if(window.firebase) {
        firebase.database().ref('system/sounds').on('value', (snapshot) => {
            refreshSoundDropdown(snapshot.val());
        });
    } else {
        refreshSoundDropdown(null);
    }

    if(soundSelector) {
        soundSelector.addEventListener('change', () => {
            const val = soundSelector.value;
            localStorage.setItem('auraSoundPref', val);
            if(isRunning && val !== 'none') playAudio(val);
            else if (val === 'none') ambientAudio.pause();
        });
    }
}

function refreshSoundDropdown(customSounds) {
    if (!soundSelector) return;
    const savedPref = localStorage.getItem('auraSoundPref') || 'none';
    
    soundSelector.innerHTML = '';
    SOUND_URLS = {}; 

    const silentOpt = document.createElement('option');
    silentOpt.value = 'none';
    silentOpt.textContent = 'Silent Mode';
    soundSelector.appendChild(silentOpt);

    if (customSounds) {
        const groupCustom = document.createElement('optgroup');
        groupCustom.label = "Active Protocols";
        Object.values(customSounds).forEach(sound => {
            const id = `custom_${sound.name.replace(/\s+/g, '_')}`;
            SOUND_URLS[id] = sound.url;
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = sound.name;
            groupCustom.appendChild(opt);
        });
        soundSelector.appendChild(groupCustom);
    }

    if (SOUND_URLS[savedPref] || savedPref === 'none') {
        soundSelector.value = savedPref;
    } else {
        soundSelector.value = 'none'; 
        localStorage.setItem('auraSoundPref', 'none');
        if(isRunning) ambientAudio.pause();
    }
}

function playAudio(key) {
    if (key === 'none' || !SOUND_URLS[key]) {
        ambientAudio.pause();
        return;
    }
    if (ambientAudio.src !== SOUND_URLS[key]) {
        ambientAudio.src = SOUND_URLS[key];
        ambientAudio.volume = 0.5; 
    }
    ambientAudio.play().catch(e => console.log("Audio Blocked", e));
}

// --- CORE FUNCTIONS ---
function updateDisplay() {
    if(!timerDisplay) return;
    
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${m}:${s}`;
    
    if(progressRing) {
        const totalTime = MODES[currentMode].time;
        const offset = CIRCLE_CIRCUMFERENCE - (timeLeft / totalTime) * CIRCLE_CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = offset;
    }
    
    document.title = isRunning ? `[${m}:${s}] FOCUS` : 'AURA.';
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    
    const sound = soundSelector ? soundSelector.value : 'none';
    playAudio(sound);

    toggleBtn.innerHTML = '<i data-lucide="pause" class="w-5 h-5 fill-current"></i> Pause';
    toggleBtn.classList.add('opacity-90'); 
    
    if(window.lucide) lucide.createIcons();
    timerStatus.textContent = 'EXECUTING';
    timerStatus.classList.add('animate-pulse', 'text-main');
    
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    ambientAudio.pause();
    
    toggleBtn.innerHTML = '<i data-lucide="play" class="w-5 h-5 fill-current"></i> Start';
    toggleBtn.classList.remove('opacity-90');
    
    timerStatus.textContent = 'PAUSED';
    timerStatus.classList.remove('animate-pulse', 'text-main');
    
    if(window.lucide) lucide.createIcons();
}

function resetTimer() {
    pauseTimer();
    timeLeft = MODES[currentMode].time;
    timerStatus.textContent = 'READY';
    updateDisplay();
}

function completeTimer() {
    pauseTimer();
    
    // --- GAMIFICATION: COLORFUL CONFETTI ---
    if(window.confetti) {
        confetti({ 
            particleCount: 150, 
            spread: 100, 
            origin: { y: 0.6 }, 
            colors: ['#FF4500', '#FFD700', '#32CD32', '#00BFFF', '#9400D3', '#FF1493'] 
        });
    }
    
    const alarm = document.getElementById('alarm-sound');
    if(alarm) alarm.play().catch(()=>{});

    if(currentMode === 'work') {
        const minutes = MODES.work.time / 60;
        const earnedPoints = Math.floor(minutes * 2); 
        
        if (window.triggerJuice && timerDisplay) {
            const card = timerDisplay.closest('.card-s1n');
            window.triggerJuice(card || timerDisplay, earnedPoints);
        }

        if (window.showNotification) {
            window.showNotification("SESSION COMPLETE", `Protocol finished. +${earnedPoints} Credits.`, "success"); 
        }

        if(window.addPoints) window.addPoints(earnedPoints, "Focus Session");
        
        saveStats(minutes);
        
        if(window.checkAchievements) window.checkAchievements();
        
        addToHistory(minutes, currentFocusTask || 'Focus Session');
    } else {
        if (window.showNotification) {
            window.showNotification("BREAK OVER", "Return to focus.", "success"); 
        }
    }
    
    timerStatus.textContent = 'COMPLETE';
}

window.openSettings = function() {
    const modal = document.getElementById('settings-modal');
    if(modal) {
        modal.classList.remove('hidden');
        document.getElementById('setting-focus').value = settings.work;
        document.getElementById('setting-short').value = settings.short;
        document.getElementById('setting-long').value = settings.long;
    }
};

window.closeSettings = function() {
    document.getElementById('settings-modal').classList.add('hidden');
};

window.saveSettings = function() {
    const newWork = parseInt(document.getElementById('setting-focus').value) || 25;
    const newShort = parseInt(document.getElementById('setting-short').value) || 5;
    const newLong = parseInt(document.getElementById('setting-long').value) || 15;
    
    settings = { work: newWork, short: newShort, long: newLong };
    localStorage.setItem('auraTimerSettings', JSON.stringify(settings));
    
    MODES.work.time = newWork * 60;
    MODES.short.time = newShort * 60;
    MODES.long.time = newLong * 60;
    
    resetTimer();
    closeSettings();
};

window.setFocusTask = function(taskText) {
    currentFocusTask = taskText;
    if(focusTaskText) focusTaskText.textContent = taskText;
    if(activeTaskDisplay) activeTaskDisplay.classList.remove('hidden');
    if(window.switchView) window.switchView('focus');
    setMode('work');
};

window.clearFocusTask = function() {
    currentFocusTask = null;
    if(activeTaskDisplay) activeTaskDisplay.classList.add('hidden');
};

function saveStats(minutesToAdd) {
    stats.sessions += 1;
    stats.minutes += minutesToAdd;
    localStorage.setItem('auraStats', JSON.stringify(stats));
    
    const user = JSON.parse(localStorage.getItem('auraUser'));
    if(user) {
        user.totalSessions = stats.sessions;
        user.totalMinutes = stats.minutes;
        localStorage.setItem('auraUser', JSON.stringify(user));
    }
}

function addToHistory(duration, label) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry = {
        id: Date.now(),
        date: now.toLocaleDateString(),
        time: timeString,
        duration: duration,
        label: label
    };
    history.unshift(entry);
    if(history.length > 30) history.pop();
    localStorage.setItem('auraHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {}

window.clearHistory = function() {
    if(confirm('Purge session logs?')) {
        history = [];
        localStorage.setItem('auraHistory', JSON.stringify(history));
        renderHistory();
    }
}

function setMode(mode) {
    resetTimer();
    currentMode = mode;
    timeLeft = MODES[mode].time;
    
    Object.keys(modeBtns).forEach(k => {
        const btn = modeBtns[k];
        if(!btn) return;
        
        if(k === mode) {
            btn.className = "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-main bg-main text-body shadow-sm transition-colors";
        } else {
            btn.className = "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-transparent text-muted hover:border-border transition-colors";
        }
    });
    updateDisplay();
}

function setupModeListeners() {
    if(modeBtns.work) modeBtns.work.addEventListener('click', () => setMode('work'));
    if(modeBtns.short) modeBtns.short.addEventListener('click', () => setMode('short'));
    if(modeBtns.long) modeBtns.long.addEventListener('click', () => setMode('long'));
}

if(toggleBtn) toggleBtn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
if(resetBtn) resetBtn.addEventListener('click', resetTimer);

initPomodoro();
