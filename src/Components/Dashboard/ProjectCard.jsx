import React, { useContext, useRef, useState, useEffect } from "react";
import { FiFolder, FiMoreVertical, FiEdit2, FiTrash2, FiExternalLink, FiClock } from "react-icons/fi";
import { ThemeContext } from "../../ThemeProvider.jsx";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ProjectAPI } from "../../services/ProjectAPI.js";

const ProjectCard = ({ project, viewMode = "grid", onDeleteClick, onEditClick }) => {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef(null);
    const cardRef = useRef(null);

    // Menu Animation
    useEffect(() => {
        if (openMenu && menuRef.current) {
            gsap.fromTo(menuRef.current,
                { opacity: 0, scale: 0.9, y: -10 },
                { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: "back.out(1.7)" }
            );
        }
    }, [openMenu]);

    // 3D Tilt Effect on Hover
    useEffect(() => {
        const card = cardRef.current;
        if (!card || viewMode !== "grid") return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.5,
                ease: "power2.out",
                transformPerspective: 1000
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        };

        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            card.removeEventListener("mousemove", handleMouseMove);
            card.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [viewMode]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Handle project open - fetch code from folder
    const handleOpen = async () => {
        if (isLoading) return;

        const projectId = project.project_id;
        setIsLoading(true);

        try {
            // Fetch project code from saved folder
            const result = await ProjectAPI.fetchProjectCode(projectId);

            // Robust extraction
            const projectData = result?.data || result;
            const files = projectData?.files || result?.files;
            const sessionId = projectData?.session_id || result?.session_id;

            if (result.status && files) {
                // Navigate with fetched code
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
            // Still navigate on error
            navigate("/project/preview", {
                state: {
                    project_id: projectId,
                    project_name: project.project_name
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Grid View
    if (viewMode === "grid") {
        return (
            <div
                ref={cardRef}
                className={`group relative p-5 rounded-2xl glass-card card-hover overflow-visible ${isLoading ? 'cursor-wait opacity-70' : 'cursor-pointer'} ${openMenu ? 'z-[200]' : 'z-10'}`}
                onClick={handleOpen}
            >
                {/* Thumbnail */}
                <div className="relative h-32 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-dots opacity-50" />

                    {/* Folder Icon / Loading Spinner */}
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <FiFolder className="text-white" />
                        )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                        <span className="text-white text-sm font-medium flex items-center gap-1">
                            <FiExternalLink size={14} />
                            {isLoading ? 'Loading...' : 'Open Project'}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">
                            {project.project_name || "Untitled Project"}
                        </h3>
                        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                            <FiClock size={10} />
                            Updated recently
                        </p>
                    </div>

                    {/* Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu); }}
                            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <FiMoreVertical size={16} />
                        </button>

                        {openMenu && (
                            <div className="absolute right-0 top-full mt-2 w-40 rounded-xl glass-card border border-white/10 overflow-visible shadow-2xl z-[100]">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditClick(project); setOpenMenu(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <FiEdit2 size={14} className="text-blue-400" />
                                    Rename
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteClick(project); setOpenMenu(false); }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all border-t border-white/5"
                                >
                                    <FiTrash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div
            ref={cardRef}
            className={`group relative flex items-center gap-4 p-4 rounded-xl glass-card card-hover overflow-visible ${isLoading ? 'cursor-wait opacity-70' : 'cursor-pointer'} ${openMenu ? 'z-[200]' : 'z-10'}`}
            onClick={handleOpen}
        >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <FiFolder className="text-purple-400" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate group-hover:text-purple-400 transition-colors">
                    {project.project_name || "Untitled Project"}
                </h3>
                <p className="text-gray-500 text-xs flex items-center gap-1">
                    <FiClock size={10} />
                    Updated recently
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onEditClick(project); }}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 transition-all"
                >
                    <FiEdit2 size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDeleteClick(project); }}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-red-400 transition-all"
                >
                    <FiTrash2 size={14} />
                </button>
            </div>

            <FiExternalLink className="text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0" />
        </div>
    );
};

export default ProjectCard;