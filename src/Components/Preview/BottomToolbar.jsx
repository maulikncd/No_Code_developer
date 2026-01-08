'use client';
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { ThemeContext } from "../../ThemeProvider";
import { useEditor } from "../Editor/EditorContext";
import {
    Smartphone,
    Tablet,
    Monitor,
    Undo2,
    Redo2,
    MousePointer2,
    MessageSquare,
    Rocket,
    Save,
    Loader2
} from 'lucide-react';
import { gsap } from "gsap";

// ============================================
// MACOS DOCK ITEM COMPONENT
// ============================================
const DockItem = ({
    children,
    tooltip,
    onClick,
    disabled = false,
    isActive = false,
    className = "",
    index,
    hoveredIndex,
    onHover,
    onLeave,
    noMagnify = false
}) => {
    const itemRef = useRef(null);
    const tooltipRef = useRef(null);

    // Calculate scale based on distance from hovered item
    const getScale = useCallback(() => {
        if (noMagnify) return 1; // Skip magnification
        if (hoveredIndex === null) return 1;
        const distance = Math.abs(index - hoveredIndex);
        if (distance === 0) return 1.4; // Hovered item
        if (distance === 1) return 1.2; // Immediate neighbors
        if (distance === 2) return 1.1; // Second neighbors
        return 1; // Far items
    }, [index, hoveredIndex, noMagnify]);

    // Calculate Y offset (items lift up when magnified)
    const getTranslateY = useCallback(() => {
        if (noMagnify) return 0; // Skip lift
        if (hoveredIndex === null) return 0;
        const distance = Math.abs(index - hoveredIndex);
        if (distance === 0) return -12; // Hovered item lifts most
        if (distance === 1) return -6; // Neighbors lift less
        if (distance === 2) return -2; // Second neighbors lift slightly
        return 0;
    }, [index, hoveredIndex, noMagnify]);

    useEffect(() => {
        if (itemRef.current) {
            gsap.to(itemRef.current, {
                scale: getScale(),
                y: getTranslateY(),
                duration: 0.2,
                ease: "power2.out"
            });
        }
    }, [hoveredIndex, getScale, getTranslateY]);

    // Show tooltip on hover
    useEffect(() => {
        if (tooltipRef.current) {
            if (hoveredIndex === index && tooltip) {
                gsap.to(tooltipRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.2,
                    ease: "power2.out"
                });
            } else {
                gsap.to(tooltipRef.current, {
                    opacity: 0,
                    y: 10,
                    duration: 0.15,
                    ease: "power2.in"
                });
            }
        }
    }, [hoveredIndex, index, tooltip]);

    const handleClick = () => {
        if (disabled || !onClick) return;

        // Bounce animation on click
        gsap.timeline()
            .to(itemRef.current, {
                scale: getScale() * 0.85,
                duration: 0.1,
                ease: "power2.in"
            })
            .to(itemRef.current, {
                scale: getScale(),
                duration: 0.3,
                ease: "elastic.out(1, 0.3)"
            });

        onClick();
    };

    return (
        <div
            className="relative flex flex-col items-center"
            onMouseEnter={() => onHover(index)}
            onMouseLeave={onLeave}
        >
            {/* Tooltip */}
            {tooltip && (
                <div
                    ref={tooltipRef}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-gray-900/95 border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none backdrop-blur-sm shadow-xl"
                    style={{ transform: 'translateX(-50%) translateY(10px)' }}
                >
                    {tooltip}
                    {/* Tooltip arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/95 border-r border-b border-white/10 rotate-45" />
                </div>
            )}

            {/* Item */}
            <button
                ref={itemRef}
                onClick={handleClick}
                disabled={disabled}
                className={`
                    relative flex items-center justify-center
                    transition-colors duration-200
                    ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                    ${className}
                `}
                style={{ transformOrigin: 'bottom center' }}
            >
                {children}

                {/* Active indicator dot */}
                {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-lg shadow-white/50" />
                )}
            </button>
        </div>
    );
};

// ============================================
// DOCK BUTTON (Icon only)
// ============================================
const DockButton = ({
    icon: Icon,
    tooltip,
    onClick,
    disabled = false,
    isActive = false,
    index,
    hoveredIndex,
    onHover,
    onLeave,
    activeGradient = "from-purple-500 to-blue-500"
}) => (
    <DockItem
        tooltip={tooltip}
        onClick={onClick}
        disabled={disabled}
        isActive={isActive}
        index={index}
        hoveredIndex={hoveredIndex}
        onHover={onHover}
        onLeave={onLeave}
        className={`
            w-12 h-10 rounded-2xl
            ${isActive
                ? `bg-gradient-to-br ${activeGradient} text-white shadow-lg shadow-purple-500/30`
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }
        `}
    >
        <Icon size={16} strokeWidth={2} />
    </DockItem>
);

// ============================================
// DOCK ACTION BUTTON (Icon + Label)
// ============================================
const DockActionButton = ({
    icon: Icon,
    label,
    tooltip,
    onClick,
    disabled = false,
    isActive = false,
    isLoading = false,
    index,
    hoveredIndex,
    onHover,
    onLeave,
    gradient = "from-purple-500 to-blue-500",
    noMagnify = false
}) => (
    <DockItem
        tooltip={tooltip}
        onClick={onClick}
        disabled={disabled || isLoading}
        isActive={isActive}
        index={index}
        hoveredIndex={hoveredIndex}
        onHover={onHover}
        onLeave={onLeave}
        noMagnify={noMagnify}
        className={`
            flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm
            ${isActive
                ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                : disabled || isLoading
                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    : `bg-gradient-to-r ${gradient} text-white hover:shadow-lg`
            }
        `}
        style={{ boxShadow: isActive ? `0 8px 32px -4px rgba(168, 85, 247, 0.4)` : 'none' }}
    >
        {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
        ) : (
            <Icon size={18} strokeWidth={2} />
        )}
        <span>{isLoading ? 'Saving...' : label}</span>
    </DockItem>
);

// ============================================
// DIVIDER
// ============================================
const DockDivider = ({ index, hoveredIndex }) => {
    const scale = hoveredIndex !== null && Math.abs(index - hoveredIndex) <= 2 ? 1.1 : 1;

    return (
        <div
            className="w-px h-10 mx-2 bg-gradient-to-b from-transparent via-white/20 to-transparent transition-transform duration-200"
            style={{ transform: `scaleY(${scale})` }}
        />
    );
};

// ============================================
// MAIN BOTTOM TOOLBAR (MAGIC DOCK)
// ============================================
export function BottomToolbar({
    viewMode = 'desktop',
    onViewChange,
    onPublishClick,
    isInteractMode = false,
    onInteractToggle,
    isChatOpen = false,
    onChatToggle,
    onSave,
    isSaving = false,
}) {
    const { theme } = useContext(ThemeContext);
    const { undo, redo, canUndo, canRedo, historyLength, futureLength } = useEditor();
    const toolbarRef = useRef(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Entry animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(toolbarRef.current,
                { opacity: 0, y: 80, scale: 0.8 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    ease: "elastic.out(1, 0.5)",
                    delay: 0.2
                }
            );

            // Stagger animate children
            gsap.fromTo(
                toolbarRef.current?.children || [],
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: "power2.out",
                    delay: 0.4
                }
            );
        });

        return () => ctx.revert();
    }, []);

    const handleHover = (index) => setHoveredIndex(index);
    const handleLeave = () => setHoveredIndex(null);

    const handleUndo = () => canUndo && undo();
    const handleRedo = () => canRedo && redo();

    // Define all dock items with their indices
    let itemIndex = 0;
    const getNextIndex = () => itemIndex++;

    return (
        <div
            ref={toolbarRef}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            onMouseLeave={handleLeave}
        >
            {/* Glow effect behind dock */}
            <div className="absolute inset-0 -z-10 blur-2xl opacity-50">
                <div className="w-full h-full bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30 rounded-3xl" />
            </div>

            {/* Main dock container */}
            <div className="flex items-end h-16 gap-3 px-4 py-3 rounded-3xl bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">

                {/* Undo */}
                <DockButton
                    icon={Undo2}
                    tooltip={`Undo ${historyLength > 0 ? `(${historyLength})` : ''}`}
                    onClick={handleUndo}
                    disabled={!canUndo}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                />

                {/* Redo */}
                <DockButton
                    icon={Redo2}
                    tooltip={`Redo ${futureLength > 0 ? `(${futureLength})` : ''}`}
                    onClick={handleRedo}
                    disabled={!canRedo}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                />

                <DockDivider index={getNextIndex()} hoveredIndex={hoveredIndex} />

                {/* Interact Mode */}
                <DockButton
                    icon={MousePointer2}
                    tooltip={isInteractMode ? 'Interacting (Click to disable)' : 'Enable Interact Mode'}
                    onClick={onInteractToggle}
                    isActive={isInteractMode}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                    activeGradient="from-purple-500 to-blue-500"
                />

                {/* Chat */}
                <DockButton
                    icon={MessageSquare}
                    tooltip={isChatOpen ? 'Close Chat' : 'Open AI Chat'}
                    onClick={onChatToggle}
                    isActive={isChatOpen}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                    activeGradient="from-blue-500 to-cyan-500"
                />

                <DockDivider index={getNextIndex()} hoveredIndex={hoveredIndex} />

                {/* Device Mode Buttons */}
                <DockButton
                    icon={Smartphone}
                    tooltip="Mobile View"
                    onClick={() => onViewChange?.('mobile')}
                    isActive={viewMode === 'mobile'}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                    activeGradient="from-pink-500 to-rose-500"
                />
                <DockButton
                    icon={Tablet}
                    tooltip="Tablet View"
                    onClick={() => onViewChange?.('tablet')}
                    isActive={viewMode === 'tablet'}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                    activeGradient="from-orange-500 to-amber-500"
                />
                <DockButton
                    icon={Monitor}
                    tooltip="Desktop View"
                    onClick={() => onViewChange?.('desktop')}
                    isActive={viewMode === 'desktop'}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                    activeGradient="from-green-500 to-emerald-500"
                />

                <DockDivider index={getNextIndex()} hoveredIndex={hoveredIndex} />

                {/* Save Button */}
                <DockActionButton
                    icon={Save}
                    label="Save"
                    tooltip="Save Project (Ctrl+S)"
                    onClick={onSave}
                    disabled={isSaving}
                    isLoading={isSaving}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                    gradient="from-blue-500 to-purple-500"
                    noMagnify={true}
                />

                {/* Publish Button */}
                <DockActionButton
                    icon={Rocket}
                    label="Publish"
                    tooltip="Publish Website"
                    onClick={onPublishClick}
                    index={getNextIndex()}
                    hoveredIndex={hoveredIndex}
                    onHover={handleHover}
                    onLeave={() => { }}
                    gradient="from-green-500 to-emerald-500"
                    noMagnify={true}
                />
            </div>

            {/* Reflection effect */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-b from-white/5 to-transparent blur-sm rounded-full" />
        </div>
    );
}

export default BottomToolbar;
