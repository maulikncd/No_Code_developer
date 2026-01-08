import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../ThemeProvider.jsx';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Cookies from "js-cookie";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Icons
import {
  FiSun, FiMoon, FiMenu, FiX, FiArrowRight, FiCheck, FiZap,
  FiLayout, FiCode, FiGlobe, FiShield, FiCpu, FiPlay, FiStar,
  FiChevronDown, FiInstagram, FiTwitter, FiGithub, FiLinkedin,
  FiPlus, FiMinus, FiSearch, FiSmartphone, FiMonitor, FiCpu as FiAi
} from 'react-icons/fi';
import { HiSparkles } from "react-icons/hi2";
import { BsLightningChargeFill } from "react-icons/bs";

// Images (Using generated artifacts)
// Note: In a real app, these would be local assets. I'll use the paths provided by the tool.
const heroVisual = "/banner1.png";
const galleryVisual = "/gallery-visual.png";

// ============================================
// NAVBAR COMPONENT
// ============================================
const Navbar = () => {
  const { theme, setThemeMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const username = Cookies.get("username");
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
    );

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
        ? 'py-4 glass mx-6 mt-4 rounded-2xl border-white/10'
        : 'py-6 bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-purple-500/20">
            <BsLightningChargeFill className="text-white text-lg" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">INAI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          <a href="#features" className="text-gray-400 hover:text-white transition-all text-sm font-medium hover:scale-105">Features</a>
          <a href="#showcase" className="text-gray-400 hover:text-white transition-all text-sm font-medium hover:scale-105">Showcase</a>
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-all text-sm font-medium hover:scale-105">Process</a>
          <a href="#faq" className="text-gray-400 hover:text-white transition-all text-sm font-medium hover:scale-105">FAQ</a>
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-5">
          <button
            onClick={() => setThemeMode(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {username ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm hidden xl:block">Welcome back, <span className="text-white font-medium">{username}</span></span>
              <Link
                to="/dashboard"
                className="px-6 py-2.5 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/signin" className="px-5 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold hover:shadow-2xl hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-white"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 p-6 glass-card mx-4 mt-2 rounded-2xl animate-scale-in border-white/10 shadow-2xl">
          <div className="flex flex-col gap-6">
            <a href="#features" onClick={() => setMobileOpen(false)} className="text-gray-300 font-medium border-b border-white/5 pb-2">Features</a>
            <a href="#showcase" onClick={() => setMobileOpen(false)} className="text-gray-300 font-medium border-b border-white/5 pb-2">Showcase</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-gray-300 font-medium border-b border-white/5 pb-2">How It Works</a>
            <Link to="/signin" className="text-gray-300 font-medium border-b border-white/5 pb-2">Sign In</Link>
            <Link
              to="/signup"
              className="py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center font-bold shadow-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// ============================================
// HERO SECTION
// ============================================
const HeroSection = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(".hero-badge",
      { opacity: 0, y: 30, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
    )
      .fromTo(".hero-title",
        { opacity: 0, y: 50, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power4.out" },
        "-=0.6"
      )
      .fromTo(".hero-subtitle",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.7"
      )
      .fromTo(".hero-cta",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        "-=0.5"
      )
      .fromTo(".hero-visual",
        { opacity: 0, y: 100, rotateX: 20, scale: 0.9 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1.5, ease: "power4.out" },
        "-=0.8"
      );

    // Floating orbs
    gsap.to(".orb-1", { y: -100, x: 50, duration: 20, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-2", { y: 100, x: -50, duration: 15, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center pt-48 pb-32 overflow-hidden px-6">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="orb-1 absolute top-1/4 -left-64 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="orb-2 absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-10 group cursor-default">
          <HiSparkles className="text-yellow-400 group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-bold tracking-widest uppercase text-gray-300">The Next Generation of Web Design</span>
        </div>

        {/* Title */}
        <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
          Empower business growth <br />
          <span>with AI technologies</span> today.
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
          Build, launch, and scale your business with the most advanced AI-powered website builder.
          Turn your ideas into professional, high-converting websites in seconds.
        </p>

        {/* CTA */}
        <div className="hero-cta flex flex-col sm:flex-row gap-5 justify-center mb-24">
          <Link
            to="/signup"
            className="px-10 py-5 rounded-2xl bg-white text-black font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-white/10"
          >
            Get Started <FiArrowRight />
          </Link>
          <button className="px-10 py-5 rounded-2xl glass border-white/10 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
            <FiPlay className="text-purple-500 fill-purple-500" /> Watch Demo
          </button>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual relative max-w-6xl mx-auto perspective-card">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[32px] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative rounded-[30px] border border-white/10 overflow-hidden shadow-2xl bg-black">
            <img
              src={heroVisual}
              alt="AI Website Builder Interface"
              className="w-full h-auto object-cover opacity-90"
            />
          </div>

          {/* Floating Stats */}
          <div className="absolute -left-10 bottom-20 p-6 glass-card rounded-2xl hidden xl:block animate-float">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <FiZap className="text-green-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">100/100</p>
                <p className="text-gray-400 text-xs">PageSpeed Score</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 top-20 p-6 glass-card rounded-2xl hidden xl:block animate-float animation-delay-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <FiAi className="text-purple-400 text-xl" />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">AI Active</p>
                <p className="text-gray-400 text-xs">Generating layout...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// APP SHOWCASE SECTION
// ============================================
const ShowcaseSection = () => {
  return (
    <section id="showcase" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Imagine a vast collection of <br />
            <span className="text-gradient">business apps</span> at your disposal.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From e-commerce to SaaS, INAI provides the foundation for any type of business website you can dream of.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { name: "Portfolio", icon: FiLayout },
            { name: "E-commerce", icon: FiZap },
            { name: "SaaS", icon: FiCpu },
            { name: "Landing Page", icon: FiMonitor },
            { name: "Mobile App", icon: FiSmartphone },
            { name: "Blog", icon: FiCode }
          ].map((app, i) => (
            <div key={i} className="glass-card p-8 rounded-2xl text-center group hover:border-purple-500/50 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-white/5 mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <app.icon className="text-gray-400 group-hover:text-white text-xl" />
              </div>
              <p className="text-white font-semibold text-sm">{app.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// PROCESS SECTION (START WITH A PROMPT)
// ============================================
const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { title: "Start With A Prompt", desc: "Just tell us what you want to build. 'A sleek portfolio for a creative director' or 'A luxury cafe website'." },
    { title: "Website Details", desc: "Our AI asks a few smart questions to understand your brand's unique personality and goals." },
    { title: "Let AI Do The Work", desc: "Sit back as our engine generates content, images, and a stunning layout in seconds." },
    { title: "Fine-Tune Your Design", desc: "Easily adjust colors, typography, and spacing with our intuitive real-time editor." },
    { title: "Edit Section", desc: "Add or remove sections with a single click. Every piece is modular and responsive." },
    { title: "Build Design", desc: "Launch your masterpiece. Get clean code or host it directly with us for maximum performance." }
  ];

  return (
    <section id="how-it-works" className="py-32 bg-white/2 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          {/* Left Side: Steps */}
          <div className="flex-1 w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">How It Works</h2>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all border ${activeStep === i
                    ? 'glass border-purple-500/50 bg-purple-500/5'
                    : 'border-transparent hover:bg-white/5 grayscale opacity-50'}`}
                >
                  <div className="flex items-center gap-6">
                    <span className={`text-2xl font-black ${activeStep === i ? 'text-purple-500' : 'text-gray-600'}`}>0{i + 1}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                      {activeStep === i && <p className="text-gray-400 text-sm animate-fade-up">{step.desc}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Preview */}
          <div className="flex-1 relative">
            <div className="relative rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <img
                src={heroVisual} // Using same visual for simplicity, can use another one
                alt="Process Preview"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-bottom p-10">
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="p-4 rounded-xl glass border-white/10">
                    <p className="text-purple-400 font-mono text-sm mb-2">// AI Thinking...</p>
                    <p className="text-white font-medium">Generating {steps[activeStep].title.toLowerCase()} module</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// GALLERY SECTION
// ============================================
const GallerySection = () => {
  const images = ["/t1.png", "/t2.png", "/t3.png", "/t4.png", "/t5.png", "/t6.png", "/t7.png"];
  const scrollRef = useRef(null);
  const scrollRef2 = useRef(null);

  useEffect(() => {
    // Row 1 scroll
    const row1 = scrollRef.current;
    const totalWidth = row1.scrollWidth;

    const animation1 = gsap.to(row1, {
      x: -(totalWidth / 2),
      duration: 30,
      ease: "none",
      repeat: -1
    });

    // Row 2 scroll (opposite direction)
    const row2 = scrollRef2.current;
    const totalWidth2 = row2.scrollWidth;

    const animation2 = gsap.fromTo(row2,
      { x: -(totalWidth2 / 2) },
      {
        x: 0,
        duration: 35,
        ease: "none",
        repeat: -1
      }
    );

    // Hover pause logic
    const handleMouseEnter = () => {
      animation1.pause();
      animation2.pause();
    };
    const handleMouseLeave = () => {
      animation1.play();
      animation2.play();
    };

    const galleryElement = document.getElementById("gallery-marquee");
    if (galleryElement) {
      galleryElement.addEventListener("mouseenter", handleMouseEnter);
      galleryElement.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (galleryElement) {
        galleryElement.removeEventListener("mouseenter", handleMouseEnter);
        galleryElement.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <section id="showcase" className="py-32 bg-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <h2 className="text-5xl font-black text-white mb-6">500k+ Websites built with INAI</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Join the community of creators who have launched stunning, AI-powered websites globally.</p>
      </div>

      <div id="gallery-marquee" className="flex flex-col gap-8 relative cursor-pointer">
        {/* Fades */}
        <div className="absolute inset-y-0 left-0 w-60 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-60 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Row 1 */}
        <div className="flex whitespace-nowrap" ref={scrollRef}>
          {[...images, ...images].map((img, i) => (
            <div key={i} className="inline-block px-4">
              <div className="w-[400px] h-[250px] rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors shadow-2xl">
                <img src={img} alt={`Showcase ${i}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex whitespace-nowrap" ref={scrollRef2}>
          {[...images, ...images].map((img, i) => (
            <div key={i} className="inline-block px-4">
              <div className="w-[400px] h-[250px] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-colors shadow-2xl">
                <img src={img} alt={`Showcase ${i}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FEATURES GRID SECTION
// ============================================
const FeaturesGrid = () => {
  const features = [
    { title: "Prompt-Based Generation", desc: "Create complete pages using just a text description.", icon: FiZap },
    { title: "Style Guide Integration", desc: "Maintain perfect brand consistency with global styles.", icon: FiStar },
    { title: "Real-Time Code Output", desc: "Watch clean, production-ready code generate instantly.", icon: FiCode },
    { title: "Responsive Design", desc: "Your site looks perfect on every device, automatically.", icon: FiSmartphone },
    { title: "Section Regeneration", desc: "Not happy with a part? Regenerate specific sections only.", icon: FiLayout },
    { title: "AI Assistant", desc: "A smart collaborator always ready to help with edits.", icon: FiAi },
    { title: "Interactivity", desc: "Add complex animations and hover effects without code.", icon: FiCpu },
    { title: "Visual Editor", desc: "Fine-tune every pixel with a professional-grade editor.", icon: FiMonitor },
    { title: "One-Click Publishing", desc: "Go live on our secure, global CDN in under a second.", icon: FiGlobe }
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Everything You Need to Create a Website <br />
            With AI, From Start to Finish
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-card p-10 rounded-[2rem] border-white/5 hover:border-purple-500/30 transition-all card-hover">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-purple-400 text-2xl mb-8">
                <f.icon />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FAQ SECTION
// ============================================
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    { q: "Is my data safe with INAI?", a: "Absolutely. We use enterprise-grade encryption and follow strict GDPR compliance to ensure your data and website remains yours and secure." },
    { q: "What tech stack does INAI use?", a: "Our AI generates clean, high-performance React and Tailwind CSS code that follows industry best practices for accessibility and SEO." },
    { q: "Can I customize the personality of my AI companion?", a: "Yes! You can set the tone and style of the AI assistant to match your brand voice, whether it's professional, friendly, or creative." },
    { q: "Does INAI offer a free plan?", a: "Yes, we have a generous free-forever plan that allows you to build and preview websites. You only pay when you're ready to publish with a custom domain." },
    { q: "What are the benefits of the premium plan?", a: "Premium users get access to custom domains, advanced SEO tools, priority AI generation, and the ability to export clean code for external hosting." }
  ];

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Frequently asked questions</h2>
          <p className="text-gray-400">Everything you need to know about our AI services</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-2xl border-white/5 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-8 py-6 text-left flex items-center justify-between group"
              >
                <span className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{faq.q}</span>
                {openIndex === i ? <FiMinus className="text-purple-500" /> : <FiPlus className="text-gray-500" />}
              </button>
              {openIndex === i && (
                <div className="px-8 pb-8 animate-fade-up">
                  <p className="text-gray-400 leading-relaxed font-medium">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// FOOTER
// ============================================
const Footer = () => {
  return (
    <footer className="py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <BsLightningChargeFill className="text-white text-xl" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">INAI</span>
          </div>

          <div className="flex items-center gap-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors font-medium">Docs</a>
            <div className="flex items-center gap-4 ml-8">
              {[FiTwitter, FiGithub, FiInstagram, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl glass border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-gray-500">
          <p>© 2026 INAI Labs Inc. Built with intelligence.</p>
          <div className="flex gap-10 mt-4 md:mt-0">
            <span>Status: Online</span>
            <span>v2.4.0-stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// MAIN HOME COMPONENT
// ============================================
function Home() {
  const { theme } = useContext(ThemeContext);
  const pageRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    );
  }, []);

  return (
    <div
      ref={pageRef}
      className={`min-h-screen ${theme === 'dark' ? 'bg-[#050508]' : 'bg-slate-50'} relative overflow-x-hidden transition-colors duration-500`}
    >
      <Navbar />
      <HeroSection />
      <ShowcaseSection />
      <ProcessSection />
      <GallerySection />
      <FeaturesGrid />
      <FAQSection />

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[3rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative glass-card p-20 rounded-[3rem] text-center border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />

            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 relative z-10">Start building your <br /> future today.</h2>
            <p className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto relative z-10 font-medium">Join over 500,000 creators and businesses who rely on INAI to power their digital presence.</p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
              <Link to="/signup" className="px-12 py-5 rounded-2xl bg-white text-black font-black text-lg hover:scale-105 transition-all">Get Started Free</Link>
              <Link to="/signin" className="px-12 py-5 rounded-2xl glass border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all">Sign In</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;