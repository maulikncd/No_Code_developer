import React, { useContext, useState, useEffect, useRef } from "react";
import { FiLock, FiShield, FiEye, FiEyeOff } from "react-icons/fi";
import Cookies from "js-cookie";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";
import { gsap } from "gsap";

const SettingSecurity = () => {
    const { theme } = useContext(ThemeContext);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const securityRef = useRef(null);
    const elementsRef = useRef([]);

    const addToRefs = (el) => {
        if (el && !elementsRef.current.includes(el)) {
            elementsRef.current.push(el);
        }
    };

    useEffect(() => {
        gsap.set(elementsRef.current, { opacity: 0, x: -15 });
        gsap.to(elementsRef.current, {
            opacity: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(1.2)"
        });
    }, []);

    const [form, setForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [show, setShow] = useState({ old: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    const showAlert = (message, severity = "error") => {
        setAlert({ open: true, message, severity });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!form.old_password || !form.new_password || !form.confirm_password) {
            showAlert("All fields are required", "warning");
            return;
        }

        if (form.new_password !== form.confirm_password) {
            gsap.to(securityRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
            showAlert("Passwords don't match", "warning");
            return;
        }

        try {
            setLoading(true);
            const token = Cookies.get("access_token");

            const response = await fetch(`${BASE_URL}/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok || data.status === false) {
                gsap.to(securityRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
                showAlert(data?.message || "Failed to change password", "error");
                return;
            }

            showAlert("Password updated successfully", "success");
            setForm({ old_password: "", new_password: "", confirm_password: "" });

        } catch {
            showAlert("Server error. Try again later.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div ref={securityRef}>
                {/* Header */}
                <div ref={addToRefs} className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-1">Account Security</h2>
                    <p className="text-gray-500 text-sm">Update your password</p>
                </div>

                {/* Info Card */}
                <div ref={addToRefs} className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                            <FiShield className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-white text-sm">Password Tips</h4>
                            <p className="text-gray-500 text-xs mt-1">
                                Use at least 8 characters with letters, numbers, and symbols.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Current Password */}
                    <div ref={addToRefs}>
                        <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type={show.old ? "text" : "password"}
                                name="old_password"
                                value={form.old_password}
                                onChange={handleChange}
                                placeholder="Enter current password"
                                className="input-dark w-full pl-11 pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShow(s => ({ ...s, old: !s.old }))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {show.old ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div ref={addToRefs}>
                        <label className="block text-gray-400 text-sm mb-2">New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type={show.new ? "text" : "password"}
                                name="new_password"
                                value={form.new_password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="input-dark w-full pl-11 pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShow(s => ({ ...s, new: !s.new }))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {show.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div ref={addToRefs}>
                        <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type={show.confirm ? "text" : "password"}
                                name="confirm_password"
                                value={form.confirm_password}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className="input-dark w-full pl-11 pr-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {show.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div ref={addToRefs} className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60"
                        >
                            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </div>
            </div>

            <AppAlert
                open={alert.open}
                message={alert.message}
                severity={alert.severity}
                onClose={() => setAlert(prev => ({ ...prev, open: false }))}
            />
        </>
    );
};

export default SettingSecurity;