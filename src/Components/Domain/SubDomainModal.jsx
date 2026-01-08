import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DNSWaitModal from "./DNSWaitModal";
import { FiGlobe, FiServer, FiArrowLeft, FiCheck, FiCopy } from "react-icons/fi";
import { gsap } from "gsap";

const SubDomainModal = ({ onClose, onNext }) => {
    const navigate = useNavigate();
    const [subdomain, setSubdomain] = useState("");
    const [ns1, setNs1] = useState("");
    const [ns2, setNs2] = useState("");
    const [showDNSWait, setShowDNSWait] = useState(false);
    const [copied, setCopied] = useState(null);

    const modalRef = useRef(null);
    const backdropRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo(modalRef.current,
            { opacity: 0, scale: 0.9, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" }
        );
    }, []);

    const handleClose = () => {
        gsap.to(modalRef.current, { opacity: 0, scale: 0.9, duration: 0.2 });
        gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const nameservers = [
        { label: "NS1", value: "ns1.dns-parking.com" },
        { label: "NS2", value: "ns2.dns-parking.com" }
    ];

    return (
        <>
            <div ref={backdropRef} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                <div className="absolute inset-0" onClick={handleClose} />

                <div ref={modalRef} className="relative z-10 w-full max-w-lg p-8 rounded-3xl glass-card">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                        <FiGlobe className="text-white text-xl" />
                    </div>

                    <h2 className="text-2xl font-bold text-white text-center mb-2">Configure Domain</h2>
                    <p className="text-gray-500 text-center text-sm mb-8">Enter your domain and nameserver details</p>

                    {/* Form */}
                    <div className="space-y-5">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Domain Name</label>
                            <input
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.target.value)}
                                placeholder="e.g. mysite.com"
                                className="input-dark w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Nameserver 1</label>
                            <input
                                value={ns1}
                                onChange={(e) => setNs1(e.target.value)}
                                placeholder="Enter nameserver 1"
                                className="input-dark w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Nameserver 2</label>
                            <input
                                value={ns2}
                                onChange={(e) => setNs2(e.target.value)}
                                placeholder="Enter nameserver 2"
                                className="input-dark w-full"
                            />
                        </div>
                    </div>

                    {/* Quick Copy */}
                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-gray-500 text-xs mb-3">Our Nameservers (Click to copy):</p>
                        <div className="space-y-2">
                            {nameservers.map((ns) => (
                                <div
                                    key={ns.label}
                                    onClick={() => copyToClipboard(ns.value, ns.label)}
                                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiServer className="text-purple-400" size={14} />
                                        <span className="text-white text-sm font-mono">{ns.value}</span>
                                    </div>
                                    {copied === ns.label ? (
                                        <FiCheck className="text-green-400" size={14} />
                                    ) : (
                                        <FiCopy className="text-gray-500" size={14} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={handleClose}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-all"
                        >
                            <FiArrowLeft size={16} />
                            Back
                        </button>

                        <button
                            onClick={() => setShowDNSWait(true)}
                            disabled={!subdomain.trim()}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-40"
                        >
                            Configure DNS
                        </button>
                    </div>
                </div>
            </div>

            {showDNSWait && (
                <DNSWaitModal onClose={() => setShowDNSWait(false)} />
            )}
        </>
    );
};

export default SubDomainModal;