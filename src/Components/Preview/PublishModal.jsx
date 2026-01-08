import React, { useContext, useEffect, useRef } from "react";
import { ThemeContext } from "../../ThemeProvider";
import { FiGlobe, FiLink, FiServer, FiX } from "react-icons/fi";
import { gsap } from "gsap";

const PublishModal = ({ onClose, onConnectDomain, onCustomDomain, onSubDomain }) => {
    const { theme } = useContext(ThemeContext);
    const modalRef = useRef(null);
    const backdropRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(modalRef.current,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
    }, []);

    const handleClose = () => {
        gsap.to(modalRef.current, { opacity: 0, scale: 0.9, duration: 0.2 });
        gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    };

    const options = [
        {
            icon: FiLink,
            label: "Connect Your Domain",
            description: "Use a domain you already own",
            onClick: onConnectDomain,
            gradient: "from-purple-500 to-blue-500"
        },
        {
            icon: FiGlobe,
            label: "Get a Custom Domain",
            description: "Purchase a new domain",
            onClick: onCustomDomain,
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: FiServer,
            label: "Use Subdomain",
            description: "Get a free subdomain instantly",
            onClick: onSubDomain,
            gradient: "from-green-500 to-emerald-500"
        }
    ];

    return (
        <div ref={backdropRef} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="absolute inset-0" onClick={handleClose} />

            <div ref={modalRef} className="relative z-10 w-full max-w-md p-8 rounded-3xl glass-card border border-white/10">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                    <FiX size={18} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                        <FiGlobe className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Publish Your Site</h2>
                    <p className="text-gray-500 text-sm mt-1">Choose how you want to publish</p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={opt.onClick}
                            className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group text-left"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${opt.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                <opt.icon className="text-white" size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold group-hover:text-gradient transition-all">
                                    {opt.label}
                                </h3>
                                <p className="text-gray-500 text-sm">{opt.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublishModal;