import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable GSAP Animation Utilities
 * Use these for consistent animations across the app
 */

// ============================================
// PAGE ENTRANCE ANIMATIONS
// ============================================

/**
 * Fade in element with optional slide
 * @param {string|HTMLElement} target - Element or selector
 * @param {object} options - Animation options
 */
export const fadeIn = (target, options = {}) => {
    const defaults = {
        duration: 0.8,
        ease: "power3.out",
        y: 0,
        x: 0,
        delay: 0,
    };

    const settings = { ...defaults, ...options };

    return gsap.fromTo(
        target,
        {
            opacity: 0,
            y: settings.y,
            x: settings.x,
        },
        {
            opacity: 1,
            y: 0,
            x: 0,
            duration: settings.duration,
            ease: settings.ease,
            delay: settings.delay,
        }
    );
};

/**
 * Slide in from direction
 * @param {string|HTMLElement} target
 * @param {string} direction - 'left', 'right', 'up', 'down'
 * @param {object} options
 */
export const slideIn = (target, direction = "up", options = {}) => {
    const defaults = {
        duration: 0.8,
        ease: "power3.out",
        distance: 50,
        delay: 0,
    };

    const settings = { ...defaults, ...options };

    const directions = {
        up: { y: settings.distance, x: 0 },
        down: { y: -settings.distance, x: 0 },
        left: { x: settings.distance, y: 0 },
        right: { x: -settings.distance, y: 0 },
    };

    return gsap.fromTo(
        target,
        {
            opacity: 0,
            ...directions[direction],
        },
        {
            opacity: 1,
            y: 0,
            x: 0,
            duration: settings.duration,
            ease: settings.ease,
            delay: settings.delay,
        }
    );
};

/**
 * Scale in animation with bounce
 * 
 * @param {string|HTMLElement} target
 * @param {object} options
 */
export const scaleIn = (target, options = {}) => {
    const defaults = {
        duration: 0.6,
        ease: "back.out(1.7)",
        from: 0.8,
        delay: 0,
    };

    const settings = { ...defaults, ...options };

    return gsap.fromTo(
        target,
        {
            opacity: 0,
            scale: settings.from,
        },
        {
            opacity: 1,
            scale: 1,
            duration: settings.duration,
            ease: settings.ease,
            delay: settings.delay,
        }
    );
};

// ============================================
// STAGGER ANIMATIONS
// ============================================

/**
 * Stagger animation for multiple elements
 * @param {string|HTMLElement[]} targets
 * @param {object} options
 */
export const staggerFadeIn = (targets, options = {}) => {
    const defaults = {
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        y: 30,
        delay: 0,
    };

    const settings = { ...defaults, ...options };

    return gsap.fromTo(
        targets,
        {
            opacity: 0,
            y: settings.y,
        },
        {
            opacity: 1,
            y: 0,
            duration: settings.duration,
            stagger: settings.stagger,
            ease: settings.ease,
            delay: settings.delay,
        }
    );
};

/**
 * Stagger with scale animation
 * @param {string|HTMLElement[]} targets
 * @param {object} options
 */
export const staggerScaleIn = (targets, options = {}) => {
    const defaults = {
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.4)",
        from: 0.8,
        delay: 0,
    };

    const settings = { ...defaults, ...options };

    return gsap.fromTo(
        targets,
        {
            opacity: 0,
            scale: settings.from,
            y: 30,
        },
        {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: settings.duration,
            stagger: settings.stagger,
            ease: settings.ease,
            delay: settings.delay,
        }
    );
};

// ============================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================

/**
 * Scroll-triggered fade in
 * @param {string|HTMLElement} target
 * @param {object} options
 */
export const scrollFadeIn = (target, options = {}) => {
    const defaults = {
        duration: 1,
        y: 50,
        start: "top 80%",
        end: "top 50%",
        scrub: false,
        toggleActions: "play none none reverse",
    };

    const settings = { ...defaults, ...options };

    return gsap.fromTo(
        target,
        {
            opacity: 0,
            y: settings.y,
        },
        {
            opacity: 1,
            y: 0,
            duration: settings.duration,
            scrollTrigger: {
                trigger: target,
                start: settings.start,
                end: settings.end,
                scrub: settings.scrub,
                toggleActions: settings.toggleActions,
            },
        }
    );
};

/**
 * Parallax scroll effect
 * @param {string|HTMLElement} target
 * @param {object} options
 */
export const parallaxScroll = (target, options = {}) => {
    const defaults = {
        y: -50,
        ease: "none",
        scrub: 1,
    };

    const settings = { ...defaults, ...options };

    return gsap.to(target, {
        y: settings.y,
        ease: settings.ease,
        scrollTrigger: {
            trigger: target,
            start: "top bottom",
            end: "bottom top",
            scrub: settings.scrub,
        },
    });
};

// ============================================
// HOVER EFFECTS
// ============================================

/**
 * Magnetic hover effect
 * @param {HTMLElement} element
 * @param {object} options
 */
export const magneticHover = (element, options = {}) => {
    const defaults = {
        strength: 0.3,
        duration: 0.3,
        ease: "power2.out",
    };

    const settings = { ...defaults, ...options };

    const handleMouseMove = (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
            x: x * settings.strength,
            y: y * settings.strength,
            duration: settings.duration,
            ease: settings.ease,
        });
    };

    const handleMouseLeave = () => {
        gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
        });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    // Return cleanup function
    return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
    };
};

/**
 * 3D tilt effect on hover
 * @param {HTMLElement} element
 * @param {object} options
 */
export const tiltEffect = (element, options = {}) => {
    const defaults = {
        max: 10,
        speed: 400,
        perspective: 1000,
    };

    const settings = { ...defaults, ...options };

    const handleMouseMove = (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -settings.max;
        const rotateY = ((x - centerX) / centerX) * settings.max;

        gsap.to(element, {
            rotateX,
            rotateY,
            duration: settings.speed / 1000,
            ease: "power2.out",
            transformPerspective: settings.perspective,
        });
    };

    const handleMouseLeave = () => {
        gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power2.out",
        });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
    };
};

// ============================================
// COUNTER ANIMATIONS
// ============================================

/**
 * Animate number counting
 * @param {HTMLElement} element
 * @param {number} target
 * @param {object} options
 */
export const animateCounter = (element, target, options = {}) => {
    const defaults = {
        duration: 2,
        ease: "power2.out",
        from: 0,
    };

    const settings = { ...defaults, ...options };

    const obj = { val: settings.from };

    return gsap.to(obj, {
        val: target,
        duration: settings.duration,
        ease: settings.ease,
        onUpdate: () => {
            element.textContent = Math.ceil(obj.val);
        },
    });
};

// ============================================
// CONTINUOUS ANIMATIONS
// ============================================

/**
 * Infinite floating animation
 * @param {string|HTMLElement} target
 * @param {object} options
 */
export const floatAnimation = (target, options = {}) => {
    const defaults = {
        y: 20,
        duration: 3,
        ease: "sine.inOut",
    };

    const settings = { ...defaults, ...options };

    return gsap.to(target, {
        y: `+=${settings.y}`,
        duration: settings.duration,
        repeat: -1,
        yoyo: true,
        ease: settings.ease,
    });
};

/**
 * Continuous rotation
 * @param {string|HTMLElement} target
 * @param {object} options
 */
export const rotateAnimation = (target, options = {}) => {
    const defaults = {
        duration: 10,
        ease: "none",
        clockwise: true,
    };

    const settings = { ...defaults, ...options };

    return gsap.to(target, {
        rotation: settings.clockwise ? 360 : -360,
        duration: settings.duration,
        repeat: -1,
        ease: settings.ease,
    });
};

// ============================================
// TIMELINE HELPERS
// ============================================

/**
 * Create entrance timeline for a section
 * @param {string} selector - Selector for container
 * @returns {gsap.core.Timeline}
 */
export const createEntranceTimeline = (selector) => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
        `${selector} .animate-title`,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8 }
    )
        .fromTo(
            `${selector} .animate-subtitle`,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.4"
        )
        .fromTo(
            `${selector} .animate-cards`,
            { opacity: 0, y: 40, scale: 0.9 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.2)",
            },
            "-=0.3"
        );

    return tl;
};

export default {
    fadeIn,
    slideIn,
    scaleIn,
    staggerFadeIn,
    staggerScaleIn,
    scrollFadeIn,
    parallaxScroll,
    magneticHover,
    tiltEffect,
    animateCounter,
    floatAnimation,
    rotateAnimation,
    createEntranceTimeline,
};
