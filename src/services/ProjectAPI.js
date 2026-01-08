import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Project API Service
 * All project related backend calls
 */
export const ProjectAPI = {
    /**
     * ===============================
     * LIST PROJECTS
     * ===============================
     */
    async listProjects() {
        const token = Cookies.get("access_token");

        const response = await fetch(`${BASE_URL}/auth/project/list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok || data?.status === false) {
            throw new Error(data?.message || "Failed to load projects");
        }

        return data;
    },

    /**
     * ===============================
     * SAVE PROJECT
     * ===============================
     */
    async saveProject({ sessionId, projectId, projectName, htmlContent }) {
        const token = Cookies.get("access_token");

        const response = await fetch(`${BASE_URL}/project/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                session_id: sessionId,
                project_id: projectId,
                project_name: projectName,
                html_content: htmlContent,
            }),
        });

        const data = await response.json();

        if (!response.ok || data?.status === false) {
            throw new Error(data?.message || "Failed to save project");
        }

        return data;
    },

    /**
     * ===============================
     * FETCH PROJECT FILES
     * ===============================
     */
    async fetchProjectCode(projectId) {
        const token = Cookies.get("access_token");

        const response = await fetch(`${BASE_URL}/project/${projectId}/files`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok || data?.status === false) {
            throw new Error(data?.message || "Failed to fetch project files");
        }

        return data;
    },

    /**
     * ===============================
     * PROJECT DETAILS
     * ===============================
     */
    async getProjectDetails(projectId) {
        const token = Cookies.get("access_token");

        const response = await fetch(`${BASE_URL}/project/${projectId}/details`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok || data?.status === false) {
            throw new Error(data?.message || "Failed to fetch project details");
        }

        return data;
    },

    /**
     * ===============================
     * UPDATE PROJECT NAME
     * ===============================
     */
    async updateProject(projectId, newProjectName) {
        const token = Cookies.get("access_token");

        const response = await fetch(`${BASE_URL}/auth/project/update`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                project_id: projectId,
                new_project_name: newProjectName,
            }),
        });

        const data = await response.json();

        if (!response.ok || data?.status === false) {
            throw new Error(data?.message || "Failed to update project");
        }

        return data;
    },

    /**
     * ===============================
     * DELETE PROJECT
     * ===============================
     */
    async deleteProject(projectId) {
        const token = Cookies.get("access_token");

        const response = await fetch(`${BASE_URL}/auth/project/delete`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                project_id: projectId,
            }),
        });

        const data = await response.json();

        if (!response.ok || data?.status === false) {
            throw new Error(data?.message || "Failed to delete project");
        }

        return data;
    },

    /**
     * ===============================
     * SYNC CODE TO BACKEND 
     * ===============================
     * Syncs current HTML to backend so chatbot uses latest version.
     * Called when user saves property changes via PropertiesPanel.
     */
    async syncCode({ sessionId, htmlContent }) {
        const token = Cookies.get("access_token");

        try {
            const response = await fetch(`${BASE_URL}/project/save-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    code: htmlContent,
                    file_path: "index.html"
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn("⚠️ Failed to sync code to backend:", data?.message);
                return { status: false, message: data?.message };
            }

            console.log("✅ Code synced to backend");
            return { status: true, ...data };
        } catch (error) {
            console.warn("⚠️ Error syncing code:", error.message);
            return { status: false, message: error.message };
        }
    },

    /**
     * ===============================
     * UPDATE BLUEPRINT PROPERTY
     * ===============================
     * Updates a specific property in the Blueprint.
     * Called when user changes a property in PropertiesPanel.
     */
    async updateProperty({ sessionId, componentId, field, value, elementInfo }) {
        const token = Cookies.get("access_token");

        try {
            const response = await fetch(`${BASE_URL}/project/update-property`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    component_id: componentId,
                    field: field,
                    value: value,
                    element_info: elementInfo
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn("⚠️ Failed to update property:", data?.error);
                return { success: false, error: data?.error };
            }

            console.log(`✅ Property updated: ${data.component}.${data.field}`);
            return { success: true, ...data };
        } catch (error) {
            console.warn("⚠️ Error updating property:", error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * ===============================
     * APPLY CHANGES & REGENERATE
     * ===============================
     * Saves Blueprint and regenerates HTML code.
     * Called when user clicks "Apply Changes" in PropertiesPanel.
     */
    async applyChanges({ sessionId, regenerateCode = true }) {
        const token = Cookies.get("access_token");

        try {
            const response = await fetch(`${BASE_URL}/project/apply-changes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    regenerate_code: regenerateCode
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.warn("⚠️ Failed to apply changes:", data?.error);
                return { success: false, error: data?.error };
            }

            console.log("✅ Changes applied, code regenerated!");
            return { success: true, ...data };
        } catch (error) {
            console.warn("⚠️ Error applying changes:", error.message);
            return { success: false, error: error.message };
        }
    },
};

export default ProjectAPI;
