import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PricingSection() {
    const plans = [

        {
            name: "Free",
            price: "₹0",
            period: "forever",
            description: "Start at no cost",
            features: [
                "Discover career paths",
                "Basic skill assessment",
                "Community access",
                "Limited AI recommendations"
            ],
            button: "Start Free"
        },
        {
            name: "Horizon Pro",
            price: "₹799",
            period: "per month",
            description: "billed monthly",
            popular: true,
            features: [
                "AI Interview Simulator",
                "Threat Scoring & Job Match Analysis",
                "Resume Generator (AI Powered)",
                "Skill gap insights",
                "Career roadmap (standard)",
                "Cold email templates"
            ],
            button: "Get Started"
        },
        {
            name: "Horizon Advanced",
            price: "₹1999",
            period: "per month",
            description: "billed monthly",
            features: [
                "Everything in Horizon Pro",
                "Advanced personalized career roadmap",
                "Advanced cold emailing suite",
                "Custom job automation rules",
                "1-hour support response time"
            ],
            button: "Contact Sales"
        }
    ];

    return (
        <div className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4 sm:mb-6">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto px-4">
                        Choose the plan that works for you. All plans include access to our platform, lead generation tools, and dedicated support.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="group cursor-pointer"
                        >
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 relative">
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                                        Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold text-white mb-2 text-center">{plan.name}</h3>
                                <div className="text-center mb-4">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-white/70 ml-2">/ {plan.period}</span>
                                    <p className="text-white/60 text-sm">{plan.description}</p>
                                </div>
                                <ul className="text-white/80 text-sm space-y-2 mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span>✔️</span> {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 rounded-xl py-3 transition-all duration-300">
                                    {plan.button}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
