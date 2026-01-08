import React from "react";
import {
    FiHome, FiUser, FiLayers, FiShoppingCart, FiMail, FiCpu,
    FiMessageCircle, FiHelpCircle, FiDollarSign, FiPackage, FiImage, FiVideo, FiCalendar, FiCheck, FiBox
} from "react-icons/fi";

export const MODULES_OPTIONS = [
    { label: "Home", value: "home", icon: <FiHome /> },
    { label: "About Us", value: "about_us", icon: <FiUser /> },
    { label: "Services", value: "services", icon: <FiLayers /> },
    { label: "E-Commerce", value: "e_commerce", icon: <FiShoppingCart /> },
    { label: "Contact", value: "contact", icon: <FiMail /> },
    { label: "AI Blog", value: "ai_blog", icon: <FiCpu /> },
    { label: "Portfolio", value: "portfolio", icon: <FiImage /> },
    { label: "Testimonials", value: "testimonials", icon: <FiMessageCircle /> },
    { label: "FAQ", value: "faq", icon: <FiHelpCircle /> },
    { label: "Pricing", value: "pricing_tables", icon: <FiDollarSign /> },
    { label: "Products", value: "products", icon: <FiPackage /> },
    { label: "Gallery", value: "gallery", icon: <FiImage /> },
    { label: "Video Intro", value: "video_intro", icon: <FiVideo /> },
    { label: "Booking", value: "booking_sys", icon: <FiCalendar /> },
];

// Normalize feature option from API
const normalizeOption = (opt, index) => {
    if (!opt) return null;

    // Already normalized
    if (typeof opt === 'object' && opt.label && opt.value) {
        return opt;
    }

    // String value
    if (typeof opt === 'string') {
        const label = opt
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
        return { value: opt, label };
    }

    // Object with different keys
    if (typeof opt === 'object') {
        const value = opt.value || opt.id || opt.name || opt.key || `feature_${index}`;
        const label = opt.label || opt.title || opt.name || opt.display_name ||
            (typeof value === 'string' ? value.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : `Feature ${index + 1}`);
        return { value, label };
    }

    return null;
};

const FeaturesSelection = ({
    isDark = true,
    selected = [],
    setSelected,
    options = MODULES_OPTIONS,
}) => {
    // Normalize all options
    const normalizedOptions = options
        .map((opt, i) => normalizeOption(opt, i))
        .filter(Boolean);

    const handleSelect = (optionValue) => {
        if (selected.includes(optionValue)) {
            setSelected(selected.filter(item => item !== optionValue));
        } else {
            setSelected([...selected, optionValue]);
        }
    };

    // If no options, show message
    if (normalizedOptions.length === 0) {
        return (
            <div className="text-center py-12">
                <FiBox className="text-4xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No features available</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <FiLayers size={16} />
                    <span>Available Modules</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${selected.length > 0
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-500 border border-white/10'
                    }`}>
                    {selected.length} selected
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {normalizedOptions.map((option, i) => {
                    const optionValue = option.value;
                    const optionLabel = option.label || optionValue;
                    const isSelected = selected.includes(optionValue);

                    // Find matching icon or use default
                    const defaultOption = MODULES_OPTIONS.find(
                        m => m.value === optionValue ||
                            m.label.toLowerCase() === optionLabel.toLowerCase()
                    );
                    const icon = defaultOption?.icon || <FiBox />;

                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(optionValue)}
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${isSelected
                                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 text-white'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                                }`}
                        >
                            <span className={`text-lg transition-colors ${isSelected ? 'text-purple-400' : ''}`}>
                                {icon}
                            </span>
                            <span className="text-sm font-medium truncate">{optionLabel}</span>

                            {isSelected && (
                                <div className="absolute right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                    <FiCheck size={12} className="text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FeaturesSelection;