import React, { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../../ThemeProvider.jsx";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AppAlert from "../common/AppAlert.jsx";
import { FiFolder, FiX, FiArrowRight } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { gsap } from "gsap";

const NewProjectModal = ({ onClose }) => {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const modalRef = useRef(null);
    const backdropRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        );
        gsap.fromTo(modalRef.current,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
    }, []);

    const [projectName, setProjectName] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    const showAlert = (message, severity = "error") => {
        setAlert({ open: true, message, severity });
    };

    const handleCreateProject = async () => {
        if (!projectName.trim()) {
            gsap.to(modalRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
            showAlert("Please enter a project name", "warning");
            return;
        }

        try {
            setLoading(true);
            const BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const accessToken = Cookies.get("access_token");

            const response = await fetch(`${BASE_URL}/auth/project/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ project_name: projectName.trim() }),
            });

            const data = await response.json();

            if (!response.ok || data.status !== true) {
                gsap.to(modalRef.current, { x: [-10, 10, -10, 10, 0], duration: 0.4 });
                throw new Error(data?.message || "Project creation failed");
            }

            Cookies.set("project_id", data.data.project_id, { secure: true, sameSite: "Strict" });

            gsap.to(modalRef.current, { scale: 1.05, opacity: 0, duration: 0.3 });

            setTimeout(() => {
                onClose();
                navigate("/project/workspace");
            }, 300);

        } catch (error) {
            showAlert(error.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        gsap.to(modalRef.current, { scale: 0.9, opacity: 0, duration: 0.2 });
        gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    };

    return (
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                {/* Backdrop */}
                <div
                    ref={backdropRef}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div
                    ref={modalRef}
                    className="relative z-10 w-full max-w-md p-8 rounded-2xl glass-card border border-white/10"
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <FiX size={18} />
                    </button>

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                        <FiFolder className="text-white text-2xl" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center text-white mb-2">New Project</h2>
                    <p className="text-gray-500 text-center text-sm mb-8">Give your project a name to get started</p>

                    {/* Input */}
                    <div className="mb-6">
                        <label className="block text-gray-400 text-sm mb-2">Project Name</label>
                        <input
                            type="text"
                            autoFocus
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="e.g., My Portfolio Website"
                            disabled={loading}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                            className="input-dark w-full"
                        />
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={handleCreateProject}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <HiSparkles />
                                <span>Create Project</span>
                                <FiArrowRight />
                            </>
                        )}
                    </button>
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

export default NewProjectModal;