/**
 * JARVIS SELECTOR SCRIPT
 * =======================
 * This script is injected into generated HTML files (iFrames) to enable:
 * - Element hover highlighting
 * - Click-to-select functionality  
 * - Inline text editing (contentEditable)
 * - Floating toolbar (Regenerate, Custom Edit, Props buttons)
 * - Communication with parent frame via postMessage
 * 
 * DO NOT MODIFY - This is auto-injected into preview iframes
 */

(function () {
    'use strict';

    // Prevent double initialization
    if (window.__JARVIS_INITIALIZED__) return;
    window.__JARVIS_INITIALIZED__ = true;

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        highlightColor: '#3B82F6',        // Blue
        selectedColor: '#8B5CF6',          // Purple
        editingColor: '#10B981',           // Green
        hoverBorderStyle: '2px dashed',
        selectedBorderStyle: '2px solid',
        editingBorderStyle: '2px solid',
        toolbarOffset: 8,
        excludedTags: ['HTML', 'HEAD', 'BODY', 'SCRIPT', 'STYLE', 'META', 'LINK', 'NOSCRIPT'],
        editableTags: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'BUTTON', 'A', 'LI', 'TD', 'TH', 'LABEL', 'DIV']
    };

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    let state = {
        selectionMode: true,              // Is selection mode active
        currentHoveredElement: null,       // Currently hovered element
        currentSelectedElement: null,      // Currently selected element
        isEditing: false,                  // Is user editing text
        originalText: '',                  // Original text before editing
        toolbar: null,                     // Floating toolbar element
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    // Get unique element path (XPath-like)
    function getElementPath(element) {
        if (!element || element === document.body) return 'body';

        const path = [];
        let current = element;

        while (current && current !== document.body && current !== document.documentElement) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
                selector += `#${current.id}`;
            } else if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.');
                if (classes) selector += `.${classes}`;
            }

            // Add index if there are siblings with same tag
            const siblings = current.parentElement?.children || [];
            const sameTagSiblings = Array.from(siblings).filter(s => s.tagName === current.tagName);
            if (sameTagSiblings.length > 1) {
                const index = sameTagSiblings.indexOf(current) + 1;
                selector += `:nth-of-type(${index})`;
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return 'body > ' + path.join(' > ');
    }

    // Get computed styles for element
    function getElementStyles(element) {
        const computed = window.getComputedStyle(element);
        return {
            width: computed.width,
            height: computed.height,
            padding: computed.padding,
            margin: computed.margin,
            display: computed.display,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            borderRadius: computed.borderRadius,
            textAlign: computed.textAlign
        };
    }

    // Get element data for parent communication
    function getElementData(element) {
        const rect = element.getBoundingClientRect();
        return {
            tagName: element.tagName.toLowerCase(),
            id: element.id || null,
            className: element.className || null,
            text: element.innerText?.substring(0, 500) || null,
            innerHTML: element.innerHTML?.substring(0, 1000) || null,
            path: getElementPath(element),
            styles: getElementStyles(element),
            rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            },
            attributes: Object.fromEntries(
                Array.from(element.attributes).map(attr => [attr.name, attr.value])
            )
        };
    }

    // Check if element is valid for selection
    function isValidElement(element) {
        if (!element) return false;
        if (CONFIG.excludedTags.includes(element.tagName)) return false;
        if (element.id === 'jarvis-toolbar') return false;
        if (element.closest('#jarvis-toolbar')) return false;
        return true;
    }

    // Check if element text is editable
    function isTextEditable(element) {
        return CONFIG.editableTags.includes(element.tagName);
    }

    // ============================================
    // STYLING FUNCTIONS
    // ============================================

    // Inject styles
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'jarvis-selector-styles';
        style.textContent = `
            /* Hover state */
            [data-jarvis-hover="true"] {
                outline: ${CONFIG.hoverBorderStyle} ${CONFIG.highlightColor} !important;
                outline-offset: 2px;
                cursor: pointer;
            }
            
            /* Selected state */
            [data-jarvis-selected="true"] {
                outline: ${CONFIG.selectedBorderStyle} ${CONFIG.selectedColor} !important;
                outline-offset: 2px;
            }
            
            /* Editing state */
            [data-jarvis-editing="true"] {
                outline: ${CONFIG.editingBorderStyle} ${CONFIG.editingColor} !important;
                outline-offset: 2px;
                cursor: text;
            }
            
            /* Floating Toolbar */
            #jarvis-toolbar {
                position: fixed;
                display: flex;
                gap: 4px;
                padding: 6px 8px;
                background: linear-gradient(135deg, #1e1e2e 0%, #2d2d3f 100%);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 10px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                backdrop-filter: blur(20px);
                animation: jarvis-toolbar-fade-in 0.15s ease-out;
            }
            
            @keyframes jarvis-toolbar-fade-in {
                from { opacity: 0; transform: translateY(-8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            #jarvis-toolbar button {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 6px;
                color: #fff;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
                white-space: nowrap;
            }
            
            #jarvis-toolbar button:hover {
                background: rgba(255,255,255,0.15);
                border-color: rgba(255,255,255,0.2);
                transform: translateY(-1px);
            }
            
            #jarvis-toolbar button.regenerate {
                background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
                border-color: rgba(139, 92, 246, 0.3);
            }
            
            #jarvis-toolbar button.regenerate:hover {
                background: linear-gradient(135deg, #9D7AFF 0%, #7C7FFF 100%);
            }
            
            #jarvis-toolbar button.custom-edit {
                background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                border-color: rgba(59, 130, 246, 0.3);
            }
            
            #jarvis-toolbar button.custom-edit:hover {
                background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
            }
            
            #jarvis-toolbar button.props {
                background: rgba(255,255,255,0.08);
            }
            
            /* Inline edit indicator */
            .jarvis-editing-indicator {
                position: fixed;
                padding: 6px 12px;
                background: ${CONFIG.editingColor};
                color: white;
                font-size: 11px;
                font-weight: 600;
                border-radius: 4px;
                z-index: 999998;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Apply hover highlight
    function applyHoverHighlight(element) {
        if (state.currentHoveredElement && state.currentHoveredElement !== element) {
            state.currentHoveredElement.removeAttribute('data-jarvis-hover');
        }
        if (element && isValidElement(element) && element !== state.currentSelectedElement) {
            element.setAttribute('data-jarvis-hover', 'true');
            state.currentHoveredElement = element;
        }
    }

    // Remove hover highlight
    function removeHoverHighlight(element) {
        if (element) {
            element.removeAttribute('data-jarvis-hover');
        }
        if (state.currentHoveredElement === element) {
            state.currentHoveredElement = null;
        }
    }

    // Select element
    function selectElement(element) {
        // Clear previous selection
        if (state.currentSelectedElement) {
            state.currentSelectedElement.removeAttribute('data-jarvis-selected');
            state.currentSelectedElement.removeAttribute('contenteditable');
        }

        // Clear hover on new selection
        if (state.currentHoveredElement) {
            removeHoverHighlight(state.currentHoveredElement);
        }

        // Set new selection
        if (element && isValidElement(element)) {
            element.setAttribute('data-jarvis-selected', 'true');
            state.currentSelectedElement = element;

            // Show toolbar
            showToolbar(element);

            return true;
        }

        return false;
    }

    // Deselect element
    function deselectElement() {
        if (state.currentSelectedElement) {
            state.currentSelectedElement.removeAttribute('data-jarvis-selected');
            state.currentSelectedElement.removeAttribute('data-jarvis-editing');
            state.currentSelectedElement.removeAttribute('contenteditable');
        }
        state.currentSelectedElement = null;
        state.isEditing = false;
        hideToolbar();
    }

    // ============================================
    // FLOATING TOOLBAR
    // ============================================

    function createToolbar() {
        if (state.toolbar) return state.toolbar;

        const toolbar = document.createElement('div');
        toolbar.id = 'jarvis-toolbar';
        toolbar.innerHTML = `
            <button class="regenerate" data-action="regenerate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 11-3-6.7l2-2"/>
                    <path d="M21 3v6h-6"/>
                </svg>
                Regenerate
            </button>
            <button class="custom-edit" data-action="custom-edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>   
                Custom Edit
            </button>
            <button class="props" data-action="props">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Props
            </button>
        `;

        // Add event listeners
        toolbar.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                handleToolbarAction(action);
            });
        });

        document.body.appendChild(toolbar);
        state.toolbar = toolbar;
        return toolbar;
    }

    function showToolbar(element) {
        const toolbar = createToolbar();
        const rect = element.getBoundingClientRect();

        // Position toolbar above element
        let top = rect.top - toolbar.offsetHeight - CONFIG.toolbarOffset;
        let left = rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2);

        // Keep within viewport
        if (top < 10) top = rect.bottom + CONFIG.toolbarOffset;
        if (left < 10) left = 10;
        if (left + toolbar.offsetWidth > window.innerWidth - 10) {
            left = window.innerWidth - toolbar.offsetWidth - 10;
        }

        toolbar.style.top = `${top}px`;
        toolbar.style.left = `${left}px`;
        toolbar.style.display = 'flex';
    }

    function hideToolbar() {
        if (state.toolbar) {
            state.toolbar.style.display = 'none';
        }
    }

    function handleToolbarAction(action) {
        if (!state.currentSelectedElement) return;

        const elementData = getElementData(state.currentSelectedElement);

        switch (action) {
            case 'regenerate':
                sendToParent('JARVIS_REGENERATE_ELEMENT', elementData);
                break;

            case 'custom-edit':
                sendToParent('JARVIS_CUSTOM_EDIT_ELEMENT', elementData);
                break;

            case 'props':
                sendToParent('JARVIS_PROPS_ELEMENT', elementData);
                break;
        }
    }

    // ============================================
    // INLINE TEXT EDITING
    // ============================================

    function startEditing(element) {
        if (!isTextEditable(element)) return;

        state.isEditing = true;
        state.originalText = element.innerText;

        element.setAttribute('data-jarvis-editing', 'true');
        element.setAttribute('contenteditable', 'true');
        element.focus();

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        hideToolbar();

        sendToParent('JARVIS_ELEMENT_EDITING', {
            ...getElementData(element),
            originalText: state.originalText
        });
    }

    function finishEditing(save = true) {
        const element = state.currentSelectedElement;
        if (!element || !state.isEditing) return;

        element.removeAttribute('data-jarvis-editing');
        element.removeAttribute('contenteditable');

        const newText = element.innerText;

        if (save && newText !== state.originalText) {
            sendToParent('JARVIS_TEXT_CHANGED', {
                ...getElementData(element),
                oldText: state.originalText,
                newText: newText
            });
        } else if (!save) {
            element.innerText = state.originalText;
        }

        state.isEditing = false;
        state.originalText = '';

        showToolbar(element);
    }

    // ============================================
    // PARENT COMMUNICATION
    // ============================================

    function sendToParent(type, data = {}) {
        window.parent.postMessage({
            type: type,
            data: data,
            timestamp: Date.now()
        }, '*');
    }

    function handleParentMessage(event) {
        const { type, data } = event.data || {};

        switch (type) {
            case 'JARVIS_SET_SELECTION_MODE':
                state.selectionMode = data?.enabled ?? true;
                if (!state.selectionMode) {
                    deselectElement();
                }
                break;

            case 'JARVIS_DESELECT':
            case 'DESELECT':
                deselectElement();
                break;

            case 'JARVIS_UPDATE_ELEMENT':
            case 'UPDATE_ELEMENT':
                if (state.currentSelectedElement && data) {
                    const { field, value } = data;
                    if (field === 'text' && value !== undefined) {
                        state.currentSelectedElement.innerText = value;
                    } else if (field === 'classes' && value !== undefined) {
                        state.currentSelectedElement.className = value;
                    }
                }
                break;

            case 'JARVIS_SELECT_BY_PATH':
                if (data?.path) {
                    try {
                        const element = document.querySelector(data.path);
                        if (element) {
                            selectElement(element);
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } catch (e) {
                        console.warn('Invalid selector path:', data.path);
                    }
                }
                break;
        }
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================

    function handleMouseOver(e) {
        if (!state.selectionMode || state.isEditing) return;
        applyHoverHighlight(e.target);
    }

    function handleMouseOut(e) {
        if (!state.selectionMode) return;
        removeHoverHighlight(e.target);
    }

    function handleClick(e) {
        // Don't handle clicks on toolbar
        if (e.target.closest('#jarvis-toolbar')) return;

        // Prevent default navigation
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            const href = (e.target.closest('a') || e.target).getAttribute('href');
            if (href && !href.startsWith('#')) {
                e.preventDefault();
                e.stopPropagation();
            }
        }

        if (!state.selectionMode) return;

        e.preventDefault();
        e.stopPropagation();

        const target = e.target;

        // If clicking on already selected element, start editing
        if (target === state.currentSelectedElement && isTextEditable(target)) {
            startEditing(target);
            return;
        }

        // If editing, finish editing first
        if (state.isEditing) {
            finishEditing(true);
        }

        // Select new element
        if (selectElement(target)) {
            // Get click position relative to parent
            const elementData = getElementData(target);
            elementData.mouseX = e.clientX;
            elementData.mouseY = e.clientY;

            sendToParent('JARVIS_ELEMENT_SELECTED', elementData);
        }
    }

    function handleDoubleClick(e) {
        if (!state.selectionMode) return;

        e.preventDefault();
        e.stopPropagation();

        const target = e.target;

        if (isTextEditable(target)) {
            if (target !== state.currentSelectedElement) {
                selectElement(target);
            }
            startEditing(target);
        }
    }

    function handleKeyDown(e) {
        // ESC to cancel editing or deselect
        if (e.key === 'Escape') {
            if (state.isEditing) {
                finishEditing(false); // Cancel without saving
            } else if (state.currentSelectedElement) {
                deselectElement();
                sendToParent('JARVIS_ELEMENT_DESELECTED', {});
            }
        }

        // Enter to finish editing
        if (e.key === 'Enter' && state.isEditing && !e.shiftKey) {
            e.preventDefault();
            finishEditing(true);
        }
    }

    function handleBlur(e) {
        // Finish editing when clicking outside
        if (state.isEditing && e.target === state.currentSelectedElement) {
            // Small delay to check if focus moved to toolbar
            setTimeout(() => {
                if (state.isEditing && !document.activeElement.closest('#jarvis-toolbar')) {
                    finishEditing(true);
                }
            }, 100);
        }
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        // Inject styles
        injectStyles();

        // Add event listeners
        document.body.addEventListener('mouseover', handleMouseOver, true);
        document.body.addEventListener('mouseout', handleMouseOut, true);
        document.body.addEventListener('click', handleClick, true);
        document.body.addEventListener('dblclick', handleDoubleClick, true);
        document.addEventListener('keydown', handleKeyDown, true);
        document.body.addEventListener('blur', handleBlur, true);

        // Listen for parent messages
        window.addEventListener('message', handleParentMessage);

        // Notify parent that selector is ready
        sendToParent('JARVIS_SELECTOR_READY', {
            version: '1.0.0',
            features: ['select', 'edit', 'toolbar']
        });

        console.log('🤖 Jarvis Selector initialized');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
