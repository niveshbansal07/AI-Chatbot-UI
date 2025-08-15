// AI Chatbot Application
class ChatbotApp {
    constructor() {
        this.currentTheme = 'system';
        this.chatHistory = [];
        this.isTyping = false;
        this.messageCounter = 0;
        
        // DOM Elements
        this.elements = {
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            chatMessages: document.getElementById('chatMessages'),
            historyBtn: document.getElementById('historyBtn'),
            historySidebar: document.getElementById('historySidebar'),
            closeSidebar: document.getElementById('closeSidebar'),
            historyList: document.getElementById('historyList'),
            themeBtn: document.getElementById('themeBtn'),
            themeDropdown: document.getElementById('themeDropdown'),
            overlay: document.getElementById('overlay')
        };
        
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.bindEvents();
        this.loadChatHistory();
        this.autoResizeTextarea();
        this.updateSendButton();
    }
    
    // Theme Management
    loadTheme() {
        const savedTheme = localStorage.getItem('chatbot-theme') || 'system';
        this.setTheme(savedTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('chatbot-theme', theme);
        
        // Update theme button icon
        const themeBtn = this.elements.themeBtn;
        const icon = themeBtn.querySelector('i');
        
        switch(theme) {
            case 'light':
                icon.className = 'fas fa-sun';
                break;
            case 'dark':
                icon.className = 'fas fa-moon';
                break;
            case 'system':
                icon.className = 'fas fa-desktop';
                break;
        }
    }
    
    // Event Binding
    bindEvents() {
        // Send message events
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input events
        this.elements.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateSendButton();
        });
        
        // History sidebar events
        this.elements.historyBtn.addEventListener('click', () => this.toggleHistorySidebar());
        this.elements.closeSidebar.addEventListener('click', () => this.closeHistorySidebar());
        this.elements.overlay.addEventListener('click', () => this.closeHistorySidebar());
        
        // Theme switcher events
        this.elements.themeBtn.addEventListener('click', () => this.toggleThemeDropdown());
        
        // Theme option events
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.setTheme(theme);
                this.closeThemeDropdown();
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-switcher')) {
                this.closeThemeDropdown();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.elements.messageInput.focus();
                        break;
                    case 'h':
                        e.preventDefault();
                        this.toggleHistorySidebar();
                        break;
                }
            }
        });
    }
    
    // Message Handling
    async sendMessage() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.elements.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateSendButton();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addMessage(this.generateAIResponse(message), 'bot');
        }, 1500 + Math.random() * 1000);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(messageTime);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.elements.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Save to history
        this.saveMessageToHistory(text, sender);
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-message';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-robot';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingIndicator.appendChild(dot);
        }
        
        content.appendChild(typingIndicator);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        this.elements.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // History Management
    saveMessageToHistory(text, sender) {
        const message = {
            id: ++this.messageCounter,
            text,
            sender,
            timestamp: new Date().toISOString(),
            time: this.getCurrentTime()
        };
        
        this.chatHistory.push(message);
        this.saveChatHistory();
        this.updateHistoryList();
    }
    
    loadChatHistory() {
        const saved = localStorage.getItem('chatbot-history');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
            this.messageCounter = this.chatHistory.length;
        }
    }
    
    saveChatHistory() {
        // Keep only last 100 messages
        if (this.chatHistory.length > 100) {
            this.chatHistory = this.chatHistory.slice(-100);
        }
        localStorage.setItem('chatbot-history', JSON.stringify(this.chatHistory));
    }
    
    updateHistoryList() {
        this.elements.historyList.innerHTML = '';
        
        // Group messages by conversation
        const conversations = this.groupMessagesByConversation();
        
        conversations.forEach((conversation, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div style="font-weight: 500; margin-bottom: 4px;">
                    Conversation ${conversations.length - index}
                </div>
                <div style="font-size: 0.875rem; color: var(--text-muted);">
                    ${conversation.firstMessage}...
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                    ${conversation.time}
                </div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.loadConversation(conversation.messages);
            });
            
            this.elements.historyList.appendChild(historyItem);
        });
    }
    
    groupMessagesByConversation() {
        const conversations = [];
        let currentConversation = [];
        
        this.chatHistory.forEach(message => {
            if (message.sender === 'user') {
                if (currentConversation.length > 0) {
                    conversations.push({
                        messages: [...currentConversation],
                        firstMessage: currentConversation[0].text.substring(0, 50),
                        time: currentConversation[0].time
                    });
                }
                currentConversation = [message];
            } else {
                currentConversation.push(message);
            }
        });
        
        if (currentConversation.length > 0) {
            conversations.push({
                messages: [...currentConversation],
                firstMessage: currentConversation[0].text.substring(0, 50),
                time: currentConversation[0].time
            });
        }
        
        return conversations.reverse();
    }
    
    loadConversation(messages) {
        this.elements.chatMessages.innerHTML = '';
        messages.forEach(message => {
            this.addMessage(message.text, message.sender);
        });
        this.closeHistorySidebar();
    }
    
    // UI Controls
    toggleHistorySidebar() {
        const sidebar = this.elements.historySidebar;
        const overlay = this.elements.overlay;
        
        if (sidebar.classList.contains('show')) {
            this.closeHistorySidebar();
        } else {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            this.updateHistoryList();
        }
    }
    
    closeHistorySidebar() {
        this.elements.historySidebar.classList.remove('show');
        this.elements.overlay.classList.remove('show');
    }
    
    toggleThemeDropdown() {
        this.elements.themeDropdown.classList.toggle('show');
    }
    
    closeThemeDropdown() {
        this.elements.themeDropdown.classList.remove('show');
    }
    
    // Utility Functions
    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateSendButton() {
        const message = this.elements.messageInput.value.trim();
        const sendBtn = this.elements.sendBtn;
        
        if (message && !this.isTyping) {
            sendBtn.disabled = false;
        } else {
            sendBtn.disabled = true;
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }, 100);
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // AI Response Generation (Demo)
    generateAIResponse(userMessage) {
        const responses = [
            "That's an interesting question! Let me think about that...",
            "I understand what you're asking. Here's what I can tell you...",
            "Great question! Based on my knowledge, I'd say...",
            "I appreciate you asking that. Here's my perspective...",
            "That's a thoughtful inquiry. Let me break this down for you...",
            "I'm glad you brought that up. Here's what I know...",
            "That's a complex topic. Let me explain it this way...",
            "Interesting point! Here's how I see it...",
            "I can help you with that. Here's what you should know...",
            "That's a good question. Let me provide some insights..."
        ];
        
        // Simple keyword-based responses
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! How can I assist you today?";
        } else if (lowerMessage.includes('how are you')) {
            return "I'm functioning perfectly! How can I help you?";
        } else if (lowerMessage.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            return "Goodbye! Feel free to come back if you have more questions.";
        } else if (lowerMessage.includes('help')) {
            return "I'm here to help! You can ask me questions, and I'll do my best to assist you. What would you like to know?";
        } else if (lowerMessage.includes('name')) {
            return "I'm an AI assistant designed to help you with various tasks and questions. What can I do for you today?";
        } else if (lowerMessage.includes('weather')) {
            return "I don't have access to real-time weather data, but I can help you with many other questions!";
        } else if (lowerMessage.includes('time')) {
            return `The current time is ${this.getCurrentTime()}. Is there anything specific you'd like to know?`;
        } else if (lowerMessage.includes('joke')) {
            return "Why don't scientists trust atoms? Because they make up everything! 😄";
        } else if (lowerMessage.includes('math') || lowerMessage.includes('calculate')) {
            return "I can help with basic math concepts and explanations, but for complex calculations, you might want to use a calculator.";
        }
        
        // Random response for other messages
        return responses[Math.floor(Math.random() * responses.length)];
    }
}

// Enhanced 3D Button Effects
class ButtonEffects {
    static init() {
        const buttons = document.querySelectorAll('.history-btn, .theme-btn, .send-btn');
        
        buttons.forEach(button => {
            button.addEventListener('mousedown', (e) => {
                this.createRipple(e, button);
            });
            
            button.addEventListener('mouseenter', (e) => {
                this.addHoverEffect(button);
            });
            
            button.addEventListener('mouseleave', (e) => {
                this.removeHoverEffect(button);
            });
        });
    }
    
    static createRipple(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    static addHoverEffect(button) {
        button.style.transform = 'translateY(-2px) scale(1.02)';
    }
    
    static removeHoverEffect(button) {
        button.style.transform = 'translateY(0) scale(1)';
    }
}

// Add ripple effect styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new ChatbotApp();
    ButtonEffects.init();
    
    // Add some demo messages after a delay
    setTimeout(() => {
        if (app.chatHistory.length === 0) {
            app.addMessage("Welcome! I'm here to help you with any questions you might have. Feel free to ask me anything!", 'bot');
        }
    }, 1000);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChatbotApp, ButtonEffects };
}
