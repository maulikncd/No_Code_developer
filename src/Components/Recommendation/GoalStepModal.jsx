import React, { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../../ThemeProvider.jsx";
import Header from "./Header.jsx";
import Cookies from "js-cookie";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { gsap } from "gsap";

const SINGLE_OPTION_TYPES = ["radio", "select", "dropdown", "optional", "required", "single"];

const resolveQuestionType = (q) => {
    if (!q) return null;
    let type = q.type?.toLowerCase();

    // Normalize backend types
    if (type === "required" || type === "single") type = "radio";
    if (type === "multiple" || type === "multi") type = "checkbox";

    if (type) return type;

    // Infer from options
    const opts = q.options || q.optional?.options || q.answers || q.choices || [];
    if (Array.isArray(opts) && opts.length > 0) {
        return "radio"; // Default to radio if options exist
    }

    return "text"; // No options = text input
};

const GoalStepModal = ({ firstQuestion, onComplete, totalQuestions = 10 }) => {
    const { theme } = useContext(ThemeContext);
    const [sessionId] = useState(() => Cookies.get("session_id"));

    const [question, setQuestion] = useState(firstQuestion);
    const [selected, setSelected] = useState(null);
    const [multiSelected, setMultiSelected] = useState([]);
    const [textAnswer, setTextAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);

    const questionCardRef = useRef(null);
    const optionsRef = useRef([]);

    // Animation on question change
    useEffect(() => {
        if (!questionCardRef.current) return;
        gsap.fromTo(questionCardRef.current,
            { opacity: 0, y: 30, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
        );
    }, [question]);

    if (!question) return null;

    // Get options from various possible locations
    const optionList = question?.options ||
        question?.optional?.options ||
        question?.answers ||
        question?.choices ||
        [];

    const hasOptions = Array.isArray(optionList) && optionList.length > 0;
    const questionType = resolveQuestionType(question);

    // Determine if this is a multi-select question (checkbox style UI shown in screenshot)
    const isMultiSelect = questionType === "checkbox" ||
        question?.type?.toLowerCase() === "multiple" ||
        question?.multiple === true;

    // Handle single option selection
    const handleSingleSelect = (value) => {
        console.log("Single Select:", value);
        setSelected(value);
    };

    // Handle multi-option toggle
    const handleMultiToggle = (value) => {
        console.log("Multi Toggle:", value);
        setMultiSelected((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };

    const handleContinue = async () => {
        if (!sessionId) return;

        let answer = null;
        if (isMultiSelect) {
            answer = multiSelected.join(", ");
        } else if (["text", "textarea", "number", "date"].includes(questionType) || !hasOptions) {
            answer = textAnswer.trim();
        } else {
            answer = selected;
        }

        if (!answer) return;
        setLoading(true);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/recommendation/next-question`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Cookies.get("access_token")}`,
                    },
                    body: JSON.stringify({ session_id: sessionId, question_id: question.id, answer }),
                }
            );

            const data = await res.json();

            gsap.to(questionCardRef.current, {
                opacity: 0,
                x: -30,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    if (data?.next_question?.id) {
                        setQuestion(data.next_question);
                        setSelected(null);
                        setMultiSelected([]);
                        setTextAnswer("");
                        setCurrentQuestionIndex(prev => prev + 1);
                        gsap.set(questionCardRef.current, { x: 30 });
                    } else if (data?.completed) {
                        onComplete();
                    }
                }
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Check if answer is valid
    const isValidAnswer = isMultiSelect
        ? multiSelected.length > 0
        : hasOptions
            ? selected !== null
            : textAnswer.trim().length > 0;

    const progress = Math.round((currentQuestionIndex / totalQuestions) * 100);

    return (
        <div className="fixed inset-0 z-50 flex flex-col theme-bg overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
            <div className="orb orb-purple w-[500px] h-[500px] -top-60 -left-60" />
            <div className="orb orb-blue w-[400px] h-[400px] -bottom-40 -right-40" />

            <Header />

            <div className="flex-1 flex items-center justify-center px-6 relative z-10">
                <div
                    ref={questionCardRef}
                    className="w-full max-w-3xl p-10 rounded-3xl glass-card"
                >
                    {/* Progress */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span>Question</span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold">
                                    {currentQuestionIndex} of {totalQuestions}
                                </span>
                            </div>
                            <span className="text-gray-500 text-sm">{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Question */}
                    <h2 className="text-2xl font-bold text-white mb-10 text-center">
                        {question.question}
                    </h2>

                    {/* Multi-Select Options (Checkbox Style) */}
                    {hasOptions && isMultiSelect && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                            {optionList.map((opt, i) => {
                                const value = typeof opt === 'string' ? opt : (opt.value || opt.label || opt);
                                const label = typeof opt === 'string' ? opt : (opt.label || opt.value || opt);
                                const checked = multiSelected.includes(value);
                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleMultiToggle(value)}
                                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${checked
                                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                                            : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-purple-500 border-purple-500' : 'border-white/30'
                                            }`}>
                                            {checked && <FiCheck size={12} className="text-white" />}
                                        </div>
                                        <span className="font-medium">{label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Single Select Options (Radio Style) */}
                    {hasOptions && !isMultiSelect && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            {optionList.map((opt, i) => {
                                const value = typeof opt === 'string' ? opt : (opt.value || opt.label || opt);
                                const label = typeof opt === 'string' ? opt : (opt.label || opt.value || opt);
                                const isSelected = selected === value;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleSingleSelect(value)}
                                        className={`p-5 rounded-2xl cursor-pointer border text-center transition-all ${isSelected
                                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50 text-white'
                                            : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="font-medium">{label}</span>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center mx-auto mt-3">
                                                <FiCheck size={12} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Text Input (when no options) */}
                    {!hasOptions && (
                        <div className="mb-10">
                            <input
                                type="text"
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                className="input-dark w-full"
                                placeholder="Type your answer..."
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Continue Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleContinue}
                            disabled={!isValidAnswer || loading}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Continue</span>
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalStepModal;