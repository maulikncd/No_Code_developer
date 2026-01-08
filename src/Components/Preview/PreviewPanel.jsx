"use client";

import { useState, useContext, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

import { BottomToolbar } from "./BottomToolbar";
import { ChatPanel } from "./ChatPanel";
import PublishModal from "./PublishModal";
import SubDomainModal from "../Domain/SubDomainModal";
import Header from "./Header";

import { ThemeContext } from "../../ThemeProvider";
import { EditorProvider, useEditor } from "../Editor/EditorContext";
import PropertiesPanel from "../Editor/PropertiesPanel";
import { ElementContextMenu } from "../Editor/ElementContextMenu";
import { ProjectAPI } from "../../services/ProjectAPI";
import AppAlert from "../common/AppAlert.jsx";

/* ---------------- IFRAME INTERACTION SCRIPT ---------------- */
// Base script to prevent navigation - ALWAYS injected
const baseScript = `
<script>
  // Prevent external link navigation but allow hash links for smooth scrolling
  document.addEventListener('click', function(e) {
    const target = e.target.closest('a');
    if (target && target.tagName === 'A') {
      const href = target.getAttribute('href');
      
      // Allow hash links (e.g., #gallery, #home) for section navigation
      if (href && href.startsWith('#')) {
        // Let the browser handle hash navigation naturally
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }
      
      // Prevent all other navigation (external links, different pages, etc.)
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
</script>
`;

// Interaction script for edit mode - only when interact mode is enabled
const interactionScript = `
<script>
(function() {
  // Guard: Prevent multiple executions
  if (window.__JARVIS_SELECTOR_INITIALIZED__) {
    console.log('⚠️ Jarvis selector already initialized, skipping...');
    return;
  }
  window.__JARVIS_SELECTOR_INITIALIZED__ = true;
  
  let selectionEnabled = true;
  const STYLE_ID = 'jarvis-interaction-styles';
  let currentSelectedElement = null;
  
  function updateStyles() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = selectionEnabled ? \`
      [data-hover="true"] { outline: 2px dashed #00F2FF !important; cursor: pointer !important; outline-offset: -2px; }
      [data-selected="true"] { outline: 3px solid #7000FF !important; outline-offset: -3px; }
      /* Disable all interactive element default behaviors */
      a, button, input[type="submit"], input[type="button"], [onclick], [role="button"] {
        pointer-events: auto !important;
        cursor: pointer !important;
      }
      /* Visual indicator that buttons/links won't work */
      a:hover, button:hover {
        cursor: pointer !important;
      }
    \` : '';
  }

  // Helper function to get element-specific properties
  function getElementProperties(el) {
    const tagName = el.tagName.toLowerCase();
    const computed = window.getComputedStyle(el);
    
    // Base properties for all elements
    const props = {
      tagName: tagName,
      text: el.innerText?.substring(0, 500) || '',
      classes: el.className || '',
      id: el.id || '',
      styles: {
        width: computed.width,
        height: computed.height,
        padding: computed.padding,
        margin: computed.margin,
        display: computed.display,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        borderRadius: computed.borderRadius,
        opacity: computed.opacity,
        position: computed.position
      }
    };
    
    // Element-specific properties based on tag
    switch(tagName) {
      case 'img':
        props.src = el.src || '';
        props.alt = el.alt || '';
        props.naturalWidth = el.naturalWidth;
        props.naturalHeight = el.naturalHeight;
        props.elementType = 'image';
        break;
        
      case 'a':
        props.href = el.href || '';
        props.target = el.target || '';
        props.rel = el.rel || '';
        props.elementType = 'link';
        break;
        
      case 'button':
        props.type = el.type || 'button';
        props.disabled = el.disabled;
        props.elementType = 'button';
        break;
        
      case 'input':
        props.type = el.type || 'text';
        props.placeholder = el.placeholder || '';
        props.value = el.value || '';
        props.name = el.name || '';
        props.required = el.required;
        props.disabled = el.disabled;
        props.elementType = 'input';
        break;
        
      case 'textarea':
        props.placeholder = el.placeholder || '';
        props.value = el.value || '';
        props.rows = el.rows;
        props.cols = el.cols;
        props.elementType = 'input';
        break;
        
      case 'select':
        props.value = el.value || '';
        props.name = el.name || '';
        props.options = Array.from(el.options).map(o => ({ value: o.value, text: o.text }));
        props.elementType = 'input';
        break;
        
      case 'video':
        props.src = el.src || el.querySelector('source')?.src || '';
        props.poster = el.poster || '';
        props.autoplay = el.autoplay;
        props.controls = el.controls;
        props.loop = el.loop;
        props.muted = el.muted;
        props.elementType = 'media';
        break;
        
      case 'audio':
        props.src = el.src || el.querySelector('source')?.src || '';
        props.autoplay = el.autoplay;
        props.controls = el.controls;
        props.loop = el.loop;
        props.elementType = 'media';
        break;
        
      case 'iframe':
        props.src = el.src || '';
        props.title = el.title || '';
        props.elementType = 'embed';
        break;
        
      case 'form':
        props.action = el.action || '';
        props.method = el.method || '';
        props.elementType = 'form';
        break;
        
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        props.elementType = 'heading';
        break;
        
      case 'p':
      case 'span':
      case 'label':
        props.elementType = 'text';
        break;
        
      case 'div':
      case 'section':
      case 'article':
      case 'header':
      case 'footer':
      case 'nav':
      case 'aside':
      case 'main':
        props.elementType = 'container';
        break;
        
      case 'ul':
      case 'ol':
        props.elementType = 'list';
        break;
        
      case 'li':
        props.elementType = 'listItem';
        break;
        
      case 'table':
      case 'thead':
      case 'tbody':
      case 'tr':
      case 'th':
      case 'td':
        props.elementType = 'table';
        break;
        
      case 'svg':
        props.elementType = 'icon';
        break;
        
      default:
        props.elementType = 'generic';
    }
    
    return props;
  }

  updateStyles();

  window.addEventListener('message', e => {
    if (e.data.type === 'SET_SELECTION_MODE') {
      selectionEnabled = !!e.data.payload?.enabled;
      console.log('🎯 Selection mode:', selectionEnabled ? 'ENABLED' : 'DISABLED');
      updateStyles();
      if (!selectionEnabled) {
        document.querySelectorAll('[data-hover], [data-selected]').forEach(el => {
          el.removeAttribute('data-hover');
          el.removeAttribute('data-selected');
        });
      }
    }
  });

  // Main click handler for element selection
  function handleElementClick(e) {
    if (!selectionEnabled) return;
    
    // Prevent default actions (like link navigation)
    e.preventDefault();
    e.stopPropagation();
    
    // Find the actual clickable target (might be inside a link/button)
    let target = e.target;
    
    // Clear previous selections
    document.querySelectorAll('[data-selected]').forEach(el => el.removeAttribute('data-selected'));

    // Mark this element as selected
    target.setAttribute('data-selected', 'true');
    currentSelectedElement = target;

    // Get element properties for the context menu
    const elementProps = getElementProperties(target);
    
    // Calculate position relative to parent window
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    console.log('🔵 Element clicked:', elementProps.tagName, 'at', mouseX, mouseY);
    
    // Send message to parent window to show context menu
    window.parent.postMessage({
      type: 'ELEMENT_CLICKED',
      payload: {
        ...elementProps,
        mouseX: mouseX,
        mouseY: mouseY
      }
    }, '*');
    
    return false;
  }
  
  // Add click listener to document (capture phase)
  document.addEventListener('click', handleElementClick, true);

  // Block form submissions when in selection mode
  document.body.addEventListener('submit', e => {
    if (!selectionEnabled) return;
    e.preventDefault();
    e.stopPropagation();
    console.log('🚫 Form submit blocked in selection mode');
  }, true);

  // Block button click handlers
  document.body.addEventListener('mousedown', e => {
    if (!selectionEnabled) return;
    const isInteractive = e.target.closest('a, button, [onclick], [role="button"], input[type="submit"], input[type="button"]');
    if (isInteractive) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  document.body.addEventListener('mouseover', e => {
    if (!selectionEnabled) return;
    e.target.setAttribute('data-hover', 'true');
  });

  document.body.addEventListener('mouseout', e => {
    e.target.removeAttribute('data-hover');
  });

  window.addEventListener('message', e => {
    if (e.data.type === 'DESELECT') {
      document
        .querySelectorAll('[data-selected]')
        .forEach(el => el.removeAttribute('data-selected'));
      currentSelectedElement = null;
    }
    
    // Handle element updates from Properties Panel
    if (e.data.type === 'UPDATE_ELEMENT' && currentSelectedElement) {
      const { field, value } = e.data.payload;
      
      if (field === 'text') {
        currentSelectedElement.innerText = value;
      } else if (field === 'classes') {
        currentSelectedElement.className = value;
      } else if (field === 'src' && (currentSelectedElement.tagName.toLowerCase() === 'img' || currentSelectedElement.tagName.toLowerCase() === 'video')) {
        currentSelectedElement.src = value;
      } else if (field === 'href' && currentSelectedElement.tagName.toLowerCase() === 'a') {
        currentSelectedElement.href = value;
      } else if (field === 'alt' && currentSelectedElement.tagName.toLowerCase() === 'img') {
        currentSelectedElement.alt = value;
      } else if (field === 'placeholder' && (currentSelectedElement.tagName.toLowerCase() === 'input' || currentSelectedElement.tagName.toLowerCase() === 'textarea')) {
        currentSelectedElement.placeholder = value;
      } else if (field === 'target' && currentSelectedElement.tagName.toLowerCase() === 'a') {
        currentSelectedElement.target = value;
      }
    }
  });

  console.log('✅ Jarvis selector initialized');
})();
</script>
`;


/* ---------------- MAIN COMPONENT ---------------- */
function PreviewContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};
  const {
    session_id: sessionIdFromRoute,
    blueprint: blueprintFromRoute,
    html: htmlFromRoute,
    project_id: projectIdFromRoute,
    project_name: projectNameFromRoute,
  } = locationState;
  const { theme } = useContext(ThemeContext);
  const {
    htmlContent,
    setHtmlContent,
    selectedElement,
    setSelectedElement,
    elementUpdateTrigger,
    iframeRef,
    interactionMode,
    setInteractionMode
  } = useEditor();

  const hasAutoFetchedRef = useRef(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const isDark = theme === "dark";

  /* ✅ FIX: MISSING STATE */
  const [isLoading, setIsLoading] = useState(false);

  const [mode, setMode] = useState("preview");
  const [inputValue, setInputValue] = useState("");
  const [viewMode, setViewMode] = useState("desktop");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSubDomainModal, setShowSubDomainModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);  // Chat visibility state
  const [selectedElementName, setSelectedElementName] = useState("");  // 👈 For chatbot display
  const [selectedElementData, setSelectedElementData] = useState(null);  // 👈 Full element data for chatbot editing

  // Context menu state
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [contextMenuElement, setContextMenuElement] = useState(null);

  /* ---------------- SEND ELEMENT UPDATES TO IFRAME ---------------- */
  useEffect(() => {
    if (elementUpdateTrigger > 0 && selectedElement && iframeRef.current?.contentWindow) {
      // Send update message to iframe for text, class, and src changes
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_ELEMENT',
          payload: {
            field: 'text',
            value: selectedElement.text || ''
          }
        },
        '*'
      );

      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_ELEMENT',
          payload: {
            field: 'classes',
            value: selectedElement.classes || ''
          }
        },
        '*'
      );

      if (selectedElement.tagName === 'img' || selectedElement.src) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'UPDATE_ELEMENT',
            payload: {
              field: 'src',
              value: selectedElement.src || ''
            }
          },
          '*'
        );
      }
    }
  }, [elementUpdateTrigger, selectedElement]);

  /* ---------------- KEYBOARD LISTENER FOR CHAT ---------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only in edit mode
      if (mode !== "edit") return;

      // Ignore if already typing in input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      // Ignore modifier keys alone
      if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape"].includes(e.key)) return;

      // Only handle single character keys
      if (e.key.length === 1) {
        // If chat is NOT open, open it and add the key
        if (!isChatOpen) {
          e.preventDefault();  // Prevent the key from being typed again when input focuses
          setIsChatOpen(true);
          setInputValue(e.key);  // Set (not append) the first key
        }
        // If chat IS already open, let the input handle it naturally
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, isChatOpen]);

  /* ---------------- ACCEPT ROUTE HTML ---------------- */
  useEffect(() => {
    if (htmlFromRoute) {
      // Only accept route HTML if there's no saved content in localStorage for THIS session
      const storageKey = sessionIdFromRoute ? `editorHtmlContent_${sessionIdFromRoute}` : 'editorHtmlContent';
      const savedContent = localStorage.getItem(storageKey);

      if (!savedContent) {
        console.log(`📥 Using HTML from route for session: ${sessionIdFromRoute}`);
        setHtmlContent(htmlFromRoute);
      } else {
        console.log(`💾 Using existing local edits for session: ${sessionIdFromRoute}`);
      }
    }
  }, [htmlFromRoute, setHtmlContent, sessionIdFromRoute]);


  /* ---------------- HANDLE IFRAME MESSAGE ---------------- */
  useEffect(() => {
    const handleMessage = (event) => {
      const { type, data, payload } = event.data || {};

      // ONLY process element selection when Interact mode is ON
      if (!interactionMode) {
        // In non-interact mode, ignore all selection messages
        return;
      }

      // Handle legacy ELEMENT_CLICKED format
      if (type === "ELEMENT_CLICKED") {
        const elementData = payload;
        const elementName = elementData.id || elementData.className?.split(' ')[0] || elementData.tagName || 'Element';
        const mouseX = elementData.mouseX || window.innerWidth / 2;
        const mouseY = elementData.mouseY || window.innerHeight / 2;

        // DEBUG: Log received element data
        console.log('📨 ELEMENT_CLICKED received:', {
          tagName: elementData.tagName,
          text: elementData.text?.substring(0, 50),
          id: elementData.id,
          classes: elementData.classes
        });

        // Show context menu with options
        setContextMenuElement({ ...elementData, elementName });
        setContextMenuPosition({ x: mouseX, y: mouseY });
        setShowContextMenu(true);
      }

      // Handle new JARVIS_* message types
      if (type === "JARVIS_SELECTOR_READY") {
        console.log('🤖 Jarvis Selector Ready', data);
      }

      if (type === "JARVIS_ELEMENT_SELECTED") {
        const elementData = data;
        const elementName = elementData.id || elementData.className?.split(' ')[0] || elementData.tagName || 'Element';
        const mouseX = elementData.mouseX || window.innerWidth / 2;
        const mouseY = elementData.mouseY || window.innerHeight / 2;

        // Show context menu with options
        setContextMenuElement({ ...elementData, elementName });
        setContextMenuPosition({ x: mouseX, y: mouseY });
        setShowContextMenu(true);
      }

      if (type === "JARVIS_TEXT_CHANGED") {
        console.log('📝 Text Changed:', data);
      }

      if (type === "JARVIS_REGENERATE_ELEMENT") {
        console.log('🔄 Regenerate Request:', data);
        const elementName = data.id || data.className?.split(' ')[0] || data.tagName || 'Element';
        setSelectedElementName(elementName);
        setIsChatOpen(true);
        setInputValue(`Regenerate the ${data.tagName} element: `);
      }

      if (type === "JARVIS_CUSTOM_EDIT_ELEMENT") {
        console.log('✏️ Custom Edit Request:', data);
        const elementName = data.id || data.className?.split(' ')[0] || data.tagName || 'Element';
        setSelectedElementName(elementName);
        setIsChatOpen(true);
        setInputValue(`[${elementName}] `);
      }

      if (type === "JARVIS_PROPS_ELEMENT") {
        console.log('⚙️ Props Panel Request:', data);
        setSelectedElement({
          tagName: data.tagName,
          text: data.text,
          src: data.src,
          classes: data.className,
          id: data.id,
          styles: data.styles,
          path: data.path
        });
      }

      if (type === "JARVIS_ELEMENT_DESELECTED") {
        setSelectedElement(null);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [mode, interactionMode, setSelectedElement]);



  /* ---------------- DESELECT HANDLING ---------------- */
  useEffect(() => {
    if (!selectedElement && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "DESELECT" },
        "*"
      );
    }
  }, [selectedElement]);

  /* ---------------- SYNC INTERACTION MODE TO IFRAME ---------------- */
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "SET_SELECTION_MODE",
          payload: { enabled: interactionMode }
        },
        "*"
      );
      console.log(`🎯 Interaction mode ${interactionMode ? 'ENABLED' : 'DISABLED'} in iframe`);
    }
  }, [interactionMode]);

  /* ---------------- INTERACTION MODE HANDLING ---------------- */
  useEffect(() => {
    // If switching to preview mode, force interaction mode OFF
    if (mode === "preview" && interactionMode) {
      setInteractionMode(false);
    }

    // Close properties panel when interaction mode is disabled or in preview mode
    if ((mode === "preview" || !interactionMode) && selectedElement) {
      setSelectedElement(null);
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: "DESELECT" }, "*");
      }
    }
  }, [mode, interactionMode, selectedElement, setSelectedElement, setInteractionMode]);

  /* ---------------- IFRAME SOURCE ---------------- */
  // Helper to check if string is a full HTML document
  const isFullHtml = htmlContent?.trim().toLowerCase().startsWith('<!doctype') ||
    htmlContent?.trim().toLowerCase().startsWith('<html');

  // DEBUG: Log interact mode state
  const shouldInjectScript = interactionMode && mode === "edit";
  console.log(`🔧 Mode: ${mode} | Interact: ${interactionMode} | Script: ${shouldInjectScript ? 'INJECTED' : 'CLEAN'}`);

  const fullSource = useMemo(() => {
    if (isFullHtml) {
      return `
${htmlContent}
${baseScript}
${shouldInjectScript ? interactionScript : ""}
`;
    }
    return `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; overflow-x: hidden; background: #050510; font-family: sans-serif; }
    ::-webkit-scrollbar { display: none; }
  </style>
</head>
<body>
  ${htmlContent || ""}
  ${baseScript}
  ${shouldInjectScript ? interactionScript : ""}
</body>
</html>
`;
  }, [htmlContent, isFullHtml, shouldInjectScript]);

  /* ---------------- GENERATE WEBSITE ---------------- */
  const generateWebsite = useCallback(async (refreshFromDB = false) => {
    try {
      setIsLoading(true);

      const token = Cookies.get("access_token");

      const payload = {
        session_id: sessionIdFromRoute
      };

      // Only use route blueprint if not forcing a refresh from DB
      if (!refreshFromDB && blueprintFromRoute) {
        payload.blueprint = blueprintFromRoute;
      }

      console.log(`🚀 Generating website code... (Source: ${refreshFromDB ? 'Database' : 'Route/Local'})`);

      const res = await fetch(`${BASE_URL}/project/generate-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error("Code generation failed");
      }

      setHtmlContent(data.generated_code || data.html || data.main_page);
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [BASE_URL, blueprintFromRoute, sessionIdFromRoute, setHtmlContent]);

  /* ---------------- SAVE PROJECT TO FOLDER ---------------- */
  const handleSaveProject = useCallback(async () => {
    if (!sessionIdFromRoute || !projectIdFromRoute) {
      setAlert({
        open: true,
        message: "Missing project information. Please try again.",
        severity: "error"
      });
      return;
    }

    try {
      setIsSaving(true);

      const result = await ProjectAPI.saveProject({
        sessionId: sessionIdFromRoute,
        projectId: projectIdFromRoute,
        projectName: projectNameFromRoute || "Untitled Project",
        htmlContent: htmlContent
      });

      if (result.status) {
        setAlert({
          open: true,
          message: "Project saved successfully! 🎉",
          severity: "success"
        });

        // Clear localStorage after successful save to database
        const storageKey = sessionIdFromRoute ? `editorHtmlContent_${sessionIdFromRoute}` : 'editorHtmlContent';
        // Keep localStorage as backup but mark as synced
        localStorage.setItem(`${storageKey}_synced`, 'true');

        // Redirect to dashboard after showing success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to save project");
      }
    } catch (err) {
      console.error("Save error:", err);
      setAlert({
        open: true,
        message: err.message || "Failed to save project. Please try again.",
        severity: "error"
      });
    } finally {
      setIsSaving(false);
    }
  }, [sessionIdFromRoute, projectIdFromRoute, projectNameFromRoute, htmlContent]);

  /* ---------------- AUTO FETCH WHEN NEEDED ---------------- */
  useEffect(() => {
    if (
      !htmlFromRoute &&
      sessionIdFromRoute &&
      blueprintFromRoute &&
      !hasAutoFetchedRef.current
    ) {
      hasAutoFetchedRef.current = true;
      generateWebsite();
    }
  }, [blueprintFromRoute, htmlFromRoute, sessionIdFromRoute, generateWebsite]);

  /* ---------------- RENDER ---------------- */
  return (
    <div
      className={`flex flex-col h-screen w-full overflow-hidden font-sans relative
      ${isDark ? "bg-[#0B0B0B] text-white" : "bg-gray-50 text-black"}`}
    >
      {isDark && (
        <div
          className="absolute inset-0 z-0 pointer-events-none
          bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),
          linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]
          bg-[size:40px_40px]"
        />
      )}

      <Header mode={mode} onModeChange={setMode} />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <main className="flex-1 flex">
          <div
            className="transition-all duration-300 bg-white shadow-2xl overflow-hidden relative"
            style={{
              width:
                viewMode === "mobile"
                  ? "375px"
                  : viewMode === "tablet"
                    ? "768px"
                    : "100%",
              height: "100%",
              margin: viewMode === "desktop" ? "0" : "0 auto",
            }}
          >
            <iframe
              key={`preview-${interactionMode ? 'int' : 'view'}-${mode}`}
              ref={iframeRef}
              className="w-full h-full border-0"
              srcDoc={fullSource}
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </main>

        {selectedElement && mode === "edit" && interactionMode && <PropertiesPanel />}
      </div>

      {mode === "edit" && (
        <>
          <ChatPanel
            inputValue={inputValue}
            isLoading={isLoading}
            onInputChange={setInputValue}
            sessionId={sessionIdFromRoute}
            isOpen={isChatOpen}
            selectedElementName={selectedElementName}
            selectedElementData={selectedElementData}  // Pass full element data
            htmlContent={htmlContent}  // Pass current HTML for element editing
            onClose={() => {
              setIsChatOpen(false);
              setInputValue("");
              setSelectedElementName("");
              setSelectedElementData(null);  // Clear element data on close
            }}
            onClearElement={() => {
              // Clear element selection but keep chat open
              console.log('🚫 Clearing element selection');
              setSelectedElementName("");
              setSelectedElementData(null);
            }}
            onHtmlUpdate={(updatedHtml) => {
              // Direct HTML update from chatbot element editing
              console.log('🔄 Chatbot updated HTML directly');
              setHtmlContent(updatedHtml);
            }}
            onCodeUpdate={async (data) => {
              // 1. If chat response contains direct HTML/Code, use it immediately
              const newHtml = data.generated_code || data.html || data.code;
              if (newHtml) {
                setHtmlContent(newHtml);
                return;
              }

              // 2. Fallback: If blueprint was updated, regenerate code via API
              if (data.blueprint_updated) {
                console.log('🔄 Blueprint updated by Chatbot, refreshing code from DB...');
                await generateWebsite(true);
              }
            }}
          />

          <BottomToolbar
            viewMode={viewMode}
            onViewChange={setViewMode}
            isInteractMode={interactionMode}
            onInteractToggle={() => setInteractionMode(prev => !prev)}
            isChatOpen={isChatOpen}
            onChatToggle={() => setIsChatOpen(prev => !prev)}
            onPublish={() => setShowPublishModal(true)}
            onSave={handleSaveProject}
            isSaving={isSaving}
            mode={mode}
            onModeChange={setMode}
          />

          {/* Context Menu for Interact Mode */}
          {showContextMenu && contextMenuElement && (
            <ElementContextMenu
              position={contextMenuPosition}
              onGenerate={() => {
                // DEBUG: Log what we're passing to chat
                console.log('✨ Generate clicked - setting element data:', {
                  tagName: contextMenuElement.tagName,
                  text: contextMenuElement.text?.substring(0, 50),
                  elementName: contextMenuElement.elementName
                });

                // Open chatbot with selected element - pass full element data
                setSelectedElementName(contextMenuElement.elementName);
                setSelectedElementData(contextMenuElement);  // Pass full element data for editing
                setIsChatOpen(true);
                setInputValue("");  // Clear input, user will type their request
                setShowContextMenu(false);
                setContextMenuElement(null);
              }}
              onProps={() => {
                // Open properties panel
                setSelectedElement(contextMenuElement);
                setShowContextMenu(false);
                setContextMenuElement(null);
              }}
              onClose={() => {
                setShowContextMenu(false);
                setContextMenuElement(null);
              }}
            />
          )}
        </>
      )}

      {showPublishModal && (
        <PublishModal
          onClose={() => setShowPublishModal(false)}
          onConnectDomain={() => {
            setShowPublishModal(false);
            navigate("/domain/connect");
          }}
          onCustomDomain={() => {
            setShowPublishModal(false);
            navigate("/domain/custom");
          }}
          onSubDomain={() => {
            setShowPublishModal(false);
            navigate("/sub-domain/dashboard");
          }}
        />
      )}

      {showSubDomainModal && (
        <SubDomainModal
          onClose={() => setShowSubDomainModal(false)}
          onNext={() => navigate("/sub-domain/dashboard")}
        />
      )}

      {/* Save Alert */}
      <AppAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}

/* ---------------- WRAPPER ---------------- */
export default function PreviewPanelWrapper() {
  const location = useLocation();
  const sessionId = location.state?.session_id || 'default';

  return (
    <EditorProvider key={sessionId} sessionId={sessionId}>
      <PreviewContent />
    </EditorProvider>
  );
}
