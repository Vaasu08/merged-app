import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Testimonial {
    name: string;
    role: string;
    company: string;
    image: string;
    quote: string;
    rating: number;
}

export default function AnimatedTestimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials: Testimonial[] = [
        {
            name: "Ruchi Bhat",
            role: "Data Scientist",
            company: "TechFlow",
            image: "",
            quote: "This starter template saved me weeks of setup time. The Supabase integration is flawless, and the UI components are beautiful and easy to customize. Worth every penny!",
            rating: 5
        },
        {
            name: "Yatin Kumar",
            role: "Full Stack Developer",
            company: "Innovation Labs",
            image: "",
            quote: "The skill gap analysis feature is incredible. It showed me exactly what I needed to learn to transition into product management. Already enrolled in 3 courses!",
            rating: 4
        },
        {
            name: "Kim Kardashian",
            role: "Software Engineer",
            company: "Google",
            image: "",
            quote: "HORIZON's interview simulator helped me land my dream job at Google! The AI feedback was so detailed and helpful. Can't recommend it enough!",
            rating: 5
        },
        {
            name: "Emma Watson",
            role: "Career Coach",
            company: "Future Path",
            image: "",
            quote: "The career roadmap feature is a game-changer. I can see exactly where I'll be in 5 years and what steps to take. Finally, clarity in my career journey!",
            rating: 4
        },
        {
            name: "Khushi Sharma",
            role: "Marketing Specialist",
            company: "Brand Studio",
            image: "",
            quote: "Love how HORIZON connects skills to real job opportunities. Found 3 perfect matches I never would have considered. The AI really understands the market!",
            rating: 5
        },
        {
            name: "Lisa Zhang",
            role: "Business Analyst",
            company: "Analytics Pro",
            image: "",
            quote: "The community insights are amazing. Seeing what skills are trending and what companies are hiring for helps me stay ahead of the curve.",
            rating: 3
        }
    ];

    // Autoplay functionality
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const currentTestimonial = testimonials[currentIndex];

    return (
        <div className="relative bg-black py-16 sm:py-20 lg:py-24 overflow-hidden">
            {/* Animated Wave Background */}
            <div className="absolute inset-0 overflow-hidden">
                <svg
                    className="absolute w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                >
                    <defs>
                        <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3">
                                <animate attributeName="stop-color" values="#06b6d4; #8b5cf6; #ec4899; #06b6d4" dur="8s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3">
                                <animate attributeName="stop-color" values="#8b5cf6; #ec4899; #06b6d4; #8b5cf6" dur="8s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3">
                                <animate attributeName="stop-color" values="#ec4899; #06b6d4; #8b5cf6; #ec4899" dur="8s" repeatCount="indefinite" />
                            </stop>
                        </linearGradient>
                        <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.2">
                                <animate attributeName="stop-color" values="#ec4899; #06b6d4; #8b5cf6; #ec4899" dur="10s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2">
                                <animate attributeName="stop-color" values="#06b6d4; #8b5cf6; #ec4899; #06b6d4" dur="10s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2">
                                <animate attributeName="stop-color" values="#8b5cf6; #ec4899; #06b6d4; #8b5cf6" dur="10s" repeatCount="indefinite" />
                            </stop>
                        </linearGradient>
                        <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25">
                                <animate attributeName="stop-color" values="#8b5cf6; #ec4899; #06b6d4; #8b5cf6" dur="12s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.25">
                                <animate attributeName="stop-color" values="#ec4899; #06b6d4; #8b5cf6; #ec4899" dur="12s" repeatCount="indefinite" />
                            </stop>
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25">
                                <animate attributeName="stop-color" values="#06b6d4; #8b5cf6; #ec4899; #06b6d4" dur="12s" repeatCount="indefinite" />
                            </stop>
                        </linearGradient>
                    </defs>

                    {/* Wave 1 - Bottom */}
                    <path
                        fill="url(#wave-gradient-1)"
                        d="M0,160 C320,300,420,300,740,160 C1060,20,1120,20,1440,160 L1440,320 L0,320 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="20s"
                            repeatCount="indefinite"
                            values="
                M0,160 C320,300,420,300,740,160 C1060,20,1120,20,1440,160 L1440,320 L0,320 Z;
                M0,140 C320,10,420,10,740,140 C1060,270,1120,270,1440,140 L1440,320 L0,320 Z;
                M0,160 C320,300,420,300,740,160 C1060,20,1120,20,1440,160 L1440,320 L0,320 Z
              "
                        />
                    </path>

                    {/* Wave 2 - Middle */}
                    <path
                        fill="url(#wave-gradient-2)"
                        d="M0,200 C360,80,480,80,720,200 C960,320,1080,320,1440,200 L1440,320 L0,320 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="15s"
                            repeatCount="indefinite"
                            values="
                M0,200 C360,80,480,80,720,200 C960,320,1080,320,1440,200 L1440,320 L0,320 Z;
                M0,220 C360,340,480,340,720,220 C960,100,1080,100,1440,220 L1440,320 L0,320 Z;
                M0,200 C360,80,480,80,720,200 C960,320,1080,320,1440,200 L1440,320 L0,320 Z
              "
                        />
                    </path>

                    {/* Wave 3 - Top */}
                    <path
                        fill="url(#wave-gradient-3)"
                        d="M0,240 C400,100,500,100,800,240 C1100,380,1200,380,1440,240 L1440,320 L0,320 Z"
                    >
                        <animate
                            attributeName="d"
                            dur="25s"
                            repeatCount="indefinite"
                            values="
                M0,240 C400,100,500,100,800,240 C1100,380,1200,380,1440,240 L1440,320 L0,320 Z;
                M0,260 C400,400,500,400,800,260 C1100,120,1200,120,1440,260 L1440,320 L0,320 Z;
                M0,240 C400,100,500,100,800,240 C1100,380,1200,380,1440,240 L1440,320 L0,320 Z
              "
                        />
                    </path>
                </svg>

                {/* Additional blur effects */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Left Side - Title and Description */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            {/* Trust Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                            >
                                <span className="text-yellow-400">⭐</span>
                                <span className="text-sm font-medium text-white/90">
                                    Trusted by developers
                                </span>
                            </motion.div>

                            {/* Main Heading */}
                            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                                Loved by the community
                            </h2>

                            {/* Description */}
                            <p className="text-lg text-white/70 leading-relaxed max-w-xl">
                                Don't just take our word for it. See what developers and companies have to say about our starter template.
                            </p>

                            {/* Dot Indicators */}
                            <div className="flex gap-2 pt-4">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                            ? "bg-white w-8"
                                            : "bg-white/30 w-2 hover:bg-white/50"
                                            }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Trust Footer */}
                            <p className="text-sm text-white/50 pt-8">
                                Trusted by developers from companies worldwide
                            </p>
                        </motion.div>

                        {/* Right Side - Testimonial Card */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 0.95, rotateY: 10 }}
                                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="relative"
                                >
                                    {/* Testimonial Card */}
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/20">
                                        {/* Star Rating */}
                                        <div className="flex gap-1 mb-6">
                                            {[...Array(currentTestimonial.rating)].map((_, i) => (
                                                <motion.span
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                                    className="text-yellow-400 text-2xl"
                                                >
                                                    ⭐
                                                </motion.span>
                                            ))}
                                        </div>

                                        {/* Quote */}
                                        <div className="mb-8">
                                            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                                                "{currentTestimonial.quote}"
                                            </p>
                                        </div>

                                        {/* Author Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-purple-600 p-0.5">
                                                <img
                                                    src={currentTestimonial.image}
                                                    alt={currentTestimonial.name}
                                                    className="w-full h-full rounded-full object-cover bg-white"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white text-lg">
                                                    {currentTestimonial.name}
                                                </h4>
                                                <p className="text-white/60 text-sm">
                                                    {currentTestimonial.role}, {currentTestimonial.company}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative blur elements */}
                                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                                        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
                                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
