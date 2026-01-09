/* notifications.js */

// Create container on load
document.addEventListener('DOMContentLoaded', () => {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-24 right-4 z-[100] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
});

window.showNotification = function(title, message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Create Element
    const notif = document.createElement('div');
    
    // Colors based on type
    let colors = 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900';
    let iconColor = 'text-indigo-500';
    let iconName = 'bell';

    if (type === 'success') {
        colors = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50';
        iconColor = 'text-emerald-500';
        iconName = 'check-circle';
    } else if (type === 'warning') { // Time over
        colors = 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50';
        iconColor = 'text-amber-500';
        iconName = 'alert-circle';
    }

    notif.className = `pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-2xl shadow-xl border ${colors} flex gap-3 transform transition-all duration-500 translate-x-full opacity-0`;
    
    notif.innerHTML = `
        <div class="p-2 bg-white dark:bg-slate-900/50 rounded-full h-fit shrink-0">
            <i data-lucide="${iconName}" class="w-5 h-5 ${iconColor}"></i>
        </div>
        <div>
            <h4 class="font-bold text-sm text-slate-800 dark:text-slate-100">${title}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">${message}</p>
        </div>
    `;

    container.appendChild(notif);
    if (window.lucide) lucide.createIcons();

    // Animate In
    requestAnimationFrame(() => {
        notif.classList.remove('translate-x-full', 'opacity-0');
    });

    // Play Notification Sound (Soft)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2345/2345-preview.mp3'); 
    audio.volume = 0.5;
    audio.play().catch(()=>{});

    // Remove after 4 seconds
    setTimeout(() => {
        notif.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notif.remove(), 500);
    }, 4000);
};
