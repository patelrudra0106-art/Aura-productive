/* shop.js - S1N Industrial Theme Update */

// --- CATALOG CONFIG ---
// We use window.SHOP_ITEMS to prevent errors if the script loads twice
window.SHOP_ITEMS = [
    {
        id: 'badge_crown',
        name: 'Crown',
        type: 'badge',
        cost: 1000,
        icon: 'crown',
        description: 'Status symbol for the elite.',
    },
    {
        id: 'badge_star',
        name: 'Star',
        type: 'badge',
        cost: 500,
        icon: 'star',
        description: 'Mark of distinction.',
    },
    {
        id: 'badge_fire',
        name: 'Flame',
        type: 'badge',
        cost: 300,
        icon: 'flame',
        description: 'For the relentless.',
    },
    {
        id: 'badge_zap',
        name: 'Voltage',
        type: 'badge',
        cost: 250,
        icon: 'zap',
        description: 'High efficiency rating.',
    },
    // --- NEW ITEM: STREAK RESTORE ---
    {
        id: 'restore_streak',
        name: 'Streak Restore',
        type: 'consumable',
        cost: 500,
        icon: 'history',
        description: 'Repair broken streak.',
    },
    {
        id: 'theme_emerald',
        name: 'Support',
        type: 'consumable', 
        cost: 2000,
        icon: 'leaf',
        description: 'Contributor Badge.',
    }
];

// --- INIT ---
window.loadShop = function() {
    const list = document.getElementById('shop-list');
    const pointsDisplay = document.getElementById('shop-points-display');
    const user = JSON.parse(localStorage.getItem('auraUser'));

    if (!list) return;
    
    // Update local Points Display in Header
    if (pointsDisplay) {
        pointsDisplay.textContent = user ? (user.points || 0).toLocaleString() : '0';
    }

    renderShopItems(list, user);
};

// --- RENDER ---
function renderShopItems(container, user) {
    container.innerHTML = '';
    
    // Ensure inventory exists safely
    const inventory = (user && user.inventory) ? user.inventory : [];
    const currentPoints = (user && user.points) ? user.points : 0;

    window.SHOP_ITEMS.forEach(item => {
        // "Owned" logic: Permanent items appear faded/disabled if you have them.
        // Consumables (like Streak Restore) are never "owned" permanently; you can always buy more.
        const isPermanentAndOwned = (item.type !== 'consumable' && inventory.includes(item.id));
        
        const canAfford = currentPoints >= item.cost;

        const div = document.createElement('div');
        // S1N Style: Bordered card, no shadow. Opacity change if owned.
        div.className = `card-s1n p-5 flex flex-col justify-between transition-all duration-300 ${isPermanentAndOwned ? 'opacity-50' : 'hover:border-main'}`;
        
        // Button Logic
        let actionBtn = '';
        
        if (isPermanentAndOwned) {
            actionBtn = `
                <button disabled class="w-full py-3 mt-4 border border-border rounded-full text-xs font-bold uppercase tracking-wider text-muted cursor-not-allowed">
                    Acquired
                </button>
            `;
        } else if (canAfford) {
            actionBtn = `
                <button onclick="buyItem('${item.id}')" class="btn-s1n w-full mt-4 text-xs uppercase tracking-wider">
                    Purchase ${item.cost}
                </button>
            `;
        } else {
            actionBtn = `
                <button disabled class="w-full py-3 mt-4 border border-border rounded-full text-xs font-bold uppercase tracking-wider text-muted cursor-not-allowed opacity-50">
                    Need ${item.cost}
                </button>
            `;
        }

        // Icon Logic: Use item.icon
        div.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-4">
                    <div class="w-10 h-10 border border-main rounded-md flex items-center justify-center text-main">
                        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                    </div>
                    ${isPermanentAndOwned ? '<i data-lucide="check" class="w-4 h-4 text-muted"></i>' : ''}
                </div>
                
                <h3 class="font-bold text-lg leading-tight tracking-tight text-main uppercase">${item.name}</h3>
                <p class="text-[10px] text-muted mt-1 uppercase tracking-wider">${item.description}</p>
            </div>
            ${actionBtn}
        `;
        container.appendChild(div);
    });

    if (window.lucide) lucide.createIcons();
}

// --- ACTIONS ---
window.buyItem = async function(itemId) {
    const item = window.SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    let user = JSON.parse(localStorage.getItem('auraUser'));
    if (!user) return alert("Please log in to purchase.");

    if ((user.points || 0) < item.cost) {
        return alert("Insufficient Credits.");
    }

    if (!confirm(`Confirm purchase of ${item.name} for ${item.cost} credits?`)) return;

    // 1. Deduct Points
    user.points -= item.cost;
    
    // 2. Handle Item Effects
    if (item.id === 'restore_streak') {
        // EFFECT: Set lastTaskDate to yesterday to bridge the gap
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        user.lastTaskDate = yesterday.toISOString().split('T')[0];
        
        if(window.showNotification) window.showNotification("Streak Repaired", "Timeline bridged. Continue protocol.", "success");
    } 
    else {
        // Normal Items (Badges) go to Inventory
        if (!user.inventory) user.inventory = [];
        if (!user.inventory.includes(item.id)) {
            user.inventory.push(item.id);
        }
    }

    // 3. Update Local Storage (User & Profile)
    let profile = JSON.parse(localStorage.getItem('auraProfile')) || {};
    profile.points = user.points;
    profile.inventory = user.inventory;
    if(user.lastTaskDate) profile.lastTaskDate = user.lastTaskDate;
    
    localStorage.setItem('auraUser', JSON.stringify(user));
    localStorage.setItem('auraProfile', JSON.stringify(profile));

    // 4. UI Updates
    window.loadShop(); 
    if(window.updateProfileUI) window.updateProfileUI(); 
    
    // 5. Success Effect
    if (item.id !== 'restore_streak' && window.showNotification) {
        window.showNotification("Transaction Complete", `${item.name} added.`, "success");
    }
    if(window.confetti) confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#000000', '#FFFFFF'] });

    // 6. Firebase Sync (Silent)
    try {
        if(window.firebase) {
            await firebase.database().ref('users/' + user.name).update({
                points: user.points,
                inventory: user.inventory || [],
                lastTaskDate: user.lastTaskDate || null
            });
        }
    } catch (error) {
        console.error("Sync error:", error);
    }
};
