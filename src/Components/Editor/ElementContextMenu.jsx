import { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../../ThemeProvider";
import { FiZap, FiSettings } from "react-icons/fi";
import { gsap } from "gsap";

export function ElementContextMenu({ position, onGenerate, onProps, onClose }) {
    const { theme } = useContext(ThemeContext);
    const menuRef = useRef(null);
    const isDark = theme === "dark";

    useEffect(() => {
        if (menuRef.current) {
            gsap.fromTo(
                menuRef.current,
                { opacity: 0, scale: 0.9, y: -10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "back.out(1.7)" }
            );
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className={`fixed z-[9999] min-w-[180px] rounded-xl shadow-2xl border backdrop-blur-xl ${isDark
                    ? "bg-[#1a1a1a]/95 border-white/10 text-white"
                    : "bg-white/95 border-gray-200 text-gray-900"
                }`}
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
            }}
        >
            <div className="p-2 space-y-1">
                {/* Generate Option */}
                <button
                    onClick={onGenerate}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all group ${isDark
                            ? "hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 hover:text-white"
                            : "hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 hover:text-purple-700"
                        }`}
                >
                    <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isDark
                                ? "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white"
                                : "bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white"
                            }`}
                    >
                        <FiZap size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Generate</div>
                        <div
                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            Modify with AI
                        </div>
                    </div>
                </button>

                {/* Divider */}
                <div
                    className={`h-px mx-2 ${isDark ? "bg-white/10" : "bg-gray-200"
                        }`}
                />

                {/* Props Option */}
                <button
                    onClick={onProps}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all group ${isDark
                            ? "hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white"
                            : "hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 hover:text-blue-700"
                        }`}
                >
                    <div
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isDark
                                ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white"
                                : "bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white"
                            }`}
                    >
                        <FiSettings size={16} />
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Properties</div>
                        <div
                            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                                }`}
                        >
                            Edit element styles
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
