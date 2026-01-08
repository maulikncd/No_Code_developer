import { Clock, X, MessageSquare, Trash2 } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from "../../ThemeProvider";
import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

export function ChatHistory({ isOpen, onClose, chatSessions, onSelectChat, onDeleteChat }) {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const containerRef = useRef(null);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { opacity: 0, x: 300 },
                { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
            );
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                onClick={onClose}
            />

            {/* History Panel */}
            <div
                ref={containerRef}
                className={`fixed right-0 top-0 h-full w-full max-w-md z-[70] shadow-2xl
                    ${isDark ? 'bg-[#0B0B0B]' : 'bg-white'}`}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Chat History</h2>
                                <p className="text-sm text-gray-400">{chatSessions.length} conversations</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Chat List */}
                <div className="overflow-y-auto h-[calc(100%-120px)] p-4 space-y-2">
                    {chatSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">No chat history yet</p>
                            <p className="text-gray-600 text-sm mt-2">Start a conversation to see it here</p>
                        </div>
                    ) : (
                        chatSessions.map((session) => (
                            <div
                                key={session.id}
                                className="group relative p-4 rounded-xl bg-[#0a0a0f] hover:bg-[#1a1a2e] 
                                    border border-white/10 hover:border-purple-500/50 
                                    transition-all cursor-pointer"
                                onClick={() => {
                                    onSelectChat(session.id);
                                    onClose();
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                            <h3 className="text-white font-medium text-sm truncate">
                                                {session.title || 'New Chat'}
                                            </h3>
                                        </div>
                                        <p className="text-gray-500 text-xs truncate">
                                            {session.lastMessage || 'No messages yet'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Clock className="w-3 h-3 text-gray-600" />
                                            <span className="text-gray-600 text-xs">
                                                {formatTime(session.lastUpdated)}
                                            </span>
                                            <span className="text-gray-700 text-xs">•</span>
                                            <span className="text-gray-600 text-xs">
                                                {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteChat(session.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg 
                                            hover:bg-red-500/20 text-gray-500 hover:text-red-400 
                                            transition-all"
                                        title="Delete chat"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
