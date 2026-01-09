/* auth.js */

// --- STATE ---
let currentUser = JSON.parse(localStorage.getItem('auraUser')) || null;
let userDB = JSON.parse(localStorage.getItem('auraDatabase')) || []; 

// --- DOM ELEMENTS ---
const authOverlay = document.getElementById('auth-overlay');
const mainApp = document.getElementById('main-app'); // New wrapper
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit');
const toggleAuthText = document.getElementById('toggle-auth-mode');

// Inputs
const nameInput = document.getElementById('auth-name');
const passInput = document.getElementById('auth-pass');
const confirmPassField = document.getElementById('field-confirm-pass');
const confirmPassInput = document.getElementById('auth-confirm-pass');

let isLoginMode = true;

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        // Logged In: Show App
        if(mainApp) mainApp.classList.remove('hidden');
        if(authOverlay) authOverlay.classList.add('hidden');
        syncProfileFromDB();
    } else {
        // Logged Out: Show Auth Only
        if(authOverlay) authOverlay.classList.remove('hidden');
        if(mainApp) mainApp.classList.add('hidden');
    }
});

// --- AUTH UI LOGIC ---
window.toggleAuthMode = function() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authTitle.textContent = "Welcome to Aura";
        authSubmitBtn.textContent = "Log In";
        toggleAuthText.innerHTML = "New here? <span class='text-indigo-600 font-bold cursor-pointer hover:underline' onclick='toggleAuthMode()'>Create Account</span>";
        confirmPassField.classList.add('hidden');
    } else {
        authTitle.textContent = "Join Contest";
        authSubmitBtn.textContent = "Sign Up";
        toggleAuthText.innerHTML = "Have an account? <span class='text-indigo-600 font-bold cursor-pointer hover:underline' onclick='toggleAuthMode()'>Log In</span>";
        confirmPassField.classList.remove('hidden');
    }
};

// --- AUTH CORE LOGIC ---
window.handleAuth = async function(e) {
    e.preventDefault();
    const name = nameInput.value.trim();
    const password = passInput.value;
    const confirmPass = confirmPassInput.value;

    if (!name || !password) return alert("Please fill in all fields");

    authSubmitBtn.disabled = true;
    authSubmitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto"></i>';
    if(window.lucide) lucide.createIcons();

    await new Promise(r => setTimeout(r, 600)); // Fake delay

    try {
        if (isLoginMode) {
            // LOGIN
            const user = userDB.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
            if (user) {
                loginUser(user);
            } else {
                throw new Error("Invalid Username or Password");
            }
        } else {
            // SIGNUP
            if (password !== confirmPass) throw new Error("Passwords do not match");
            if (userDB.find(u => u.name.toLowerCase() === name.toLowerCase())) throw new Error("Username already taken");

            const newUser = {
                id: 'user_' + Date.now(),
                name: name,
                password: password,
                points: 0,
                streak: 0,
                joinDate: new Date().toLocaleDateString()
            };

            userDB.push(newUser);
            saveDB();
            loginUser(newUser);
        }
    } catch (error) {
        alert(error.message);
        authSubmitBtn.disabled = false;
        authSubmitBtn.textContent = isLoginMode ? "Log In" : "Sign Up";
    }
};

function loginUser(user) {
    currentUser = user;
    localStorage.setItem('auraUser', JSON.stringify(currentUser));
    
    // Sync profile data
    const profile = { name: user.name, points: user.points, streak: user.streak, lastTaskDate: null };
    localStorage.setItem('auraProfile', JSON.stringify(profile));
    
    // UI Switch
    authOverlay.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    // Just refresh to clean state
    window.location.reload(); 
}

window.logout = function() {
    if(confirm("Log out of " + currentUser.name + "?")) {
        localStorage.removeItem('auraUser');
        window.location.reload();
    }
};

window.deleteAccount = function() {
    if(!currentUser) return;
    
    const confirmDelete = confirm(`Are you sure you want to delete the account "${currentUser.name}"? This will remove your ranking from the contest forever.`);
    
    if(confirmDelete) {
        // 1. Remove user from global DB
        userDB = userDB.filter(u => u.name !== currentUser.name);
        saveDB();
        
        // 2. Clear Session
        localStorage.removeItem('auraUser');
        localStorage.removeItem('auraProfile');
        
        // 3. Reload
        window.location.reload();
    }
};

window.syncUserToDB = function(newPoints, newStreak) {
    if (!currentUser) return;
    const index = userDB.findIndex(u => u.name === currentUser.name);
    if (index !== -1) {
        userDB[index].points = newPoints;
        userDB[index].streak = newStreak;
        saveDB();
    }
};

function saveDB() { localStorage.setItem('auraDatabase', JSON.stringify(userDB)); }

function syncProfileFromDB() {
    userDB = JSON.parse(localStorage.getItem('auraDatabase')) || [];
    const freshData = userDB.find(u => u.name === currentUser.name);
    if(freshData) {
        let profile = JSON.parse(localStorage.getItem('auraProfile')) || {};
        profile.points = freshData.points;
        profile.streak = freshData.streak;
        localStorage.setItem('auraProfile', JSON.stringify(profile));
    }
}
