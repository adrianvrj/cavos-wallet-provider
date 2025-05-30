'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const plans = [
    {
        name: 'Free',
        price: '0',
        description: 'Perfect to start and try out the platform.',
        features: [
            'Deploy unlimited accounts on Sepolia',
            'Basic support',
        ],
        cta: 'Start',
        disabled: true,
    },
    {
        name: 'Pro',
        price: '32',
        description: 'For advanced users and small teams.',
        features: [
            'Deploy unlimited accounts on Sepolia',
            'Deploy limited accounts/day on Mainnet',
            'Priority support',
        ],
        cta: 'Buy',
        disabled: false,
        productId: 'c953377c-8925-472c-9d79-649d39e131da', // Replace with your real Polar product ID
    },
    {
        name: 'Business',
        price: '60',
        description: 'For companies and production projects.',
        features: [
            'Deploy unlimited accounts on Sepolia',
            'Deploy unlimited on Mainnet',
            '24/7 support',
        ],
        cta: 'Buy',
        disabled: false,
        productId: 'c3eb3484-2a30-4031-998e-caf0eb45e92d', // Replace with your real Polar product ID
    },
];

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleBuy = (productId: string) => {
        setLoading(productId);
        router.push(`/checkout?products=${productId}`);
    };

    return (
        <>
            <Header />
            <div className="mt-14 bg-[#11110E] text-white flex flex-col items-center py-16 px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                    Choose your <span className="text-[#FFFFE3]">plan</span>
                </h1>
                <p className="text-lg text-[#FFFFE3]/80 mb-12 text-center max-w-2xl">
                    Select the plan that best fits your needs and start enjoying Cavos Wallet Provider.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className="bg-[#1A1A16] border border-[#FFFFE3]/10 rounded-2xl p-8 flex flex-col h-full items-center shadow-lg"
                            style={{ minHeight: 480 }} // Optional: set a minHeight for extra consistency
                        >
                            <h2 className="text-2xl font-bold mb-2 text-[#FFFFE3]">{plan.name}</h2>
                            <div className="text-4xl font-bold mb-2">
                                {plan.price === '0' ? 'Free' : `$${plan.price}/year`}
                            </div>
                            <p className="mb-6 text-[#FFFFE3]/70 text-center">{plan.description}</p>
                            <ul className="mb-8 space-y-2 text-[#FFFFE3]/90 text-left w-full">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="text-[#FFFFE3]">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="w-full mt-auto flex">
                                {plan.disabled ? (
                                    <button
                                        className="bg-[#FFFFE3]/20 text-[#FFFFE3] px-6 py-3 rounded-lg font-medium cursor-not-allowed w-full"
                                        disabled
                                    >
                                        {plan.cta}
                                    </button>
                                ) : (
                                    <button
                                        className={`hover:cursor-pointer bg-[#FFFFE3] text-[#11110E] px-6 py-3 rounded-lg font-medium hover:bg-[#FFFFE3]/90 transition-colors duration-300 w-full flex items-center justify-center ${loading === plan.productId ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        onClick={() => handleBuy(plan.productId!)}
                                        disabled={loading === plan.productId}
                                    >
                                        {loading === plan.productId ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5 mr-2 text-[#11110E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                                Redirecting...
                                            </>
                                        ) : (
                                            plan.cta
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}