import React, { useState, useContext, useEffect, useRef } from "react";
import Header from "./Header";
import SettingProfile from "./SettingProfile";
import SettingSecurity from "./SettingSecurity";
import { ThemeContext } from "../../ThemeProvider.jsx";
import { FiUser, FiShield, FiSettings } from "react-icons/fi";
import { gsap } from "gsap";

const Setting = () => {
    const [tab, setTab] = useState("profile");
    const { theme } = useContext(ThemeContext);

    const titleRef = useRef(null);
    const tabsRef = useRef(null);
    const contentRef = useRef(null);

    // Entrance Animation
    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(titleRef.current,
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        )
            .fromTo(tabsRef.current,
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
                "-=0.3"
            );
    }, []);

    // Tab Switch Animation
    useEffect(() => {
        gsap.fromTo(contentRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
    }, [tab]);

    const tabs = [
        { id: "profile", label: "Profile", icon: FiUser },
        { id: "security", label: "Security", icon: FiShield },
    ];

    return (
        <div className="min-h-screen theme-bg relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
            <div className="orb orb-purple w-[400px] h-[400px] top-40 -right-40 opacity-30" />
            <div className="orb orb-blue w-[300px] h-[300px] bottom-40 -left-40 opacity-20" />

            <Header />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
                {/* Page Header */}
                <div ref={titleRef} className="mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <FiSettings className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Settings</h1>
                            <p className="text-gray-500 text-sm">Manage your account preferences</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Tabs Sidebar */}
                    <div ref={tabsRef} className="lg:w-64 flex-shrink-0">
                        <div className="p-2 rounded-2xl glass-card">
                            {tabs.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${tab === item.id
                                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <item.icon size={18} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div ref={contentRef} className="flex-1">
                        <div className="p-8 rounded-2xl glass-card">
                            {tab === "profile" && <SettingProfile />}
                            {tab === "security" && <SettingSecurity />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Setting;