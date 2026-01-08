import React, { useContext, useEffect, useState, useRef } from "react";
import Header from "./Header";
import ProjectCard from "./ProjectCard";
import { ThemeContext } from "../../ThemeProvider.jsx";
import Cookies from "js-cookie";
import AppAlert from "../common/AppAlert.jsx";
import { FiFolder, FiEdit2, FiTrash2, FiPlus, FiSearch, FiGrid, FiList } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ProjectAPI } from "../../services/ProjectAPI";

const Project = () => {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    const [deleteProject, setDeleteProject] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [newProjectName, setNewProjectName] = useState("");
    const [updating, setUpdating] = useState(false);

    const headerRef = useRef(null);
    const modalRef = useRef(null);

    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
    const showAlert = (message, severity = "success") => setAlert({ open: true, message, severity });

    // Entrance Animation
    useEffect(() => {
        gsap.fromTo(headerRef.current,
            { opacity: 0, y: -30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
    }, []);

    // Project Cards Animation
    useEffect(() => {
        if (!loading && projects.length > 0) {
            gsap.fromTo(".project-item",
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.4)" }
            );
        }
    }, [loading, projects]);

    // Modal Animation
    useEffect(() => {
        if ((editProject || deleteProject) && modalRef.current) {
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [editProject, deleteProject]);

    // Fetch Projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await ProjectAPI.listProjects();
                const projectList = data?.data?.projects || data?.projects || data?.data || [];
                setProjects(Array.isArray(projectList) ? projectList : []);
            } catch (err) {
                setProjects([]);
                showAlert(err.message || "Failed to load projects", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const data = await ProjectAPI.deleteProject(deleteProject.project_id);

            if (data?.status === false) {
                showAlert(data?.message || "Delete failed", "error");
                return;
            }

            setProjects(prev => prev.filter(p => p.project_id !== deleteProject.project_id));
            setDeleteProject(null);
            showAlert("Project deleted", "success");
        } catch (err) {
            showAlert(err.message || "Something went wrong", "error");
        } finally {
            setDeleting(false);
        }
    };

    const handleUpdate = async () => {
        if (!newProjectName.trim()) {
            showAlert("Name cannot be empty", "warning");
            return;
        }
        try {
            setUpdating(true);
            const data = await ProjectAPI.updateProject(editProject.project_id, newProjectName.trim());

            if (data?.status === false) {
                showAlert(data?.message || "Update failed", "error");
                return;
            }

            setProjects(prev => prev.map(p => p.project_id === editProject.project_id ? { ...p, project_name: newProjectName } : p));
            setEditProject(null);
            showAlert("Project renamed", "success");
        } catch (err) {
            showAlert(err.message || "Failed to update project", "error");
        } finally {
            setUpdating(false);
        }
    };

    const filteredProjects = projects.filter(p =>
        p.project_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="min-h-screen theme-bg relative overflow-hidden">
                {/* Background */}
                <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
                <div className="orb orb-purple w-[400px] h-[400px] top-20 -right-40 opacity-30" />
                <div className="orb orb-blue w-[300px] h-[300px] bottom-20 -left-40 opacity-20" />

                <Header />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
                    {/* Page Header */}
                    <div ref={headerRef} className="mb-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                    <FiFolder className="text-white text-xl" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">All Projects</h1>
                                    <p className="text-gray-500 text-sm">Manage and organize your websites</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate("/project/workspace")}
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                            >
                                <FiPlus />
                                New Project
                            </button>
                        </div>

                        {/* Search & View Toggle */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card flex-1 max-w-md">
                                <FiSearch className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                                />
                            </div>

                            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-3 rounded-lg transition-all ${viewMode === "grid" ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <FiGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-3 rounded-lg transition-all ${viewMode === "list" ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <FiList size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Projects */}
                    {loading ? (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 rounded-2xl skeleton" />
                            ))}
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                                <FiFolder className="text-gray-600 text-3xl" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {searchQuery ? "No matching projects" : "No projects yet"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchQuery ? "Try a different search" : "Create your first project"}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => navigate("/project/workspace")}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold inline-flex items-center gap-2"
                                >
                                    <HiSparkles />
                                    Create First Project
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                            {filteredProjects.map((project) => (
                                <div key={project.project_id} className="project-item">
                                    <ProjectCard
                                        project={project}
                                        viewMode={viewMode}
                                        onDeleteClick={setDeleteProject}
                                        onEditClick={(p) => { setEditProject(p); setNewProjectName(p.project_name); }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editProject && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div ref={modalRef} className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                            <FiEdit2 className="text-white text-xl" />
                        </div>

                        <h3 className="text-xl font-bold mb-2">Rename Project</h3>
                        <p className="text-gray-500 text-sm mb-6">Enter a new name for your project</p>

                        <input
                            autoFocus
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                            className="input-dark w-full mb-6"
                            placeholder="Project name"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditProject(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={updating}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {updating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {updating ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteProject && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div ref={modalRef} className="w-full max-w-md p-8 rounded-2xl glass-card border border-white/10 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                            <FiTrash2 className="text-white text-2xl" />
                        </div>

                        <h3 className="text-xl font-bold mb-2">Delete Project?</h3>
                        <p className="text-gray-500 mb-8">
                            Are you sure you want to delete <span className="text-white font-semibold">{deleteProject.project_name}</span>?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteProject(null)}
                                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {deleting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AppAlert open={alert.open} message={alert.message} severity={alert.severity} onClose={() => setAlert(prev => ({ ...prev, open: false }))} />
        </>
    );
};

export default Project;