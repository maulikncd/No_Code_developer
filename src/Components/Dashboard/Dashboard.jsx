import React, { useContext, useEffect, useState, useRef } from "react";
import Header from "./Header";
import {
    FiPlus, FiFolder, FiClock, FiTrendingUp, FiZap, FiStar,
    FiArrowRight, FiGrid, FiActivity, FiLayers, FiTrash2
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { BsLightningChargeFill } from "react-icons/bs";
import { ThemeContext } from "../../ThemeProvider.jsx";
import NewProjectModal from "../Recommendation/NewProjectModal.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import AppAlert from "../common/AppAlert.jsx";
import { gsap } from "gsap";
import { ProjectAPI } from "../../services/ProjectAPI.js";

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="stat-card-wrapper relative p-6 rounded-2xl glass-card group hover:border-purple-500/50 transition-all overflow-hidden">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-gradient-x" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
                <div className={`stat-icon w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:shadow-purple-500/50`}>
                    <Icon className="text-white text-xl" />
                </div>
                {trend && (
                    <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1 animate-pulse-glow">
                        <FiTrendingUp size={12} />
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-white mb-1">
                <span className="stat-value" data-value={value}>{value}</span>
            </p>
            <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">{label}</p>
        </div>
    </div>
);

// ============================================
// PROJECT ROW COMPONENT
// ============================================
const ProjectRow = ({ project, onClick, onDelete, delay, isLoading = false, isDeleting = false }) => (
    <div
        className={`project-row-item group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 hover:border-purple-500/40 transition-all overflow-hidden ${isLoading || isDeleting ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
        style={{ animationDelay: `${delay}s` }}
    >
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div onClick={!isLoading && !isDeleting ? onClick : undefined} className="relative z-10 flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                {isLoading || isDeleting ? (
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <FiFolder className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                )}
            </div>
            <div>
                <p className="text-white font-medium group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all">
                    {project.project_name || "Untitled Project"}
                </p>
                <p className="text-gray-500 text-xs flex items-center gap-1">
                    <FiClock size={10} className="group-hover:text-purple-400 transition-colors" />
                    {isLoading ? "Loading..." : isDeleting ? "Deleting..." : "Updated recently"}
                </p>
            </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
            {!isLoading && !isDeleting && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(project.project_id);
                    }}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Project"
                >
                    <FiTrash2 size={16} />
                </button>
            )}
            {isLoading || isDeleting ? (
                <span className="text-purple-400 text-sm font-medium">{isDeleting ? "Deleting" : "Loading"}</span>
            ) : (
                <div onClick={onClick} className="p-2 rounded-lg hover:bg-white/10 transition-all">
                    <FiArrowRight className="text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                </div>
            )}
        </div>
    </div>
);

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const Dashboard = () => {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Refs
    const welcomeRef = useRef(null);
    const statsRef = useRef(null);
    const cardsRef = useRef(null);

    const [openNewProject, setOpenNewProject] = useState(false);
    const [recentProjects, setRecentProjects] = useState([]);
    const [totalProjects, setTotalProjects] = useState(0);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Stats state
    const [stats, setStats] = useState({
        activeSites: 0,
        aiGenerations: 0,
        publishedSites: 0,
        activeSitesTrend: null,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    const username = Cookies.get("username") || "User";
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
    const [loadingProjectId, setLoadingProjectId] = useState(null);
    const [deletingProjectId, setDeletingProjectId] = useState(null);

    // Handle project deletion
    const handleDeleteProject = async (projectId) => {
        if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

        setDeletingProjectId(projectId);
        try {
            const result = await ProjectAPI.deleteProject(projectId);
            if (result.status) {
                setRecentProjects(prev => prev.filter(p => p.project_id !== projectId));
                setTotalProjects(prev => Math.max(0, prev - 1));
                setAlert({
                    open: true,
                    message: "Project deleted successfully! 🗑️",
                    severity: "success"
                });
            } else {
                throw new Error(result.message || "Deletion failed");
            }
        } catch (err) {
            console.error("Delete error:", err);
            setAlert({
                open: true,
                message: err.message || "Failed to delete project",
                severity: "error"
            });
        } finally {
            setDeletingProjectId(null);
        }
    };

    // Handle project click - fetch code from folder then navigate
    const handleProjectClick = async (project) => {
        const projectId = project.project_id;
        setLoadingProjectId(projectId);

        try {
            // Fetch project code from saved folder
            const result = await ProjectAPI.fetchProjectCode(projectId);

            // Robust extraction: backend might wrap data in a 'data' property or 'files' might be at root
            const projectData = result?.data || result;
            const files = projectData?.files || result?.files;
            const sessionId = projectData?.session_id || result?.session_id;

            if (result.status && files) {
                // Navigate to preview with fetched code
                navigate("/project/preview", {
                    state: {
                        project_id: projectId,
                        session_id: sessionId,
                        project_name: project.project_name,
                        html: files.html,
                        css: files.css,
                        js: files.js,
                        fromSavedFolder: true
                    }
                });
            } else {
                // Fallback: navigate without pre-fetched code
                navigate("/project/preview", {
                    state: {
                        project_id: projectId,
                        session_id: sessionId || result?.session_id,
                        project_name: project.project_name
                    }
                });
            }
        } catch (err) {
            console.error("Error fetching project:", err);
            // Still navigate but show warning
            setAlert({
                open: true,
                message: "Could not load saved project. Loading from database...",
                severity: "warning"
            });
            navigate("/project/preview", {
                state: {
                    project_id: projectId,
                    project_name: project.project_name
                }
            });
        } finally {
            setLoadingProjectId(null);
        }
    };

    // 🎨 Ultra Premium GSAP Animations
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // 1. Text reveal character-by-character for welcome
        if (welcomeRef.current) {
            const heading = welcomeRef.current.querySelector('h1');
            if (heading) {
                const text = heading.textContent;
                heading.innerHTML = text.split('').map((char, i) =>
                    `<span class="char" style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`
                ).join('');

                gsap.fromTo('.char',
                    { opacity: 0, y: 50, rotateX: -90 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.05,
                        stagger: 0.03,
                        ease: "back.out(1.7)"
                    }
                );
            }
        }

        // 2. Animated gradient background on stat cards
        tl.fromTo(".stat-card",
            { opacity: 0, y: 80, scale: 0.7, rotateX: -25, z: -100 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                z: 0,
                duration: 1,
                stagger: {
                    amount: 0.5,
                    from: "start",
                    ease: "power2.out"
                },
                ease: "expo.out"
            },
            "-=0.3"
        )
            // 3. Main cards with slide-in effect (same as project rows)
            .fromTo(".main-card",
                { opacity: 0, x: -50, rotateY: -10, scale: 0.9 },
                {
                    opacity: 1,
                    x: 0,
                    rotateY: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "expo.out"
                },
                "-=0.5"
            );

        // 4. Dynamic orb animations with path
        gsap.to(".orb-purple", {
            motionPath: {
                path: [{ x: 0, y: 0 }, { x: 50, y: -40 }, { x: 30, y: -60 }, { x: 0, y: 0 }],
                curviness: 1.5
            },
            duration: 15,
            repeat: -1,
            ease: "sine.inOut"
        });

        gsap.to(".orb-blue", {
            motionPath: {
                path: [{ x: 0, y: 0 }, { x: -40, y: 50 }, { x: -20, y: 70 }, { x: 0, y: 0 }],
                curviness: 1.5
            },
            duration: 18,
            repeat: -1,
            ease: "sine.inOut"
        });

        // 5. Pulsing glow effect on stat icons
        gsap.to(".stat-icon", {
            boxShadow: "0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // 6. Gradient animation on cards
        gsap.to(".stat-card-wrapper", {
            backgroundPosition: "200% center",
            duration: 3,
            repeat: -1,
            ease: "linear"
        });

        // 7. Enhanced magnetic hover with 3D tilt
        const statCards = document.querySelectorAll(".stat-card");
        statCards.forEach(card => {
            card.addEventListener("mouseenter", (e) => {
                gsap.to(card, {
                    scale: 1.08,
                    z: 50,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(card, {
                    rotateY: x / 10,
                    rotateX: -y / 10,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener("mouseleave", (e) => {
                gsap.to(card, {
                    scale: 1,
                    z: 0,
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });

        return () => {
            statCards.forEach(card => {
                card.removeEventListener("mouseenter", () => { });
                card.removeEventListener("mousemove", () => { });
                card.removeEventListener("mouseleave", () => { });
            });
        };
    }, []);

    // 🔢 Enhanced counter with random fluctuation
    useEffect(() => {
        if (!loadingStats) {
            const animateCounter = (element, target) => {
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2.5,
                    ease: "expo.out",
                    onUpdate: () => {
                        if (element) {
                            element.textContent = Math.ceil(obj.val);
                        }
                    },
                    onComplete: () => {
                        // Add subtle pulsing after count completes
                        gsap.to(element, {
                            scale: 1.1,
                            duration: 0.3,
                            yoyo: true,
                            repeat: 1,
                            ease: "power2.inOut"
                        });
                    }
                });
            };

            setTimeout(() => {
                const statElements = document.querySelectorAll(".stat-value");
                statElements.forEach((el, i) => {
                    const target = parseInt(el.dataset.value) || 0;
                    if (target > 0) {
                        animateCounter(el, target);
                    }
                });
            }, 800);
        }
    }, [loadingStats, stats]);

    // 📊 Project rows with wave effect
    useEffect(() => {
        if (!loadingProjects && recentProjects.length > 0) {
            gsap.fromTo(".project-row",
                { opacity: 0, x: -50, rotateY: -10, scale: 0.9 },
                {
                    opacity: 1,
                    x: 0,
                    rotateY: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: {
                        amount: 0.4,
                        from: "start",
                        ease: "sine.out"
                    },
                    ease: "expo.out"
                }
            );

            // Add hover pulse effect
            const projectRows = document.querySelectorAll(".project-row-item");
            projectRows.forEach(row => {
                row.addEventListener("mouseenter", () => {
                    gsap.to(row, {
                        scale: 1.02,
                        boxShadow: "0 10px 40px rgba(168, 85, 247, 0.3)",
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });

                row.addEventListener("mouseleave", () => {
                    gsap.to(row, {
                        scale: 1,
                        boxShadow: "none",
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
            });
        }
    }, [loadingProjects, recentProjects]);

    // Alert from navigation
    useEffect(() => {
        if (location.state?.alert) {
            setAlert({ open: true, ...location.state.alert });
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    // Fetch projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await ProjectAPI.listProjects();
                const projects = data?.data?.projects || data?.projects || data?.data || [];
                const projectsArray = Array.isArray(projects) ? projects : [];
                setTotalProjects(projectsArray.length);
                setRecentProjects(projectsArray.slice(0, 5));
            } catch (err) {
                setRecentProjects([]);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, []);

    // Fetch stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = Cookies.get("access_token");
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/user/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        activeSites: data?.activeSites || data?.active_sites || 0,
                        aiGenerations: data?.aiGenerations || data?.ai_generations || 0,
                        publishedSites: data?.publishedSites || data?.published_sites || 0,
                        activeSitesTrend: data?.activeSitesTrend || data?.active_sites_trend || null,
                    });
                } else {
                    // Backend not ready yet, keep default values
                    setStats({
                        activeSites: 0,
                        aiGenerations: 0,
                        publishedSites: 0,
                        activeSitesTrend: null,
                    });
                }
            } catch (err) {
                // API not implemented yet, use default values
                console.log("Stats API not ready yet");
                setStats({
                    activeSites: 0,
                    aiGenerations: 0,
                    publishedSites: 0,
                    activeSitesTrend: null,
                });
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <>
            <div className="min-h-screen theme-bg relative overflow-hidden">
                {/* Background */}
                <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
                <div className="orb orb-purple w-[500px] h-[500px] top-20 -left-60 opacity-40" />
                <div className="orb orb-blue w-[400px] h-[400px] bottom-20 -right-40 opacity-30" />

                <Header />

                <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
                    {/* Welcome Section */}
                    <div ref={welcomeRef} className="mb-10">
                        <p className="text-gray-500 text-sm mb-2">{getGreeting()} 👋</p>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Welcome back, <span className="text-gradient">{username}</span>
                        </h1>
                        <p className="text-gray-500 mt-2">Ready to create something amazing?</p>
                    </div>

                    {/* Stats Grid */}
                    <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                        <div className="stat-card">
                            <StatCard
                                icon={FiFolder}
                                label="Total Projects"
                                value={totalProjects || "0"}
                                color="from-purple-500 to-violet-500"
                            />
                        </div>
                        <div className="stat-card">
                            <StatCard
                                icon={FiActivity}
                                label="Active Sites"
                                value={loadingStats ? "..." : stats.activeSites}
                                trend={stats.activeSitesTrend}
                                color="from-blue-500 to-cyan-500"
                            />
                        </div>
                        <div className="stat-card">
                            <StatCard
                                icon={FiZap}
                                label="AI Generations"
                                value={loadingStats ? "..." : stats.aiGenerations}
                                color="from-orange-500 to-red-500"
                            />
                        </div>
                        <div className="stat-card">
                            <StatCard
                                icon={FiStar}
                                label="Published"
                                value={loadingStats ? "..." : stats.publishedSites}
                                color="from-pink-500 to-rose-500"
                            />
                        </div>
                    </div>

                    {/* Main Cards Grid */}
                    <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* New Project Card - 2 columns */}
                        <div
                            className="main-card lg:col-span-2 p-8 rounded-2xl glass-card card-hover cursor-pointer group relative overflow-hidden"
                            onClick={() => setOpenNewProject(true)}
                        >
                            {/* Gradient Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/50 transition-all" />

                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                                    <FiPlus className="text-white text-2xl" />
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                    New Project
                                    <HiSparkles className="text-purple-400" />
                                </h2>

                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Start fresh with AI-powered website generation. Describe your vision and watch the magic happen.
                                </p>

                                <div className="flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-3 transition-all">
                                    <span>Create Now</span>
                                    <FiArrowRight />
                                </div>
                            </div>
                        </div>

                        {/* Recent Projects Card - 3 columns */}
                        <div className="main-card lg:col-span-3 p-8 rounded-2xl glass-card">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <FiLayers className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Recent Projects</h2>
                                        <p className="text-gray-500 text-sm">Continue where you left off</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/dashboard/project")}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                                >
                                    View All
                                    <FiArrowRight size={14} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {loadingProjects ? (
                                    [...Array(3)].map((_, i) => (
                                        <div key={i} className="h-16 rounded-xl skeleton" />
                                    ))
                                ) : recentProjects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                            <FiGrid className="text-gray-600 text-2xl" />
                                        </div>
                                        <p className="text-gray-500">No projects yet</p>
                                        <p className="text-gray-600 text-sm">Create your first project to get started</p>
                                    </div>
                                ) : (
                                    recentProjects.map((project, i) => (
                                        <div key={project.project_id || i} className="project-row">
                                            <ProjectRow
                                                project={project}
                                                delay={i * 0.1}
                                                onClick={() => handleProjectClick(project)}
                                                onDelete={handleDeleteProject}
                                                isLoading={loadingProjectId === project.project_id}
                                                isDeleting={deletingProjectId === project.project_id}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {openNewProject && <NewProjectModal onClose={() => setOpenNewProject(false)} />}
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

export default Dashboard;