/* shop.js */

// --- CONFIG ---
const SHOP_ITEMS = [
    {
        id: 'streak_freeze',
        name: 'Streak Freeze',
        description: 'Protects your streak for one day if you miss a task.',
        price: 200,
        icon: 'snowflake',
        type: 'consumable', // Consumed on use/trigger
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
    },
    {
        id: 'badge_pro',
        name: 'Pro Badge',
        description: 'Adds a "PRO" badge next to your name.',
        price: 1000,
        icon: 'award',
        type: 'cosmetic', // Permanent
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
        id: 'theme_gold',
        name: 'Golden Name',
        description: 'Makes your profile name shine in Gold.',
        price: 2500,
        icon: 'crown',
        type: 'cosmetic',
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
        id: 'potion_xp',
        name: 'Double Points (1h)',
        description: 'Earn 2x points for the next hour. (Coming Soon)',
        price: 500,
        icon: 'flask-conical',
        type: 'consumable',
        disabled: true,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
];

// --- RENDER ---
window.initShop = function() {
    renderShopBalance();
    renderShopItems();
};

function renderShopBalance() {
    const balanceEl = document.getElementById('shop-balance');
    // Accesses global userProfile from profile.js
    if(balanceEl && typeof userProfile !== 'undefined') {
        balanceEl.textContent = (userProfile.coins || 0).toLocaleString();
    }
}

function renderShopItems() {
    const list = document.getElementById('shop-list');
    if(!list) return;

    list.innerHTML = '';
    
    // Ensure inventory exists in state
    if(typeof userProfile !== 'undefined' && !userProfile.inventory) {
        userProfile.inventory = [];
    }

    SHOP_ITEMS.forEach(item => {
        const isOwned = userProfile.inventory.includes(item.id);
        const canAfford = (userProfile.coins || 0) >= item.price;
        const isConsumable = item.type === 'consumable';
        
        // Button Logic
        let btnHtml = '';
        if (item.disabled) {
            btnHtml = `<button disabled class="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 text-xs font-bold cursor-not-allowed">Coming Soon</button>`;
        } else if (isOwned && !isConsumable) {
            btnHtml = `<button disabled class="w-full py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Owned</button>`;
        } else {
            // Consumable Logic: For this version, max 1 active in inventory
            if(isConsumable && isOwned) {
                 btnHtml = `<button disabled class="w-full py-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold">Active in Inventory</button>`;
            } else {
                const btnColor = canAfford ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 shadow-md' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed';
                btnHtml = `<button onclick="buyItem('${item.id}')" ${!canAfford ? 'disabled' : ''} class="w-full py-2 rounded-xl ${btnColor} text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1">
                    Buy <span class="font-normal opacity-80">for</span> ${item.price}
                </button>`;
            }
        }

        const el = document.createElement('div');
        el.className = "bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full animate-fade-in";
        el.innerHTML = `
            <div class="mb-4">
                <div class="w-12 h-12 rounded-2xl ${item.bgColor} ${item.color} flex items-center justify-center mb-4">
                    <i data-lucide="${item.icon}" class="w-6 h-6"></i>
                </div>
                <h3 class="font-bold text-slate-800 dark:text-slate-100 mb-1">${item.name}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed h-10 line-clamp-2">${item.description}</p>
            </div>
            ${btnHtml}
        `;
        list.appendChild(el);
    });
    
    if(window.lucide) lucide.createIcons();
}

// --- ACTIONS ---
window.buyItem = function(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    if ((userProfile.coins || 0) < item.price) {
        if(window.showNotification) window.showNotification("Insufficient Funds", "Keep working to earn more coins!", "warning");
        return;
    }

    if (!confirm(`Buy ${item.name} for ${item.price} coins?`)) return;

    // Deduct Cost
    userProfile.coins -= item.price;
    
    // Add to Inventory
    if(!userProfile.inventory) userProfile.inventory = [];
    userProfile.inventory.push(item.id);

    // Save & UI Updates
    // saveProfile() is global from profile.js
    if(typeof saveProfile === 'function') saveProfile(); 
    
    renderShopBalance();
    renderShopItems();
    
    // Trigger Effects (Update UI immediately to show Badge/Gold Name)
    if(window.updateProfileUI) window.updateProfileUI();
    
    // Confetti
    if(window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b'] });
    if(window.showNotification) window.showNotification("Purchase Successful!", `You bought ${item.name}`, "success");
    
    // Sync to Cloud
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
};
