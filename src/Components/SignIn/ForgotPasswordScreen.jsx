import React, { useState, useContext } from "react";
import { HiKey } from "react-icons/hi";
import { HiOutlineMail } from "react-icons/hi";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";

const ForgotPasswordScreen = ({ setStep, setEmail }) => {
    const { theme } = useContext(ThemeContext);

    const [emailLocal, setEmailLocal] = useState("");
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
        if (!emailLocal.trim()) {
            showAlert("Please enter a valid email address", "warning");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/send-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailLocal.trim() }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.status === false) {
                showAlert(data?.message || "Failed to send OTP", "error");
                return;
            }

            setEmail(emailLocal.trim());
            showAlert("OTP sent successfully to your email", "success", "Check Your Inbox");

            setTimeout(() => {
                setStep(3);
            }, 1200);

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
                <div className="orb orb-blue animate-float" style={{ width: '420px', height: '420px', top: '12%', left: '8%', animationDuration: '11s' }} />
                <div className="orb orb-purple animate-float" style={{ width: '380px', height: '380px', bottom: '8%', right: '12%', animationDelay: '3s', animationDuration: '13s' }} />
                <div className="orb orb-cyan animate-float" style={{ width: '320px', height: '320px', top: '45%', right: '18%', animationDelay: '5s', animationDuration: '15s' }} />

                {/* Content */}
                <div className="relative z-10 w-full max-w-md animate-fade-up">
                    {/* Glass Card */}
                    <div className="glass-card rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-4">
                                <HiKey className="text-4xl text-blue-500" />
                            </div>
                            <h1 className="text-3xl font-bold theme-text mb-2">
                                Forgot Password?
                            </h1>
                            <p className="theme-text-muted">
                                No worries, we'll send you reset instructions
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <ModernInput
                                icon={<HiOutlineMail />}
                                type="email"
                                placeholder="Enter your email"
                                value={emailLocal}
                                onChange={(e) => setEmailLocal(e.target.value)}
                                theme={theme}
                            />

                            {/* Send Code Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading && (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {loading ? "Sending..." : "Send Reset Code"}
                            </button>

                            {/* Back to Sign In */}
                            <p className="text-center theme-text-muted text-sm">
                                Remember your password?{" "}
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    Back to Sign In
                                </button>
                            </p>
                        </form>
                    </div>

                    {/* Bottom Decorative Text */}
                    <p className="text-center mt-6 theme-text-muted text-xs">
                        Check your email inbox and spam folder
                    </p>
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
const ModernInput = ({ icon, theme, ...props }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none theme-text-muted group-focus-within:text-blue-500 transition-colors">
            {icon}
        </div>
        <input
            {...props}
            required
            className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-white/5 border-2 theme-border rounded-xl theme-text placeholder:theme-text-muted focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300"
        />
    </div>
);

export default ForgotPasswordScreen;