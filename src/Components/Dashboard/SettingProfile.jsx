import React, { useContext, useEffect, useRef, useState } from "react";
import { FiUser, FiMail, FiCamera, FiCheck } from "react-icons/fi";
import { ThemeContext } from "../../ThemeProvider.jsx";
import { gsap } from "gsap";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const SettingProfile = () => {
    const { theme } = useContext(ThemeContext);

    // Get user data from token
    const getUserData = () => {
        try {
            const token = Cookies.get("access_token");
            if (token) {
                const decoded = jwtDecode(token);
                return {
                    username: decoded.username || Cookies.get("username") || "User",
                    email: decoded.email || decoded.sub || ""
                };
            }
        } catch (error) {
            console.log("Error decoding token:", error);
        }
        return {
            username: Cookies.get("username") || "User",
            email: ""
        };
    };

    const userData = getUserData();

    const [formData, setFormData] = useState({
        username: userData.username,
        email: userData.email,
    });
    const [saving, setSaving] = useState(false);

    const profileRef = useRef(null);
    const elementsRef = useRef([]);

    const addToRefs = (el) => {
        if (el && !elementsRef.current.includes(el)) {
            elementsRef.current.push(el);
        }
    };

    useEffect(() => {
        const tl = gsap.timeline();
        gsap.set(elementsRef.current, { opacity: 0, x: -15 });
        tl.to(elementsRef.current, {
            opacity: 1,
            x: 0,
            stagger: 0.1,
            duration: 0.5,
            ease: "back.out(1.2)"
        });
    }, []);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1500);
    };

    return (
        <div ref={profileRef}>
            {/* Header */}
            <div ref={addToRefs} className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Profile Information</h2>
                <p className="text-gray-500 text-sm">Update your profile details</p>
            </div>

            <div className="space-y-8">
                {/* Avatar */}
                <div ref={addToRefs} className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-purple-500/30">
                            {formData.username.charAt(0).toUpperCase()}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white/10 border-2 border-purple-500 flex items-center justify-center text-purple-400 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                            <FiCamera size={14} />
                        </button>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{formData.username}</h3>
                        <p className="text-gray-500 text-sm">{formData.email || "No email set"}</p>
                    </div>
                </div>

                {/* Username Input */}
                <div ref={addToRefs}>
                    <label className="block text-gray-400 text-sm mb-2">Username</label>
                    <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="input-dark w-full pl-11"
                            placeholder="Enter username"
                        />
                    </div>
                </div>

                {/* Email Input */}
                <div ref={addToRefs}>
                    <label className="block text-gray-400 text-sm mb-2">Email Address</label>
                    <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`input-dark w-full pl-11 ${formData.email ? 'pr-24' : ''}`}
                            placeholder="Enter your email"
                            style={{ color: formData.email ? '#ffffff' : undefined }}
                        />
                        {formData.email && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1">
                                <FiCheck size={12} />
                                Verified
                            </span>
                        )}
                    </div>
                </div>

                {/* Save Button */}
                <div ref={addToRefs} className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60"
                    >
                        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingProfile;