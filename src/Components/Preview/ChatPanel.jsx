'use client';
'use client';
import { ArrowRight, Sparkles, User, MousePointer2, X, Plus, Clock, Palette, Type, Trash2, Wand2, Undo2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { ThemeContext } from "../../ThemeProvider";
import Cookies from "js-cookie";
import { gsap } from "gsap";
import { ChatHistory } from "./ChatHistory";

export function ChatPanel({
    inputValue = '',
    isLoading: externalLoading = false,
    onInputChange,
    onSubmit,
    onCodeUpdate,
    onHtmlUpdate,  // New: callback when HTML is directly updated
    onClose,
    onClearElement,  // New: callback to clear selected element
    sessionId: propSessionId,
    isOpen = false,
    selectedElementName = '',
    selectedElementData = null,  // New: full element data object
    htmlContent = '',  // New: current HTML content for element editing
}) {
    const { theme } = useContext(ThemeContext);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastActivityTime, setLastActivityTime] = useState(Date.now());

    // Chat conversation management (API-based)
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);

    // 🆕 Element Session Tracking - maintains context across messages
    const [elementSession, setElementSession] = useState({
        element: null,
        startIndex: 0,
        questionsAsked: 0,
        lastAction: null
    });

    // 🆕 Undo capability for element changes
    const [undoStack, setUndoStack] = useState([]);
    const [canUndo, setCanUndo] = useState(false);

    // 🆕 Preview Mode State
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [pendingPreview, setPendingPreview] = useState(null); // { newHtml, oldHtml, action }

    // ==========================================
    // 1. LOAD CONVERSATIONS (Sidebar Load)
    // ==========================================
    const loadConversations = useCallback(async () => {
        if (!propSessionId) return;

        console.log('📋 Loading conversations for session:', propSessionId);
        setIsLoadingConversations(true);

        try {
            const token = Cookies.get("access_token");
            const url = `${BASE_URL}/web-generator/conversations/${propSessionId}`;
            console.log('📡 API Call:', url);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('📥 Response status:', response.status, response.ok ? '✅' : '❌');

            if (response.ok) {
                const data = await response.json();
                const conversationsRaw = data.conversations || [];

                console.log('📦 Received conversations:', conversationsRaw.length, 'items');
                console.log('📦 Raw conversation data:', conversationsRaw[0]);

                // Transform backend snake_case to frontend camelCase
                const conversationsList = conversationsRaw.map(conv => ({
                    id: conv.conversation_id,           // ✅ Map conversation_id -> id
                    title: conv.title || 'New Chat',
                    lastMessage: conv.last_message || 'No messages yet',
                    messageCount: conv.message_count || 0,
                    updatedAt: conv.updated_at || Date.now()
                }));

                console.log('✅ Transformed conversations:', conversationsList[0]);

                setConversations(conversationsList);

                // If no current conversation and we have conversations, load the most recent one
                if (!currentConversationId && conversationsList.length > 0) {
                    const latestConversation = conversationsList[0];
                    console.log('⏰ Auto-loading latest conversation:', latestConversation.id);

                    // Validate conversation has valid ID before loading
                    if (latestConversation && latestConversation.id && latestConversation.id !== 'undefined') {
                        await loadConversationMessages(latestConversation.id);
                    }
                }
            } else {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Failed to load conversations:', error);
        } finally {
            setIsLoadingConversations(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [propSessionId, BASE_URL]);

    // ==========================================
    // 2. CREATE NEW CONVERSATION (+ Button)
    // ==========================================
    const createNewConversation = async () => {
        if (!propSessionId) return;

        try {
            const token = Cookies.get("access_token");
            const response = await fetch(`${BASE_URL}/web-generator/conversation/new`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ session_id: propSessionId })
            });

            if (response.ok) {
                const data = await response.json();

                // Validate conversation_id before setting
                if (data.conversation_id && data.conversation_id !== 'undefined') {
                    setCurrentConversationId(data.conversation_id);
                    setChatHistory([]);
                    onInputChange?.('');
                    setLastActivityTime(Date.now());

                    // Reload conversations list
                    await loadConversations();
                } else {
                    console.error('Invalid conversation_id received from API:', data);
                }
            }
        } catch (error) {
            console.error('Failed to create new conversation:', error);
        }
    };

    // ==========================================
    // 3. LOAD CONVERSATION MESSAGES (History Click)
    // ==========================================
    const loadConversationMessages = async (conversationId) => {
        console.log('📨 Loading conversation messages for ID:', conversationId);

        // Validate conversation ID
        if (!conversationId || conversationId === 'undefined') {
            console.error('❌ Invalid conversation ID:', conversationId);
            return;
        }

        try {
            const token = Cookies.get("access_token");
            const url = `${BASE_URL}/web-generator/conversation/${conversationId}`;
            console.log('📡 API Call:', url);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('📥 Response status:', response.status, response.ok ? '✅' : '❌');

            if (response.ok) {
                const data = await response.json();
                console.log('📦 Received data:', data);

                const messages = (data.messages || []).map(msg => ({
                    type: msg.role === 'user' ? 'user' : 'ai',
                    message: msg.content,
                    metadata: msg.metadata,
                    timestamp: msg.created_at
                }));

                console.log('💬 Formatted messages:', messages.length, 'messages');

                setCurrentConversationId(conversationId);
                setChatHistory(messages);
                setLastActivityTime(Date.now());
            } else {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
            }
        } catch (error) {
            console.error('❌ Failed to load conversation messages:', error);
        }
    };

    // ==========================================
    // 4. SWITCH TO EXISTING CONVERSATION
    // ==========================================
    const switchToConversation = async (conversationId) => {
        console.log('🔄 Switching to conversation:', conversationId);

        // Validate before switching
        if (!conversationId || conversationId === 'undefined') {
            console.error('Cannot switch to invalid conversation:', conversationId);
            return;
        }

        await loadConversationMessages(conversationId);
    };

    // ==========================================
    // 5. DELETE CONVERSATION
    // ==========================================
    const deleteConversation = async (conversationId) => {
        // Validate conversation ID before deletion
        if (!conversationId || conversationId === 'undefined') {
            console.error('Cannot delete invalid conversation:', conversationId);
            return;
        }

        try {
            const token = Cookies.get("access_token");
            const response = await fetch(`${BASE_URL}/web-generator/conversation/${conversationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // If deleted current conversation, create a new one
                if (conversationId === currentConversationId) {
                    await createNewConversation();
                }

                // Reload conversations list
                await loadConversations();
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    // Generate a title for the chat based on first user message
    const generateChatTitle = (messages) => {
        const firstUserMessage = messages.find(m => m.type === 'user');
        if (firstUserMessage) {
            const text = firstUserMessage.message;
            return text.length > 40 ? text.substring(0, 40) + '...' : text;
        }
        return 'New Chat';
    };

    // Load conversations when chat panel opens
    useEffect(() => {
        if (isOpen && propSessionId) {
            loadConversations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, propSessionId]);

    // Initialize conversation on first open if needed
    useEffect(() => {
        if (isOpen && !currentConversationId && conversations.length === 0 && !isLoadingConversations) {
            createNewConversation();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentConversationId, conversations.length, isLoadingConversations]);

    const panelRef = useRef(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (inputValue.length > 0) {
            setLastActivityTime(Date.now());
        }
    }, [inputValue]);

    // 🆕 Track element session - update when element selection changes
    useEffect(() => {
        if (selectedElementData && selectedElementData.tagName) {
            setElementSession(prev => ({
                element: selectedElementData,
                startIndex: chatHistory.length,
                questionsAsked: 0,
                lastAction: prev.lastAction
            }));
            console.log('🎯 Element session started:', selectedElementData.tagName);
        }
    }, [selectedElementData]);

    // 🆕 Clear element session when element is cleared
    useEffect(() => {
        if (!selectedElementData && !selectedElementName) {
            setElementSession({
                element: null,
                startIndex: 0,
                questionsAsked: 0,
                lastAction: null
            });
            console.log('🎯 Element session cleared');
        }
    }, [inputValue]);

    // Removed 5-second auto-close rule as per user request

    // 🆕 Undo handler - restores previous HTML state
    const handleUndo = useCallback(() => {
        if (undoStack.length > 0) {
            const lastState = undoStack[undoStack.length - 1];
            console.log('↩️ Undoing last action:', lastState.action);

            // Restore HTML
            onHtmlUpdate?.(lastState.html);

            // Remove from stack
            setUndoStack(prev => prev.slice(0, -1));

            // Update canUndo
            setCanUndo(undoStack.length > 1);

            // Add message to chat
            setChatHistory(prev => [...prev, {
                type: 'ai',
                message: `↩️ Undo successful! Reverted the '${lastState.action}' change on ${lastState.elementInfo || 'element'}.`
            }]);
        }
    }, [undoStack, onHtmlUpdate]);

    // 🆕 Preview Mode Handlers
    const handleConfirmPreview = useCallback(() => {
        if (!pendingPreview) return;

        // Add to undo stack upon confirmation
        setUndoStack(prev => [...prev.slice(-4), {
            html: pendingPreview.newHtml,
            action: pendingPreview.action,
            timestamp: Date.now(),
            elementInfo: selectedElementData?.tagName
        }]);
        setCanUndo(true);
        setElementSession(prev => ({ ...prev, lastAction: { type: pendingPreview.action } }));

        setChatHistory(prev => [...prev, {
            type: 'ai',
            message: `✅ Changes applied.`
        }]);

        setPendingPreview(null);
    }, [pendingPreview, selectedElementData]);

    const handleDiscardPreview = useCallback(() => {
        if (!pendingPreview) return;

        console.log('↩️ Discarding preview');
        onHtmlUpdate?.(pendingPreview.oldHtml);

        setChatHistory(prev => [...prev, {
            type: 'ai',
            message: `❌ Changes discarded.`
        }]);

        setPendingPreview(null);
    }, [pendingPreview, onHtmlUpdate]);

    // ==========================================
    // 6. SEND CHAT MESSAGE
    // ==========================================
    const handleSendMessage = async () => {
        const message = inputValue.trim();
        if (!message || isLoading) return;

        const sessionId = propSessionId || Cookies.get("session_id");
        const token = Cookies.get("access_token");

        if (!sessionId) {
            gsap.to(containerRef.current, { x: 8, duration: 0.05, repeat: 5, yoyo: true });
            return;
        }

        // If no conversation exists, create one first
        if (!currentConversationId) {
            await createNewConversation();
            return; // Will retry after conversation is created
        }

        setChatHistory(prev => [...prev, { type: 'user', message }]);
        onInputChange?.("");
        setIsLoading(true);

        try {
            // 🆕 Build enriched request body with element session context
            const activeElement = selectedElementData || elementSession.element;
            const hasActiveElement = activeElement && (activeElement.tagName || selectedElementName);

            const requestBody = {
                session_id: sessionId,
                conversation_id: currentConversationId,
                message,
                // 🆕 Include conversation context for better understanding
                context: {
                    messages_in_session: chatHistory.length,
                    element_session_active: hasActiveElement,
                    messages_since_element_selection: hasActiveElement ? chatHistory.length - elementSession.startIndex : 0,
                    previous_actions: elementSession.lastAction ? [elementSession.lastAction] : []
                }
            };

            console.log('🔍 Element Context:', {
                activeElement: activeElement?.tagName,
                sessionElement: elementSession.element?.tagName,
                hasActiveElement,
                messagesSinceSelection: requestBody.context.messages_since_element_selection
            });

            // 🆕 Always include element if session is active (even for follow-up questions)
            if (hasActiveElement) {
                console.log('🎯 Including element in request:', activeElement.tagName);
                requestBody.selected_element = {
                    tagName: activeElement.tagName || selectedElementName || 'unknown',
                    id: activeElement.id || null,
                    classes: activeElement.classes || activeElement.className || null,
                    text: activeElement.text?.substring(0, 500) || null,
                    src: activeElement.src || null,
                    href: activeElement.href || null,
                    styles: activeElement.styles || null,
                    elementType: activeElement.elementType || null,
                    // 🆕 Additional context for better AI understanding
                    sessionInfo: {
                        questionsAsked: elementSession.questionsAsked,
                        isFollowUp: elementSession.questionsAsked > 0
                    }
                };

                // Send current HTML content for element manipulation
                if (htmlContent) {
                    requestBody.html_content = htmlContent;
                }

                // 🆕 Update questions asked count
                setElementSession(prev => ({
                    ...prev,
                    questionsAsked: prev.questionsAsked + 1
                }));
            }

            console.log('📤 Sending chat request:', {
                hasElement: !!requestBody.selected_element,
                hasHtml: !!requestBody.html_content,
                elementTagName: requestBody.selected_element?.tagName,
                elementText: requestBody.selected_element?.text?.substring(0, 50),
                contextIncluded: !!requestBody.context
            });

            const response = await fetch(`${BASE_URL}/web-generator/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok && data) {
                const aiMessage = data.response || data.message || "Done!";

                // Add AI response with metadata
                setChatHistory(prev => [...prev, {
                    type: 'ai',
                    message: aiMessage,
                    metadata: {
                        actions_taken: data.actions_taken || [],
                        suggestions: data.suggestions || [],
                        intent: data.intent,
                        mode: data.mode,
                        html_updated: data.html_updated
                    }
                }]);

                setLastActivityTime(Date.now());

                // Reload conversations to update title and last message
                await loadConversations();

                // Handle different update types
                if (data.html_updated && data.updated_html) {
                    if (isPreviewMode) {
                        // 🆕 PREVIEW MODE: Apply change but wait for confirmation
                        setPendingPreview({
                            newHtml: data.updated_html,
                            oldHtml: htmlContent, // Current HTML before change
                            action: data.actions_taken?.[0]?.type || 'unknown'
                        });

                        // Show preview immediately
                        onHtmlUpdate?.(data.updated_html);

                        setChatHistory(prev => [...prev, {
                            type: 'ai',
                            message: "👀 Previewing changes... click Check to confirm or X to discard."
                        }]);
                    } else {
                        // STANDARD MODE: Apply immediately (existing logic)
                        setUndoStack(prev => [...prev.slice(-4), {
                            html: htmlContent,
                            action: data.actions_taken?.[0]?.type || 'unknown',
                            timestamp: Date.now(),
                            elementInfo: requestBody.selected_element?.tagName
                        }]);
                        setCanUndo(true);

                        setElementSession(prev => ({
                            ...prev,
                            lastAction: data.actions_taken?.[0] || null
                        }));

                        // Direct HTML update from element editing
                        console.log('✨ HTML updated by chatbot, updating preview');
                        onHtmlUpdate?.(data.updated_html);
                    }
                } else if (data.blueprint_updated) {
                    // Blueprint was updated, trigger code regeneration
                    console.log('📋 Blueprint updated, regenerating code');
                    onCodeUpdate?.(data);
                }

                onSubmit?.(data);
            } else {
                setChatHistory(prev => [...prev, { type: 'ai', message: data?.message || "Something went wrong" }]);
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            setChatHistory(prev => [...prev, { type: 'ai', message: "Failed to send message" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const loading = isLoading || externalLoading;

    if (!isOpen) return null;

    return (
        <>
            <div ref={panelRef} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                {/* Header with New Chat and History buttons */}
                <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        {/* New Chat Button */}
                        <button
                            onClick={createNewConversation}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl 
                                bg-gradient-to-r from-purple-500 to-blue-500 
                                text-white font-medium text-sm shadow-lg 
                                hover:shadow-purple-500/30 transition-all
                                hover:scale-105 active:scale-95"
                            title="Start new chat"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Chat</span>
                        </button>

                        {/* Current Chat Title */}
                        {chatHistory.length > 0 && (
                            <div className="px-4 py-2 rounded-xl bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10">
                                <span className="text-gray-300 text-sm">
                                    {generateChatTitle(chatHistory)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* 🆕 Preview Toggle */}
                        <button
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className={`p-2 rounded-xl transition-all border ${isPreviewMode
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                : 'bg-[#0a0a0f]/95 text-gray-400 border-white/10 hover:text-white'
                                }`}
                            title={isPreviewMode ? "Preview Mode ON (Changes require confirmation)" : "Preview Mode OFF (Changes apply immediately)"}
                        >
                            {isPreviewMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* History Button */}
                        <button
                            onClick={() => setShowHistory(true)}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl 
                                bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 
                                hover:bg-[#1a1a2e] hover:border-purple-500/50 
                                text-gray-300 hover:text-white 
                                transition-all"
                            title="Chat history"
                        >
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">History</span>
                            {conversations.length > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                                    {conversations.length}
                                </span>
                            )}
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-white transition-all"
                            title="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Chat History */}
                {chatHistory.length > 0 && (
                    <div className="mb-3 max-h-72 overflow-y-auto rounded-2xl bg-[#0a0a0f]/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="p-4 space-y-3">
                            {chatHistory.map((chat, index) => (
                                <div key={index} className={`flex gap-3 ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {chat.type === 'ai' && (
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${chat.type === 'user'
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-md'
                                        : 'bg-white/10 text-white rounded-bl-md'
                                        }`}>
                                        {chat.message}
                                    </div>
                                    {chat.type === 'user' && (
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white animate-spin" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl bg-white/10 rounded-bl-md">
                                        <span className="text-gray-400 animate-pulse">AI is thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                )}

                {/* 🆕 Pending Preview Banner */}
                {pendingPreview && (
                    <div className="mb-3 p-3 rounded-xl bg-purple-900/90 backdrop-blur-xl border border-purple-500/50 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3">
                            <Eye className="w-4 h-4 text-purple-300" />
                            <span className="text-sm text-white font-medium">Previewing Changes...</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleConfirmPreview}
                                className="p-1.5 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors"
                                title="Confirm Changes"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleDiscardPreview}
                                className="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                                title="Discard Changes"
                            >
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Selected Element Badge - Enhanced with element details */}
                {(selectedElementName || selectedElementData) && (
                    <div className="mb-2 px-4 py-3 rounded-xl bg-[#0a0a0f]/95 backdrop-blur-xl border border-purple-500/30 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <MousePointer2 className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-400">Editing Element:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 ml-6">
                            {/* Tag Name */}
                            <code className="px-2 py-0.5 rounded-lg bg-purple-500/30 text-purple-300 font-mono text-xs font-bold">
                                &lt;{selectedElementData?.tagName || selectedElementName}&gt;
                            </code>

                            {/* Element ID if exists */}
                            {selectedElementData?.id && (
                                <code className="px-2 py-0.5 rounded-lg bg-blue-500/30 text-blue-300 font-mono text-xs">
                                    #{selectedElementData.id}
                                </code>
                            )}

                            {/* Text Preview if exists */}
                            {selectedElementData?.text && (
                                <span className="text-gray-400 text-xs truncate max-w-[200px]">
                                    "{selectedElementData.text.substring(0, 30)}{selectedElementData.text.length > 30 ? '...' : ''}"
                                </span>
                            )}

                            {/* Clear/Cancel element selection button */}
                            <button
                                onClick={onClearElement}
                                className="ml-auto p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all"
                                title="Clear element selection"
                            >
                                <X className="w-3 h-3" />
                            </button>

                            {/* 🆕 Undo button - only show if undo available */}
                            {canUndo && (
                                <button
                                    onClick={handleUndo}
                                    className="p-1 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 hover:text-yellow-300 transition-all"
                                    title="Undo last change"
                                >
                                    <Undo2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Quick hint */}
                        <div className="mt-2 ml-6 text-xs text-gray-500">
                            💡 Ask me to change text, color, style or describe this element
                        </div>
                    </div>
                )}

                {/* Input Container */}
                <div
                    ref={containerRef}
                    className="bg-[#0a0a0f]/95 backdrop-blur-xl w-full rounded-2xl border border-white/10 flex items-center p-2 pl-5 gap-3 shadow-2xl"
                >
                    <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => onInputChange?.(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Ask AI to make changes... (e.g., "Make hero section dark")'
                        disabled={loading}
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-500"
                    />

                    {inputValue.trim() && (
                        <button
                            onClick={() => onInputChange?.("")}
                            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X size={16} />
                        </button>
                    )}

                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !inputValue.trim()}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${inputValue.trim()
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                            : 'bg-white/5 text-gray-500'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Sparkles className="w-4 h-4 animate-spin" />
                                <span className="hidden sm:inline">Sending</span>
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Send</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Chat History Sidebar */}
            < ChatHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                chatSessions={conversations}
                onSelectChat={switchToConversation}
                onDeleteChat={deleteConversation}
            />
        </>
    );
}