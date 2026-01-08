import React, { useState, useEffect, useRef } from "react";
import { FiCheck, FiPlus, FiGlobe, FiFolder, FiLink, FiArrowRight } from "react-icons/fi";
import Header from "../Recommendation/Header.jsx";
import { gsap } from "gsap";

const DomainDashboard = () => {
    const [subdomain, setSubdomain] = useState("");
    const [useCustomFolder, setUseCustomFolder] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const cardRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.2 }
        );
    }, []);

    const handleCreate = () => {
        if (!subdomain.trim()) return;
        gsap.to(".create-btn", { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    };

    return (
        <div className="fixed inset-0 flex flex-col theme-bg">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
            <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />

            <Header />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-3xl mx-auto relative z-10">
                    {/* Header Section */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <FiGlobe className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Domains</h1>
                            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                                <FiLink size={12} />
                                <span className="text-purple-400">https://modest-catfish-1.10web.cloud</span>
                            </p>
                        </div>
                    </div>

                    {/* Create Subdomain Card */}
                    <div ref={cardRef} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        {/* Header */}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center gap-4 text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                <FiPlus className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-semibold">Create A New Subdomain</h3>
                                <p className="text-gray-500 text-sm">Get a free .inaiverse.com subdomain</p>
                            </div>
                            <FiArrowRight className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Form */}
                        {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                {/* Subdomain Input */}
                                <div className="mb-5">
                                    <label className="text-gray-400 text-sm mb-2 block">Subdomain Name</label>
                                    <div className="flex rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                        <input
                                            value={subdomain}
                                            onChange={(e) => setSubdomain(e.target.value)}
                                            placeholder="Enter your subdomain"
                                            className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-gray-600 outline-none"
                                        />
                                        <div className="px-4 py-3 bg-white/5 text-purple-400 font-medium border-l border-white/10 flex-shrink-0">
                                            .inaiverse.com
                                        </div>
                                    </div>
                                </div>

                                {/* Custom Folder Checkbox */}
                                <label className="flex items-center gap-3 cursor-pointer mb-6 group">
                                    <div
                                        onClick={() => setUseCustomFolder(!useCustomFolder)}
                                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${useCustomFolder
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'border-white/20 bg-white/5 hover:border-white/40'
                                            }`}
                                    >
                                        {useCustomFolder && <FiCheck size={12} className="text-white" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
                                        <FiFolder size={14} />
                                        <span className="text-sm">Use custom folder for subdomain</span>
                                    </div>
                                </label>

                                {/* Create Button */}
                                <button
                                    onClick={handleCreate}
                                    disabled={!subdomain.trim()}
                                    className="create-btn px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <FiCheck />
                                    Create Subdomain
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Existing Domains Section */}
                    <div className="mt-6">
                        <h3 className="text-white font-semibold mb-3 text-sm">Your Domains</h3>
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                <FiGlobe className="text-gray-600" size={20} />
                            </div>
                            <p className="text-gray-500 text-sm">No domains connected yet</p>
                            <p className="text-gray-600 text-xs mt-1">Create a subdomain above to get started</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DomainDashboard;