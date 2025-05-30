"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { userAtom } from "../lib/atoms/user";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("what-is");

  const sections = [
    { id: "what-is", title: "What is Cavos Wallet Service" },
    { id: "what-you-can-do", title: "What you can do" },
    { id: "getting-started", title: "Getting Started" },
    { id: "api", title: "API Reference" },
  ];

  return (
    <>
      <Header />
      <div className="mt-14 min-h-screen bg-[#11110E] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#FFFFE3] to-[#FFFFE3]/80 bg-clip-text text-transparent">
              Cavos Wallet Service
            </h1>
            <p className="text-xl text-[#FFFFE3]/70 max-w-3xl mx-auto">
              A powerful blockchain wallet service that enables seamless
              integration with Starknet ecosystem, featuring gasless
              transactions through AVNU paymaster integration.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeSection === section.id
                    ? "bg-[#FFFFE3] text-[#11110E]"
                    : "bg-[#1A1A16] border border-[#FFFFE3]/20 text-[#FFFFE3]/70 hover:bg-[#FFFFE3]/10 hover:text-[#FFFFE3]"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="max-w-4xl mx-auto">
            {/* Section 1: What is Cavos Wallet Service */}
            {activeSection === "what-is" && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold mb-6 text-[#FFFFE3]">
                  What is Cavos Wallet Service?
                </h2>
                <div className="bg-[#1A1A16] border border-[#FFFFE3]/10 rounded-2xl p-8">
                  <p className="text-lg text-[#FFFFE3]/70 mb-6">
                    Cavos Wallet Service is a next-generation wallet
                    infrastructure built on the Starknet ecosystem. It enables
                    developers and businesses to create fully functional wallets
                    with a single API call and offers complete gas fee
                    abstraction through integration with AVNU’s paymaster.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-6">
                      <h4 className="text-xl font-semibold mb-3 text-[#FFFFE3]">
                        ⚙️ One-Call Wallet Creation
                      </h4>
                      <p className="text-[#FFFFE3]/60">
                        Instantly deploy Starknet accounts with a single API
                        call. No complex setup, just seamless onboarding for
                        users and apps.
                      </p>
                    </div>
                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-6">
                      <h4 className="text-xl font-semibold mb-3 text-[#FFFFE3]">
                        💸 Gasless UX with AVNU Paymaster
                      </h4>
                      <p className="text-[#FFFFE3]/60">
                        Integrated with AVNU’s paymaster to cover gas fees on
                        behalf of users, enabling smooth, gasless interactions
                        on Starknet.
                      </p>
                    </div>
                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-6">
                      <h4 className="text-xl font-semibold mb-3 text-[#FFFFE3]">
                        🔧 Developer Friendly
                      </h4>
                      <p className="text-[#FFFFE3]/60">
                        Comprehensive APIs, SDKs, and guides to integrate wallet
                        features effortlessly into your dApps or platforms.
                      </p>
                    </div>
                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-6">
                      <h4 className="text-xl font-semibold mb-3 text-[#FFFFE3]">
                        🌐 Starknet Native
                      </h4>
                      <p className="text-[#FFFFE3]/60">
                        Tailored for Starknet with full Cairo compatibility,
                        leveraging Layer 2 scalability and zero-knowledge
                        proofs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: What you can do */}
            {activeSection === "what-you-can-do" && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold mb-6 text-[#FFFFE3]">
                  What you can do with Cavos Wallet Service?
                </h2>

                {/* 2.1 What the service does */}
                <div className="bg-[#1A1A16] border border-[#FFFFE3]/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-[#FFFFE3]">
                    What the Service Does
                  </h3>
                  <div className="space-y-6">
                    <div className="border-l-4 border-[#FFFFE3]/40 pl-6">
                      <h4 className="text-lg font-semibold mb-2 text-[#FFFFE3]">
                        🚀 Instant Wallet Creation
                      </h4>
                      <p className="text-[#FFFFE3]/60">
                        Forget complex onboarding. With a single API call, you
                        can create fully functional wallets on Starknet —
                        whether on Sepolia testnet or Mainnet. No prior
                        blockchain knowledge required.
                      </p>
                    </div>
                    <div className="border-l-4 border-[#FFFFE3]/40 pl-6">
                      <h4 className="text-lg font-semibold mb-2 text-[#FFFFE3]">
                        ⚙️ Smart Contract Execution Made Simple
                      </h4>
                      <p className="text-[#FFFFE3]/60">
                        Need to call a smart contract but don’t know how? Cavos
                        provides an intuitive endpoint to help you execute any
                        contract call with ease — no gas fees involved, thanks
                        to our AVNU Paymaster integration.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2.2 AVNU Paymaster Integration */}
                <div className="bg-[#1A1A16] border border-[#FFFFE3]/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-[#FFFFE3]">
                    AVNU Paymaster Integration
                  </h3>
                  <div className="bg-gradient-to-r from-[#FFFFE3]/5 to-[#FFFFE3]/10 rounded-lg p-6 mb-6 border border-[#FFFFE3]/20">
                    <h4 className="text-xl font-semibold mb-4 text-[#FFFFE3]">
                      Gasless Transactions
                    </h4>
                    <p className="text-[#FFFFE3]/70 mb-4">
                      Through our integration with AVNU's paymaster service,
                      users can execute transactions without holding ETH for gas
                      fees. This revolutionary feature enables true mainstream
                      adoption by removing the complexity of gas management.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-[#FFFFE3]">
                        Benefits:
                      </h5>
                      <ul className="space-y-2 text-[#FFFFE3]/60">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          Zero gas fees for end users
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          Improved user experience
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          Lower barrier to entry
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          Automatic fee sponsorship
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-[#FFFFE3]">
                        Use Cases:
                      </h5>
                      <ul className="space-y-2 text-[#FFFFE3]/60">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          DeFi applications
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          NFT marketplaces
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          Gaming platforms
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#FFFFE3] rounded-full mr-3"></span>
                          Social applications
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Getting Started */}
            {activeSection === "getting-started" && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold mb-6 text-[#FFFFE3]">
                  Getting Started
                </h2>

                {/* How to start and create organization */}
                <div className="bg-[#1A1A16] border border-[#FFFFE3]/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-[#FFFFE3]">
                    Create Your Organization
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center text-[#FFFFE3]">
                        <span className="bg-[#FFFFE3] text-[#11110E] rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                          1
                        </span>
                        Sign Up & Verify
                      </h4>
                      <p className="text-[#FFFFE3]/60 ml-11">
                        Go to{" "}
                        <a
                          href="https://services.cavos.xyz/"
                          className="underline text-[#FFFFE3]"
                        >
                          services.cavos.xyz
                        </a>
                        , click on "Login" and then "Sign Up". Enter your email
                        and password to create your organization and access the
                        service.
                      </p>
                    </div>

                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center text-[#FFFFE3]">
                        <span className="bg-[#FFFFE3] text-[#11110E] rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                          2
                        </span>
                        Access Your Dashboard
                      </h4>
                      <p className="text-[#FFFFE3]/60 ml-11">
                        Once your organization is created, you can view and
                        manage it from the{" "}
                        <a
                          href="https://services.cavos.xyz/dashboard"
                          className="underline text-[#FFFFE3]"
                        >
                          dashboard
                        </a>
                        . Here you’ll find organization details, usage insights,
                        and configuration options.
                      </p>
                    </div>

                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center text-[#FFFFE3]">
                        <span className="bg-[#FFFFE3] text-[#11110E] rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">
                          3
                        </span>
                        API Keys & Integration
                      </h4>
                      <p className="text-[#FFFFE3]/60 ml-11">
                        Inside your{" "}
                        <a
                          href="https://services.cavos.xyz/dashboard"
                          className="underline text-[#FFFFE3]"
                        >
                          dashboard
                        </a>
                        , you’ll find your API Key and Secret. Use these to
                        start calling our endpoints and integrating Cavos into
                        your application.
                      </p>
                    </div>
                  </div>
                </div>

                {/* API Secret and Hash Secret */}
                <div className="bg-[#1A1A16] border border-[#FFFFE3]/10 rounded-2xl p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-[#FFFFE3]">
                    API Secret & Hash Secret
                  </h3>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-[#FFFFE3]/5 to-[#FFFFE3]/10 rounded-lg p-6 border border-[#FFFFE3]/20">
                      <h4 className="text-xl font-semibold mb-4 text-[#FFFFE3]">
                        🔐 API Secret
                      </h4>
                      <p className="text-[#FFFFE3]/70 mb-4">
                        Your API Secret is a unique identifier that
                        authenticates your organization with our service. It
                        should be included in the Authorization header of all
                        API requests.
                      </p>
                      <div className="bg-[#0A0A08] border border-[#FFFFE3]/10 rounded-lg p-4">
                        <code className="text-[#FFFFE3] font-mono text-sm">
                          Authorization: Bearer your-api-secret-here
                        </code>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-[#FFFFE3]/5 to-[#FFFFE3]/10 rounded-lg p-6 border border-[#FFFFE3]/20">
                      <h4 className="text-xl font-semibold mb-4 text-[#FFFFE3]">
                        🔨 Hash Secret
                      </h4>
                      <p className="text-[#FFFFE3]/70 mb-4">
                        The Hash Secret is used to generate secure signatures
                        for sensitive operations like transaction signing and
                        wallet creation. It ensures the integrity of your
                        requests.
                      </p>
                      <div className="bg-[#0A0A08] border border-[#FFFFE3]/10 rounded-lg p-4 mb-4">
                        <code className="text-[#FFFFE3] font-mono text-sm">
                          const signature = hmacSHA256(requestBody, hashSecret);
                        </code>
                      </div>
                    </div>

                    <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
                      <h4 className="text-lg font-semibold mb-2 text-red-400">
                        ⚠️ Security Best Practices
                      </h4>
                      <ul className="space-y-2 text-[#FFFFE3]/60">
                        <li>• Never expose your secrets in client-side code</li>
                        <li>
                          • Store secrets securely using environment variables
                        </li>
                        <li>
                          • Rotate your secrets regularly (recommended: every 90
                          days)
                        </li>
                        <li>
                          • Use different secrets for development and production
                        </li>
                        <li>• Monitor API usage for suspicious activity</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "api" && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold mb-6 text-[#FFFFE3]">
                  API Reference
                </h2>

                <div className="bg-[#1A1A16] border border-[#FFFFE3]/10 rounded-2xl p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-[#FFFFE3] mb-4">
                      Create Wallet
                    </h3>
                    <p className="text-[#FFFFE3]/70 mb-2">
                      Creates a new wallet under your organization.
                    </p>
                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-4">
                      <pre className="text-[#FFFFE3]/80 text-sm whitespace-pre-wrap">
                        {`curl -X POST https://api.cavos.xyz/v1/wallets \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My First Wallet",
    "type": "hd"
}'`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold text-[#FFFFE3] mb-4">
                      Send Transaction
                    </h3>
                    <p className="text-[#FFFFE3]/70 mb-2">
                      Sends a transaction from a wallet to a recipient.
                    </p>
                    <div className="bg-[#11110E] border border-[#FFFFE3]/20 rounded-lg p-4">
                      <pre className="text-[#FFFFE3]/80 text-sm whitespace-pre-wrap">
                        {`curl -X POST https://api.cavos.xyz/v1/transactions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "wallet_id": "wallet_abc123",
    "to": "0x04fb...",
    "amount": "1000000000000000000", 
    "token_address": "0xTokenAddress"
}'`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
