/* app.js - S1N Global Logic & Theme System */

// --- THEME CONTROL ---
window.setTheme = function(mode) {
    const btnLight = document.getElementById('theme-btn-light');
    const btnDark = document.getElementById('theme-btn-dark');
    
    // 1. Apply Class to HTML
    if (mode === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // 2. Save Preference
    localStorage.setItem('auraTheme', mode);

    // 3. Update Button Visuals (Solid Black/White for active)
    if (btnLight && btnDark) {
        if (mode === 'dark') {
            // Dark Mode Active: Dark button is solid, Light is transparent
            btnDark.className = "flex-1 py-2 text-xs font-bold uppercase transition-colors bg-main text-body";
            btnLight.className = "flex-1 py-2 text-xs font-bold uppercase transition-colors bg-transparent text-muted hover:text-main";
        } else {
            // Light Mode Active: Light button is solid, Dark is transparent
            btnLight.className = "flex-1 py-2 text-xs font-bold uppercase transition-colors bg-main text-body";
            btnDark.className = "flex-1 py-2 text-xs font-bold uppercase transition-colors bg-transparent text-muted hover:text-main";
        }
    }
    
    // Optional: Play Click Sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'); 
    audio.volume = 0.1;
    audio.play().catch(()=>{});
};

// --- JUICE SYSTEM (Visual Feedback) ---
// Used by Shop, Achievements, and Tasks to create "pop" effects
window.triggerJuice = function(element, points) {
    if (!element) return;

    // 1. Shake Animation (requires .animate-shake in style.css)
    element.classList.remove('animate-shake');
    void element.offsetWidth; // Force browser reflow to restart animation
    element.classList.add('animate-shake');

    // 2. Flash Effect
    const flash = document.createElement('div');
    flash.className = "absolute inset-0 bg-main opacity-20 rounded-xl pointer-events-none z-10 transition-opacity duration-300";
    
    // Ensure parent is relative so flash sits inside
    const style = window.getComputedStyle(element);
    if(style.position === 'static') {
        element.style.position = 'relative'; 
    }
    
    element.appendChild(flash);
    setTimeout(() => {
        flash.classList.add('opacity-0');
        setTimeout(() => flash.remove(), 300);
    }, 50);

    // 3. Floating Text (XP Popup)
    if (points > 0) {
        const rect = element.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = "xp-popup"; // Requires .xp-popup in style.css
        popup.textContent = `+${points}`;
        
        // Position centered above the element
        // We use 'fixed' positioning to ensure it floats over everything
        popup.style.position = 'fixed';
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top}px`;
        
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }
};

// --- GLOBAL INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme on Load
    // Check LocalStorage -> System Preference -> Default to Light
    const savedTheme = localStorage.getItem('auraTheme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply immediately
    window.setTheme(savedTheme);

    // 2. PWA Install Prompt Handler (Optional)
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        // You can show a custom "Install App" button here if desired
    });
});
