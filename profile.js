/* profile.js - Strict Streak + Working Profile Button */

// --- HELPER: GET LOCAL DATE (YYYY-MM-DD) ---
function getLocalToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- HELPER: CALCULATE DAYS PASSED ---
function getDaysDifference(dateStr1, dateStr2) {
    if (!dateStr1 || !dateStr2) return 0;
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    d1.setHours(0,0,0,0); 
    d2.setHours(0,0,0,0);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// --- STATE ---
let userProfile = JSON.parse(localStorage.getItem('auraProfile')) || {
    name: 'Guest',
    points: 0,
    monthlyPoints: 0,
    coins: 0,
    inventory: [],
    streak: 0,
    lastTaskDate: null, 
    lastActiveMonth: new Date().toISOString().slice(0, 7)
};

// --- UI UPDATER ---
window.updateProfileUI = function() {
    const navStreak = document.getElementById('streak-count');
    const pointsDisplay = document.getElementById('display-points');
    const streakDisplay = document.getElementById('display-streak');
    const profileNameDisplay = document.getElementById('profile-name');

    // Update Numbers
    if(pointsDisplay) pointsDisplay.textContent = userProfile.points.toLocaleString();
    if(streakDisplay) streakDisplay.textContent = userProfile.streak;
    if(navStreak) navStreak.textContent = userProfile.streak;

    // Visual State: Gray vs Orange Flame
    const today = getLocalToday();
    const isDoneToday = userProfile.lastTaskDate === today;
    const navContainer = navStreak ? navStreak.parentElement : null;

    if (navContainer) {
        if (isDoneToday) {
            // Active (Done today)
            navContainer.className = "flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full border border-orange-200 dark:border-orange-500/50 transition-colors cursor-pointer";
            navStreak.classList.add('text-orange-600', 'dark:text-orange-400');
            navStreak.classList.remove('text-slate-500');
        } else {
            // Pending (Not done today)
            navContainer.className = "flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 transition-colors opacity-80 cursor-pointer";
            navStreak.classList.remove('text-orange-600', 'dark:text-orange-400');
            navStreak.classList.add('text-slate-500', 'dark:text-slate-400');
        }
    }

    // Name Cosmetics (Gold/Pro)
    if(profileNameDisplay) {
        let nameHtml = userProfile.name || 'User';
        const inv = userProfile.inventory || [];
        
        if(inv.includes('theme_gold')) {
            profileNameDisplay.className = "text-center font-bold text-lg text-amber-500 drop-shadow-sm animate-pulse";
        } else {
            profileNameDisplay.className = "text-center font-bold text-lg text-slate-700 dark:text-slate-200";
        }

        if(inv.includes('badge_pro')) {
            nameHtml += ` <span class="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold align-middle ml-1 shadow-sm shadow-indigo-500/50">PRO</span>`;
        }
        profileNameDisplay.innerHTML = nameHtml;
    }
};

window.saveProfile = function() {
    localStorage.setItem('auraProfile', JSON.stringify(userProfile));
};

// --- CORE FUNCTIONS ---

window.updateStreak = function() {
    const today = getLocalToday();
    const lastDate = userProfile.lastTaskDate;

    if (lastDate === today) return; // Already done today

    const diff = getDaysDifference(today, lastDate);

    // If diff is 1 (Yesterday) OR streak is 0 (First task), increment
    // If diff > 1, the initialization logic (bottom of file) already reset it to 0
    if (diff === 1 || userProfile.streak === 0) {
        userProfile.streak += 1;
        triggerStreakAnimation();
    } else {
        userProfile.streak = 1; // Start fresh
    }

    userProfile.lastTaskDate = today;
    window.saveProfile();
    window.updateProfileUI();
    
    if(window.syncUserToDB) syncData();
};

window.addPoints = function(amount, reason) {
    userProfile.points += amount;
    // Earn Coins
    if (amount > 0) userProfile.coins = (userProfile.coins || 0) + amount;

    // Monthly Reset Logic
    const today = getLocalToday();
    const currentMonth = today.slice(0, 7);
    if (userProfile.lastActiveMonth !== currentMonth) {
        userProfile.monthlyPoints = 0;
        userProfile.lastActiveMonth = currentMonth;
    }
    userProfile.monthlyPoints = (userProfile.monthlyPoints || 0) + amount;

    window.saveProfile();
    window.updateProfileUI();
    if(window.syncUserToDB) syncData();
    if(amount > 0 && window.showNotification) window.showNotification(`+${amount} Pts`, reason, 'success');
};

function syncData() {
    if(window.syncUserToDB) {
        window.syncUserToDB(
            userProfile.points, 
            userProfile.streak, 
            userProfile.monthlyPoints, 
            userProfile.lastActiveMonth, 
            userProfile.coins, 
            userProfile.inventory
        );
    }
}

function triggerStreakAnimation() {
    const navStreakIcon = document.querySelector('#streak-count')?.previousElementSibling; 
    if(navStreakIcon) {
        navStreakIcon.classList.add('animate-bounce', 'text-orange-600');
        setTimeout(() => navStreakIcon.classList.remove('animate-bounce'), 1000);
    }
    if(window.confetti) confetti({ particleCount: 30, spread: 50, origin: { y: 0.1 }, colors: ['#f97316'] });
}

function useStreakFreeze() {
    const index = userProfile.inventory.indexOf('streak_freeze');
    if (index > -1) {
        userProfile.inventory.splice(index, 1);
        
        // Trick logic into thinking task was done yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        // Format manually to YYYY-MM-DD
        const y = yesterday.getFullYear();
        const m = String(yesterday.getMonth() + 1).padStart(2, '0');
        const d = String(yesterday.getDate()).padStart(2, '0');
        userProfile.lastTaskDate = `${y}-${m}-${d}`;

        if(window.showNotification) {
            setTimeout(() => window.showNotification("Streak Saved! ❄️", "A Streak Freeze was used automatically.", "info"), 1500);
        }
    }
}

// --- MODAL & SETTINGS FUNCTIONS ---
// Defined BEFORE usage to ensure buttons work
window.openAccount = function() { 
    const modal = document.getElementById('account-modal');
    if(modal) {
        modal.classList.remove('hidden'); 
        window.updateProfileUI(); 
    }
};

window.closeAccount = function() { 
    document.getElementById('account-modal').classList.add('hidden'); 
    document.getElementById('change-pass-form').classList.add('hidden'); 
};

window.toggleChangePass = function() { 
    document.getElementById('change-pass-form').classList.toggle('hidden'); 
    document.getElementById('cp-old').value = ''; 
    document.getElementById('cp-new').value = ''; 
};

window.submitChangePass = async function() {
    const oldPass = document.getElementById('cp-old').value;
    const newPass = document.getElementById('cp-new').value;
    const user = JSON.parse(localStorage.getItem('auraUser'));
    if(!user || !oldPass || !newPass) return alert("Invalid inputs.");
    const btn = document.getElementById('cp-btn');
    btn.textContent = "Updating...";
    try {
        const snap = await firebase.database().ref('users/' + user.name).once('value');
        if (snap.val().password !== oldPass) throw new Error("Wrong password.");
        await firebase.database().ref('users/' + user.name).update({ password: newPass });
        user.password = newPass;
        localStorage.setItem('auraUser', JSON.stringify(user));
        alert("Success!");
        window.toggleChangePass();
    } catch(e) { alert(e.message); }
    btn.textContent = "Update Password";
};

// --- INITIALIZATION LOGIC ---
// Runs after everything is defined
document.addEventListener('DOMContentLoaded', () => {
    // 1. Make the Streak Badge Clickable (New Feature)
    const streakEl = document.getElementById('streak-count');
    if (streakEl && streakEl.parentElement) {
        streakEl.parentElement.onclick = window.openAccount;
        streakEl.parentElement.setAttribute('title', 'View Profile & Stats');
    }

    // 2. Check Streak Health
    const today = getLocalToday();
    const lastDate = userProfile.lastTaskDate;

    if (lastDate) {
        const diff = getDaysDifference(today, lastDate);
        
        // Strict Check: if diff > 1 (missed yesterday), break streak
        if (diff > 1) {
            if (userProfile.inventory && userProfile.inventory.includes('streak_freeze')) {
                useStreakFreeze();
            } else {
                console.log("Streak broken! Resetting to 0.");
                userProfile.streak = 0;
            }
        }
    }

    // 3. Init Coins if missing
    if (userProfile.coins === undefined) {
        userProfile.coins = Math.floor(userProfile.points / 2);
        userProfile.inventory = [];
    }

    window.saveProfile();
    window.updateProfileUI();
});
