import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../ThemeProvider";
import { FiGrid, FiLogOut, FiChevronDown } from "react-icons/fi";
import { BsLightningChargeFill } from "react-icons/bs";
import Cookies from "js-cookie";
import AppAlert from "../common/AppAlert.jsx";
import { gsap } from "gsap";

const Header = ({ mode, onModeChange }) => {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const username = Cookies.get("username") || "User";

    const [open, setOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    const dropdownRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (open) {
            gsap.fromTo(".preview-dropdown",
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
            );
        }
    }, [open]);

    useEffect(() => {
        if (showLogoutConfirm && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [showLogoutConfirm]);

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
            await fetch(`${BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("refresh_token")}`,
                },
            });
        } catch (err) {
            console.error(err);
        } finally {
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            Cookies.remove("username");
            navigate("/signin");
        }
    };

    return (
        <>
            <header className="h-14 flex items-center justify-between px-4 shrink-0 z-50 glass border-b border-white/5">
                {/* Logo */}
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <BsLightningChargeFill className="text-white text-base" />
                    </div>
                    <span className="font-bold text-white text-lg hidden sm:block">INAI</span>
                </div>

                {/* Mode Toggle - Center */}
                <div className="absolute left-1/2 -translate-x-1/2 flex p-1 rounded-full bg-white/5 border border-white/10">
                    <button
                        onClick={() => onModeChange("edit")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === "edit"
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onModeChange("preview")}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === "preview"
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Preview
                    </button>
                </div>

                {/* User Menu */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-sm hidden sm:block">{username}</span>
                        <FiChevronDown className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} size={14} />
                    </button>

                    {open && (
                        <div className="preview-dropdown absolute right-0 mt-2 w-48 rounded-xl glass-card border border-white/10 overflow-hidden shadow-2xl">
                            <button
                                onClick={() => { navigate("/dashboard"); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <FiGrid size={16} />
                                Dashboard
                            </button>
                            <button
                                onClick={() => { setShowLogoutConfirm(true); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all border-t border-white/10"
                            >
                                <FiLogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    )}
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
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2"
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