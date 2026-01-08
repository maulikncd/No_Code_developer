import React, { useCallback, useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { FiPlus, FiCheck } from "react-icons/fi";
import { gsap } from "gsap";

export const COLOR_MATRIX_OPTIONS = [
    ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
    ["#11998e", "#38ef7d", "#00b09b", "#96c93d", "#43cea2"],
    ["#ff416c", "#ff4b2b", "#f857a6", "#ff5858", "#ee0979"],
    ["#8e2de2", "#4a00e0", "#9d50bb", "#6e48aa", "#5433ff"],
    ["#fc4a1a", "#f7b733", "#f89b29", "#ff8008", "#ffc837"],
    ["#00c6ff", "#0072ff", "#396afc", "#2948ff", "#00d2ff"],
    ["#434343", "#000000", "#1c1c1c", "#2c2c2c", "#3c3c3c"],
    ["#f5af19", "#f12711", "#e65c00", "#f9d423", "#ff4e50"],
];

// Normalize palette to array of color strings
const normalizePalette = (palette) => {
    if (!palette) return null;

    // Already an array of strings
    if (Array.isArray(palette) && typeof palette[0] === 'string') {
        return palette;
    }

    // Object with colors array
    if (palette.colors && Array.isArray(palette.colors)) {
        return palette.colors;
    }

    // Object with palette array
    if (palette.palette && Array.isArray(palette.palette)) {
        return palette.palette;
    }

    // Array of objects with hex/color property
    if (Array.isArray(palette) && typeof palette[0] === 'object') {
        const colors = palette.map(c => c.hex || c.color || c.value || c.code);
        if (colors.every(c => c)) return colors;
    }

    // Object with named colors (primary, secondary, etc.)
    if (typeof palette === 'object' && !Array.isArray(palette)) {
        const keys = ['primary', 'secondary', 'accent', 'background', 'text', 'color1', 'color2', 'color3', 'color4', 'color5'];
        const colors = keys.map(k => palette[k]).filter(Boolean);
        if (colors.length >= 3) return colors;

        // Just get all string values that look like colors
        const allColors = Object.values(palette).filter(v =>
            typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgb'))
        );
        if (allColors.length >= 3) return allColors;
    }

    return null;
};

const ColorSelection = ({
    isDark = true,
    selected,
    setSelected,
    options = COLOR_MATRIX_OPTIONS,
    shouldAutoFetch = true,
}) => {
    const [paletteOptions, setPaletteOptions] = useState(options);
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState("");

    const [isCustom, setIsCustom] = useState(false);
    const [customColors, setCustomColors] = useState(["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"]);
    const [activeColorIndex, setActiveColorIndex] = useState(0);

    const pickerRef = useRef(null);

    useEffect(() => {
        if (!fetching && paletteOptions.length > 0) {
            gsap.fromTo(".palette-card",
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "back.out(1.7)" }
            );
        }
    }, [fetching, paletteOptions]);

    useEffect(() => {
        if (isCustom && pickerRef.current) {
            gsap.fromTo(pickerRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
            );
        }
    }, [isCustom]);

    const fetchPalettes = useCallback(async () => {
        if (!shouldAutoFetch) return;
        const sessionId = Cookies.get("session_id");
        if (!sessionId) {
            setFetchError("Session expired");
            return;
        }

        setFetching(true);
        setFetchError("");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/recommendation/color-palettes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("access_token")}`,
                },
                body: JSON.stringify({ session_id: sessionId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || "Failed to fetch palettes");
            }

            // Try different response formats
            let rawPalettes = data?.palettes || data?.data?.palettes || data?.color_palettes || data?.data || [];

            if (!Array.isArray(rawPalettes)) {
                // Maybe it's an object with keys like p1, p2, etc.
                if (typeof rawPalettes === 'object') {
                    rawPalettes = Object.values(rawPalettes);
                }
            }


            const normalized = rawPalettes
                .map(normalizePalette)
                .filter(p => p && p.length >= 3);


            if (normalized.length > 0) {
                setPaletteOptions(normalized);
                setSelected?.(null);
            } else {
                // Keep default options if normalization failed
                console.warn("Using default palettes - API format not recognized");
                setPaletteOptions(options);
            }
        } catch (err) {
            console.error("Palette fetch error:", err);
            setFetchError(err.message);
            // Use default palettes on error
            setPaletteOptions(options);
        } finally {
            setFetching(false);
        }
    }, [shouldAutoFetch, setSelected, options]);

    useEffect(() => {
        fetchPalettes();
    }, [fetchPalettes]);

    if (fetching) {
        return (
            <div className="text-center py-16">
                <div className="w-10 h-10 mx-auto mb-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500">Loading color palettes...</p>
            </div>
        );
    }

    return (
        <>
            {/* Palette Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {paletteOptions.map((palette, i) => {
                    // Ensure we have an array of colors
                    const colors = Array.isArray(palette) ? palette : normalizePalette(palette) || [];

                    return (
                        <div
                            key={i}
                            onClick={() => { setSelected(i); setIsCustom(false); }}
                            className={`palette-card relative rounded-2xl p-2 cursor-pointer transition-all border ${selected === i
                                    ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                    : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                }`}
                        >
                            {selected === i && (
                                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center z-10">
                                    <FiCheck size={12} className="text-white" />
                                </div>
                            )}
                            <div className="flex h-20 rounded-xl overflow-hidden">
                                {colors.length > 0 ? (
                                    colors.map((color, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-1"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))
                                ) : (
                                    <div className="flex-1 bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                                        No colors
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Custom Color */}
                <div
                    onClick={() => { setIsCustom(true); setSelected('custom'); setActiveColorIndex(0); }}
                    className={`palette-card rounded-2xl p-2 cursor-pointer border border-dashed transition-all ${selected === 'custom' ? 'border-purple-500 bg-purple-500/10' : 'border-white/20 hover:border-white/40'
                        }`}
                >
                    <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                        <FiPlus size={24} />
                        <span className="text-xs mt-1">Custom</span>
                    </div>
                </div>
            </div>

            {/* Custom Picker */}
            {isCustom && (
                <div ref={pickerRef} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl glass-card">
                    {/* Preview */}
                    <div className="flex-1 flex h-32 rounded-xl overflow-hidden border border-white/10">
                        {customColors.map((color, i) => (
                            <div
                                key={i}
                                onClick={() => setActiveColorIndex(i)}
                                className={`flex-1 cursor-pointer transition-all relative ${activeColorIndex === i ? 'scale-110 z-10' : 'hover:opacity-80'
                                    }`}
                                style={{ backgroundColor: color }}
                            >
                                {activeColorIndex === i && (
                                    <div className="absolute inset-0 border-2 border-white" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-64 space-y-4">
                        <div
                            className="w-full h-20 rounded-xl shadow-lg"
                            style={{ backgroundColor: customColors[activeColorIndex] }}
                        />
                        <input
                            type="color"
                            value={customColors[activeColorIndex]}
                            onChange={(e) => {
                                const copy = [...customColors];
                                copy[activeColorIndex] = e.target.value;
                                setCustomColors(copy);
                            }}
                            className="w-full h-12 rounded-xl cursor-pointer border-none bg-transparent"
                        />
                        <input
                            value={customColors[activeColorIndex].toUpperCase()}
                            onChange={(e) => {
                                const copy = [...customColors];
                                copy[activeColorIndex] = e.target.value;
                                setCustomColors(copy);
                            }}
                            className="input-dark w-full text-center font-mono uppercase"
                        />
                        <button
                            onClick={() => setIsCustom(false)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold"
                        >
                            Save Palette
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ColorSelection;