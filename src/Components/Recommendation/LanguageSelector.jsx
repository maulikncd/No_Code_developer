import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { HiOutlineTranslate } from "react-icons/hi";
import { gsap } from "gsap";

const languages = [
    { label: "English", value: "english", flag: "🇬🇧" },
    { label: "Hindi", value: "hindi", flag: "🇮🇳" },
    { label: "Gujarati", value: "gujarati", flag: "🇮🇳" },
];

const LanguageSelector = ({ theme, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const dropdownRef = useRef(null);

    const selectedLanguage = languages.find((l) => l.value === value) || languages[0];

    useEffect(() => {
        if (open && dropdownRef.current) {
            gsap.fromTo(dropdownRef.current,
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
            );
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            {/* Button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
            >
                <HiOutlineTranslate size={16} className="text-purple-400" />
                <span className="font-medium">{selectedLanguage.label}</span>
                <FiChevronDown
                    className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                    size={14}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full mt-2 right-0 w-48 rounded-xl glass-card border border-white/10 overflow-hidden shadow-2xl z-50"
                >
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.value}
                                onClick={() => {
                                    onChange(lang.value);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all ${value === lang.value
                                        ? 'bg-purple-500/10 text-white'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span>{lang.flag}</span>
                                    <span className="font-medium">{lang.label}</span>
                                </div>
                                {value === lang.value && (
                                    <FiCheck size={14} className="text-purple-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;