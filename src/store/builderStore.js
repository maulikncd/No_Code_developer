/**
 * BUILDER STORE (Zustand)
 * ==========================
 * Centralized state management for the No-Code Builder
 * 
 * Features:
 * - Element Selection State
 * - Undo/Redo History
 * - HTML Content Management
 * - Interaction Mode Tracking
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Maximum history size for undo/redo
const MAX_HISTORY_SIZE = 50;

export const useBuilderStore = create(
    subscribeWithSelector((set, get) => ({
        // ============================================
        // ELEMENT SELECTION STATE
        // ============================================
        selectedElement: null,
        selectedElementData: null,
        interactionMode: false,  // true = selection mode active
        selectorReady: false,    // true when iframe script is ready

        // Select an element
        selectElement: (elementData) => {
            set({
                selectedElement: elementData?.tagName + (elementData?.id ? `#${elementData.id}` : ''),
                selectedElementData: {
                    tagName: elementData?.tagName || null,
                    id: elementData?.id || null,
                    className: elementData?.className || null,
                    text: elementData?.text || elementData?.innerText || null,
                    path: elementData?.path || null,
                    styles: elementData?.styles || {},
                    rect: elementData?.rect || {},
                    attributes: elementData?.attributes || {}
                }
            });
        },

        // Clear element selection
        clearElementSelection: () => {
            set({
                selectedElement: null,
                selectedElementData: null
            });
        },

        // Toggle interaction/selection mode
        setInteractionMode: (enabled) => {
            set({ interactionMode: enabled });
        },

        // Set selector ready status
        setSelectorReady: (ready) => {
            set({ selectorReady: ready });
        },

        // ============================================
        // HTML CONTENT STATE
        // ============================================
        htmlContent: '',
        cssContent: '',
        jsContent: '',

        setHtmlContent: (html) => {
            const prevHtml = get().htmlContent;
            if (prevHtml && html !== prevHtml) {
                // Add to history before changing
                get().pushToHistory(prevHtml);
            }
            set({ htmlContent: html });
            // Persist to localStorage
            localStorage.setItem('builderHtmlContent', html);
        },

        setCssContent: (css) => set({ cssContent: css }),
        setJsContent: (js) => set({ jsContent: js }),

        // Load content from localStorage
        loadFromStorage: () => {
            const savedHtml = localStorage.getItem('builderHtmlContent');
            if (savedHtml) {
                set({ htmlContent: savedHtml });
            }
        },

        // ============================================
        // UNDO/REDO HISTORY
        // ============================================
        history: [],          // Past states
        future: [],           // Future states (for redo)
        historyIndex: -1,     // Current position in history

        // Push current state to history
        pushToHistory: (content) => {
            set(state => {
                const newHistory = [...state.history, content].slice(-MAX_HISTORY_SIZE);
                return {
                    history: newHistory,
                    future: [],  // Clear future on new action
                    historyIndex: newHistory.length - 1
                };
            });
        },

        // Undo action
        undo: () => {
            const { history, htmlContent, future } = get();
            if (history.length === 0) return false;

            const previousContent = history[history.length - 1];
            const newHistory = history.slice(0, -1);

            set({
                history: newHistory,
                future: [htmlContent, ...future],
                htmlContent: previousContent,
                historyIndex: newHistory.length - 1
            });

            localStorage.setItem('builderHtmlContent', previousContent);
            return true;
        },

        // Redo action
        redo: () => {
            const { future, htmlContent, history } = get();
            if (future.length === 0) return false;

            const nextContent = future[0];
            const newFuture = future.slice(1);

            set({
                history: [...history, htmlContent],
                future: newFuture,
                htmlContent: nextContent,
                historyIndex: history.length
            });

            localStorage.setItem('builderHtmlContent', nextContent);
            return true;
        },

        // Check if can undo/redo
        canUndo: () => get().history.length > 0,
        canRedo: () => get().future.length > 0,

        // Clear history
        clearHistory: () => {
            set({
                history: [],
                future: [],
                historyIndex: -1
            });
        },

        // ============================================
        // TEXT CHANGES TRACKING
        // ============================================
        textChanges: [],
        pendingChanges: false,

        // Add a text change
        addTextChange: (change) => {
            set(state => ({
                textChanges: [...state.textChanges, {
                    ...change,
                    timestamp: Date.now()
                }],
                pendingChanges: true
            }));
        },

        // Clear text changes
        clearTextChanges: () => {
            set({
                textChanges: [],
                pendingChanges: false
            });
        },

        // ============================================
        // CHAT/EDITING STATE
        // ============================================
        isChatOpen: false,
        chatInput: '',
        isEditing: false,
        editingElement: null,

        setChatOpen: (open) => set({ isChatOpen: open }),
        setChatInput: (input) => set({ chatInput: input }),
        setEditingElement: (element) => set({
            editingElement: element,
            isEditing: !!element
        }),

        // ============================================
        // SAVE STATUS
        // ============================================
        saveStatus: 'idle', // 'idle' | 'saving' | 'saved' | 'error'

        setSaveStatus: (status) => set({ saveStatus: status }),

        // ============================================
        // QUICK ACTIONS
        // ============================================

        // Update selected element property
        updateSelectedProperty: (field, value) => {
            const { selectedElementData } = get();
            if (!selectedElementData) return;

            set({
                selectedElementData: {
                    ...selectedElementData,
                    [field]: value
                }
            });
        },

        // Reset entire store
        resetStore: () => {
            localStorage.removeItem('builderHtmlContent');
            set({
                selectedElement: null,
                selectedElementData: null,
                interactionMode: false,
                htmlContent: '',
                history: [],
                future: [],
                historyIndex: -1,
                textChanges: [],
                pendingChanges: false,
                isChatOpen: false,
                chatInput: '',
                saveStatus: 'idle'
            });
        }
    }))
);

// ============================================
// SELECTORS (for optimized re-renders)
// ============================================
export const selectSelectedElement = (state) => state.selectedElement;
export const selectSelectedElementData = (state) => state.selectedElementData;
export const selectHtmlContent = (state) => state.htmlContent;
export const selectCanUndo = (state) => state.history.length > 0;
export const selectCanRedo = (state) => state.future.length > 0;
export const selectSaveStatus = (state) => state.saveStatus;
export const selectInteractionMode = (state) => state.interactionMode;

// ============================================
// KEYBOARD SHORTCUTS HANDLER
// ============================================
export const setupKeyboardShortcuts = () => {
    const handleKeyboard = (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const store = useBuilderStore.getState();

        // Ctrl/Cmd + Z = Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            store.undo();
        }

        // Ctrl/Cmd + Shift + Z = Redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
            e.preventDefault();
            store.redo();
        }

        // Ctrl/Cmd + Y = Redo (alternative)
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            e.preventDefault();
            store.redo();
        }

        // Escape = Clear selection
        if (e.key === 'Escape') {
            store.clearElementSelection();
        }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
};

export default useBuilderStore;
