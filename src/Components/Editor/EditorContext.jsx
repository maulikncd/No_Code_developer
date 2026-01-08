// import React, { createContext, useContext, useState } from 'react';
// import { initialProjectData } from './initialData';

// const EditorContext = createContext();

// export const useEditor = () => {
//     const context = useContext(EditorContext);
//     if (!context) {
//         throw new Error('useEditor must be used within an EditorProvider');
//     }
//     return context;
// };

// export const EditorProvider = ({ children }) => {
//     const [projectData, setProjectData] = useState(initialProjectData);
//     const [selectedElementId, setSelectedElementId] = useState(null);

//     const selectElement = (id) => {
//         setSelectedElementId(id);
//     };

//     const updateElement = (id, newAttributes) => {
//         setProjectData((prev) => ({
//             ...prev,
//             elements: {
//                 ...prev.elements,
//                 [id]: {
//                     ...prev.elements[id],
//                     ...newAttributes,
//                 },
//             },
//         }));
//     };

//     const value = {
//         projectData,
//         selectedElementId,
//         selectElement,
//         updateElement,
//         selectedElement: selectedElementId ? projectData.elements[selectedElementId] : null
//     };

//     return (
//         <EditorContext.Provider value={value}>
//             {children}
//         </EditorContext.Provider>
//     );
// };












// "use client";
// import React, { createContext, useContext, useState } from 'react';

// const EditorContext = createContext();

// export const useEditor = () => {
//     const context = useContext(EditorContext);
//     if (!context) throw new Error('useEditor must be used within an EditorProvider');
//     return context;
// };

// export const EditorProvider = ({ children }) => {
//     // 1. Raw Content (Abhi dummy data hai, baad me backend se aayega)
//     const [htmlContent, setHtmlContent] = useState(`
//         <div class="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-10">
//             <h1 class="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
//                 Galaxy UI
//             </h1>
//             <p class="text-xl text-gray-400 mb-8 max-w-lg text-center">
//                 Revolutionize your SaaS product with our modern builder. Click any element to inspect.
//             </p>
//             <div class="flex gap-4">
//                 <button class="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition">Get Started</button>
//                 <button class="px-6 py-3 border border-gray-700 rounded-lg font-medium hover:bg-gray-800 transition">Learn More</button>
//             </div>
//         </div>
//     `);
//     const [cssContent, setCssContent] = useState("");
//     const [jsContent, setJsContent] = useState("");

//     // 2. Selection State
//     const [selectedElement, setSelectedElement] = useState(null);
//     const [isSelectMode, setIsSelectMode] = useState(false); // Default false

//     // 3. Selection Handler
//     const handleSelection = (data) => {
//         // console.log("Selected:", data);
//         setSelectedElement(data);
//     };

//     // 4. Update Handler (Optimistic UI Update for Sidebar)
//     const updateElement = (field, value) => {
//         if (!selectedElement) return;

//         setSelectedElement(prev => ({
//             ...prev,
//             [field]: value
//         }));

//         // Note: Real app me yahan HTML string replace logic aayega
//     };

//     const value = {
//         htmlContent, setHtmlContent,
//         cssContent, setCssContent,
//         jsContent, setJsContent,
//         selectedElement,
//         handleSelection,
//         isSelectMode, setIsSelectMode,
//         updateElement
//     };

//     return (
//         <EditorContext.Provider value={value}>
//             {children}
//         </EditorContext.Provider>
//     );
// };


















"use client";
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { ProjectAPI } from '../../services/ProjectAPI';

const EditorContext = createContext();

// Maximum history size for undo/redo (reduced for localStorage persistence)
const MAX_HISTORY_SIZE = 20;

// ============================================
// HELPER: Clean HTML content before saving
// Removes all interaction-related attributes that shouldn't be persisted
// ============================================
const cleanHtmlContent = (html) => {
    if (!html) return html;

    let cleaned = html;

    // 1. Remove all data-attributes injected by the selector
    cleaned = cleaned.replace(/\sdata-(hover|selected|jarvis|contenteditable|jarvis-initialized)[^=]*="[^"]*"/g, '');
    cleaned = cleaned.replace(/\sdata-(hover|selected|jarvis|contenteditable|jarvis-initialized)[^=\s>]*(\s|>)/g, '$2');

    // 2. Remove any injected style tags for selector
    // Removes: <style id="jarvis-interaction-styles">...</style> and similar
    cleaned = cleaned.replace(/<style[^>]*id="(jarvis-interaction-styles|jarvis-selector-styles)"[^>]*>[\s\S]*?<\/style>/gi, '');

    // 3. Remove styles that contain our specific interaction CSS rules (backup check)
    cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?data-hover="true"[\s\S]*?<\/style>/gi, '');

    // 4. Remove UI elements like the toolbar
    cleaned = cleaned.replace(/<div[^>]*id="jarvis-toolbar"[^>]*>[\s\S]*?<\/div>/gi, '');

    // 5. Final polish: remove any leftover empty attributes or weird spacing
    cleaned = cleaned.replace(/\s{2,}/g, ' ');

    return cleaned.trim();
};

export const useEditor = () => {
    return useContext(EditorContext);
};

export const EditorProvider = ({ children, sessionId }) => {
    // ============================================
    // STORAGE KEY (Session Specific)
    // ============================================
    const storageKey = sessionId ? `editorHtmlContent_${sessionId}` : 'editorHtmlContent';

    // ============================================
    // ELEMENT SELECTION STATE
    // ============================================
    const [selectedElement, setSelectedElement] = useState(null);
    const [originalElement, setOriginalElement] = useState(null);
    const [elementUpdateTrigger, setElementUpdateTrigger] = useState(0);

    // Jarvis Selector state
    const [selectorReady, setSelectorReady] = useState(false);
    const [interactionMode, setInteractionMode] = useState(false);

    // Store iframe reference for extracting HTML on save
    const iframeRef = useRef(null);

    // Default HTML content
    const defaultHtmlContent = `
        <div class="min-h-screen bg-[#050510] text-white flex flex-col items-center justify-center p-10 font-sans">
            <div class="flex items-center gap-2 mb-8 opacity-80">
                <span class="text-xl font-bold tracking-wide">Galaxy</span>
            </div>
            <h1 class="text-6xl md:text-7xl font-bold text-center bg-gradient-to-r from-violet-400 to-blue-500 bg-clip-text text-transparent mb-6">
                Revolutionize your<br/>SaaS products
            </h1>
            <p class="text-gray-400 text-xl max-w-2xl text-center mb-10 leading-relaxed">
                Create stunning, professional-quality websites in record time with our powerful UI kit.
            </p>
            <div class="flex gap-4">
                <button class="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition">Get Started</button>
                <button class="px-8 py-4 border border-white/20 rounded-full font-bold hover:bg-white/10 transition">View Demo</button>
            </div>
        </div>
    `;

    // ============================================
    // HTML CONTENT STATE
    // ============================================
    const [htmlContent, setHtmlContentInternal] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            // Clean any saved content to remove old interaction attributes
            const cleaned = cleanHtmlContent(saved);
            // Update localStorage with cleaned version
            localStorage.setItem(storageKey, cleaned);
            return cleaned;
        }
        return defaultHtmlContent;
    });

    // ============================================
    // UNDO/REDO HISTORY
    // ============================================
    const historyKey = sessionId ? `editorHistory_${sessionId}` : 'editorHistory';
    const futureKey = sessionId ? `editorFuture_${sessionId}` : 'editorFuture';

    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem(historyKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load history:', e);
            return [];
        }
    });

    const [future, setFuture] = useState(() => {
        try {
            const saved = localStorage.getItem(futureKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load future:', e);
            return [];
        }
    });

    const [isUndoRedo, setIsUndoRedo] = useState(false); // Flag to prevent history push during undo/redo

    // Sync history to localStorage
    useEffect(() => {
        if (!isUndoRedo) {
            localStorage.setItem(historyKey, JSON.stringify(history));
        }
    }, [history, historyKey, isUndoRedo]);

    // Sync future to localStorage
    useEffect(() => {
        if (!isUndoRedo) {
            localStorage.setItem(futureKey, JSON.stringify(future));
        }
    }, [future, futureKey, isUndoRedo]);

    // Push to history
    const pushToHistory = useCallback((content) => {
        if (!content || isUndoRedo) return;

        setHistory(prev => {
            const newHistory = [...prev, content].slice(-MAX_HISTORY_SIZE);
            return newHistory;
        });
        setFuture([]); // Clear future on new action
    }, [isUndoRedo]);

    // Set HTML content with history tracking
    // ALWAYS cleans HTML to remove interaction attributes
    const setHtmlContent = useCallback((html) => {
        if (!html) return;

        // IMPORTANT: Always clean HTML before saving to remove interaction artifacts
        const cleanedHtml = cleanHtmlContent(html);

        // Push current content to history before changing
        if (htmlContent && cleanedHtml !== htmlContent && !isUndoRedo) {
            pushToHistory(htmlContent);
        }

        setHtmlContentInternal(cleanedHtml);
        localStorage.setItem(storageKey, cleanedHtml);

        console.log(`🧹 HTML cleaned and saved to ${storageKey}`);
    }, [htmlContent, pushToHistory, isUndoRedo, storageKey]);

    // Undo action
    const undo = useCallback(() => {
        if (history.length === 0) {
            console.log('⚠️ No more undo history');
            return false;
        }

        setIsUndoRedo(true);

        const previousContent = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        setHistory(newHistory);
        setFuture(prev => [htmlContent, ...prev]);
        setHtmlContentInternal(previousContent);
        localStorage.setItem(storageKey, previousContent);

        // Update storage immediately for undo/redo to be safe
        localStorage.setItem(historyKey, JSON.stringify(newHistory));
        localStorage.setItem(futureKey, JSON.stringify([htmlContent, ...future]));

        console.log('↩️ Undo performed');

        setTimeout(() => setIsUndoRedo(false), 100);
        return true;
    }, [history, htmlContent, storageKey]);

    // Redo action
    const redo = useCallback(() => {
        if (future.length === 0) {
            console.log('⚠️ No more redo history');
            return false;
        }

        setIsUndoRedo(true);

        const nextContent = future[0];
        const newFuture = future.slice(1);

        setHistory(prev => [...prev, htmlContent]);
        setFuture(newFuture);
        setHtmlContentInternal(nextContent);
        localStorage.setItem(storageKey, nextContent);

        // Update storage immediately
        localStorage.setItem(historyKey, JSON.stringify([...history, htmlContent]));
        localStorage.setItem(futureKey, JSON.stringify(newFuture));

        console.log('↪️ Redo performed');

        setTimeout(() => setIsUndoRedo(false), 100);
        return true;
    }, [future, htmlContent, storageKey]);

    // Check capabilities
    const canUndo = history.length > 0;
    const canRedo = future.length > 0;

    // ============================================
    // KEYBOARD SHORTCUTS (Ctrl+Z, Ctrl+Y)
    // ============================================
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // Ctrl/Cmd + Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }

            // Ctrl/Cmd + Shift + Z = Redo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                redo();
            }

            // Ctrl/Cmd + Y = Redo (alternative)
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // ============================================
    // ELEMENT OPERATIONS
    // ============================================

    // Update element properties (temporary changes)
    const updateElementProperty = (field, value) => {
        if (!selectedElement) return;

        const updatedElement = {
            ...selectedElement,
            [field]: value
        };

        setSelectedElement(updatedElement);
        setElementUpdateTrigger(prev => prev + 1);
    };

    // Save changes - commits the temporary changes AND syncs to backend
    const saveChanges = useCallback(async () => {
        if (!selectedElement) return false;

        if (iframeRef.current && iframeRef.current.contentWindow) {
            try {
                const iframeDoc = iframeRef.current.contentWindow.document;
                const bodyContent = iframeDoc.body.innerHTML;

                // IMPORTANT: Clean HTML before saving to remove interaction attributes
                const cleanedContent = cleanHtmlContent(bodyContent);

                // This will trigger history push and save to localStorage
                setHtmlContent(cleanedContent);

                // Set original to current (commit changes)
                setOriginalElement(selectedElement);

                console.log('✅ Changes saved to localStorage!');

                // 🆕 SYNC TO BACKEND: Ensure chatbot uses latest HTML
                // This prevents property changes from being lost when chatbot regenerates code
                if (sessionId) {
                    console.log('🔄 Syncing changes to backend...');
                    const syncResult = await ProjectAPI.syncCode({
                        sessionId: sessionId,
                        htmlContent: cleanedContent
                    });

                    if (syncResult.status) {
                        console.log('✅ Changes synced to backend!');
                    } else {
                        console.warn('⚠️ Backend sync failed, but localStorage saved');
                    }
                }

                return true;
            } catch (error) {
                console.error('Error saving changes:', error);
                return false;
            }
        }
        return false;
    }, [selectedElement, setHtmlContent, sessionId]);

    // Cancel changes - revert to original state
    const cancelChanges = useCallback(() => {
        if (!originalElement) {
            setSelectedElement(null);
            return;
        }

        // Send revert message to iframe to restore original element state
        if (iframeRef.current && iframeRef.current.contentWindow) {
            // Send all original properties to restore
            ['text', 'classes', 'src', 'href', 'alt', 'placeholder', 'target'].forEach(field => {
                if (originalElement[field] !== undefined) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'UPDATE_ELEMENT',
                        payload: { field, value: originalElement[field] }
                    }, '*');
                }
            });
        }

        // Trigger UI update with original values briefly
        setSelectedElement(originalElement);
        setElementUpdateTrigger(prev => prev + 1);

        // Then close the panel
        setTimeout(() => {
            setSelectedElement(null);
            setOriginalElement(null);
        }, 50);
    }, [originalElement, iframeRef]);

    // Custom setSelectedElement wrapper to also store original
    const selectElement = useCallback((element) => {
        if (element) {
            setOriginalElement(element);
        }
        setSelectedElement(element);
    }, []);

    // Reset content to default
    const resetContent = useCallback(() => {
        // Save current state for undo
        if (htmlContent) {
            pushToHistory(htmlContent);
        }

        localStorage.removeItem(storageKey);
        setHtmlContentInternal(defaultHtmlContent);
        setSelectedElement(null);
        setOriginalElement(null);

        // Future should be cleared because we're starting a "new" path from default
        setFuture([]);
        localStorage.removeItem(futureKey);

        console.log('🔄 Content reset to default');
    }, [htmlContent, pushToHistory, storageKey, defaultHtmlContent, futureKey]);

    // Clear all session specific data from localStorage
    const clearSessionData = useCallback(() => {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(historyKey);
        localStorage.removeItem(futureKey);
        localStorage.removeItem(`${storageKey}_synced`);

        setHtmlContentInternal(defaultHtmlContent);
        setHistory([]);
        setFuture([]);
        setSelectedElement(null);
        setOriginalElement(null);

        console.log(`🧹 All data cleared for session: ${sessionId}`);
    }, [storageKey, historyKey, futureKey, defaultHtmlContent, sessionId]);

    // Clear all history
    const clearHistory = useCallback(() => {
        setHistory([]);
        setFuture([]);
        localStorage.removeItem(historyKey);
        localStorage.removeItem(futureKey);
        console.log('🗑️ History cleared');
    }, [historyKey, futureKey]);

    // ============================================
    // CONTEXT PROVIDER VALUE
    // ============================================
    return (
        <EditorContext.Provider value={{
            // Element Selection
            selectedElement,
            setSelectedElement: selectElement,
            originalElement,
            updateElementProperty,
            elementUpdateTrigger,

            // HTML Content
            htmlContent,
            setHtmlContent,

            // Undo/Redo
            undo,
            redo,
            canUndo,
            canRedo,
            clearHistory,
            historyLength: history.length,
            futureLength: future.length,

            // Save/Cancel
            saveChanges,
            cancelChanges,
            resetContent,
            clearSessionData,

            // Jarvis Selector
            selectorReady,
            setSelectorReady,
            interactionMode,
            setInteractionMode,

            // Iframe Reference
            iframeRef,

            // Session ID for API calls
            sessionId
        }}>
            {children}
        </EditorContext.Provider>
    );
};