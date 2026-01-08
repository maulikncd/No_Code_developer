import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FiUser, FiLogOut, FiGrid, FiSun, FiMoon, FiSettings,
    FiChevronDown, FiBell, FiFolder, FiHome
} from "react-icons/fi";
import { BsLightningChargeFill } from "react-icons/bs";
import Cookies from "js-cookie";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";
import { gsap } from "gsap";

const Header = () => {
    const navigate = useNavigate();
    const { theme, setThemeMode } = useContext(ThemeContext);

    const username = Cookies.get("username") || "User";
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    const dropdownRef = useRef(null);
    const headerRef = useRef(null);
    const modalRef = useRef(null);

    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    // GSAP: Header entrance
    useEffect(() => {
        gsap.fromTo(headerRef.current,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
    }, []);

    // GSAP: Dropdown animation
    useEffect(() => {
        if (dropdownOpen && dropdownRef.current) {
            gsap.fromTo(dropdownRef.current,
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
            );
        }
    }, [dropdownOpen]);

    // GSAP: Modal animation
    useEffect(() => {
        if (showLogoutModal && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [showLogoutModal]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = async () => {
        try {
            setLogoutLoading(true);
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
            navigate("/signin", {
                state: { alert: { message: "Logged out successfully", severity: "success" } },
            });
        }
    };

    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: FiGrid, end: true },
        { name: "Projects", path: "/dashboard/project", icon: FiFolder },
        { name: "Settings", path: "/dashboard/setting", icon: FiSettings },
    ];

    return (
        <>
            <header ref={headerRef} className="sticky top-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
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

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon size={16} />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setThemeMode(theme === 'dark' ? 'light' : 'dark')}
                                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white text-sm font-medium hidden sm:block">{username}</span>
                                    <FiChevronDown
                                        className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                                        size={16}
                                    />
                                </button>

                                {dropdownOpen && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute right-0 mt-2 w-64 rounded-2xl glass-card border border-white/10 overflow-hidden shadow-2xl"
                                    >
                                        {/* User Info */}
                                        <div className="p-4 border-b border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                                                    {username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{username}</p>
                                                    <p className="text-gray-500 text-xs">Free Plan</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <button
                                                onClick={() => { navigate("/dashboard"); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                            >
                                                <FiGrid size={18} />
                                                <span className="text-sm">Dashboard</span>
                                            </button>
                                            <button
                                                onClick={() => { navigate("/dashboard/setting"); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                            >
                                                <FiSettings size={18} />
                                                <span className="text-sm">Settings</span>
                                            </button>
                                        </div>

                                        {/* Logout */}
                                        <div className="p-2 border-t border-white/10">
                                            <button
                                                onClick={() => { setShowLogoutModal(true); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <FiLogOut size={18} />
                                                <span className="text-sm">Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div ref={modalRef} className="w-full max-w-sm p-8 rounded-2xl glass-card border border-white/10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                            <FiLogOut className="text-white text-2xl" />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Sign Out?</h3>
                        <p className="text-gray-400 mb-8">
                            Are you sure you want to sign out?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                disabled={logoutLoading}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={logoutLoading}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                {logoutLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {logoutLoading ? "Signing out..." : "Sign Out"}
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