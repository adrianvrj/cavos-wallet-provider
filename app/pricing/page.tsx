'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';

const plans = [
    {
        name: 'Sepolia (Testnet)',
        price: 'Free',
        description: 'Perfect for development and testing.',
        features: [
            'Deploy unlimited accounts on Sepolia',
            'Full wallet functionality',
            'No fees or charges',
            'Ideal for development and testing',
        ],
        cta: 'Start Free',
        disabled: false,
        isFree: true,
    },
    {
        name: 'Mainnet (Production)',
        price: 'One-time Payment',
        description: 'For production deployment on Starknet mainnet.',
        features: [
            'Deploy on Starknet mainnet',
            'Production-ready infrastructure',
            'USDC or USDT payment accepted',
            'Contact admins for pricing details',
        ],
        cta: 'Contact Admins',
        disabled: false,
        isMainnet: true,
    },
];

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleAction = (plan: any) => {
        if (plan.isFree) {
            router.push('/dashboard');
        } else if (plan.isMainnet) {
            window.location.href = 'mailto:adrianvrj@cavos.xyz?subject=Mainnet Pricing Inquiry&body=Hi, I am interested in mainnet deployment pricing. Please provide details about the one-time payment options with USDC/USDT.';
        }
    };

    return (
        <>
            <Header />
            <div className="mt-14 bg-[#000000] text-white flex flex-col items-center py-16 px-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
                    Choose your <span className="text-[#EAE5DC]">plan</span>
                </h1>
                <p className="text-lg text-[#EAE5DC]/80 mb-12 text-center max-w-2xl">
                    Sepolia services are completely free. Mainnet deployment requires a one-time payment with USDC or USDT.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className="bg-[#000000] border border-[#EAE5DC]/10 rounded-2xl p-8 flex flex-col h-full items-center shadow-lg"
                            style={{ minHeight: 480 }}
                        >
                            <h2 className="text-2xl font-bold mb-2 text-[#EAE5DC]">{plan.name}</h2>
                            <div className="text-4xl font-bold mb-2">
                                {plan.price}
                            </div>
                            <p className="mb-6 text-[#EAE5DC]/70 text-center">{plan.description}</p>
                            <ul className="mb-8 space-y-2 text-[#EAE5DC]/90 text-left w-full">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="text-[#EAE5DC]">✓</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="w-full mt-auto flex">
                                <button
                                    className={`hover:cursor-pointer bg-[#EAE5DC] text-[#000000] px-6 py-3 rounded-lg font-medium hover:bg-[#EAE5DC]/90 transition-colors duration-300 w-full flex items-center justify-center ${loading === plan.name ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    onClick={() => handleAction(plan)}
                                    disabled={loading === plan.name}
                                >
                                    {loading === plan.name ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-2 text-[#000000]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                            {plan.isMainnet ? 'Opening Email...' : 'Redirecting...'}
                                        </>
                                    ) : (
                                        plan.cta
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </>
    );
}