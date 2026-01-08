import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Recommendation/Header.jsx";
import SubDomainModal from "../Domain/SubDomainModal";
import { FiCheck, FiAlertTriangle, FiExternalLink, FiArrowRight } from "react-icons/fi";
import { gsap } from "gsap";

const CustomDomain = () => {
    const navigate = useNavigate();
    const [showSubDomainModal, setShowSubDomainModal] = useState(false);
    const stepsRef = useRef([]);

    useEffect(() => {
        gsap.fromTo(stepsRef.current.filter(Boolean),
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power3.out", delay: 0.2 }
        );
    }, []);

    const steps = [
        {
            number: "01",
            title: "Buy a Domain",
            items: [
                "Click Buy Domain on our website",
                "You will be redirected to Hostinger",
                "Search for your domain name (e.g. mybrand.com)",
                "Complete the payment on Hostinger"
            ],
            note: "Domain payment is made directly to Hostinger"
        },
        {
            number: "02",
            title: "Come Back To Our Website",
            items: [
                "Visit the editor on our website",
                "Enter the domain name you purchased",
                "Click Connect Domain"
            ]
        },
        {
            number: "03",
            title: "Update Nameservers in Hostinger",
            items: [
                "Login to your Hostinger account",
                "Go to Domains → Click on your domain",
                "Open DNS/Nameservers section",
                "Select Use Custom Nameservers",
                "Paste: ns1.dns-parking.com & ns2.dns-parking.com",
                "Click Save"
            ]
        }
    ];

    return (
        <>
            <div className="fixed inset-0 flex flex-col theme-bg">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-grid pointer-events-none opacity-30" />
                <div className="absolute -top-60 -left-60 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px] pointer-events-none" />

                <Header />

                <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                    <div className="max-w-3xl mx-auto relative z-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Domain</span> Setup
                            </h1>
                            <p className="text-gray-500 text-sm">Follow these steps to connect your domain</p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-4">
                            {steps.map((step, idx) => (
                                <div
                                    key={idx}
                                    ref={el => stepsRef.current[idx] = el}
                                    className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {step.number}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                                            <ul className="space-y-2">
                                                {step.items.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-gray-400 text-sm">
                                                        <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" size={14} />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {step.note && (
                                                <p className="mt-3 text-xs text-yellow-400/80 flex items-center gap-2">
                                                    <span>👉</span> {step.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Important Notes */}
                        <div className="mt-6 p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                                    <FiAlertTriangle className="text-white" size={14} />
                                </div>
                                <h3 className="text-white font-semibold">Important Notes</h3>
                            </div>
                            <ul className="space-y-1 text-gray-400 text-sm pl-11">
                                <li>• Renew your domain every year</li>
                                <li>• Expired domains will stop your website</li>
                                <li>• Don't change nameservers unless instructed</li>
                                <li>• SSL and DNS are handled automatically</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 mt-8 pb-6">
                            <a
                                href="https://www.hostinger.com"
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-all"
                            >
                                Visit Hostinger
                                <FiExternalLink size={12} />
                            </a>
                            <button
                                onClick={() => setShowSubDomainModal(true)}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                            >
                                Continue
                                <FiArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showSubDomainModal && (
                <SubDomainModal
                    onClose={() => setShowSubDomainModal(false)}
                    onNext={() => setShowSubDomainModal(false)}
                />
            )}
        </>
    );
};

export default CustomDomain;