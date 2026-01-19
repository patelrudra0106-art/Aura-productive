/* achievements.js - S1N Auto-Unlock System */

// --- CONFIGURATION ---
window.ACHIEVEMENT_DATA = [
    { 
        id: 'ach_first_blood', 
        title: 'Initiation', 
        desc: 'Complete your first protocol.', 
        icon: 'check', 
        reward: 50,
        condition: (u) => (u.totalTasks || 0) >= 1 
    },
    { 
        id: 'ach_warmup', 
        title: 'Warming Up', 
        desc: 'Complete 10 protocols.', 
        icon: 'list-checks', 
        reward: 100,
        condition: (u) => (u.totalTasks || 0) >= 10 
    },
    { 
        id: 'ach_focus_novice', 
        title: 'Deep Work', 
        desc: 'Finish a focus session.', 
        icon: 'brain-circuit', 
        reward: 50,
        condition: (u) => (u.totalSessions || 0) >= 1 
    },
    { 
        id: 'ach_streak_3', 
        title: 'Momentum', 
        desc: 'Reach a 3-day streak.', 
        icon: 'flame', 
        reward: 150,
        condition: (u) => (u.streak || 0) >= 3 
    },
    { 
        id: 'ach_streak_7', 
        title: 'Unstoppable', 
        desc: 'Reach a 7-day streak.', 
        icon: 'zap', 
        reward: 500,
        condition: (u) => (u.streak || 0) >= 7 
    },
    { 
        id: 'ach_rich', 
        title: 'Capitalist', 
        desc: 'Amass 1,000 Credits.', 
        icon: 'gem', 
        reward: 200,
        condition: (u) => (u.points || 0) >= 1000 
    }
];

// --- CORE LOGIC ---
window.checkAchievements = function() {
    const user = JSON.parse(localStorage.getItem('auraUser'));
    if(!user) return;
    
    // Initialize array if missing
    if(!user.unlockedAchievements) user.unlockedAchievements = [];
    
    let hasChanges = false;
    let earnedTotal = 0;

    window.ACHIEVEMENT_DATA.forEach(ach => {
        // If not already unlocked...
        if(!user.unlockedAchievements.includes(ach.id)) {
            // Check condition
            if(ach.condition(user)) {
                // UNLOCK!
                user.unlockedAchievements.push(ach.id);
                
                // Add Reward
                user.points = (user.points || 0) + ach.reward;
                earnedTotal += ach.reward;
                
                hasChanges = true;
                
                // Notify User
                if(window.showNotification) {
                    window.showNotification("ACHIEVEMENT UNLOCKED", `${ach.title} (+${ach.reward} Credits)`, "success");
                }
                
                // Visual Celebration
                if(window.confetti) {
                    // Gold & White Burst
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FCD34D', '#FFFFFF'] }); 
                }
            }
        }
    });

    if(hasChanges) {
        // Save Local
        localStorage.setItem('auraUser', JSON.stringify(user));
        
        // Save Profile (for immediate UI updates)
        let profile = JSON.parse(localStorage.getItem('auraProfile')) || {};
        profile.points = user.points;
        localStorage.setItem('auraProfile', JSON.stringify(profile));

        // Update UI
        if(window.updateProfileUI) window.updateProfileUI();
        if(window.loadShop) window.loadShop();

        // Sync to Firebase
        if(window.firebase) {
            firebase.database().ref('users/' + user.name).update({
                points: user.points,
                unlockedAchievements: user.unlockedAchievements
            });
        }
    }
};

// --- RENDER LOGIC (For Profile Modal) ---
window.renderAchievementsList = function(containerId) {
    const container = document.getElementById(containerId);
    if(!container) return;

    const user = JSON.parse(localStorage.getItem('auraUser'));
    const unlocked = (user && user.unlockedAchievements) ? user.unlockedAchievements : [];
    
    container.innerHTML = '';
    
    // Add Header
    container.innerHTML = `<h4 class="text-[10px] font-bold uppercase text-muted tracking-widest mb-3 mt-6 border-t border-border pt-4">Trophies (${unlocked.length}/${window.ACHIEVEMENT_DATA.length})</h4>`;
    
    const grid = document.createElement('div');
    grid.className = "grid grid-cols-4 gap-2";

    window.ACHIEVEMENT_DATA.forEach(ach => {
        const isUnlocked = unlocked.includes(ach.id);
        
        const div = document.createElement('div');
        // Style: If unlocked = Solid Main Color. If locked = Transparent/Faded.
        // Added cursor-pointer so user knows it's clickable
        const bgClass = isUnlocked ? 'bg-main text-body border-main' : 'bg-transparent text-muted border-border opacity-50 hover:opacity-100';
        
        div.className = `aspect-square rounded-xl border flex flex-col items-center justify-center p-1 text-center transition-all cursor-pointer ${bgClass}`;
        
        // CLICK ACTION: Show Alert with Details
        div.onclick = () => {
             alert(`🏆 ${ach.title.toUpperCase()}\n\nOBJECTIVE:\n${ach.desc}\n\nREWARD:\n+${ach.reward} Credits\n\nSTATUS:\n${isUnlocked ? "UNLOCKED" : "LOCKED"}`);
        };
        
        // RENDER: Always show title (Removed '???' and blur)
        // We use split(' ')[0] to keep the visible name short in the box (e.g. "Deep" instead of "Deep Work"), 
        // but the click shows the full name.
        div.innerHTML = `
            <i data-lucide="${isUnlocked ? ach.icon : 'lock'}" class="w-4 h-4 mb-1"></i>
            <span class="text-[8px] font-bold uppercase leading-none overflow-hidden text-ellipsis w-full px-1">${ach.title}</span>
        `;
        
        grid.appendChild(div);
    });

    container.appendChild(grid);
    if(window.lucide) lucide.createIcons();
};
