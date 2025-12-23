// Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    initApp();
});

function initApp() {
    // DOM Elements
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const newChatBtnMobile = document.getElementById('newChatBtnMobile');
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.querySelector('.sidebar');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const historyList = document.getElementById('historyList');
    const typingIndicator = document.getElementById('typingIndicator');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const settingsModal = document.getElementById('settingsModal');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeOptions = document.querySelectorAll('.theme-option');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const exampleButtons = document.querySelectorAll('.example-btn');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    
    // State variables
    let currentChatId = null;
    let isTyping = false;
    let chats = loadChatsFromStorage();
    
    // Initialize UI
    updateChatHistory();
    applyTheme();
    
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Enter to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button click
    sendBtn.addEventListener('click', sendMessage);
    
    // New chat buttons
    newChatBtn.addEventListener('click', startNewChat);
    newChatBtnMobile.addEventListener('click', startNewChat);
    
    // Mobile menu toggle
    menuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Example questions
    exampleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            messageInput.value = question;
            messageInput.style.height = 'auto';
            messageInput.style.height = (messageInput.scrollHeight) + 'px';
            messageInput.focus();
        });
    });
    
    // Settings modal
    settingsBtn.addEventListener('click', function() {
        modalOverlay.style.display = 'flex';
        settingsModal.style.display = 'block';
    });
    
    closeSettingsModal.addEventListener('click', function() {
        modalOverlay.style.display = 'none';
    });
    
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
        }
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', function() {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });
    
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            
            // Update active state
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Clear history
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin menghapus semua riwayat chat?')) {
            clearChatHistory();
        }
    });
    
    // Voice input button (placeholder)
    voiceInputBtn.addEventListener('click', function() {
        alert('Fitur input suara akan segera hadir!');
    });
    
    // Functions
    function sendMessage() {
        const message = messageInput.value.trim();
        
        if (!message) {
            showError('Silakan masukkan pesan terlebih dahulu');
            return;
        }
        
        if (isTyping) {
            showError('Tunggu respons AI selesai');
            return;
        }
        
        // Hide welcome screen if visible
        if (welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
        }
        
        // Create new chat if none exists
        if (!currentChatId) {
            startNewChat();
        }
        
        // Add user message to UI
        addMessageToUI(message, 'user');
        
        // Clear input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Disable send button
        sendBtn.disabled = true;
        isTyping = true;
        
        // Save user message to chat
        saveMessageToChat(message, 'user');
        
        // Send to AI API
        getAIResponse(message)
            .then(response => {
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add AI response to UI with typewriter effect
                addMessageToUIWithTyping(response, 'ai');
                
                // Save AI response to chat
                saveMessageToChat(response, 'ai');
                
                // Enable send button
                sendBtn.disabled = false;
                isTyping = false;
            })
            .catch(error => {
                // Hide typing indicator
                hideTypingIndicator();
                
                // Show error message
                addMessageToUI(`Maaf, terjadi kesalahan: ${error.message}. Silakan coba lagi.`, 'ai');
                
                // Save error to chat
                saveMessageToChat(`Error: ${error.message}`, 'ai');
                
                // Enable send button
                sendBtn.disabled = false;
                isTyping = false;
            });
    }
    
    function getAIResponse(question) {
        return new Promise((resolve, reject) => {
            // Encode question for URL
            const encodedQuestion = encodeURIComponent(question);
            
            // Build API URL (tidak ditampilkan di UI)
            const apiUrl = `${AI_CONFIG.API_BASE_URL}?apikey=${AI_CONFIG.API_KEY}&question=${encodedQuestion}`;
            
            // Timeout handling
            const timeout = setTimeout(() => {
                reject(new Error('Waktu permintaan habis. Silakan coba lagi.'));
            }, AI_CONFIG.TIMEOUT);
            
            // Fetch from API
            fetch(apiUrl)
                .then(response => {
                    clearTimeout(timeout);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    
                    return response.json();
                })
                .then(data => {
                    if (data.status === true && data.result) {
                        resolve(data.result);
                    } else {
                        reject(new Error('Respons API tidak valid'));
                    }
                })
                .catch(error => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }
    
    function addMessageToUI(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'}
            </div>
            <div class="message-content">
                <div class="message-text">${formatMessage(message)}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    function addMessageToUIWithTyping(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>'}
            </div>
            <div class="message-content">
                <div class="message-text" id="typingMessage"></div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
        
        // Typewriter effect
        const messageElement = document.getElementById('typingMessage');
        let i = 0;
        
        function typeWriter() {
            if (i < message.length) {
                messageElement.innerHTML = formatMessage(message.substring(0, i + 1));
                i++;
                scrollToBottom();
                setTimeout(typeWriter, AI_CONFIG.TYPING_SPEED);
            }
        }
        
        typeWriter();
    }
    
    function formatMessage(text) {
        // Convert URLs to clickable links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
    }
    
    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        scrollToBottom();
    }
    
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }
    
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function startNewChat() {
        currentChatId = generateChatId();
        
        // Clear chat container
        chatContainer.innerHTML = '';
        
        // Hide welcome screen
        welcomeScreen.style.display = 'none';
        
        // Create new chat in storage
        const newChat = {
            id: currentChatId,
            title: 'Percakapan Baru',
            messages: [],
            timestamp: new Date().toISOString()
        };
        
        chats.unshift(newChat);
        saveChatsToStorage();
        updateChatHistory();
        
        // Update active chat in history
        setActiveChat(currentChatId);
    }
    
    function saveMessageToChat(message, sender) {
        if (!currentChatId) return;
        
        const chatIndex = chats.findIndex(chat => chat.id === currentChatId);
        
        if (chatIndex !== -1) {
            // Add message to chat
            chats[chatIndex].messages.push({
                text: message,
                sender: sender,
                timestamp: new Date().toISOString()
            });
            
            // Update chat title if it's the first user message
            if (chats[chatIndex].messages.length === 1 && sender === 'user') {
                const truncatedMessage = message.length > 30 ? message.substring(0, 30) + '...' : message;
                chats[chatIndex].title = truncatedMessage;
            }
            
            saveChatsToStorage();
            updateChatHistory();
        }
    }
    
    function loadChat(chatId) {
        const chat = chats.find(chat => chat.id === chatId);
        
        if (!chat) return;
        
        currentChatId = chatId;
        
        // Clear chat container
        chatContainer.innerHTML = '';
        
        // Hide welcome screen
        welcomeScreen.style.display = 'none';
        
        // Load messages
        chat.messages.forEach(msg => {
            addMessageToUI(msg.text, msg.sender);
        });
        
        // Set active chat in history
        setActiveChat(chatId);
        
        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
        }
    }
    
    function updateChatHistory() {
        historyList.innerHTML = '';
        
        if (chats.length === 0) {
            historyList.innerHTML = '<p class="no-history">Belum ada riwayat chat</p>';
            return;
        }
        
        chats.forEach(chat => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
            historyItem.innerHTML = `
                <i class="fas fa-message"></i>
                ${chat.title}
            `;
            
            historyItem.addEventListener('click', () => loadChat(chat.id));
            
            historyList.appendChild(historyItem);
        });
    }
    
    function setActiveChat(chatId) {
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach(item => item.classList.remove('active'));
        
        const activeItem = Array.from(historyItems).find(item => 
            item.textContent.includes(chats.find(chat => chat.id === chatId)?.title || '')
        );
        
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
    
    function clearChatHistory() {
        chats = [];
        currentChatId = null;
        saveChatsToStorage();
        updateChatHistory();
        
        // Clear chat container and show welcome screen
        chatContainer.innerHTML = '';
        welcomeScreen.style.display = 'block';
    }
    
    function setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('light-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Save theme preference
        localStorage.setItem('nexusAI_theme', theme);
    }
    
    function applyTheme() {
        const savedTheme = localStorage.getItem('nexusAI_theme') || AI_CONFIG.DEFAULT_THEME;
        setTheme(savedTheme);
        
        // Set active theme option
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === savedTheme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    function showError(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--error);
            color: white;
            padding: 12px 24px;
            border-radius: var(--radius-md);
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            animation: fadeInOut 3s ease-in-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
    
    // Utility functions
    function generateChatId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function loadChatsFromStorage() {
        try {
            const savedChats = localStorage.getItem('nexusAI_chats');
            return savedChats ? JSON.parse(savedChats) : [];
        } catch (error) {
            console.error('Error loading chats:', error);
            return [];
        }
    }
    
    function saveChatsToStorage() {
        try {
            localStorage.setItem('nexusAI_chats', JSON.stringify(chats));
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    }
    
    // Add CSS for error animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            10% { opacity: 1; transform: translateX(-50%) translateY(0); }
            90% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}