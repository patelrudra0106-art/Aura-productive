/* profile.js - S1N Industrial Theme Update (With Data Export) */

// --- STATE ---
let userProfile = JSON.parse(localStorage.getItem('auraProfile')) || {
    name: 'Guest',
    points: 0,        
    monthlyPoints: 0, 
    streak: 0,
    lastTaskDate: null,
    lastActiveMonth: new Date().toISOString().slice(0, 7) 
};

// --- CHECK RESET LOGIC ---
(function checkTimeResets() {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); 

    const savedMonth = userProfile.lastActiveMonth || "";
    let hasChanged = false;

    // Monthly Reset (For League)
    if (savedMonth !== currentMonth) {
        userProfile.monthlyPoints = 0;
        userProfile.lastActiveMonth = currentMonth;
        hasChanged = true;
    }

    if (hasChanged) {
        saveProfile();
    }
})();

// --- DOM ELEMENTS ---
const pointsDisplay = document.getElementById('display-points');
const streakDisplay = document.getElementById('display-streak');
const navStreak = document.getElementById('streak-count');
const profileNameDisplay = document.getElementById('profile-name');

// --- LOGIC ---
window.addPoints = function(amount, reason) {
    userProfile.points += amount;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (userProfile.lastActiveMonth !== currentMonth) {
        userProfile.monthlyPoints = 0;
        userProfile.lastActiveMonth = currentMonth;
    }
    userProfile.monthlyPoints = (userProfile.monthlyPoints || 0) + amount;

    saveProfile();
    
    // --- TRIGGER ACHIEVEMENT CHECK ---
    if(window.checkAchievements) window.checkAchievements();
    
    updateProfileUI();
    
    if(window.syncUserToDB) window.syncUserToDB(userProfile.points, userProfile.streak, userProfile.monthlyPoints, userProfile.lastActiveMonth);
    
    if(amount > 0 && window.showNotification) window.showNotification(`CREDITS +${amount}`, reason, 'success');
};

window.updateStreak = function() {
    const today = new Date().toISOString().split('T')[0];
    if (userProfile.lastTaskDate === today) return; 

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (userProfile.lastTaskDate === yesterdayStr) {
        userProfile.streak += 1;
    } else {
        userProfile.streak = 1;
    }

    userProfile.lastTaskDate = today;
    saveProfile();
    
    // --- TRIGGER ACHIEVEMENT CHECK ---
    if(window.checkAchievements) window.checkAchievements();

    updateProfileUI();
    
    if(window.syncUserToDB) window.syncUserToDB(userProfile.points, userProfile.streak, userProfile.monthlyPoints, userProfile.lastActiveMonth);
};

function saveProfile() {
    localStorage.setItem('auraProfile', JSON.stringify(userProfile));
}

function updateProfileUI() {
    if(navStreak) navStreak.textContent = userProfile.streak;
    
    // ANIMATED STATS
    if(pointsDisplay) {
        pointsDisplay.innerHTML = `<span class="animate-title inline-block">${userProfile.points.toLocaleString()}</span>`;
    }
    
    if(streakDisplay) {
        streakDisplay.innerHTML = `<span class="animate-title stagger-1 inline-block">${userProfile.streak}</span>`;
    }
    
    if(profileNameDisplay) {
        const name = userProfile.name || 'User';
        profileNameDisplay.innerHTML = `<span class="animate-title stagger-1 inline-block">${name}</span>`;
    }

    renderProfileBadges();
    
    // --- RENDER ACHIEVEMENTS ---
    if(window.renderAchievementsList) window.renderAchievementsList('profile-achievements');
}

// --- BADGE RENDERING (Fixed Grid Layout) ---
function renderProfileBadges() {
    const user = JSON.parse(localStorage.getItem('auraUser'));
    const inventory = (user && user.inventory) ? user.inventory : [];
    
    // Target the specific container ID we added in index.html
    const badgeContainer = document.getElementById('profile-badges');
    if (!badgeContainer) return;

    if (inventory.length === 0) {
        badgeContainer.innerHTML = '';
        badgeContainer.className = 'hidden'; // Hide container if empty to save space
        return;
    }

    // Force Grid Layout: 5 columns, centered items
    badgeContainer.className = "grid grid-cols-5 gap-2 mb-4 justify-items-center";

    // Icon Lookup
    const badgeMap = {
        'badge_crown': 'crown', 
        'badge_star': 'star', 
        'badge_fire': 'flame', 
        'badge_zap': 'zap', 
        'theme_emerald': 'leaf'
    };

    badgeContainer.innerHTML = '';
    
    inventory.forEach((itemId, index) => {
        const icon = badgeMap[itemId] || 'award';
        
        const badge = document.createElement('div');
        // Fixed square size (w-10 h-10) to prevent full-width stacking
        // Added animate-slide-in for staggered badge entry
        badge.className = `w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted hover:text-main hover:border-main transition-colors cursor-help bg-card animate-slide-in`;
        badge.style.animationDelay = `${index * 50}ms`;
        
        badge.title = itemId;
        badge.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5"></i>`;
        badgeContainer.appendChild(badge);
    });

    if(window.lucide) lucide.createIcons();
}

// --- MODAL CONTROLS ---
window.openAccount = function() {
    const modal = document.getElementById('account-modal');
    if(modal) {
        // --- DYNAMICALLY INJECT EXPORT BUTTON IF MISSING ---
        // This ensures the button appears without editing index.html
        const passBtn = document.querySelector('button[onclick="toggleChangePass()"]');
        if (passBtn && passBtn.parentNode && !document.getElementById('btn-export-data')) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'btn-export-data';
            exportBtn.className = "w-full py-2.5 mb-2 border border-border rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-input transition-colors text-main";
            exportBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i data-lucide="download" class="w-3 h-3"></i> Backup Data</span>';
            exportBtn.onclick = window.exportUserData;
            
            // Insert before the Change Password button
            passBtn.parentNode.insertBefore(exportBtn, passBtn);
            if(window.lucide) lucide.createIcons();
        }

        modal.classList.remove('hidden');
        updateProfileUI();
    }
};

window.closeAccount = function() {
    const modal = document.getElementById('account-modal');
    const passForm = document.getElementById('change-pass-form');
    // Hide password form when closing to reset state
    if(passForm) passForm.classList.add('hidden');
    if(modal) modal.classList.add('hidden');
};

// --- DATA EXPORT (OPTION C) ---
window.exportUserData = function() {
    const user = JSON.parse(localStorage.getItem('auraUser'));
    if (!user) return alert("No identity found.");

    const exportData = {
        _generated: new Date().toISOString(),
        identity: user,
        profile: JSON.parse(localStorage.getItem('auraProfile')),
        stats: JSON.parse(localStorage.getItem('auraStats')),
        settings: JSON.parse(localStorage.getItem('auraTimerSettings')),
        history: JSON.parse(localStorage.getItem('auraHistory')),
        tasks: {}
    };

    // Grab tasks specific to user
    const taskKey = `auraTasks_${user.name}`;
    if (localStorage.getItem(taskKey)) {
        exportData.tasks = JSON.parse(localStorage.getItem(taskKey));
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `S1N_BACKUP_${user.name}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    if(window.showNotification) window.showNotification("Backup Complete", "Data package downloaded.", "success");
};

// --- PASSWORD RESET LOGIC ---
window.toggleChangePass = function() {
    const form = document.getElementById('change-pass-form');
    if(form) {
        form.classList.toggle('hidden');
        const old = document.getElementById('cp-old');
        const newP = document.getElementById('cp-new');
        if(old) old.value = '';
        if(newP) newP.value = '';
    }
};

window.submitChangePass = async function() {
    const oldPassInput = document.getElementById('cp-old');
    const newPassInput = document.getElementById('cp-new');
    const btn = document.getElementById('cp-btn');
    
    const oldPass = oldPassInput.value;
    const newPass = newPassInput.value;
    
    if(!oldPass || !newPass) return alert("All fields required.");
    if(newPass.length < 4) return alert("Password too short.");
    
    const user = JSON.parse(localStorage.getItem('auraUser'));
    if(!user) return alert("Authentication error.");

    const originalText = btn.textContent;
    btn.textContent = "Updating...";
    btn.disabled = true;

    try {
        const snapshot = await firebase.database().ref('users/' + user.name).once('value');
        const dbUser = snapshot.val();
        
        if (!dbUser || dbUser.password !== oldPass) {
            throw new Error("Incorrect current password.");
        }

        await firebase.database().ref('users/' + user.name).update({
            password: newPass
        });

        user.password = newPass;
        localStorage.setItem('auraUser', JSON.stringify(user));

        alert("Credentials Updated.");
        window.toggleChangePass(); 
        
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
});
