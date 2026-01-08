import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiUser, FiLogOut, FiGrid, FiChevronDown, FiArrowLeft } from "react-icons/fi";
import { BsLightningChargeFill } from "react-icons/bs";
import Cookies from "js-cookie";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";
import { gsap } from "gsap";

const Header = () => {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const username = Cookies.get("username") || "User";

    const [open, setOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const dropdownRef = useRef(null);
    const modalRef = useRef(null);
    const headerRef = useRef(null);

    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    // Header Entrance Animation
    useEffect(() => {
        gsap.fromTo(headerRef.current,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    // Dropdown Animation
    useEffect(() => {
        if (open && dropdownRef.current) {
            gsap.fromTo(".dropdown-content",
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
            );
        }
    }, [open]);

    // Modal Animation
    useEffect(() => {
        if (showLogoutConfirm && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [showLogoutConfirm]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const accessToken = Cookies.get("access_token");
            const refreshToken = Cookies.get("refresh_token");

            await fetch(`${BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${refreshToken}`,
                    "X-Access-Token": accessToken,
                },
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("username");
            Cookies.remove("email");
            Cookies.remove("user_id");
            Cookies.remove("project_id");
            Cookies.remove("session_id");
            navigate("/signin");
        }
    };

    return (
        <>
            <header ref={headerRef} className="w-full sticky top-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Left Side */}
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <FiArrowLeft size={18} />
                        </button>

                        {/* Logo */}
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate("/home")}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BsLightningChargeFill className="text-white text-lg" />
                            </div>
                            <span className="text-xl font-bold text-white hidden sm:block">INAI</span>
                        </div>
                    </div>

                    {/* Right Side - User Menu */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white text-sm font-medium hidden sm:block">{username}</span>
                            <FiChevronDown
                                className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
                                size={16}
                            />
                        </button>

                        {open && (
                            <div className="dropdown-content absolute right-0 mt-2 w-52 rounded-2xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                                {/* User Info */}
                                <div className="p-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                                            {username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{username}</p>
                                            <p className="text-gray-500 text-xs">Free Plan</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button
                                        onClick={() => { navigate("/dashboard"); setOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <FiGrid size={16} />
                                        <span className="text-sm">Dashboard</span>
                                    </button>
                                </div>

                                {/* Logout */}
                                <div className="p-2 border-t border-white/10">
                                    <button
                                        onClick={() => { setShowLogoutConfirm(true); setOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <FiLogOut size={16} />
                                        <span className="text-sm">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Logout Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div ref={modalRef} className="w-full max-w-sm p-8 rounded-2xl glass-card border border-white/10 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                            <FiLogOut className="text-white text-xl" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Sign Out?</h3>
                        <p className="text-gray-500 mb-8">Are you sure you want to sign out?</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                disabled={loggingOut}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                            >
                                {loggingOut && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {loggingOut ? "Signing out..." : "Sign Out"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AppAlert
                open={alert.open}
                message={alert.message}
                severity={alert.severity}
                onClose={() => setAlert(prev => ({ ...prev, open: false }))}
            />
        </>
    );
};

export default Header;