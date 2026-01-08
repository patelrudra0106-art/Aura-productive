/* notifications.js */
const NotificationSystem = {
    
    init: function() {
        // 1. Register Service Worker Immediately
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js')
                .then(reg => console.log("✅ SW Registered"))
                .catch(err => console.error("❌ SW Fail", err));
        }
        this.updateButtonUI();
    },

    requestPermission: function() {
        if (!("Notification" in window)) {
            alert("System notifications are not supported on this device.");
            return;
        }

        Notification.requestPermission().then((permission) => {
            this.updateButtonUI();
            if (permission === "granted") {
                // Play a silent sound to unlock audio engine immediately
                const audio = document.getElementById('alarm-sound');
                if(audio) {
                    audio.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
                    audio.volume = 0; // Silent first
                    audio.play().then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = 1; // Reset volume
                    }).catch(e => console.log("Audio unlock failed", e));
                }
                
                this.send("Aura Active", "Notifications & Audio are ready! 🚀");
            }
        });
    },

    updateButtonUI: function() {
        const btn = document.getElementById('enable-notifs-btn');
        if(!btn) return;
        
        if (Notification.permission === "granted") {
            btn.textContent = "Active ✅";
            btn.className = "px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors";
        } else if (Notification.permission === "denied") {
            btn.textContent = "Blocked 🔒";
            btn.className = "px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors";
        } else {
            btn.textContent = "Enable";
            btn.className = "px-3 py-1.5 bg-slate-200 dark:bg-slate-600 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors";
        }
    },

    send: function(title, body) {
        if (Notification.permission !== "granted") return;

        // METHOD 1: Service Worker (Best for Android Pop-ups)
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    body: body,
                    icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
                    badge: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
                    vibrate: [500, 250, 500, 250, 500], // Long vibration pattern
                    tag: 'aura-alert',        // Replaces old alerts
                    renotify: true,           // Forces sound/vibration again
                    requireInteraction: true, // Stays on screen
                    data: { url: './index.html' },
                    actions: [
                        { action: 'open', title: 'Open App' },
                        { action: 'close', title: 'Dismiss' }
                    ]
                });
            });
        } 
        // METHOD 2: Standard Fallback
        else {
            const notif = new Notification(title, {
                body: body,
                icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
                vibrate: [200, 100, 200]
            });
            notif.onclick = () => { window.focus(); notif.close(); };
        }
    },
    
    test: function() {
        this.send("Test Alert", "This is how your task notification will look!");
        // Also test audio
        const audio = document.getElementById('alarm-sound');
        if(audio) {
            audio.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
            audio.play().catch(e => console.log("Audio test failed"));
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
    const btn = document.getElementById('enable-notifs-btn');
    if(btn) btn.addEventListener('click', () => NotificationSystem.requestPermission());
});
