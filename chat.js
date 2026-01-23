/* chat.js - S1N Real-time Messaging (Time Format Aware) */

let currentChatFriend = null;
let chatListener = null;
let notificationListeners = [];

// --- 1. NOTIFICATION SYSTEM (Background Listener) ---
window.initChatNotifications = function() {
    const user = JSON.parse(localStorage.getItem('auraUser'));
    if (!user || !user.friends) return;

    notificationListeners.forEach(off => off());
    notificationListeners = [];

    user.friends.forEach(friendName => {
        const chatId = getChatId(user.name, friendName);
        const ref = firebase.database().ref(`chats/${chatId}/messages`).limitToLast(1);
        
        const listener = ref.on('child_added', (snapshot) => {
            const msg = snapshot.val();
            if (!msg) return;

            const isNew = (Date.now() - msg.timestamp) < 5000; 
            
            if (isNew && msg.sender !== user.name && currentChatFriend !== friendName) {
                if (window.showNotification) {
                    window.showNotification(`Message from ${friendName}`, msg.text, 'info');
                }
            }
        });
        notificationListeners.push(() => ref.off('child_added', listener));
    });
};

// --- 2. CHAT UI LOGIC ---

function getChatId(userA, userB) {
    return [userA, userB].sort().join('_');
}

window.openChat = function(friendName) {
    const user = JSON.parse(localStorage.getItem('auraUser'));
    if (!user) return alert("Login required.");

    const friendModal = document.getElementById('friend-modal');
    if (friendModal) friendModal.classList.add('hidden');

    currentChatFriend = friendName;
    
    const modal = document.getElementById('chat-modal');
    const title = document.getElementById('chat-title');
    const messagesBox = document.getElementById('chat-messages');
    const input = document.getElementById('chat-input');
    
    if (modal) modal.classList.remove('hidden');
    if (title) title.textContent = friendName;
    if (messagesBox) messagesBox.innerHTML = '<div class="text-center py-4 opacity-50"><i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto"></i></div>';
    
    if (input) setTimeout(() => input.focus(), 100);
    if(window.lucide) lucide.createIcons();

    loadChatHistory(user.name, friendName);
};

window.closeChat = function() {
    const modal = document.getElementById('chat-modal');
    if (modal) modal.classList.add('hidden');
    
    if (chatListener && currentChatFriend) {
        const user = JSON.parse(localStorage.getItem('auraUser'));
        if (user) {
            const chatId = getChatId(user.name, currentChatFriend);
            firebase.database().ref(`chats/${chatId}/messages`).off('value', chatListener);
        }
    }
    currentChatFriend = null;
};

function loadChatHistory(myName, friendName) {
    const chatId = getChatId(myName, friendName);
    const messagesBox = document.getElementById('chat-messages');
    
    const dbRef = firebase.database().ref(`chats/${chatId}/messages`).limitToLast(50);

    chatListener = dbRef.on('value', (snapshot) => {
        if (!messagesBox) return;
        messagesBox.innerHTML = '';
        const data = snapshot.val();
        
        if (!data) {
            messagesBox.innerHTML = '<div class="text-center py-12 text-muted text-xs uppercase font-bold tracking-wider opacity-50">Secure Channel Established.<br>Say Hello.</div>';
            return;
        }

        Object.values(data).forEach(msg => {
            const isMe = msg.sender === myName;
            
            const div = document.createElement('div');
            div.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3 animate-fade-in`;
            
            const bubbleClass = isMe 
                ? 'bg-main text-body rounded-tr-sm' 
                : 'bg-input text-main border border-border rounded-tl-sm';

            // FORMAT TIME (New Logic)
            const date = new Date(msg.timestamp);
            let timeStr;
            
            // Check Global Settings
            if (window.appSettings && window.appSettings.timeFormat === '24h') {
                timeStr = date.toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit'});
            } else {
                timeStr = date.toLocaleTimeString([], {hour12: true, hour: '2-digit', minute:'2-digit'});
            }

            div.innerHTML = `
                <div class="${bubbleClass} px-4 py-2 rounded-xl max-w-[80%] text-sm font-medium shadow-sm break-words">
                    ${msg.text}
                </div>
                <span class="text-[9px] text-muted font-mono mt-1 uppercase tracking-widest opacity-60">
                    ${timeStr}
                </span>
            `;
            messagesBox.appendChild(div);
        });

        messagesBox.scrollTop = messagesBox.scrollHeight;
    });
}

window.sendChatMessage = function() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    const user = JSON.parse(localStorage.getItem('auraUser'));
    if (!user || !currentChatFriend) return;

    const chatId = getChatId(user.name, currentChatFriend);
    const newMsgRef = firebase.database().ref(`chats/${chatId}/messages`).push();

    newMsgRef.set({
        sender: user.name,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    input.value = '';
    
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2345/2345-preview.mp3'); 
    audio.volume = 0.1;
    audio.play().catch(()=>{});
};

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if(input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.sendChatMessage();
        });
    }
    
    setTimeout(() => {
        if(window.initChatNotifications) window.initChatNotifications();
    }, 2000); 
});
