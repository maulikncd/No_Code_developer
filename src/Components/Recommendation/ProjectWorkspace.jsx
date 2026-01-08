import React, { useContext, useEffect, useState, useRef } from "react";
import { ThemeContext } from "../../ThemeProvider.jsx";
import { useNavigate } from "react-router-dom";
import Header from "./Header.jsx";
import LanguageSelector from "./LanguageSelector.jsx";
import GoalStepModal from "./GoalStepModal.jsx";
import AppAlert from "../common/AppAlert.jsx";
import ColorSelection from "./ColorSelection.jsx";
import FeaturesSelection, { MODULES_OPTIONS } from "./FeaturesSelection.jsx";
import { FiSend, FiArrowRight, FiCheck, FiCpu } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { BsLightningChargeFill } from "react-icons/bs";
import { gsap } from "gsap";
import Cookies from "js-cookie";

/* ---------------- STEPS ---------------- */
const STEPS = {
    PROMPT: "prompt",
    QUESTIONS: "questions",
    COLORS: "colors",
    FEATURES: "features",
};

const extractBlueprint = (payload) => {
    const candidates = [
        payload?.blueprint,
        payload?.data?.blueprint,
        payload?.result?.blueprint,
        payload?.data?.result?.blueprint,
    ];
    return candidates.find(Boolean) || null;
};

const extractGeneratedHtml = (payload) => {
    const candidates = [
        payload?.generated_code,
        payload?.html,
        payload?.code,
        payload?.data?.generated_code,
        payload?.data?.html,
    ];
    return candidates.find(Boolean) || null;
};

/* ---------------- STEP INDICATOR ---------------- */
const StepIndicator = ({ currentStep }) => {
    const steps = [
        { key: STEPS.PROMPT, label: "Describe", num: 1 },
        { key: STEPS.QUESTIONS, label: "Configure", num: 2 },
        { key: STEPS.COLORS, label: "Style", num: 3 },
        { key: STEPS.FEATURES, label: "Features", num: 4 },
    ];

    const getStepIndex = (step) => steps.findIndex(s => s.key === step);
    const currentIndex = getStepIndex(currentStep);

    return (
        <div className="flex items-center justify-center gap-3 mb-10">
            {steps.map((step, i) => (
                <React.Fragment key={step.key}>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${i <= currentIndex
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30'
                        : 'bg-white/5 border border-white/10'
                        }`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < currentIndex
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : i === currentIndex
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/10 text-gray-500'
                            }`}>
                            {i < currentIndex ? <FiCheck size={12} /> : step.num}
                        </span>
                        <span className={`text-sm font-medium hidden sm:block ${i <= currentIndex ? 'text-white' : 'text-gray-500'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-8 h-0.5 ${i < currentIndex ? 'bg-purple-500' : 'bg-white/10'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

/* ---------------- MAIN COMPONENT ---------------- */
const ProjectWorkspace = () => {
    const { theme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const [step, setStep] = useState(STEPS.PROMPT);
    const [language, setLanguage] = useState(null);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [firstQuestion, setFirstQuestion] = useState(null);
    const [selectedPalette, setSelectedPalette] = useState(null);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [featuresOptions, setFeaturesOptions] = useState(MODULES_OPTIONS);
    const [featuresLoading, setFeaturesLoading] = useState(false);
    const [featuresError, setFeaturesError] = useState("");
    const [savingFeatures, setSavingFeatures] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");

    const cardRef = useRef(null);

    // Card Animation on step change
    useEffect(() => {
        if (cardRef.current) {
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 30, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
            );
        }
    }, [step]);

    const [alert, setAlert] = useState({ open: false, message: "", severity: "success", title: "" });
    const showAlert = (message, severity = "error", title = "") => {
        setAlert({ open: true, message, severity, title });
    };

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleGenerate = async () => {
        if (!prompt.trim() || loading) return;

        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/recommendation/generated_question`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("access_token")}`,
                },
                body: JSON.stringify({ prompt, language: language || "english" }),
            });

            const data = await response.json();

            if (!response.ok || data.status === false) {
                throw new Error(data?.message || "Generation failed");
            }

            if (data.session_id) {
                Cookies.set("session_id", data.session_id);
            }

            if (data.questions?.length) {
                setFirstQuestion(data.questions[0]);
                setStep(STEPS.QUESTIONS);
            } else {
                showAlert("No questions generated", "warning");
            }
        } catch (err) {
            showAlert(err.message || "Server error", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFinishPalette = async () => {
        if (selectedPalette === null) {
            showAlert("Please select a color palette", "warning");
            return;
        }

        const payload = {
            session_id: Cookies.get("session_id"),
            palette_id: `p${selectedPalette + 1}`,
        };

        try {
            const res = await fetch(`${BASE_URL}/recommendation/select-palette`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("access_token")}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || data.status === false) {
                throw new Error(data?.message || "Palette selection failed");
            }

            setStep(STEPS.FEATURES);
        } catch (err) {
            showAlert(err.message, "error");
        }
    };

    const fetchFeatureOptions = async () => {
        const sessionId = Cookies.get("session_id");
        if (!sessionId) {
            setFeaturesError("Session expired. Restart flow.");
            return;
        }


        try {
            setFeaturesLoading(true);
            setFeaturesError("");

            const res = await fetch(`${BASE_URL}/recommendation/features`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("access_token")}`,
                },
                body: JSON.stringify({ session_id: sessionId }),
            });

            const data = await res.json();

            if (!res.ok || data.status === false) {
                throw new Error(data?.message || "Failed to fetch features");
            }

            // Try multiple response formats
            let rawFeatures = data?.features ||
                data?.data?.features ||
                data?.modules ||
                data?.data?.modules ||
                data?.sections ||
                data?.data ||
                [];

            // If it's an object, get its values
            if (rawFeatures && typeof rawFeatures === 'object' && !Array.isArray(rawFeatures)) {
                rawFeatures = Object.values(rawFeatures);
            }


            // Normalize features
            const options = rawFeatures.map((f, i) => {
                if (typeof f === 'string') {
                    return {
                        value: f,
                        label: f.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    };
                }
                if (typeof f === 'object') {
                    return {
                        value: f.value || f.id || f.name || f.key || `feature_${i}`,
                        label: f.label || f.title || f.name || f.display_name || `Feature ${i + 1}`
                    };
                }
                return null;
            }).filter(Boolean);


            setFeaturesOptions(options.length ? options : MODULES_OPTIONS);
        } catch (err) {
            console.error("Features fetch error:", err);
            setFeaturesError(err.message || "Failed to fetch features");
            // Use default options on error
            setFeaturesOptions(MODULES_OPTIONS);
        } finally {
            setFeaturesLoading(false);
        }
    };

    useEffect(() => {
        if (step === STEPS.FEATURES) {
            fetchFeatureOptions();
        }
    }, [step]);

    const handleFinishFeatures = async () => {
        if (!selectedFeatures.length || savingFeatures) return;

        try {
            setSavingFeatures(true);
            const token = Cookies.get("access_token");
            const sessionId = Cookies.get("session_id");
            const projectId = Cookies.get("project_id");

            if (!sessionId) throw new Error("Session expired");

            setLoadingStep("Saving your selections...");

            await fetch(`${BASE_URL}/recommendation/select_features`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, selected_features: selectedFeatures }),
            }).catch(() => { });

            setLoadingStep("Consolidating preferences...");

            await fetch(`${BASE_URL}/recommendation/save_metadata`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, project_id: projectId, selected_features: selectedFeatures }),
            });

            setLoadingStep("Designing your website structure...");

            const blueprintRes = await fetch(`${BASE_URL}/project/generate_blueprint`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, force_regenerate: false }),
            });
            const blueprintData = await blueprintRes.json();
            const blueprint = extractBlueprint(blueprintData);

            if (!blueprint) throw new Error("Blueprint generation failed");

            setLoadingStep("AI is writing your code...");

            const codeRes = await fetch(`${BASE_URL}/project/generate_code`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ session_id: sessionId, blueprint }),
            });
            const codeData = await codeRes.json();
            let html = extractGeneratedHtml(codeData);

            if (!html && codeData?.pages) {
                html = codeData.pages["index.html"] || Object.values(codeData.pages)[0];
            }

            if (html) {
                setLoadingStep("Preparing preview...");
                navigate("/project/preview", {
                    state: { session_id: sessionId, project_id: projectId, blueprint, html, pages: codeData.pages },
                });
                return;
            }

            throw new Error("Code generation failed");

        } catch (err) {
            showAlert(err.message || "Something went wrong", "error");
        } finally {
            setSavingFeatures(false);
            setLoadingStep("");
        }
    };

    const suggestions = ["Portfolio Website", "Restaurant Site", "SaaS Landing Page", "E-commerce Store"];

    return (
        <>
            <div className="min-h-screen theme-bg flex flex-col relative overflow-hidden">
                {/* Background */}
                <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
                <div className="orb orb-purple w-[500px] h-[500px] -top-60 -left-60" />
                <div className="orb orb-blue w-[400px] h-[400px] -bottom-40 -right-40" />
                <div className="orb orb-pink w-[300px] h-[300px] top-1/2 right-1/4 opacity-30" />

                <Header />

                {/* PROMPT STEP */}
                {step === STEPS.PROMPT && (
                    <>
                        <div className="absolute top-24 right-6 z-30">
                            <LanguageSelector theme={theme} value={language} onChange={setLanguage} />
                        </div>

                        <main className="flex-1 flex items-center justify-center px-6 relative z-10">
                            <div ref={cardRef} className="w-full max-w-2xl text-center">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                                    <HiSparkles className="text-purple-400" />
                                    <span className="text-sm text-gray-300">AI Website Builder</span>
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                    <span className="text-white">Describe Your</span>
                                    <br />
                                    <span className="text-gradient">Dream Website</span>
                                </h1>

                                <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto">
                                    Tell us what you want to build. Be as detailed as you like!
                                </p>

                                {/* Input */}
                                <div className="p-2 rounded-2xl glass-card mb-6">
                                    <div className="flex items-center gap-3">
                                        <input
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder='E.g., "A modern portfolio for a photographer"'
                                            className="flex-1 px-4 py-4 bg-transparent outline-none text-white placeholder-gray-500"
                                            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                                        />
                                        <button
                                            onClick={handleGenerate}
                                            disabled={loading || !prompt.trim()}
                                            className="px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 transition-all"
                                        >
                                            {loading ? (
                                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FiSend size={18} />
                                            )}
                                            <span className="hidden sm:block">{loading ? "Generating..." : "Generate"}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                <div className="flex flex-wrap justify-center gap-2">
                                    {suggestions.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setPrompt(s)}
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 hover:text-white transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </main>
                    </>
                )}

                {/* QUESTIONS STEP */}
                {step === STEPS.QUESTIONS && (
                    <GoalStepModal firstQuestion={firstQuestion} onComplete={() => setStep(STEPS.COLORS)} />
                )}

                {/* COLORS STEP */}
                {step === STEPS.COLORS && (
                    <div className="flex-1 flex items-center justify-center px-6 relative z-10">
                        <div ref={cardRef} className="w-full max-w-4xl p-10 rounded-3xl glass-card">
                            <StepIndicator currentStep={step} />

                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold mb-2">
                                    Choose Your <span className="text-gradient">Color Palette</span>
                                </h2>
                                <p className="text-gray-500">Select colors that match your brand</p>
                            </div>

                            <ColorSelection isDark={true} selected={selectedPalette} setSelected={setSelectedPalette} />

                            <div className="flex justify-end mt-10">
                                <button
                                    onClick={handleFinishPalette}
                                    disabled={selectedPalette === null}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-40 transition-all"
                                >
                                    Continue <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FEATURES STEP */}
                {step === STEPS.FEATURES && (
                    <div className="flex-1 flex items-center justify-center px-6 relative z-10">
                        <div ref={cardRef} className="w-full max-w-4xl p-10 rounded-3xl glass-card relative overflow-hidden">

                            {/* Loading Overlay */}
                            {savingFeatures && (
                                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl rounded-3xl">
                                    <div className="relative mb-8">
                                        <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <FiCpu className="text-white text-2xl" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Building Your Website</h3>
                                    <p className="text-purple-400 animate-pulse">{loadingStep || "Processing..."}</p>
                                    <div className="flex gap-2 mt-6">
                                        {[0, 1, 2].map(i => (
                                            <div key={i} className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <StepIndicator currentStep={step} />

                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold mb-2">
                                    Select Your <span className="text-gradient">Features</span>
                                </h2>
                                <p className="text-gray-500">Choose sections for your website</p>
                            </div>

                            {featuresLoading ? (
                                <div className="text-center py-16">
                                    <div className="w-10 h-10 mx-auto mb-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-500">Loading modules...</p>
                                </div>
                            ) : featuresError ? (
                                <div className="text-center py-12">
                                    <p className="text-red-400 mb-4">{featuresError}</p>
                                    <button onClick={fetchFeatureOptions} className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white">
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <FeaturesSelection isDark={true} selected={selectedFeatures} setSelected={setSelectedFeatures} options={featuresOptions} />
                            )}

                            <div className="flex justify-end mt-10">
                                <button
                                    onClick={handleFinishFeatures}
                                    disabled={!selectedFeatures.length || savingFeatures}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-40 transition-all"
                                >
                                    <HiSparkles />
                                    <span>{savingFeatures ? "Generating..." : "Generate Website"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AppAlert open={alert.open} message={alert.message} severity={alert.severity} title={alert.title} onClose={() => setAlert(p => ({ ...p, open: false }))} />
        </>
    );
};

export default ProjectWorkspace;
