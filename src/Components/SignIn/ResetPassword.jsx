import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";
import { MdLockOutline } from "react-icons/md";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";

const ResetPassword = ({ setStep, email }) => {
    const { theme } = useContext(ThemeContext);

    const [form, setForm] = useState({
        password: "",
        confirm: "",
    });

    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
        title: "",
    });

    const showAlert = (message, severity = "error", title = "") => {
        setAlert({ open: true, message, severity, title });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.password || !form.confirm) {
            showAlert("Please fill both password fields", "warning");
            return;
        }

        if (form.password !== form.confirm) {
            showAlert("Passwords do not match", "error");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/reset-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        new_password: form.password,
                        confirm_password: form.confirm,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.status === false) {
                showAlert(data?.message || "Failed to reset password", "error", "Reset Failed");
                return;
            }

            showAlert("Your password has been reset successfully", "success", "Password Updated");

            setTimeout(() => {
                setStep(5);
            }, 1000);

        } catch (err) {
            showAlert("Server not reachable. Please try again later.", "error", "Network Error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />

                {/* Animated Orbs */}
                <div className="orb orb-cyan animate-float" style={{ width: '460px', height: '460px', top: '8%', left: '10%', animationDuration: '13s' }} />
                <div className="orb orb-blue animate-float" style={{ width: '380px', height: '380px', bottom: '10%', right: '8%', animationDelay: '5s', animationDuration: '15s' }} />
                <div className="orb orb-purple animate-float" style={{ width: '310px', height: '310px', top: '42%', right: '20%', animationDelay: '7s', animationDuration: '17s' }} />

                {/* Content */}
                <div className="relative z-10 w-full max-w-md animate-fade-up">
                    {/* Glass Card */}
                    <div className="glass-card rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full mb-4">
                                <HiLockClosed className="text-4xl text-cyan-500" />
                            </div>
                            <h1 className="text-3xl font-bold theme-text mb-2">
                                Reset Password
                            </h1>
                            <p className="theme-text-muted">
                                Choose a strong password you'll remember
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password */}
                            <ModernInput
                                icon={<MdLockOutline />}
                                type={showPass ? "text" : "password"}
                                placeholder="New password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                theme={theme}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="theme-text-secondary hover:theme-text transition-colors"
                                    >
                                        {showPass ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                    </button>
                                }
                            />

                            {/* Confirm Password */}
                            <ModernInput
                                icon={<MdLockOutline />}
                                type={showConfirm ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={form.confirm}
                                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                theme={theme}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="theme-text-secondary hover:theme-text transition-colors"
                                    >
                                        {showConfirm ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                    </button>
                                }
                            />

                            {/* Reset Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
                            >
                                {loading && (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>

                        {/* Help Text */}
                        <p className="text-center theme-text-muted text-xs mt-6">
                            Make sure it's at least 8 characters including a number and a lowercase letter
                        </p>
                    </div>
                </div>
            </div>

            <AppAlert
                open={alert.open}
                message={alert.message}
                severity={alert.severity}
                title={alert.title}
                onClose={() => setAlert(prev => ({ ...prev, open: false }))}
            />
        </>
    );
};

// Modern Input Component
const ModernInput = ({ icon, rightIcon, theme, ...props }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none theme-text-muted group-focus-within:text-cyan-500 transition-colors">
            {icon}
        </div>
        <input
            {...props}
            required
            className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-white/5 border-2 theme-border rounded-xl theme-text placeholder:theme-text-muted focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all duration-300"
        />
        {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {rightIcon}
            </div>
        )}
    </div>
);

export default ResetPassword;