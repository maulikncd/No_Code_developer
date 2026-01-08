import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { FiHome, FiArrowLeft, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { BsLightningChargeFill } from 'react-icons/bs';
import { HiSparkles } from 'react-icons/hi2';

const NotFound = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const numberRef = useRef(null);
    const textRef = useRef(null);
    const buttonsRef = useRef(null);
    const orb1Ref = useRef(null);
    const orb2Ref = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Timeline for main animation
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Animate 404 number with glitch effect
            tl.fromTo(numberRef.current,
                { opacity: 0, scale: 0.5, rotateX: -90 },
                { opacity: 1, scale: 1, rotateX: 0, duration: 1, ease: "elastic.out(1, 0.5)" }
            );

            // Animate text elements
            tl.fromTo(textRef.current?.children || [],
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
                "-=0.5"
            );

            // Animate buttons
            tl.fromTo(buttonsRef.current?.children || [],
                { opacity: 0, y: 20, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
                "-=0.3"
            );

            // Floating animation for orbs
            gsap.to(orb1Ref.current, {
                y: -30,
                x: 20,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            gsap.to(orb2Ref.current, {
                y: 20,
                x: -30,
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Continuous subtle pulse on 404
            gsap.to(numberRef.current, {
                textShadow: "0 0 60px rgba(168, 85, 247, 0.8), 0 0 120px rgba(59, 130, 246, 0.6)",
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Glitch effect on hover
            const number = numberRef.current;
            if (number) {
                number.addEventListener('mouseenter', () => {
                    gsap.timeline()
                        .to(number, { x: -5, duration: 0.05 })
                        .to(number, { x: 5, duration: 0.05 })
                        .to(number, { x: -3, duration: 0.05 })
                        .to(number, { x: 3, duration: 0.05 })
                        .to(number, { x: 0, duration: 0.05 });
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-[#050510] flex flex-col items-center justify-center relative overflow-hidden px-6"
        >
            {/* Background Grid */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

            {/* Animated Orbs */}
            <div
                ref={orb1Ref}
                className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[120px] pointer-events-none"
            />
            <div
                ref={orb2Ref}
                className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-blue-500/30 rounded-full blur-[100px] pointer-events-none"
            />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center max-w-2xl mx-auto">

                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <BsLightningChargeFill className="text-white text-xl" />
                    </div>
                    <span className="text-2xl font-bold text-white">INAI</span>
                </div>

                {/* 404 Number */}
                <div
                    ref={numberRef}
                    className="relative cursor-pointer select-none"
                >
                    <h1 className="text-[180px] md:text-[220px] font-black leading-none bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
                        404
                    </h1>

                    {/* Decorative elements around 404 */}
                    <div className="absolute -top-4 -right-4">
                        <HiSparkles className="text-yellow-400 text-3xl animate-pulse" />
                    </div>
                    <div className="absolute -bottom-2 -left-6">
                        <FiAlertCircle className="text-purple-400 text-2xl animate-bounce" />
                    </div>
                </div>

                {/* Text Content */}
                <div ref={textRef} className="mt-6 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                        The page you're looking for seems to have wandered off into the digital void.
                        Let's get you back on track!
                    </p>
                </div>

                {/* Action Buttons */}
                <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>

                    <button
                        onClick={() => navigate('/home')}
                        className="group flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
                    >
                        <FiHome />
                        Back to Home
                        <HiSparkles className="text-yellow-300 group-hover:rotate-12 transition-transform" />
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300"
                    >
                        <FiSearch />
                        Dashboard
                    </button>
                </div>

                {/* Fun message */}
                <div className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm max-w-md mx-auto">
                    <p className="text-gray-500 text-sm">
                        <span className="text-purple-400 font-semibold">Pro tip:</span> If you think this is a mistake,
                        try refreshing the page or check the URL for typos.
                    </p>
                </div>

                {/* Error code detail */}
                <p className="mt-8 text-gray-600 text-xs font-mono">
                    Error Code: 404 | Page Not Found | {new Date().toISOString()}
                </p>
            </div>

            {/* Bottom gradient decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
        </div>
    );
};

export default NotFound;
