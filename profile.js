/* gamification.js */

// --- STATE ---
let userProfile = JSON.parse(localStorage.getItem('auraProfile')) || {
    name: 'Guest',
    points: 0,
    streak: 0,
    lastTaskDate: null
};

// --- DOM ELEMENTS ---
const pointsDisplay = document.getElementById('display-points');
const streakDisplay = document.getElementById('display-streak');
const navStreak = document.getElementById('streak-count');
const profileNameDisplay = document.getElementById('profile-name');

// --- LOGIC ---
window.addPoints = function(amount, reason) {
    userProfile.points += amount;
    saveProfile();
    updateProfileUI();
    if(window.syncUserToDB) window.syncUserToDB(userProfile.points, userProfile.streak);
    if(amount > 0 && window.showNotification) window.showNotification(`+${amount} Points!`, reason, 'success');
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
    updateProfileUI();
    if(window.syncUserToDB) window.syncUserToDB(userProfile.points, userProfile.streak);
};

function saveProfile() {
    localStorage.setItem('auraProfile', JSON.stringify(userProfile));
}

function updateProfileUI() {
    if(navStreak) navStreak.textContent = userProfile.streak;
    if(pointsDisplay) pointsDisplay.textContent = userProfile.points.toLocaleString();
    if(streakDisplay) streakDisplay.textContent = userProfile.streak;
    if(profileNameDisplay) profileNameDisplay.textContent = userProfile.name || 'User';
}

// --- MODAL CONTROLS (GLOBAL) ---
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

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
});
