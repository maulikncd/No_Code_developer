// ThemeProvider.jsx
import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

const getStoredTheme = () => {
    if (typeof window === "undefined") return "dark";
    try {
        return localStorage.getItem("theme") || "dark";
    } catch (_) {
        return "dark";
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => getStoredTheme());

    useEffect(() => {
        if (typeof document === "undefined") return undefined;

        const root = document.documentElement;
        const applyTheme = (mode) => {
            if (mode === "dark") {
                root.classList.add("dark");
            } else if (mode === "light") {
                root.classList.remove("dark");
            } else if (mode === "system") {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (prefersDark) {
                    root.classList.add("dark");
                } else {
                    root.classList.remove("dark");
                }
            }
            try {
                localStorage.setItem("theme", mode);
            } catch (_) {
                /* ignore write issues */
            }
        };

        applyTheme(theme);

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (event) => {
                if (event.matches) {
                    root.classList.add("dark");
                } else {
                    root.classList.remove("dark");
                }
            };
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }

        return undefined;
    }, [theme]);

    const setThemeMode = (mode) => {
        setTheme(mode);
    };

    return (
        <ThemeContext.Provider value={{ theme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
