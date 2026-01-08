import React, { useContext, useState, useEffect } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";

const PasswordSuccess = ({ setStep }) => {
    const { theme } = useContext(ThemeContext);
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
        title: "",
    });

    useEffect(() => {
        setAlert({
            open: true,
            message: "Your password has been changed successfully.",
            severity: "success",
            title: "Success",
        });
    }, []);

    const handleBackToSignIn = () => {
        setLoading(true);
        setTimeout(() => {
            setStep(1);
        }, 800);
    };

    return (
        <>
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20" />

                {/* Animated Orbs */}
                <div className="orb animate-float" style={{ width: '480px', height: '480px', top: '10%', left: '8%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 70%)', animationDuration: '14s' }} />
                <div className="orb animate-float" style={{ width: '400px', height: '400px', bottom: '8%', right: '10%', background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3), transparent 70%)', animationDelay: '6s', animationDuration: '16s' }} />
                <div className="orb animate-float" style={{ width: '320px', height: '320px', top: '45%', right: '18%', background: 'radial-gradient(circle, rgba(110, 231, 183, 0.3), transparent 70%)', animationDelay: '8s', animationDuration: '18s' }} />

                {/* Content */}
                <div className="relative z-10 w-full max-w-md animate-scale-in">
                    {/* Glass Card */}
                    <div className="glass-card rounded-3xl p-8 shadow-2xl text-center">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6 animate-pulse-glow">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <HiCheckCircle className="text-5xl text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Header */}
                        <h1 className="text-3xl font-bold theme-text mb-2">
                            All Set!
                        </h1>
                        <p className="theme-text-muted mb-8">
                            Your password has been successfully changed. You can now sign in with your new password.
                        </p>

                        {/* Back to Sign In Button */}
                        <button
                            onClick={handleBackToSignIn}
                            disabled={loading}
                            className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {loading ? "Redirecting..." : "Back to Sign In"}
                        </button>

                        {/* Help Text */}
                        <p className="text-center theme-text-muted text-xs mt-6">
                            Your account is now secure with the new password
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

export default PasswordSuccess;