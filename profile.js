/* profile.js - S1N Identity Management (Settings Integrated) */

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
    if(window.checkAchievements) window.checkAchievements();
    updateProfileUI();
    
    if(window.syncUserToDB) window.syncUserToDB(userProfile.points, userProfile.streak, userProfile.monthlyPoints, userProfile.lastActiveMonth);
};

function saveProfile() {
    localStorage.setItem('auraProfile', JSON.stringify(userProfile));
}

function updateProfileUI() {
    if(navStreak) navStreak.textContent = userProfile.streak;
    if(pointsDisplay) pointsDisplay.textContent = userProfile.points.toLocaleString();
    if(streakDisplay) streakDisplay.textContent = userProfile.streak;
    if(profileNameDisplay) profileNameDisplay.textContent = userProfile.name || 'User';

    renderProfileBadges();
    
    if(window.renderAchievementsList) window.renderAchievementsList('profile-achievements');
}

// --- BADGE RENDERING ---
function renderProfileBadges() {
    const user = JSON.parse(localStorage.getItem('auraUser'));
    const inventory = (user && user.inventory) ? user.inventory : [];
    
    const badgeContainer = document.getElementById('profile-badges');
    if (!badgeContainer) return;

    if (inventory.length === 0) {
        badgeContainer.innerHTML = '';
        badgeContainer.className = 'hidden'; 
        return;
    }

    badgeContainer.className = "grid grid-cols-5 gap-2 mb-4 justify-items-center";

    const badgeMap = {
        'badge_crown': 'crown', 'badge_star': 'star', 'badge_fire': 'flame', 
        'badge_zap': 'zap', 'theme_emerald': 'leaf'
    };

    badgeContainer.innerHTML = '';
    
    inventory.forEach(itemId => {
        const icon = badgeMap[itemId] || 'award';
        const badge = document.createElement('div');
        badge.className = `w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted hover:text-main hover:border-main transition-colors cursor-help bg-card`;
        badge.title = itemId;
        badge.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5"></i>`;
        badgeContainer.appendChild(badge);
    });

    if(window.lucide) lucide.createIcons();
}

// --- MODAL CONTROLS (Simplfied) ---
window.openAccount = function() {
    const modal = document.getElementById('account-modal');
    if(modal) {
        modal.classList.remove('hidden');
        updateProfileUI();
    }
};

window.closeAccount = function() {
    const modal = document.getElementById('account-modal');
    if(modal) modal.classList.add('hidden');
};

// --- DATA EXPORT (Used by Settings) ---
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
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    if(window.showNotification) window.showNotification("Backup Complete", "Data package downloaded.", "success");
};

// --- PASSWORD MANAGEMENT (Used by Settings) ---
window.toggleChangePass = function() {
    const form = document.getElementById('change-pass-form');
    if(form) {
        form.classList.toggle('hidden');
        // Clear fields on toggle
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

document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
});
