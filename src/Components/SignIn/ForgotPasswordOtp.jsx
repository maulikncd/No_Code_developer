import React, { useEffect, useRef, useState, useContext } from "react";
import { HiShieldCheck } from "react-icons/hi";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";

const OTP_LENGTH = 6;
const OTP_TIMER = 60;

const ForgotPasswordOtp = ({ setStep, email }) => {
    const { theme } = useContext(ThemeContext);

    const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
    const inputRefs = useRef([]);

    const [timer, setTimer] = useState(OTP_TIMER);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
        title: "",
    });

    const showAlert = (message, severity = "error", title = "") => {
        setAlert({ open: true, message, severity, title });
    };

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (timer <= 0) return;
        const i = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(i);
    }, [timer]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const next = [...otpValues];
        next[index] = value;
        setOtpValues(next);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otpValues.includes("")) {
            showAlert("Please enter the complete 6-digit code", "warning");
            return;
        }

        const otp = otpValues.join("");
        try {
            setIsSubmitting(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/verify-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                }
            );

            const data = await response.json();
            if (!response.ok || data.status === false) {
                showAlert(data?.message || "Invalid or expired OTP", "error", "Verification Failed");
                return;
            }

            showAlert("OTP verified successfully", "success", "Verified");
            setTimeout(() => setStep(4), 1000);
        } catch (err) {
            showAlert("Server not reachable. Please try again.", "error", "Network Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setResendLoading(true);

            await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password/send-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                }
            );

            setOtpValues(Array(OTP_LENGTH).fill(""));
            setTimer(OTP_TIMER);
            showAlert("OTP resent successfully", "success", "Code Sent");
        } catch {
            showAlert("Failed to resend OTP", "error", "Request Failed");
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />

                {/* Animated Orbs */}
                <div className="orb orb-purple animate-float" style={{ width: '440px', height: '440px', top: '10%', left: '12%', animationDuration: '12s' }} />
                <div className="orb orb-cyan animate-float" style={{ width: '360px', height: '360px', bottom: '12%', right: '10%', animationDelay: '4s', animationDuration: '14s' }} />
                <div className="orb orb-blue animate-float" style={{ width: '300px', height: '300px', top: '48%', right: '22%', animationDelay: '6s', animationDuration: '16s' }} />

                {/* Content */}
                <div className="relative z-10 w-full max-w-md animate-fade-up">
                    {/* Glass Card */}
                    <div className="glass-card rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full mb-4">
                                <HiShieldCheck className="text-4xl text-purple-500" />
                            </div>
                            <h1 className="text-3xl font-bold theme-text mb-2">
                                Verify Code
                            </h1>
                            <p className="theme-text-muted text-sm">
                                Enter the 6-digit code sent to
                            </p>
                            <p className="theme-text font-medium text-sm mt-1">
                                {email}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* OTP Inputs */}
                            <div className="flex justify-center gap-3">
                                {otpValues.map((value, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (inputRefs.current[i] = el)}
                                        type="text"
                                        maxLength={1}
                                        value={value}
                                        onChange={(e) => handleChange(i, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(i, e)}
                                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-white/50 dark:bg-white/5 border-2 theme-border rounded-xl theme-text focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300"
                                    />
                                ))}
                            </div>

                            {/* Timer / Resend */}
                            <div className="text-center">
                                {timer > 0 ? (
                                    <p className="theme-text-muted text-sm">
                                        Resend code in <span className="font-semibold theme-text">00:{String(timer).padStart(2, "0")}</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={resendLoading}
                                        onClick={handleResendOtp}
                                        className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-cyan-700 transition-all disabled:opacity-60"
                                    >
                                        {resendLoading ? "Sending..." : "Resend Code"}
                                    </button>
                                )}
                            </div>

                            {/* Verify Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isSubmitting && (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {isSubmitting ? "Verifying..." : "Verify Code"}
                            </button>
                        </form>

                        {/* Help Text */}
                        <p className="text-center theme-text-muted text-xs mt-6">
                            Check your spam folder if you didn't receive the code
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

export default ForgotPasswordOtp;