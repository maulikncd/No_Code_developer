
import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { useEditor } from './EditorContext';
import {
    X, Check, Image as ImageIcon, Type, Palette, Box, Layout,
    Link as LinkIcon, Eye, EyeOff, Code,
    AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
    Settings, ChevronDown, ChevronUp, Maximize2,
    FormInput, MousePointer, Video, Square, Heading, FileText
} from 'lucide-react';
import { ThemeContext } from '../../ThemeProvider';
import { ProjectAPI } from '../../services/ProjectAPI';

const PropertiesPanel = () => {
    const { selectedElement, setSelectedElement, updateElementProperty, saveChanges, cancelChanges, iframeRef, sessionId, setHtmlContent } = useEditor();
    const { theme } = useContext(ThemeContext);
    const isDark = theme === 'dark';
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [bgColor, setBgColor] = useState('#3b82f6');
    const [textColor, setTextColor] = useState('#ffffff');

    // Local states for text editing to prevent cursor jumping/focus loss
    const [localText, setLocalText] = useState('');
    const [localSrc, setLocalSrc] = useState('');
    const [localHref, setLocalHref] = useState('');
    const [localAlt, setLocalAlt] = useState('');

    const textUpdateTimeoutRef = useRef(null);
    const blueprintUpdateTimeoutRef = useRef(null);

    // Accordion states for collapsible sections
    const [sectionsExpanded, setSectionsExpanded] = useState({
        element: true,
        spacing: true,
        size: true,
        typography: true,
        visuals: true,
        interactions: false,
        layout: false,
        advanced: false
    });

    // Sync local states when selectedElement changes
    useEffect(() => {
        if (selectedElement) {
            setLocalText(selectedElement.text || '');
            setLocalSrc(selectedElement.src || '');
            setLocalHref(selectedElement.href || '');
            setLocalAlt(selectedElement.alt || '');
        }
    }, [selectedElement?.tagName, selectedElement?.id]); // Only sync on element change, not on property change

    // Sync colors when selectedElement changes
    useEffect(() => {
        if (!selectedElement) return;

        const classes = selectedElement.classes || '';

        // Extract background color
        const bgMatch = classes.match(/bg-\[#([a-fA-F0-9]+)\]/);
        if (bgMatch) {
            setBgColor(`#${bgMatch[1]}`);
        } else if (classes.includes('bg-transparent')) {
            setBgColor('transparent');
        } else if (classes.includes('bg-white')) {
            setBgColor('#ffffff');
        } else if (classes.includes('bg-black')) {
            setBgColor('#000000');
        }

        // Extract text color
        const textMatch = classes.match(/text-\[#([a-fA-F0-9]+)\]/);
        if (textMatch) {
            setTextColor(`#${textMatch[1]}`);
        } else if (classes.includes('text-white')) {
            setTextColor('#ffffff');
        } else if (classes.includes('text-black')) {
            setTextColor('#000000');
        }
    }, [selectedElement]);

    // Determine element type for dynamic rendering
    const elementType = useMemo(() => {
        if (!selectedElement) return null;

        // Check elementType from iframe first, then fallback to tagName
        if (selectedElement.elementType) return selectedElement.elementType;

        // Fallback detection based on tagName
        const tag = selectedElement.tagName?.toLowerCase();
        switch (tag) {
            case 'img': return 'image';
            case 'a': return 'link';
            case 'button': return 'button';
            case 'input':
            case 'textarea':
            case 'select': return 'input';
            case 'video':
            case 'audio': return 'media';
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6': return 'heading';
            case 'p':
            case 'span':
            case 'label': return 'text';
            case 'div':
            case 'section':
            case 'article':
            case 'header':
            case 'footer':
            case 'nav':
            case 'aside':
            case 'main': return 'container';
            case 'ul':
            case 'ol': return 'list';
            case 'li': return 'listItem';
            default: return 'generic';
        }
    }, [selectedElement]);

    // Get element type info for header
    const getElementInfo = () => {
        const typeConfig = {
            'image': { icon: ImageIcon, label: 'Image', color: 'text-green-400' },
            'link': { icon: LinkIcon, label: 'Link', color: 'text-blue-400' },
            'button': { icon: MousePointer, label: 'Button', color: 'text-purple-400' },
            'input': { icon: FormInput, label: 'Input Field', color: 'text-yellow-400' },
            'media': { icon: Video, label: 'Media', color: 'text-red-400' },
            'heading': { icon: Heading, label: 'Heading', color: 'text-orange-400' },
            'text': { icon: FileText, label: 'Text', color: 'text-cyan-400' },
            'container': { icon: Box, label: 'Container', color: 'text-indigo-400' },
            'list': { icon: Type, label: 'List', color: 'text-pink-400' },
            'listItem': { icon: Type, label: 'List Item', color: 'text-pink-400' },
            'generic': { icon: Square, label: 'Element', color: 'text-gray-400' }
        };
        return typeConfig[elementType] || typeConfig.generic;
    };

    if (!selectedElement) return null;

    const elementInfo = getElementInfo();
    const ElementIcon = elementInfo.icon;

    // Helper to safely get values
    const val = (v) => v || '';

    const toggleSection = (section) => {
        setSectionsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Helper to detect component ID from element classes
    const detectComponentId = (element) => {
        if (!element) return null;
        const classes = (element.classes || '').toLowerCase();

        // Common component patterns
        const componentPatterns = [
            'hero', 'about', 'menu', 'contact', 'footer', 'header', 'navbar',
            'gallery', 'testimonial', 'pricing', 'faq', 'feature', 'team', 'service'
        ];

        for (const pattern of componentPatterns) {
            if (classes.includes(pattern)) {
                return pattern;
            }
        }

        // Fallback: try to detect from parent section
        return null;
    };

    const handleAttributeChange = (attr, value) => {
        updateElementProperty(attr, value);

        // Send all changes to iframe immediately for real-time preview
        if (iframeRef?.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_ELEMENT',
                payload: { field: attr, value: value }
            }, '*');
        }

        // 🆕 BLUEPRINT SYNC: Update Blueprint in realtime (debounced)
        if (sessionId && selectedElement) {
            // Clear previous timeout
            if (blueprintUpdateTimeoutRef.current) {
                clearTimeout(blueprintUpdateTimeoutRef.current);
            }

            // Debounce: Update Blueprint after 500ms of no changes
            blueprintUpdateTimeoutRef.current = setTimeout(async () => {
                const componentId = detectComponentId(selectedElement);
                if (componentId) {
                    console.log(`🔄 Updating Blueprint: ${componentId}.${attr} = ${value}`);
                    await ProjectAPI.updateProperty({
                        sessionId,
                        componentId,
                        field: attr,
                        value,
                        elementInfo: {
                            tagName: selectedElement.tagName,
                            classes: selectedElement.classes,
                            id: selectedElement.id
                        }
                    });
                }
            }, 500);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateElementProperty('src', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle all text-based attribute changes with debouncing
    const handleLocalEdit = (field, newValue) => {
        // 1. Update appropriate local state for immediate feedback
        if (field === 'text') setLocalText(newValue);
        else if (field === 'src') setLocalSrc(newValue);
        else if (field === 'href') setLocalHref(newValue);
        else if (field === 'alt') setLocalAlt(newValue);

        // 2. Clear previous timeout
        if (textUpdateTimeoutRef.current) {
            clearTimeout(textUpdateTimeoutRef.current);
        }

        // 3. Debounce: Update global state and iframe after 300ms
        textUpdateTimeoutRef.current = setTimeout(() => {
            handleAttributeChange(field, newValue);
        }, 300);
    };

    // Keep handleTextChange for backward compatibility if needed, but it uses handleLocalEdit now
    const handleTextChange = (newText) => handleLocalEdit('text', newText);

    const handleSave = async () => {
        if (!sessionId) {
            console.warn('No sessionId, saving locally only');
            await saveChanges();
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 2000);
            return;
        }

        setIsSaving(true);
        try {
            console.log('📦 Applying changes: Saving Blueprint + Current HTML...');

            // 🆕 IMPORTANT: Do NOT regenerate code!
            // Blueprint is already updated during property changes.
            // Just save the current HTML (which has inline changes) to backend.

            // Option 1: Call apply-changes with regenerateCode=false (just saves Blueprint)
            const blueprintResult = await ProjectAPI.applyChanges({
                sessionId,
                regenerateCode: false  // 🔑 Don't regenerate! Keep current HTML
            });

            if (blueprintResult.success) {
                console.log('✅ Blueprint saved!');

                // Option 2: Save current HTML to backend (preserves inline changes)
                await saveChanges();  // This syncs HTML to /save-code

                console.log('✅ Current HTML synced to backend!');
                setShowSaveSuccess(true);
                setTimeout(() => setShowSaveSuccess(false), 2000);
            } else {
                console.error('❌ Blueprint save failed:', blueprintResult.error);
                // Still save HTML locally
                await saveChanges();
            }
        } catch (error) {
            console.error('Error applying changes:', error);
            // Fallback to local save
            await saveChanges();
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        cancelChanges();
    };

    // Common styles
    // Common styles
    const inputClass = `w-full p-2.5 border rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none ${isDark
        ? 'bg-[#2a2a2a] border-white/5 text-white placeholder-gray-500 focus:bg-[#333]'
        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white'
        }`;

    const labelClass = `text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`;

    const buttonClass = `px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${isDark
        ? 'bg-[#2a2a2a] hover:bg-blue-600/20 hover:text-blue-400 text-gray-400 border border-transparent hover:border-blue-500/30'
        : 'bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700'
        }`;

    const toggleBtnClass = (isActive) => `px-3 py-2 rounded-lg text-xs font-bold transition-all duration-200 border ${isActive
        ? 'bg-blue-600 text-white border-blue-600'
        : isDark ? 'bg-[#2a2a2a] hover:bg-[#333] text-gray-400 border-white/5' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
        }`;

    // Section Header Component
    const SectionHeader = ({ title, icon: Icon, expanded, section }) => (
        <button
            onClick={() => toggleSection(section)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${isDark
                ? 'hover:bg-white/5 text-white'
                : 'hover:bg-gray-100 text-gray-900'
                }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <Icon size={14} />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider">{title}</span>
            </div>
            <div className={`transition-transform duration-300 ${expanded ? 'rotate-0' : 'rotate-180'}`}>
                <ChevronUp size={14} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
            </div>
        </button>
    );

    // Color Picker Component
    const ColorPicker = ({ label, colorState, setColorState, colorType = 'bg' }) => {
        const isBackground = colorType === 'bg';
        const presetColors = isBackground
            ? [
                { color: '#3b82f6', class: 'bg-blue-500' },
                { color: '#22c55e', class: 'bg-green-500' },
                { color: '#ef4444', class: 'bg-red-500' },
                { color: '#eab308', class: 'bg-yellow-500' },
                { color: '#ffffff', class: 'bg-white' },
                { color: '#000000', class: 'bg-black' },
                { color: 'transparent', class: 'bg-transparent' }
            ]
            : [
                { color: '#ffffff', class: 'text-white' },
                { color: '#000000', class: 'text-black' },
                { color: '#3b82f6', class: 'text-blue-500' },
                { color: '#22c55e', class: 'text-green-500' },
                { color: '#ef4444', class: 'text-red-500' },
                { color: '#6b7280', class: 'text-gray-500' }
            ];

        const applyColor = (color, cls) => {
            setColorState(color);
            let classes = selectedElement.classes || '';
            console.log('🎨 Before color change:', classes);

            if (isBackground) {
                // Remove all background color classes
                classes = classes.replace(/bg-\S+/g, '').replace(/\s+/g, ' ').trim();
            } else {
                // Remove only text COLOR classes, preserve text-size, text-align, etc.
                // Matches: text-red-500, text-blue-600, text-white, text-black, text-[#hex], but NOT text-center, text-xl, etc.
                classes = classes
                    .replace(/text-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g, '')
                    .replace(/text-(white|black|transparent|current)/g, '')
                    .replace(/text-\[#[a-fA-F0-9]+\]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
            }

            const newClasses = `${classes} ${cls || (isBackground ? `bg-[${color}]` : `text-[${color}]`)}`.replace(/\s+/g, ' ').trim();
            console.log('🎨 After color change:', newClasses);
            handleAttributeChange('classes', newClasses);
        };

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className={labelClass}>{label}</label>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">{colorState}</span>
                </div>
                <div className="flex gap-3 items-center">
                    <label className="relative cursor-pointer group">
                        <div
                            className="w-11 h-11 rounded-xl border-2 border-white/10 shadow-lg flex items-center justify-center group-hover:scale-105 transition-all duration-200 overflow-hidden"
                            style={{
                                backgroundColor: colorState === 'transparent' ? 'transparent' : colorState,
                                backgroundImage: colorState === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                                backgroundSize: '10px 10px',
                                backgroundPosition: '0 0, 5px 5px'
                            }}
                        >
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Palette size={16} className={colorState === '#ffffff' || colorState === '#eab308' || colorState === 'transparent' ? 'text-black/30' : 'text-white/30'} />
                        </div>
                        <input
                            type="color"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={colorState === 'transparent' ? '#ffffff' : (colorState.startsWith('#') ? colorState : '#ffffff')}
                            onChange={(e) => applyColor(e.target.value)}
                        />
                    </label>
                    <div className="flex gap-1.5 flex-1 flex-wrap">
                        {presetColors.map(({ color, class: cls }) => (
                            <button
                                key={cls}
                                onClick={() => applyColor(color, cls)}
                                style={{
                                    backgroundColor: color === 'transparent' ? 'transparent' : color,
                                    backgroundImage: color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                                    backgroundSize: '8px 8px',
                                    backgroundPosition: '0 0, 4px 4px'
                                }}
                                className={`w-6 h-6 rounded-lg border transition-all duration-200 hover:scale-110 active:scale-95 ${colorState === color ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1a1a1a] border-white/40' : 'border-white/10'}`}
                                title={cls}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Reusable Property Selection Grid
    const PropertyGrid = ({ label, options, currentClass, regex, prefix = '', onChange }) => (
        <div className="space-y-2">
            {label && <label className={labelClass}>{label}</label>}
            <div className={`flex flex-wrap gap-1.5 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                {options.map(opt => {
                    const optValue = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt.includes('-') ? opt.split('-').pop() : opt;
                    const fullClass = prefix ? `${prefix}${optValue}` : optValue;
                    const isActive = currentClass?.split(' ').some(c => c === fullClass) || (regex && regex.test(currentClass) && currentClass.includes(fullClass));

                    return (
                        <button
                            key={optValue}
                            onClick={() => {
                                let classes = selectedElement.classes || '';
                                if (regex) classes = classes.replace(regex, '').trim();
                                onChange(`${classes} ${fullClass}`.trim());
                            }}
                            className={`flex-1 min-w-0 py-1.5 px-1 rounded-lg transition-all duration-200 text-[10px] font-bold tracking-tight uppercase ${isActive
                                ? 'bg-blue-600 text-white shadow-lg scale-105 z-10'
                                : isDark
                                    ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                                }`}
                            title={fullClass}
                        >
                            <span className="truncate block w-full uppercase">{optLabel}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    // ============ REUSABLE SECTIONS ============

    const SpacingSection = () => (
        <div className="space-y-4 py-4 border-t border-white/5">
            {SectionHeader({ title: "Spacing", icon: Box, expanded: sectionsExpanded.spacing, section: "spacing" })}
            {sectionsExpanded.spacing && (
                <div className="space-y-4 px-2">
                    {PropertyGrid({
                        label: "Padding",
                        options: ['p-0', 'p-2', 'p-4', 'p-6', 'p-8', 'p-12'],
                        currentClass: selectedElement.classes,
                        regex: /\bp-\d+/g,
                        onChange: (val) => handleAttributeChange('classes', val)
                    })}
                    {PropertyGrid({
                        label: "Margin",
                        options: ['m-0', 'm-2', 'm-4', 'm-6', 'm-8', 'm-12'],
                        currentClass: selectedElement.classes,
                        regex: /\bm-\d+/g,
                        onChange: (val) => handleAttributeChange('classes', val)
                    })}
                    {PropertyGrid({
                        label: "Gap (Flex/Grid)",
                        options: ['gap-0', 'gap-2', 'gap-4', 'gap-8', 'gap-12'],
                        currentClass: selectedElement.classes,
                        regex: /\bgap-\d+/g,
                        onChange: (val) => handleAttributeChange('classes', val)
                    })}
                </div>
            )}
        </div>
    );

    const SizeSection = ({ showMinMax = false } = {}) => (
        <div className="space-y-4 py-4 border-t border-white/5">
            {SectionHeader({ title: "Dimensions", icon: Maximize2, expanded: sectionsExpanded.size, section: "size" })}
            {sectionsExpanded.size && (
                <div className="space-y-4 px-2">
                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Width",
                            options: ['w-auto', 'w-full', 'w-fit'],
                            currentClass: selectedElement.classes,
                            regex: /\bw-\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Height",
                            options: ['h-auto', 'h-full', 'h-fit'],
                            currentClass: selectedElement.classes,
                            regex: /\bh-\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>
                    {showMinMax && (
                        <div className="grid grid-cols-2 gap-4">
                            {PropertyGrid({
                                label: "Max Width",
                                options: ['max-w-xs', 'max-w-md', 'max-w-full'],
                                currentClass: selectedElement.classes,
                                regex: /\bmax-w-\S+/g,
                                onChange: (val) => handleAttributeChange('classes', val)
                            })}
                            {PropertyGrid({
                                label: "Aspect Ratio",
                                options: ['aspect-auto', 'aspect-square', 'aspect-video'],
                                currentClass: selectedElement.classes,
                                regex: /\baspect-\S+/g,
                                onChange: (val) => handleAttributeChange('classes', val)
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const TypographySection = () => (
        <div className="space-y-4 py-4 border-t border-white/5">
            {SectionHeader({ title: "Typography", icon: Type, expanded: sectionsExpanded.typography, section: "typography" })}
            {sectionsExpanded.typography && (
                <div className="space-y-4 px-2">
                    {ColorPicker({ label: "Text Color", colorState: textColor, setColorState: setTextColor, colorType: "text" })}

                    {PropertyGrid({
                        label: "Font Size",
                        options: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-4xl'],
                        currentClass: selectedElement.classes,
                        regex: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/g,
                        onChange: (val) => handleAttributeChange('classes', val)
                    })}

                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Weight",
                            options: ['font-normal', 'font-medium', 'font-bold'],
                            currentClass: selectedElement.classes,
                            regex: /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Align",
                            options: ['text-left', 'text-center', 'text-right'],
                            currentClass: selectedElement.classes,
                            regex: /\btext-(left|center|right|justify)/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Transform",
                            options: ['uppercase', 'lowercase', 'capitalize'],
                            currentClass: selectedElement.classes,
                            regex: /\b(uppercase|lowercase|capitalize|normal-case)\b/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Decoration",
                            options: ['underline', 'line-through', 'no-underline'],
                            currentClass: selectedElement.classes,
                            regex: /\b(underline|line-through|no-underline)\b/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Line Height",
                            options: ['leading-tight', 'leading-normal', 'leading-loose'],
                            currentClass: selectedElement.classes,
                            regex: /\bleading-\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Letter Spacing",
                            options: ['tracking-tight', 'tracking-normal', 'tracking-wide'],
                            currentClass: selectedElement.classes,
                            regex: /\btracking-\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    const VisualSection = () => (
        <div className="space-y-4 py-4 border-t border-white/5">
            {SectionHeader({ title: "Visuals", icon: Palette, expanded: sectionsExpanded.visuals, section: "visuals" })}
            {sectionsExpanded.visuals && (
                <div className="space-y-4 px-2">
                    {ColorPicker({ label: "Background", colorState: bgColor, setColorState: setBgColor, colorType: "bg" })}

                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Radius",
                            options: ['rounded-none', 'rounded-lg', 'rounded-3xl', 'rounded-full'],
                            currentClass: selectedElement.classes,
                            regex: /\brounded\S*/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Shadow",
                            options: ['shadow-none', 'shadow', 'shadow-lg', 'shadow-2xl'],
                            currentClass: selectedElement.classes,
                            regex: /\bshadow\S*/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Opacity",
                            options: ['opacity-100', 'opacity-75', 'opacity-50', 'opacity-25'],
                            currentClass: selectedElement.classes,
                            regex: /\bopacity-\d+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Border",
                            options: ['border-0', 'border', 'border-2', 'border-4'],
                            currentClass: selectedElement.classes,
                            regex: /\bborder-\d+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    const InteractionSection = () => (
        <div className="space-y-4 py-4 border-t border-white/5">
            {SectionHeader({ title: "Interactions", icon: MousePointer, expanded: sectionsExpanded.interactions, section: "interactions" })}
            {sectionsExpanded.interactions && (
                <div className="space-y-4 px-2">
                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Cursor",
                            options: ['cursor-auto', 'cursor-pointer', 'cursor-move'],
                            currentClass: selectedElement.classes,
                            regex: /\bcursor-\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Transition",
                            options: ['transition-none', 'transition-all', 'transition-colors'],
                            currentClass: selectedElement.classes,
                            regex: /\btransition\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>
                    {PropertyGrid({
                        label: "Hover Effect (Scale)",
                        options: ['hover:scale-100', 'hover:scale-105', 'hover:scale-110', 'hover:scale-125'],
                        currentClass: selectedElement.classes,
                        regex: /\bhover:scale-\d+/g,
                        onChange: (val) => handleAttributeChange('classes', val)
                    })}
                </div>
            )}
        </div>
    );

    const LayoutAdvancedSection = () => (
        <div className="space-y-4 py-4 border-t border-white/5">
            {SectionHeader({ title: "Layout", icon: Layout, expanded: sectionsExpanded.layout, section: "layout" })}
            {sectionsExpanded.layout && (
                <div className="space-y-4 px-2">
                    {PropertyGrid({
                        label: "Display",
                        options: ['block', 'flex', 'grid', 'hidden'],
                        currentClass: selectedElement.classes,
                        regex: /\b(block|flex|grid|inline-block|hidden)\b/g,
                        onChange: (val) => handleAttributeChange('classes', val)
                    })}
                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Direction",
                            options: ['row', 'col'],
                            prefix: "flex-",
                            currentClass: selectedElement.classes,
                            regex: /\bflex-(row|col)\S*/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Justify",
                            options: ['start', 'center', 'between'],
                            prefix: "justify-",
                            currentClass: selectedElement.classes,
                            regex: /\bjustify-\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {PropertyGrid({
                            label: "Align",
                            options: ['start', 'center', 'stretch'],
                            prefix: "items-",
                            currentClass: selectedElement.classes,
                            regex: /\bitems-\S+/g,
                            onChange: (val) => handleAttributeChange('classes', val)
                        })}
                        {PropertyGrid({
                            label: "Position",
                            options: ['rel', 'abs', 'fix'],
                            currentClass: selectedElement.classes,
                            regex: /\b(static|relative|absolute|fixed|sticky)\b/g,
                            onChange: (val) => {
                                const map = { 'rel': 'relative', 'abs': 'absolute', 'fix': 'fixed' };
                                handleAttributeChange('classes', val.replace(/\b(rel|abs|fix)\b/g, m => map[m] || m));
                            }
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    // ============ ELEMENT-SPECIFIC PANELS ============

    // IMAGE Panel
    const ImagePanel = () => (
        <div className="space-y-4">
            <div className="p-3 rounded-xl space-y-3 bg-white/5 border border-white/5">
                <label className={labelClass}>Source & Alt</label>
                <div className="space-y-2">
                    <input
                        type="text"
                        className={inputClass}
                        value={localSrc}
                        onChange={(e) => handleLocalEdit('src', e.target.value)}
                        placeholder="Image URL"
                    />
                    <input
                        type="text"
                        className={inputClass}
                        value={localAlt}
                        onChange={(e) => handleLocalEdit('alt', e.target.value)}
                        placeholder="Alt text"
                    />
                </div>
            </div>

            <SizeSection showMinMax />

            <div className="p-3 bg-white/5 rounded-xl space-y-4 border border-white/5">
                {PropertyGrid({
                    label: "Fitting",
                    options: ['contain', 'cover', 'fill'],
                    prefix: "object-",
                    currentClass: selectedElement.classes,
                    regex: /\bobject-(contain|cover|fill|none|scale-down)\b/g,
                    onChange: (val) => handleAttributeChange('classes', val)
                })}
                <div className="space-y-2">
                    <label className={labelClass}>Loading Strategy</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAttributeChange('loading', 'lazy')} className={toggleBtnClass(selectedElement.loading === 'lazy')}>Lazy Load</button>
                        <button onClick={() => handleAttributeChange('loading', 'eager')} className={toggleBtnClass(selectedElement.loading === 'eager')}>Instant</button>
                    </div>
                </div>
            </div>

            {VisualSection()}
            {InteractionSection()}
        </div>
    );

    // LINK Panel
    const LinkPanel = () => (
        <div className="space-y-4">
            <div className="p-3 rounded-xl space-y-4 bg-white/5 border border-white/5">
                <div className="space-y-2">
                    <label className={labelClass}>Destination (URL)</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={localHref}
                        onChange={(e) => handleLocalEdit('href', e.target.value)}
                        placeholder="https://..."
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Display Text</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={localText}
                        onChange={(e) => handleLocalEdit('text', e.target.value)}
                        placeholder="Link Text"
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Behavior</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAttributeChange('target', '_self')} className={toggleBtnClass(selectedElement.target !== '_blank')}>Same Tab</button>
                        <button onClick={() => handleAttributeChange('target', '_blank')} className={toggleBtnClass(selectedElement.target === '_blank')}>New Window</button>
                    </div>
                </div>
            </div>
            {TypographySection()}
            {SizeSection({})}
            {SpacingSection()}
            {VisualSection()}
            {InteractionSection()}
        </div>
    );

    // BUTTON Panel
    const ButtonPanel = () => (
        <div className="space-y-4">
            <div className="p-3 rounded-xl space-y-4 bg-white/5 border border-white/5">
                <div className="space-y-2">
                    <label className={labelClass}>Button Label</label>
                    <input
                        type="text"
                        className={inputClass}
                        value={localText}
                        onChange={(e) => handleLocalEdit('text', e.target.value)}
                        placeholder="Click Me"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <label className={labelClass}>Active State</label>
                        <button onClick={() => handleAttributeChange('disabled', !selectedElement.disabled)} className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedElement.disabled ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-green-500/20 text-green-500 border border-green-500/30'}`}>
                            {selectedElement.disabled ? 'Disabled' : 'Enabled'}
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className={labelClass}>Processing</label>
                        <button onClick={() => handleAttributeChange('loading', !selectedElement.loading)} className={`w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedElement.loading ? 'bg-blue-600 shadow-lg shadow-blue-500/20 text-white' : 'bg-white/5 text-gray-500 border border-white/5'}`}>
                            {selectedElement.loading ? 'loading...' : 'normal'}
                        </button>
                    </div>
                </div>
            </div>

            {TypographySection()}
            {VisualSection()}
            {SpacingSection()}
            {SizeSection()}
            {InteractionSection()}
        </div>
    );

    // CONTAINER Panel
    const ContainerPanel = () => (
        <div className="space-y-4">
            {LayoutAdvancedSection()}
            {SpacingSection()}
            {SizeSection({ showMinMax: true })}
            {VisualSection()}
            {InteractionSection()}
        </div>
    );

    // TEXT / HEADING Panel
    const TextPanel = () => (
        <div className="space-y-4">
            <div className="p-3 rounded-xl space-y-3 bg-white/5 border border-white/5">
                <label className={labelClass}>Content Editor</label>
                <textarea
                    className={`${inputClass} min-h-[120px] font-medium leading-relaxed`}
                    value={localText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Type your content here..."
                />
            </div>

            {TypographySection()}
            {SpacingSection()}
            {SizeSection()}
            {VisualSection()}
            {InteractionSection()}
        </div>
    );

    // GENERIC Panel (Fallbacks)
    const GenericPanel = () => (
        <div className="space-y-4">
            <div className="p-3 rounded-xl space-y-4 bg-white/5 border border-white/5">
                <div className="space-y-2">
                    <label className={labelClass}>Inner Text / HTML</label>
                    <textarea
                        className={`${inputClass} min-h-[80px]`}
                        value={localText}
                        onChange={(e) => handleLocalEdit('text', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className={labelClass}>Tailwind Classes</label>
                    <textarea className={`${inputClass} min-h-[60px] font-mono text-xs text-blue-400`} value={val(selectedElement.classes)} onChange={(e) => handleAttributeChange('classes', e.target.value)} />
                </div>
            </div>
            {VisualSection()}
            {SpacingSection()}
            {InteractionSection()}
        </div>
    );

    // Render element panel based on detected type
    const renderElementPanel = () => {
        if (!selectedElement) return null;

        switch (elementType) {
            case 'image': return ImagePanel();
            case 'link': return LinkPanel();
            case 'button': return ButtonPanel();
            case 'heading':
            case 'text':
            case 'list':
            case 'listItem': return TextPanel();
            case 'container': return ContainerPanel();
            default: return GenericPanel();
        }
    };

    return (
        <div className={`h-full flex flex-col border-l shadow-2xl z-50 w-[350px] overflow-hidden ${isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-200'}`}>

            {/* Premium Header */}
            <div className={`relative border-b px-5 py-5 ${isDark ? 'bg-[#1a1a1a] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${isDark ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                            <ElementIcon size={20} />
                        </div>
                        <div>
                            <p className={`font-black text-sm uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {elementInfo.label}
                            </p>
                            <div className="flex items-center gap-1.5 pt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                                    &lt;{selectedElement.tagName.toLowerCase()}&gt;
                                </span>
                                {selectedElement.id && (
                                    <span className={`text-[10px] font-mono ${isDark ? 'text-blue-400/60' : 'text-blue-500'}`}>#{selectedElement.id}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedElement(null)}
                        className={`p-2 rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-transparent hover:border-red-500/20' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'}`}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Main Content - Element Specific Properties */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10">
                <div className="p-3 space-y-2">
                    {renderElementPanel()}
                </div>
            </div>

            {/* Save & Cancel Buttons */}
            <div className={`p-5 border-t flex flex-col gap-3 ${isDark ? 'border-white/5 bg-[#1a1a1a]' : 'border-gray-100 bg-white'}`}>
                {showSaveSuccess ? (
                    <div className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 bg-green-500 shadow-lg shadow-green-500/20 text-white transition-all duration-300 transform scale-105">
                        <Check size={18} strokeWidth={3} />
                        Changes Saved
                    </div>
                ) : (
                    <>
                        <button
                            onClick={handleSave}
                            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            <Check size={16} strokeWidth={3} />
                            Apply Changes
                        </button>
                        <button
                            onClick={handleCancel}
                            className={`w-full py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-200 border ${isDark
                                ? 'bg-transparent border-white/5 hover:bg-white/5 text-gray-500 hover:text-white'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Discard Changes
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertiesPanel;