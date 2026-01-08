import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiShieldCheck } from "react-icons/hi";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";
import Cookies from "js-cookie";

const OTP_LENGTH = 6;
const OTP_TIMER = 60;

const SignOtp = ({ email: propEmail }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useContext(ThemeContext);

    const email = location.state?.email || propEmail || "dummy@gmail.com";

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
    const inputRefs = useRef([]);
    const [timer, setTimer] = useState(OTP_TIMER);
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

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        const alertData = sessionStorage.getItem("signup_alert");
        if (alertData) {
            const parsed = JSON.parse(alertData);
            showAlert(parsed.message, parsed.severity);
            sessionStorage.removeItem("signup_alert");
        }
    }, []);

    useEffect(() => {
        if (timer <= 0) return;
        const i = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(i);
    }, [timer]);

    const handleChange = (i, val) => {
        if (!/^\d?$/.test(val)) return;

        const next = [...otp];
        next[i] = val;
        setOtp(next);

        if (val && i < OTP_LENGTH - 1) {
            inputRefs.current[i + 1]?.focus();
        }
    };

    const handleKeyDown = (i, e) => {
        if (e.key === "Backspace" && !otp[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otpValue = otp.join("");
        if (otpValue.length !== OTP_LENGTH) {
            showAlert("Please enter the complete 6-digit OTP", "warning");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp: otpValue }),
                }
            );

            const payload = await response.json();

            if (!response.ok || !payload.status) {
                showAlert(payload?.message || "OTP verification failed", "error", "Verification Failed");
                return;
            }

            Cookies.set("access_token", payload.data.access_token, { expires: 1, secure: true, sameSite: "strict" });
            Cookies.set("refresh_token", payload.data.refresh_token, { expires: 7, secure: true, sameSite: "strict" });
            Cookies.set("user_id", payload.data.user_id);
            Cookies.set("email", payload.data.email);
            if (payload.data.username) Cookies.set("username", payload.data.username);

            showAlert("OTP verified successfully. Welcome!", "success", "Verified");

            setTimeout(() => {
                navigate("/dashboard", {
                    state: {
                        alert: {
                            message: `Welcome ${payload.data.username || ""}! Login successful.`,
                            severity: "success",
                        },
                    },
                });
            }, 800);
        } catch (error) {
            showAlert("Server not reachable. Please try again.", "error", "Network Error");
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
                <div className="orb orb-cyan animate-float" style={{ width: '400px', height: '400px', top: '10%', left: '10%', animationDuration: '10s' }} />
                <div className="orb orb-purple animate-float" style={{ width: '350px', height: '350px', bottom: '10%', right: '15%', animationDelay: '2s', animationDuration: '12s' }} />
                <div className="orb orb-blue animate-float" style={{ width: '300px', height: '300px', top: '50%', right: '20%', animationDelay: '4s', animationDuration: '14s' }} />

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
                                Verify Email
                            </h1>
                            <p className="theme-text-muted text-sm">
                                Enter the 6-digit code sent to
                            </p>
                            <p className="theme-text font-medium text-sm mt-1">
                                {email}
                            </p>
                        </div>

                        {/* OTP Inputs */}
                        <div className="flex justify-center gap-3 mb-6">
                            {otp.map((v, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    value={v}
                                    maxLength={1}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-white/50 dark:bg-white/5 border-2 theme-border rounded-xl theme-text focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300"
                                />
                            ))}
                        </div>

                        {/* Timer / Resend */}
                        <div className="text-center mb-6">
                            {timer > 0 ? (
                                <p className="theme-text-muted text-sm">
                                    Resend code in <span className="font-semibold theme-text">00:{String(timer).padStart(2, "0")}</span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-cyan-700 transition-all"
                                >
                                    Resend Code
                                </button>
                            )}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading && (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            {loading ? "Verifying..." : "Verify Code"}
                        </button>

                        {/* Help Text */}
                        <p className="text-center theme-text-muted text-xs mt-6">
                            Didn't receive the code? Check your spam folder
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

export default SignOtp;