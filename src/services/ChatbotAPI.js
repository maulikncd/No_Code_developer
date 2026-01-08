import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Chatbot API Service
 * Handles all conversation and messaging API calls
 */
export const ChatbotAPI = {
    /**
     * Get all conversations for a session
     * @param {string} sessionId - The session ID
     * @returns {Promise<Array>} List of conversations
     */
    async getConversations(sessionId) {
        const token = Cookies.get("access_token");
        const response = await fetch(`${BASE_URL}/web-generator/conversations/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        const conversationsRaw = data.conversations || [];

        // Transform snake_case to camelCase
        return conversationsRaw.map(conv => ({
            id: conv.conversation_id,
            title: conv.title || 'New Chat',
            lastMessage: conv.last_message || 'No messages yet',
            messageCount: conv.message_count || 0,
            updatedAt: conv.updated_at || Date.now()
        }));
    },

    /**
     * Create a new conversation
     * @param {string} sessionId - The session ID
     * @returns {Promise<Object>} New conversation data
     */
    async createConversation(sessionId) {
        const token = Cookies.get("access_token");
        const response = await fetch(`${BASE_URL}/web-generator/conversation/new`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ session_id: sessionId })
        });

        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }

        return await response.json();
    },

    /**
     * Get messages from a specific conversation
     * @param {string} conversationId - The conversation ID
     * @returns {Promise<Array>} List of messages
     */
    async getConversationMessages(conversationId) {
        const token = Cookies.get("access_token");
        const response = await fetch(`${BASE_URL}/web-generator/conversation/${conversationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch conversation messages');
        }

        const data = await response.json();
        return data.messages || [];
    },

    /**
     * Send a chat message
     * @param {Object} params - Message parameters
     * @param {string} params.sessionId - The session ID
     * @param {string} params.conversationId - The conversation ID
     * @param {string} params.message - The message text
     * @param {string} [params.selectedElement] - Optional selected element for context
     * @returns {Promise<Object>} AI response data
     */
    async sendMessage({ sessionId, conversationId, message, selectedElement }) {
        const token = Cookies.get("access_token");

        const requestBody = {
            session_id: sessionId,
            conversation_id: conversationId,
            message
        };

        if (selectedElement) {
            requestBody.selected_element = selectedElement;
            requestBody.message = `[Editing element: ${selectedElement}] ${message}`;
        }

        const response = await fetch(`${BASE_URL}/web-generator/chat`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return await response.json();
    },

    /**
     * Delete a conversation
     * @param {string} conversationId - The conversation ID to delete
     * @returns {Promise<boolean>} Success status
     */
    async deleteConversation(conversationId) {
        const token = Cookies.get("access_token");
        const response = await fetch(`${BASE_URL}/web-generator/conversation/${conversationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        return response.ok;
    },

    /**
     * Get AI suggestions for the current session
     * @param {string} sessionId - The session ID
     * @returns {Promise<Array>} List of suggestions
     */
    async getSuggestions(sessionId) {
        const token = Cookies.get("access_token");
        const response = await fetch(`${BASE_URL}/web-generator/chat-suggestions/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        return data.suggestions || [];
    }
};

/**
 * Format message for chat display
 * @param {Object} msg - Raw message from API
 * @returns {Object} Formatted message
 */
export const formatMessage = (msg) => ({
    type: msg.role === 'user' ? 'user' : 'ai',
    message: msg.content,
    metadata: msg.metadata,
    timestamp: msg.created_at
});

/**
 * Generate chat title from messages
 * @param {Array} messages - List of messages
 * @returns {string} Chat title
 */
export const generateChatTitle = (messages) => {
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (firstUserMessage) {
        const text = firstUserMessage.message;
        return text.length > 40 ? text.substring(0, 40) + '...' : text;
    }
    return 'New Chat';
};
