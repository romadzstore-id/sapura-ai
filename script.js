// DOM Elements
const chatHistory = document.getElementById('chatHistory');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const exampleQuestions = document.querySelectorAll('.example-questions li');
const clearChatButton = document.getElementById('clearChatButton');

// API Configuration
const API_URL = 'https://skyzopedia-api.vercel.app/ai/gpt';
const API_KEY = 'skyy';

// Auto-resize textarea based on content
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
}

// Add message to chat
function addMessage(sender, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="message-content">
            <div class="message-sender">${sender}</div>
            <div class="message-text">${formatMessageText(text)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chatHistory.appendChild(messageDiv);
    
    // Smooth scroll to bottom
    setTimeout(() => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 100);
    
    return messageDiv;
}

// Format message text (simple formatting for links and code)
function formatMessageText(text) {
    // Escape HTML to prevent XSS
    let formattedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Convert URLs to clickable links
    formattedText = formattedText.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>'
    );
    
    // Convert markdown-style code blocks
    formattedText = formattedText.replace(
        /`([^`]+)`/g,
        '<code>$1</code>'
    );
    
    // Convert line breaks to <br>
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Get response from API
async function getAIResponse(question) {
    try {
        const encodedQuestion = encodeURIComponent(question);
        const url = `${API_URL}?apikey=${API_KEY}&question=${encodedQuestion}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status && data.result) {
            return data.result;
        } else {
            throw new Error('Invalid response from API');
        }
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return `Maaf, terjadi kesalahan saat mengambil jawaban. Silakan coba lagi. (Error: ${error.message})`;
    }
}

// Send message
async function sendMessage() {
    const question = userInput.value.trim();
    
    if (!question) {
        return;
    }
    
    // Add user message to chat
    addMessage('Anda', question, true);
    
    // Clear input and reset height
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Disable send button while processing
    sendButton.disabled = true;
    sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    try {
        // Get AI response
        const aiResponse = await getAIResponse(question);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add AI response to chat
        addMessage('Sapura AI', aiResponse, false);
        
    } catch (error) {
        hideTypingIndicator();
        addMessage('Sapura AI', `Maaf, terjadi kesalahan: ${error.message}`, false);
    } finally {
        // Re-enable send button
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        
        // Focus back on input
        userInput.focus();
    }
}

// Load chat history from localStorage
function loadChatHistory() {
    const savedHistory = localStorage.getItem('sapuraChatHistory');
    
    if (savedHistory) {
        try {
            const history = JSON.parse(savedHistory);
            
            // Clear initial message
            chatHistory.innerHTML = '';
            
            // Add saved messages
            history.forEach(msg => {
                addMessage(msg.sender, msg.text, msg.isUser);
            });
        } catch (error) {
            console.error('Error loading chat history:', error);
            // Keep default welcome message
        }
    }
}

// Save chat history to localStorage
function saveChatHistory() {
    const messages = [];
    const messageElements = chatHistory.querySelectorAll('.message');
    
    messageElements.forEach(element => {
        const isUser = element.classList.contains('user-message');
        const sender = element.querySelector('.message-sender').textContent;
        const text = element.querySelector('.message-text').textContent;
        
        messages.push({
            sender,
            text,
            isUser,
            timestamp: new Date().toISOString()
        });
    });
    
    localStorage.setItem('sapuraChatHistory', JSON.stringify(messages));
}

// Clear chat history
function clearChatHistory() {
    if (confirm('Apakah Anda yakin ingin menghapus semua percakapan?')) {
        // Clear the chat history display
        chatHistory.innerHTML = '';
        
        // Add the initial welcome message back
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'message ai-message';
        welcomeDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="message-sender">Sapura AI</div>
                <div class="message-text">
                    Halo! Saya Sapura AI, asisten cerdas Anda. Silakan ajukan pertanyaan apa pun, dan saya akan membantu Anda.
                </div>
                <div class="message-time">Sekarang</div>
            </div>
        `;
        
        chatHistory.appendChild(welcomeDiv);
        
        // Clear localStorage
        localStorage.removeItem('sapuraChatHistory');
    }
}

// Event Listeners
// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key (but allow Shift+Enter for new line)
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
    
    autoResizeTextarea();
});

// Auto-resize textarea on input
userInput.addEventListener('input', autoResizeTextarea);

// Example questions click handler
exampleQuestions.forEach(question => {
    question.addEventListener('click', () => {
        userInput.value = question.getAttribute('data-question');
        userInput.focus();
        autoResizeTextarea();
    });
});

// Clear chat button
clearChatButton.addEventListener('click', clearChatHistory);

// Save chat history when page is about to unload
window.addEventListener('beforeunload', saveChatHistory);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load chat history from localStorage
    loadChatHistory();
    
    // Auto-focus input
    userInput.focus();
    
    // Initial textarea height adjustment
    autoResizeTextarea();
    
    // Add some interactive effects to example questions
    exampleQuestions.forEach(question => {
        question.addEventListener('mousedown', () => {
            question.style.transform = 'translateX(2px)';
        });
        
        question.addEventListener('mouseup', () => {
            question.style.transform = '';
        });
        
        question.addEventListener('mouseleave', () => {
            question.style.transform = '';
        });
    });
    
    // Add click animation to send button
    sendButton.addEventListener('mousedown', () => {
        sendButton.style.transform = 'scale(0.95)';
    });
    
    sendButton.addEventListener('mouseup', () => {
        sendButton.style.transform = '';
    });
    
    sendButton.addEventListener('mouseleave', () => {
        sendButton.style.transform = '';
    });
});