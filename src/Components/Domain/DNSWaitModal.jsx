import React, { useEffect, useRef } from "react";
import { FiClock, FiCheck } from "react-icons/fi";
import { gsap } from "gsap";

const DNSWaitModal = ({ onClose }) => {
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
        gsap.to(modalRef.current, { scale: 0.9, opacity: 0, duration: 0.2 });
        gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    };

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-md p-10 rounded-3xl glass-card border border-white/10 text-center"
            >
                {/* Animated Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse opacity-50 blur-xl" />
                    <div className="relative w-full h-full rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <FiClock className="text-white text-3xl animate-spin-slow" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">DNS Propagating</h2>
                <p className="text-gray-500 mb-6">
                    Please wait <span className="text-purple-400 font-semibold">2-5 minutes</span>
                    <br />for DNS changes to take effect
                </p>

                {/* Status Steps */}
                <div className="space-y-3 mb-8 text-left max-w-xs mx-auto">
                    {[
                        { text: "Configuration saved", done: true },
                        { text: "DNS propagating...", done: false },
                        { text: "Site going live", done: false }
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.done
                                    ? 'bg-green-500'
                                    : 'border border-white/20'
                                }`}>
                                {step.done && <FiCheck className="text-white" size={12} />}
                            </div>
                            <span className={step.done ? 'text-white' : 'text-gray-500'}>
                                {step.text}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleClose}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default DNSWaitModal;