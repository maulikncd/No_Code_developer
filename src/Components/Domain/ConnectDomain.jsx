import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Recommendation/Header.jsx";
import { FiGlobe, FiSearch, FiArrowRight, FiExternalLink } from "react-icons/fi";
import { gsap } from "gsap";

const ConnectDomain = () => {
    const navigate = useNavigate();
    const [domain, setDomain] = useState("");
    const cardRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { opacity: 0, y: 30, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    const handleConnect = () => {
        if (!domain.trim()) return;
        gsap.to(cardRef.current, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 });
    };

    return (
        <div className="fixed inset-0 flex flex-col theme-bg">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
            <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />

            {/* Header */}
            <Header />

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <div
                    ref={cardRef}
                    className="w-full max-w-xl p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative z-10"
                >
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                        <FiGlobe className="text-white text-xl" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
                        Connect Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Domain</span>
                    </h1>
                    <p className="text-gray-500 text-center mb-8 text-sm">
                        Boost your online presence with a custom domain
                    </p>

                    {/* Input */}
                    <div className="max-w-md mx-auto">
                        <div className="relative mb-4">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="e.g. myawesomesite.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-12 text-white placeholder:text-gray-600 outline-none focus:border-purple-500/50 transition-colors"
                                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                            />
                        </div>

                        <button
                            onClick={handleConnect}
                            disabled={!domain.trim()}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Connect Domain
                            <FiArrowRight />
                        </button>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-medium text-sm mb-1">Already have a domain?</h3>
                            <p className="text-gray-500 text-xs">Enter it above.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-white font-medium text-sm mb-1">Need to buy one?</h3>
                            <a
                                href="https://www.hostinger.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-purple-400 text-xs font-medium hover:text-purple-300 mt-1"
                            >
                                Visit Hostinger <FiExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConnectDomain;