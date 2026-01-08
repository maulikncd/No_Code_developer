// import React, { useState, useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//     FaEye,
//     FaEyeSlash,
//     FaGoogle,
//     FaFacebookF,
//     FaInstagram,
//     FaTwitter,
//     FaYoutube,
//     FaLinkedin,
//     FaRegUser,
// } from "react-icons/fa";
// import { HiOutlineMail } from "react-icons/hi";
// import { MdLockOutline } from "react-icons/md";

// import bgLight from "../../../Public/bg.png";
// import bgDark from "../../../Public/bg_black.png";
// import { ThemeContext } from "../../ThemeProvider.jsx";
// import AppAlert from "../common/AppAlert.jsx";

// const SignUp = ({ setStep, setEmail }) => {
//     const { theme } = useContext(ThemeContext);
//     const navigate = useNavigate();

//     const [formData, setFormData] = useState({
//         username: "",
//         email: "",
//         password: "",
//         confirm_password: "",
//     });

//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const [alert, setAlert] = useState({
//         open: false,
//         message: "",
//         severity: "success",
//         title: "",
//     });

//     const showAlert = (message, severity = "error", title = "") => {
//         setAlert({ open: true, message, severity, title });
//     };

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     /* ---------------- MANUAL SIGNUP ---------------- */
//     const handleManualSignup = async (e) => {
//         e.preventDefault();

//         if (formData.password !== formData.confirm_password) {
//             showAlert("Passwords do not match", "warning");
//             return;
//         }

//         try {
//             setLoading(true);

//             const response = await fetch(
//                 `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
//                 {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({
//                         username: formData.username,
//                         email: formData.email,
//                         password: formData.password,
//                         confirm_password: formData.confirm_password,
//                         login_method: "manual",
//                         device_id: "device-123",
//                         device_name: "Web Browser",
//                         location: "Surat",
//                     }),
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok || data.status === false) {
//                 showAlert(
//                     data?.message || "Signup failed",
//                     "error",
//                     "Registration Failed"
//                 );
//                 return;
//             }

//             // ✅ IMPORTANT: save alert for OTP screen
//             sessionStorage.setItem(
//                 "signup_alert",
//                 JSON.stringify({
//                     message: "Account created successfully. Please verify OTP.",
//                     severity: "success",
//                     title: "Signup Successful",
//                 })
//             );

//             setEmail(formData.email);
//             setStep(2); // 🔥 ONLY step number

//         } catch (err) {
//             showAlert(
//                 "Server not reachable. Please try again later.",
//                 "error",
//                 "Network Error"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };


//     return (
//         <>
//             <div
//                 className="min-h-screen flex items-center justify-center px-4"
//                 style={{
//                     backgroundImage: `url(${theme === "dark" ? bgDark : bgLight})`,
//                     backgroundColor: theme === "dark" ? "#000000" : "#f6f6f6",
//                     backgroundSize: "cover",
//                     backgroundPosition: "center",
//                 }}
//             >
//                 {/* Glow */}
//                 <div
//                     className="absolute rounded-[100%] pointer-events-none z-0"
//                     style={{
//                         width: "990px",
//                         height: "562px",
//                         top: "-281px",
//                         left: "48%",
//                         transform: "translateX(-50%)",
//                         background: "rgba(255,255,255,0.15)",
//                         filter: "blur(120px)",
//                     }}
//                 />

//                 <div className="w-full max-w-8xl flex justify-center mx-auto grid grid-cols-1 lg:grid-cols-[520px_100px] gap-10 items-center">

//                     {/* CARD */}
//                     <div
//                         className={`rounded-[24px] px-10 py-12 border shadow-[0_30px_80px_rgba(0,0,0,0.08)]
//                     ${theme === "dark"
//                                 ? "bg-black border-gray-700 text-white"
//                                 : "bg-white border-gray-200 text-gray-900"
//                             }`}
//                     >
//                         <h2 className="text-2xl font-semibold text-center">
//                             Create An Account
//                         </h2>

//                         <p className={`text-sm text-center mt-2 mb-8
//                             ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//                             Kindly fill in your details below to create an account
//                         </p>

//                         <form className="space-y-5" onSubmit={handleManualSignup}>
//                             <Input
//                                 icon={<FaRegUser />}
//                                 placeholder="Enter Your Username"
//                                 theme={theme}
//                                 name="username"
//                                 onChange={handleChange}
//                             />

//                             <Input
//                                 icon={<HiOutlineMail />}
//                                 type="email"
//                                 placeholder="Enter Your Email"
//                                 theme={theme}
//                                 name="email"
//                                 onChange={handleChange}
//                             />

//                             <Input
//                                 icon={<MdLockOutline />}
//                                 type={showPassword ? "text" : "password"}
//                                 placeholder="Enter Your Password"
//                                 theme={theme}
//                                 name="password"
//                                 onChange={handleChange}
//                                 rightIcon={
//                                     <button type="button" onClick={() => setShowPassword(!showPassword)}>
//                                         {showPassword ? <FaEyeSlash /> : <FaEye />}
//                                     </button>
//                                 }
//                             />

//                             <Input
//                                 icon={<MdLockOutline />}
//                                 type={showConfirmPassword ? "text" : "password"}
//                                 placeholder="Confirm Password"
//                                 theme={theme}
//                                 name="confirm_password"
//                                 onChange={handleChange}
//                                 rightIcon={
//                                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
//                                         {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                                     </button>
//                                 }
//                             />

//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className={`w-full py-3 rounded-full border font-medium transition
//                                 flex items-center justify-center gap-2
//                                 ${theme === "dark"
//                                         ? "bg-black border-white text-white hover:bg-white hover:text-black"
//                                         : "bg-white border-gray-300 hover:shadow-md"
//                                     }
//                                 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
//                             >
//                                 {loading && (
//                                     <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//                                 )}
//                                 {loading ? "Signing up..." : "Sign Up"}
//                             </button>

//                             <p className={`text-center text-sm
//                                 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//                                 Already have an account?
//                                 <Link to="/signin" className="ml-1 font-semibold">
//                                     Sign In
//                                 </Link>
//                             </p>
//                         </form>
//                     </div>
//                     <div className="flex flex-col items-center gap-4">
//                         <p className="text-xs tracking-widest font-semibold text-gray-500">FOLLOW:-</p>
//                         {[FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaLinkedin].map((Icon, i) => (
//                             <button
//                                 key={i}
//                                 className={`w-10 h-10 rounded-xl border flex items-center justify-center transition
//                             ${theme === "dark"
//                                         ? "bg-black border-gray-600 text-gray-300"
//                                         : "bg-white border-gray-300 text-gray-600"
//                                     }`}
//                             >
//                                 <Icon />
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* 🔔 ALERT */}
//             <AppAlert
//                 open={alert.open}
//                 message={alert.message}
//                 severity={alert.severity}
//                 title={alert.title}
//                 onClose={() =>
//                     setAlert(prev => ({ ...prev, open: false }))
//                 }
//             />
//         </>
//     );
// };

// const Input = ({ icon, rightIcon, theme, ...props }) => (
//     <div
//         className={`flex items-center gap-3 px-4 py-3 rounded-2xl border
//         ${theme === "dark"
//                 ? "border-gray-600 focus-within:border-white"
//                 : "border-gray-300 focus-within:border-gray-500"
//             }`}
//     >
//         <span className="text-gray-400">{icon}</span>
//         <input
//             {...props}
//             required
//             className={`w-full text-sm bg-transparent outline-none
//             ${theme === "dark"
//                     ? "text-white placeholder-gray-500"
//                     : "text-black placeholder-gray-400"
//                 }`}
//         />
//         {rightIcon && <span className="text-gray-400">{rightIcon}</span>}
//     </div>
// );

// export default SignUp;










import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaEye,
    FaEyeSlash,
    FaGoogle,
    FaRegUser,
} from "react-icons/fa";
import { HiOutlineMail, HiSparkles } from "react-icons/hi";
import { MdLockOutline } from "react-icons/md";
import { ThemeContext } from "../../ThemeProvider.jsx";
import AppAlert from "../common/AppAlert.jsx";
import Cookies from "js-cookie";
import { useGoogleLogin } from "@react-oauth/google";

const SignUp = ({ setStep, setEmail }) => {
    const { theme } = useContext(ThemeContext);
    const [googleLoading, setGoogleLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
        title: "",
    });

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const showAlert = (message, severity = "error", title = "") => {
        setAlert({ open: true, message, severity, title });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /* ---------------- MANUAL SIGNUP ---------------- */
    const handleManualSignup = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            showAlert("Passwords do not match", "warning");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${BASE_URL}/auth/signup`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                        confirm_password: formData.confirm_password,
                        login_method: "manual",
                        device_id: "device-123",
                        device_name: "Web Browser",
                        location: "Surat",
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || data.status === false) {
                showAlert(
                    data?.message || "Signup failed",
                    "error",
                    "Registration Failed"
                );
                return;
            }

            sessionStorage.setItem(
                "signup_alert",
                JSON.stringify({
                    message: "Account created successfully. Please verify OTP.",
                    severity: "success",
                    title: "Signup Successful",
                })
            );

            setEmail(formData.email);
            setStep(2);

        } catch (err) {
            showAlert(
                "Server not reachable. Please try again later.",
                "error",
                "Network Error"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- GOOGLE SIGNUP ---------------- */
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
                <div className="orb orb-purple animate-float" style={{ width: '500px', height: '500px', top: '10%', left: '10%', animationDuration: '8s' }} />
                <div className="orb orb-cyan animate-float" style={{ width: '400px', height: '400px', bottom: '5%', right: '15%', animationDelay: '2s', animationDuration: '10s' }} />
                <div className="orb orb-pink animate-float" style={{ width: '300px', height: '300px', top: '50%', right: '20%', animationDelay: '4s', animationDuration: '12s' }} />

                {/* Content */}
                <div className="relative z-10 w-full max-w-3xl animate-fade-up">
                    {/* Glass Card */}
                    <div className="glass-card rounded-3xl p-8 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full mb-4">
                                <HiSparkles className="text-purple-500 text-xl" />
                                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                    Join Today
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold theme-text mb-2">
                                Create Account
                            </h1>
                            <p className="theme-text-muted">
                                Start your journey with us
                            </p>
                        </div>

                        <form className="space-y-4" onSubmit={handleManualSignup}>
                            {/* Horizontal Input Grid - Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Username Input */}
                                <ModernInput
                                    icon={<FaRegUser />}
                                    placeholder="Choose a username"
                                    theme={theme}
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />

                                {/* Email Input */}
                                <ModernInput
                                    icon={<HiOutlineMail />}
                                    type="email"
                                    placeholder="Enter your email"
                                    theme={theme}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Horizontal Input Grid - Row 2 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Password Input */}
                                <ModernInput
                                    icon={<MdLockOutline />}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    theme={theme}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
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

                                {/* Confirm Password Input */}
                                <ModernInput
                                    icon={<MdLockOutline />}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    theme={theme}
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="theme-text-secondary hover:theme-text transition-colors"
                                        >
                                            {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                        </button>
                                    }
                                />
                            </div>

                            {/* Sign Up Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {loading && (
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                {loading ? "Creating Account..." : "Create Account"}
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

                            {/* Google Sign Up Button */}
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
                                        <span>Sign up with Google</span>
                                    </>
                                )}
                            </button>

                            {/* Sign In Link */}
                            <p className="text-center theme-text-muted text-sm pt-4">
                                Already have an account?{" "}
                                <Link
                                    to="/signin"
                                    className="font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-cyan-700 transition-all"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </div>

                    {/* Bottom Decorative Text */}
                    <p className="text-center mt-6 theme-text-muted text-xs">
                        By signing up, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>

            {/* Alert */}
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
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none theme-text-muted group-focus-within:text-purple-500 transition-colors">
            {icon}
        </div>
        <input
            {...props}
            required
            className="w-full pl-12 pr-12 py-3.5 bg-white/50 dark:bg-white/5 border-2 theme-border rounded-xl theme-text placeholder:theme-text-muted focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none transition-all duration-300"
        />
        {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {rightIcon}
            </div>
        )}
    </div>
);

export default SignUp;
