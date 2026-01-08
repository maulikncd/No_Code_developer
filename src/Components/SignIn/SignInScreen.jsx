import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    FaEye,
    FaEyeSlash,
    FaGoogle,
    FaRegUser,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { MdLockOutline } from "react-icons/md";
import Cookies from "js-cookie";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";
import { useGoogleLogin } from "@react-oauth/google";

const SignInScreen = ({ setStep }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useContext(ThemeContext);
    const [googleLoading, setGoogleLoading] = useState(false);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showAlert = (message, severity = "error") => {
        setAlert({ open: true, message, severity });
    };

    /* 🔥 RECEIVE ALERT FROM HEADER (LOGOUT) */
    useEffect(() => {
        if (location.state?.alert) {
            setAlert({
                open: true,
                message: location.state.alert.message,
                severity: location.state.alert.severity,
            });

            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /* ================= MANUAL LOGIN ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login_method: "manual",
                    email: formData.email,
                    password: formData.password,
                    device_id: "device-123",
                    device_name: "Web Browser",
                    location: "India",
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.status) {
                throw new Error(data?.message || "Login failed");
            }

            Cookies.set("access_token", data.data.access_token);
            Cookies.set("refresh_token", data.data.refresh_token);
            Cookies.set("user_id", data.data.user_id);
            Cookies.set("email", data.data.email);
            if (data.data.username) {
                Cookies.set("username", data.data.username);
            }

            navigate("/dashboard", {
                state: {
                    alert: {
                        message: `${data.data.username || "User"} successfully logged in`,
                        severity: "success",
                    },
                },
            });

        } catch (err) {
            showAlert(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- GOOGLE SIGNIN ---------------- */
    const handleGoogleSignup = async (googleResponse) => {
        try {
            setGoogleLoading(true);

            const userInfoRes = await fetch(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${googleResponse.access_token}`,
                    },
                }
            );

            const userInfo = await userInfoRes.json();

            const response = await fetch(`${BASE_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: userInfo.name,
                    email: userInfo.email,
                    login_method: "google",
                    social_id: userInfo.sub,
                    picture: userInfo.picture,
                    device_id: "device-123",
                    device_name: "Web Browser",
                    location: "India",
                }),
            });

            const data = await response.json();

            if (!response.ok || data.status === false) {
                throw new Error(data?.message || "Google login failed");
            }

            Cookies.set("access_token", data.data.access_token);
            Cookies.set("refresh_token", data.data.refresh_token);
            Cookies.set("username", data.data.username || userInfo.name);

            navigate("/dashboard", {
                state: {
                    alert: {
                        message: `${data.data.username || userInfo.name} successfully logged in`,
                        severity: "success",
                    },
                },
            });

        } catch (err) {
            showAlert(err.message, "error");
        } finally {
            setGoogleLoading(false);
        }
    };

    const RegisterUser = useGoogleLogin({
        onSuccess: handleGoogleSignup,
        onError: () => showAlert("Google login failed", "error"),
    });

    return (
        <>
            <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />

                {/* Animated Orbs */}
                <div className="orb orb-blue animate-float" style={{ width: '450px', height: '450px', top: '15%', left: '5%', animationDuration: '9s' }} />
                <div className="orb orb-purple animate-float" style={{ width: '350px', height: '350px', bottom: '10%', right: '10%', animationDelay: '3s', animationDuration: '11s' }} />
                <div className="orb orb-cyan animate-float" style={{ width: '280px', height: '280px', top: '40%', right: '25%', animationDelay: '5s', animationDuration: '13s' }} />

                {/* Content */}
                <div className="relative z-10 w-full max-w-3xl animate-fade-up">
                    {/* Glass Card */}
                    <div className="glass-card rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-4">
                                <HiSparkles className="text-blue-500 text-xl" />
                                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Welcome Back
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold theme-text mb-2">
                                Sign In
                            </h1>
                            <p className="theme-text-muted">
                                Continue your creative journey
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {/* Horizontal Input Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Email Input */}
                                <ModernInput
                                    icon={<FaRegUser />}
                                    name="email"
                                    placeholder="Username or Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    theme={theme}
                                />

                                {/* Password Input */}
                                <ModernInput
                                    icon={<MdLockOutline />}
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    theme={theme}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="theme-text-secondary hover:theme-text transition-colors"
                                        >
                                            {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                        </button>
                                    }
                                />
                            </div>

                            {/* Forgot Password */}
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading && (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {loading ? "Signing in..." : "Sign In"}
                            </button>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t theme-border"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-gray-900 px-3 theme-text-muted font-medium">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            {/* Google Sign In Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    RegisterUser();
                                }}
                                disabled={googleLoading}
                                className="w-full py-3.5 px-4 bg-white dark:bg-white/10 border-2 theme-border rounded-xl font-semibold theme-text hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                            >
                                {googleLoading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaGoogle className="text-red-500 text-xl" />
                                        <span>Sign in with Google</span>
                                    </>
                                )}
                            </button>

                            {/* Sign Up Link */}
                            <p className="text-center theme-text-muted text-sm pt-4">
                                Don't have an account?{" "}
                                <Link
                                    to="/signup"
                                    className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </form>
                    </div>

                    {/* Bottom Decorative Text */}
                    <p className="text-center mt-6 theme-text-muted text-xs">
                        Protected by industry-standard encryption
                    </p>
                </div>
            </div>

            {/* Alert */}
            <AppAlert
                open={alert.open}
                message={alert.message}
                severity={alert.severity}
                onClose={() => setAlert(prev => ({ ...prev, open: false }))}
            />
        </>
    );
};

// Modern Input Component
const ModernInput = ({ icon, rightIcon, theme, ...props }) => (
    <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none theme-text-muted group-focus-within:text-blue-500 transition-colors">
            {icon}
        </div>
        <input
            {...props}
            required
            className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-white/5 border-2 theme-border rounded-xl theme-text placeholder:theme-text-muted focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-300"
        />
        {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {rightIcon}
            </div>
        )}
    </div>
);

export default SignInScreen;
