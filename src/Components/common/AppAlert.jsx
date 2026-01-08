import React, { useEffect, useRef } from "react";
import { FiCheck, FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { gsap } from "gsap";

const severityConfig = {
    success: {
        icon: FiCheck,
        gradient: "from-green-500 to-emerald-500",
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        text: "text-green-400"
    },
    error: {
        icon: FiX,
        gradient: "from-red-500 to-pink-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        text: "text-red-400"
    },
    warning: {
        icon: FiAlertTriangle,
        gradient: "from-orange-500 to-yellow-500",
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-400"
    },
    info: {
        icon: FiInfo,
        gradient: "from-blue-500 to-cyan-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400"
    }
};

const AppAlert = ({ open, message, severity = "success", title, onClose }) => {
    const alertRef = useRef(null);

    const config = severityConfig[severity] || severityConfig.info;
    const Icon = config.icon;

    useEffect(() => {
        if (open && alertRef.current) {
            gsap.fromTo(alertRef.current,
                { opacity: 0, y: -20, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
            );

            // Auto close after 4 seconds
            const timer = setTimeout(() => {
                gsap.to(alertRef.current, {
                    opacity: 0,
                    y: -20,
                    scale: 0.95,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: onClose
                });
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed top-6 right-6 z-[99999]">
            <div
                ref={alertRef}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl glass-card border ${config.border} shadow-2xl min-w-[300px] max-w-[400px]`}
            >
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {title && <p className="text-white font-semibold text-sm">{title}</p>}
                    <p className={`text-sm ${title ? 'text-gray-400' : 'text-white'} truncate`}>
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => {
                        gsap.to(alertRef.current, {
                            opacity: 0,
                            scale: 0.95,
                            duration: 0.2,
                            onComplete: onClose
                        });
                    }}
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                    <FiX size={16} />
                </button>
            </div>
        </div>
    );
};

export default AppAlert;
