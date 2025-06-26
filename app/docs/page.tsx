"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiCopy, FiCheck } from 'react-icons/fi';

// Enhanced CodeSnippet component with language tabs and copy functionality
const CodeSnippet = ({ 
  title, 
  description, 
  curl, 
  js, 
  python, 
  response,
  method = "POST",
  endpoint,
  parameters = []
}: {
  title: string;
  description: string;
  curl: string;
  js: string;
  python: string;
  response?: string;
  method?: string;
  endpoint?: string;
  parameters?: Array<{ name: string; type: string; required: boolean; description: string }>;
}) => {
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const getCode = () => {
    switch (activeTab) {
      case 'curl': return curl;
      case 'javascript': return js;
      case 'python': return python;
      default: return curl;
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (err) {
      // fallback: select and copy
      setCopied(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-2xl p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-[#EAE5DC]">{title}</h3>
          <p className="text-[#EAE5DC]/80 mt-1">{description}</p>
        </div>
        {endpoint && (
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#EAE5DC]/10 text-[#EAE5DC] border border-[#EAE5DC]/20">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                method === 'GET' ? 'bg-green-500' : 
                method === 'POST' ? 'bg-blue-500' :
                method === 'PUT' ? 'bg-yellow-500' :
                method === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
              }`}></span>
              {method}
            </div>
            <div className="mt-2 text-sm font-mono text-[#EAE5DC]/70">{endpoint}</div>
          </div>
        )}
      </div>

      {parameters.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-[#EAE5DC] mb-3">Parameters</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EAE5DC]/20">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#EAE5DC]/50 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#EAE5DC]/50 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#EAE5DC]/50 uppercase tracking-wider">Required</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#EAE5DC]/50 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DC]/10">
                {parameters.map((param, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-[#EAE5DC]">{param.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#EAE5DC]/70">{param.type}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#EAE5DC]/70">{param.required ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-sm text-[#EAE5DC]/70">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex border-b border-[#EAE5DC]/20">
          <button
            onClick={() => setActiveTab('curl')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'curl'
                ? 'border-b-2 border-[#EAE5DC] text-[#EAE5DC]'
                : 'text-[#EAE5DC]/50 hover:text-[#EAE5DC]/70'
            }`}
          >
            cURL
          </button>
          <button
            onClick={() => setActiveTab('javascript')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'javascript'
                ? 'border-b-2 border-[#EAE5DC] text-[#EAE5DC]'
                : 'text-[#EAE5DC]/50 hover:text-[#EAE5DC]/70'
            }`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'python'
                ? 'border-b-2 border-[#EAE5DC] text-[#EAE5DC]'
                : 'text-[#EAE5DC]/50 hover:text-[#EAE5DC]/70'
            }`}
          >
            Python
          </button>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-[#0A0A08] border border-[#EAE5DC]/10 rounded-lg p-4 overflow-x-auto">
          <code className="text-[#EAE5DC] font-mono text-sm whitespace-pre-wrap">
            {getCode()}
          </code>
        </pre>
        <button
          className="absolute top-3 right-3 p-2 rounded-md bg-[#EAE5DC]/10 hover:bg-[#EAE5DC]/20 transition-colors"
          onClick={() => handleCopy(getCode())}
        >
          {copied ? <FiCheck className="text-green-400" /> : <FiCopy className="text-[#EAE5DC]/70" />}
        </button>
      </div>

      {response && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-[#EAE5DC] mb-3">Response</h4>
          <div className="relative">
            <pre className="bg-[#0A0A08] border border-[#EAE5DC]/10 rounded-lg p-4 overflow-x-auto">
              <code className="text-[#EAE5DC] font-mono text-sm whitespace-pre-wrap">
                {response}
              </code>
            </pre>
            <button
              className="absolute top-3 right-3 p-2 rounded-md bg-[#EAE5DC]/10 hover:bg-[#EAE5DC]/20 transition-colors"
              onClick={() => handleCopy(response)}
            >
              {copied ? <FiCheck className="text-green-400" /> : <FiCopy className="text-[#EAE5DC]/70" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("what-is");
  
  const sections = [
    { id: "what-is", title: "What is Cavos Wallet Service", category: "Overview" },
    { id: "what-you-can-do", title: "What you can do", category: "Overview" },
    { id: "getting-started", title: "Getting Started", category: "Setup" },
    { id: "api", title: "API Reference", category: "API" },
    { id: "resources", title: "Resources", category: "Resources" },
  ];

  const categories = [...new Set(sections.map(s => s.category))];

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(234, 229, 220, 0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="flex relative z-10">
        {/* Left Sidebar */}
        <div className="w-80 h-screen sticky top-0 border-r border-[#EAE5DC]/10 bg-[#000000]/80 backdrop-blur">
          <div className="p-8">
            {/* Back Button */}
            <div className="mb-8">
              <Link href="/" className="inline-flex items-center gap-2 text-[#EAE5DC] hover:text-white bg-[#0A0A08]/70 border border-[#EAE5DC]/20 rounded-lg px-4 py-2 font-medium shadow transition-all duration-200 hover:bg-[#EAE5DC]/10 focus:outline-none focus:ring-2 focus:ring-[#EAE5DC]/40">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Back
              </Link>
            </div>
            {/* Logo/Header */}
            <div className="mb-12">
              <h1 className="text-2xl font-bold text-[#EAE5DC] mb-2">
                Cavos Wallet Service
              </h1>
              <p className="text-sm text-[#EAE5DC]/60">
                API Documentation
              </p>
            </div>

            {/* Navigation */}
            <nav className="space-y-8">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-xs uppercase tracking-wider text-[#EAE5DC]/40 mb-4 font-medium">
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {sections
                      .filter(section => section.category === category)
                      .map((section) => (
                        <li key={section.id}>
                          <button
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                              activeSection === section.id
                                ? "bg-[#EAE5DC]/10 text-[#EAE5DC] border-l-2 border-[#EAE5DC]"
                                : "text-[#EAE5DC]/70 hover:bg-[#EAE5DC]/5 hover:text-[#EAE5DC]"
                            }`}
                          >
                            {section.title}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-16">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#EAE5DC] to-[#EAE5DC]/80 bg-clip-text text-transparent">
                  Documentation
                </h1>
                <p className="text-xl text-[#EAE5DC]/70 max-w-3xl mx-auto">
                  A powerful blockchain wallet service that enables seamless
                  integration with Starknet ecosystem, featuring gasless
                  transactions through AVNU paymaster integration.
                </p>
              </div>
            </motion.div>

            {/* Content Sections */}
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Section 1: What is Cavos Wallet Service */}
              {activeSection === "what-is" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-4xl font-bold mb-6 text-[#EAE5DC]">
                      What is Cavos Wallet Service?
                    </h2>
                    <div className="w-16 h-1 bg-[#EAE5DC] mb-8"></div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-2xl p-8">
                    <p className="text-lg text-[#EAE5DC]/80 mb-8 leading-relaxed">
                      Cavos Wallet Service is a next-generation wallet
                      infrastructure built on the Starknet ecosystem. It enables
                      developers and businesses to create fully functional wallets
                      with a single API call and offers complete gas fee
                      abstraction through integration with AVNU's paymaster.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[#000000]/50 border border-[#EAE5DC]/20 rounded-lg p-6">
                        <h4 className="text-xl font-semibold mb-3 text-[#EAE5DC]">
                          One-Call Wallet Creation
                        </h4>
                        <p className="text-[#EAE5DC]/70">
                          Instantly deploy Starknet accounts with a single API
                          call. No complex setup, just seamless onboarding for
                          users and apps.
                        </p>
                      </div>
                      <div className="bg-[#000000]/50 border border-[#EAE5DC]/20 rounded-lg p-6">
                        <h4 className="text-xl font-semibold mb-3 text-[#EAE5DC]">
                          Gasless UX with AVNU Paymaster
                        </h4>
                        <p className="text-[#EAE5DC]/70">
                          Integrated with AVNU's paymaster to cover gas fees on
                          behalf of users, enabling smooth, gasless interactions
                          on Starknet.
                        </p>
                      </div>
                      <div className="bg-[#000000]/50 border border-[#EAE5DC]/20 rounded-lg p-6">
                        <h4 className="text-xl font-semibold mb-3 text-[#EAE5DC]">
                          Developer Friendly
                        </h4>
                        <p className="text-[#EAE5DC]/70">
                          Comprehensive APIs, and guides to integrate wallet
                          features effortlessly into your dApps or platforms.
                        </p>
                      </div>
                      <div className="bg-[#000000]/50 border border-[#EAE5DC]/20 rounded-lg p-6">
                        <h4 className="text-xl font-semibold mb-3 text-[#EAE5DC]">
                          Starknet Native
                        </h4>
                        <p className="text-[#EAE5DC]/70">
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
                  <div>
                    <h2 className="text-4xl font-bold mb-6 text-[#EAE5DC]">
                      What you can do with Cavos Wallet Service?
                    </h2>
                    <div className="w-16 h-1 bg-[#EAE5DC] mb-8"></div>
                  </div>

                  {/* What the service does */}
                  <div className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-semibold mb-6 text-[#EAE5DC]">
                      What the Service Does
                    </h3>
                    <div className="space-y-6">
                      <div className="border-l-4 border-[#EAE5DC]/40 pl-6">
                        <h4 className="text-lg font-semibold mb-2 text-[#EAE5DC]">
                          Instant Wallet Creation
                        </h4>
                        <p className="text-[#EAE5DC]/70">
                          Forget complex onboarding. With a single API call, you
                          can create fully functional wallets on Starknet —
                          whether on Sepolia testnet or Mainnet. No prior
                          blockchain knowledge required.
                        </p>
                      </div>
                      <div className="border-l-4 border-[#EAE5DC]/40 pl-6">
                        <h4 className="text-lg font-semibold mb-2 text-[#EAE5DC]">
                          Smart Contract Execution Made Simple
                        </h4>
                        <p className="text-[#EAE5DC]/70">
                          Need to call a smart contract but don't know how? Cavos
                          provides an intuitive endpoint to help you execute any
                          contract call with ease — no gas fees involved, thanks
                          to our AVNU Paymaster integration.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AVNU Paymaster Integration */}
                  <div className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-semibold mb-6 text-[#EAE5DC]">
                      AVNU Paymaster Integration
                    </h3>
                    <div className="bg-gradient-to-r from-[#EAE5DC]/10 to-[#EAE5DC]/5 rounded-lg p-6 mb-6 border border-[#EAE5DC]/30">
                      <h4 className="text-xl font-semibold mb-4 text-[#EAE5DC]">
                        Gasless Transactions
                      </h4>
                      <p className="text-[#EAE5DC]/80 mb-4">
                        Through our integration with AVNU's paymaster service,
                        users can execute transactions without holding ETH for gas
                        fees. This revolutionary feature enables true mainstream
                        adoption by removing the complexity of gas management.
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-[#EAE5DC]">
                          Benefits:
                        </h5>
                        <ul className="space-y-3 text-[#EAE5DC]/70">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
                            Zero gas fees for end users
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
                            Improved user experience
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
                            Lower barrier to entry
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
                            Automatic fee sponsorship
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h5 className="text-lg font-semibold text-[#EAE5DC]">
                          Use Cases:
                        </h5>
                        <ul className="space-y-3 text-[#EAE5DC]/70">
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
                            DeFi applications
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
                            NFT marketplaces
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
                            Gaming platforms
                          </li>
                          <li className="flex items-center">
                            <span className="w-2 h-2 bg-[#EAE5DC] rounded-full mr-3"></span>
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
                  <div>
                    <h2 className="text-4xl font-bold mb-6 text-[#EAE5DC]">
                      Getting Started
                    </h2>
                    <div className="w-16 h-1 bg-[#EAE5DC] mb-8"></div>
                  </div>

                  {/* Create Organization */}
                  <div className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-semibold mb-6 text-[#EAE5DC]">
                      Create Your Organization
                    </h3>

                    <div className="space-y-6">
                      <div className="bg-[#000000]/50 border border-[#EAE5DC]/20 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center text-[#EAE5DC]">
                          <span className="bg-[#EAE5DC] text-[#000000] rounded-full w-8 h-8 flex items-center justify-center mr-4 text-sm font-bold">
                            1
                          </span>
                          Sign Up & Verify
                        </h4>
                        <p className="text-[#EAE5DC]/70 ml-12">
                          Go to{" "}
                          <a
                            href="https://services.cavos.xyz/"
                            className="underline text-[#EAE5DC] hover:text-[#EAE5DC]/80"
                          >
                            services.cavos.xyz
                          </a>
                          , click on "Login" and then "Sign Up". Enter your email
                          and password to create your organization and access the
                          service.
                        </p>
                      </div>

                      <div className="bg-[#000000]/50 border border-[#EAE5DC]/20 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center text-[#EAE5DC]">
                          <span className="bg-[#EAE5DC] text-[#000000] rounded-full w-8 h-8 flex items-center justify-center mr-4 text-sm font-bold">
                            2
                          </span>
                          Access Your Dashboard
                        </h4>
                        <p className="text-[#EAE5DC]/70 ml-12">
                          Once your organization is created, you can view and
                          manage it from the{" "}
                          <a
                            href="https://services.cavos.xyz/dashboard"
                            className="underline text-[#EAE5DC] hover:text-[#EAE5DC]/80"
                          >
                            dashboard
                          </a>
                          . Here you'll find organization details, usage insights,
                          and configuration options.
                        </p>
                      </div>

                      <div className="bg-[#000000]/50 border border-[#EAE5DC]/20 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center text-[#EAE5DC]">
                          <span className="bg-[#EAE5DC] text-[#000000] rounded-full w-8 h-8 flex items-center justify-center mr-4 text-sm font-bold">
                            3
                          </span>
                          API Keys & Integration
                        </h4>
                        <p className="text-[#EAE5DC]/70 ml-12">
                          Inside your{" "}
                          <a
                            href="https://services.cavos.xyz/dashboard"
                            className="underline text-[#EAE5DC] hover:text-[#EAE5DC]/80"
                          >
                            dashboard
                          </a>
                          , you'll find your API Key and Secret. Use these to
                          start calling our endpoints and integrating Cavos into
                          your application.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* API Secret and Hash Secret */}
                  <div className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-semibold mb-6 text-[#EAE5DC]">
                      API Secret & Hash Secret
                    </h3>

                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-[#EAE5DC]/10 to-[#EAE5DC]/5 rounded-lg p-6 border border-[#EAE5DC]/30">
                        <h4 className="text-xl font-semibold mb-4 text-[#EAE5DC]">
                          API Secret
                        </h4>
                        <p className="text-[#EAE5DC]/80 mb-4">
                          Your API Secret is a unique identifier that
                          authenticates your organization with our service. It
                          should be included in the Authorization header of all
                          API requests.
                        </p>
                        <div className="bg-[#0A0A08] border border-[#EAE5DC]/10 rounded-lg p-4">
                          <code className="text-[#EAE5DC] font-mono text-sm">
                            Authorization: Bearer your-api-secret-here
                          </code>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-[#EAE5DC]/10 to-[#EAE5DC]/5 rounded-lg p-6 border border-[#EAE5DC]/30">
                        <h4 className="text-xl font-semibold mb-4 text-[#EAE5DC]">
                          Hash Secret
                        </h4>
                        <p className="text-[#EAE5DC]/80 mb-4">
                          The Hash Secret is used to generate secure signatures
                          for sensitive operations like transaction signing and
                          wallet creation. It ensures the integrity of your
                          requests.
                        </p>
                        <div className="bg-[#0A0A08] border border-[#EAE5DC]/10 rounded-lg p-4 mb-4">
                          <code className="text-[#EAE5DC] font-mono text-sm">
                            const signature = hmacSHA256(requestBody, hashSecret);
                          </code>
                        </div>
                      </div>

                      <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
                        <h4 className="text-lg font-semibold mb-2 text-red-400">
                          Security Best Practices
                        </h4>
                        <ul className="space-y-2 text-[#EAE5DC]/70">
                          <li>Never expose your secrets in client-side code</li>
                          <li>Store secrets securely using environment variables</li>
                          <li>Rotate your secrets regularly (recommended: every 90 days)</li>
                          <li>Use different secrets for development and production</li>
                          <li>Monitor API usage for suspicious activity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: API Reference */}
              {activeSection === "api" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-4xl font-bold mb-6 text-[#EAE5DC]">
                      API Reference
                    </h2>
                    <div className="w-16 h-1 bg-[#EAE5DC] mb-8"></div>
                  </div>

                  <div className="space-y-8">
                    <CodeSnippet
                      title="Create Wallet"
                      description="Creates a new wallet under your organization."
                      method="POST"
                      endpoint="/api/v1/external/deploy"
                      parameters={[
                        {
                          name: "network",
                          type: "string",
                          required: true,
                          description: "Network to deploy the wallet on (sepolia or mainnet)"
                        }
                      ]}
                      curl={`curl --location 'https://services.cavos.xyz/api/v1/external/deploy' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: API_KEY_HERE' \\
--data '{
    "network": "sepolia"
}'`}
                      js={`const response = await fetch('https://services.cavos.xyz/api/v1/external/deploy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'API_KEY_HERE'
  },
  body: JSON.stringify({
    network: 'sepolia'
  })
});

const data = await response.json();`}
                      python={`import requests

url = "https://services.cavos.xyz/api/v1/external/deploy"
headers = {
    "Content-Type": "application/json",
    "Authorization": "API_KEY_HERE"
}
data = {
    "network": "sepolia"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}
                      response={`{
  "message": "Wallet deployed successfully",
  "data": {
    "address": "0x3bbf55d3b5d7f5907ef3a80fbbe0578c360fb41ec48a6fb340fd36d9eff822b",
    "network": "sepolia",
    "transactionHash": "0x123...abc"
  }
}`}
                    />
                    
                    <CodeSnippet
                      title="Send Transaction"
                      description="Sends a transaction from a wallet to a recipient."
                      method="POST"
                      endpoint="/api/v1/external/execute"
                      parameters={[
                        {
                          name: "network",
                          type: "string",
                          required: true,
                          description: "Network to execute the transaction on (sepolia or mainnet)"
                        },
                        {
                          name: "calls",
                          type: "array",
                          required: true,
                          description: "Array of contract calls to execute"
                        },
                        {
                          name: "address",
                          type: "string",
                          required: true,
                          description: "Wallet address initiating the transaction"
                        },
                        {
                          name: "hashedPk",
                          type: "string",
                          required: true,
                          description: "Hashed private key for the wallet"
                        }
                      ]}
                      curl={`curl --location 'https://services.cavos.xyz/api/v1/external/execute' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: API_KEY_HERE' \\
--data '{
    "network": "sepolia",
    "calls": [
        {
            "contractAddress": "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
            "entrypoint": "approve",
            "calldata": [
                "0x028795e04b2abaf61266faa81cc02d4d1a6ef8574fef383cdf6185ca580648aa",
                "0x0",
                "0x0"
            ]
        }
    ],
    "address": "0x3bbf55d3b5d7f5907ef3a80fbbe0578c360fb41ec48a6fb340fd36d9eff822b",
    "hashedPk": "U2FsdGVkX19a5enJlf4YG9nEpj/oBwftKrEf99zF1BC9I7jmVoVoyFx6DxrXHcL0e3rr3YYXVhMkWWF2gFtWF+UcCzcKNTxh+2FGrrbr00M="
}'`}
                      js={`const response = await fetch('https://services.cavos.xyz/api/v1/external/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'API_KEY_HERE'
  },
  body: JSON.stringify({
    network: 'sepolia',
    calls: [{
      contractAddress: '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D',
      entrypoint: 'approve',
      calldata: [
        '0x028795e04b2abaf61266faa81cc02d4d1a6ef8574fef383cdf6185ca580648aa',
        '0x0',
        '0x0'
      ]
    }],
    address: '0x3bbf55d3b5d7f5907ef3a80fbbe0578c360fb41ec48a6fb340fd36d9eff822b',
    hashedPk: 'U2FsdGVkX19a5enJlf4YG9nEpj/oBwftKrEf99zF1BC9I7jmVoVoyFx6DxrXHcL0e3rr3YYXVhMkWWF2gFtWF+UcCzcKNTxh+2FGrrbr00M='
  })
});

const data = await response.json();`}
                      python={`import requests

url = "https://services.cavos.xyz/api/v1/external/execute"
headers = {
    "Content-Type": "application/json",
    "Authorization": "API_KEY_HERE"
}
data = {
    "network": "sepolia",
    "calls": [{
        "contractAddress": "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
        "entrypoint": "approve",
        "calldata": [
            "0x028795e04b2abaf61266faa81cc02d4d1a6ef8574fef383cdf6185ca580648aa",
            "0x0",
            "0x0"
        ]
    }],
    "address": "0x3bbf55d3b5d7f5907ef3a80fbbe0578c360fb41ec48a6fb340fd36d9eff822b",
    "hashedPk": "U2FsdGVkX19a5enJlf4YG9nEpj/oBwftKrEf99zF1BC9I7jmVoVoyFx6DxrXHcL0e3rr3YYXVhMkWWF2gFtWF+UcCzcKNTxh+2FGrrbr00M="
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`}
                      response={`{
  "message": "Transaction executed successfully",
  "data": {
    "transaction_hash": "0x123...abc"
  }
}`}
                    />

                    <CodeSnippet
                      title="Get Wallet Counts"
                      description="Returns the number of wallets deployed on Sepolia and Mainnet for your organization."
                      method="GET"
                      endpoint="/api/v1/external/wallets/count"
                      curl={`curl --location 'https://services.cavos.xyz/api/v1/external/wallets/count' \\
--header 'Authorization: API_KEY_HERE'`}
                      js={`const response = await fetch('https://services.cavos.xyz/api/v1/external/wallets/count', {
  method: 'GET',
  headers: {
    'Authorization': 'API_KEY_HERE'
  }
});

const data = await response.json();`}
                      python={`import requests

url = "https://services.cavos.xyz/api/v1/external/wallets/count"
headers = {
    "Authorization": "API_KEY_HERE"
}

response = requests.get(url, headers=headers)
print(response.json())`}
                      response={`{
  "message": "Wallet counts fetched successfully",
  "data": [
    { "network": "sepolia", "count": 2 },
    { "network": "mainnet", "count": 3 }
  ]
}`}
                    />

                    <CodeSnippet
                      title="Get Transaction Token Transfers"
                      description="Fetches token transfer events for a given transaction hash on Sepolia or Mainnet."
                      method="GET"
                      endpoint="/api/v1/external/tx"
                      parameters={[
                        {
                          name: "txHash",
                          type: "string",
                          required: true,
                          description: "Transaction hash to fetch transfers for"
                        },
                        {
                          name: "network",
                          type: "string",
                          required: false,
                          description: "Network to query (mainnet or sepolia, default: mainnet)"
                        }
                      ]}
                      curl={`curl --location 'https://services.cavos.xyz/api/v1/external/tx?txHash=YOUR_TX_HASH&network=sepolia'`}
                      js={`const response = await fetch('https://services.cavos.xyz/api/v1/external/tx?txHash=YOUR_TX_HASH&network=sepolia', {
  method: 'GET'
});

const data = await response.json();`}
                      python={`import requests

url = "https://services.cavos.xyz/api/v1/external/tx"
params = {
    "txHash": "YOUR_TX_HASH",
    "network": "sepolia"
}

response = requests.get(url, params=params)
print(response.json())`}
                      response={`{
  "transfers": [
    {
      "from_address": "0x123...",
      "to_address": "0x456...",
      "token_address": "0x789...",
      "amount": "1000000000000000000",
      "token_name": "Ether",
      "token_symbol": "ETH",
      "token_decimals": 18
    }
  ]
}`}
                    />
                  </div>
                </div>
              )}

              {/* Section 5: Resources */}
              {activeSection === "resources" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-4xl font-bold mb-6 text-[#EAE5DC]">
                      Resources
                    </h2>
                    <div className="w-16 h-1 bg-[#EAE5DC] mb-8"></div>
                  </div>

                  <div className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-2xl p-8">
                    <h3 className="text-2xl font-semibold text-[#EAE5DC] mb-6">
                      Deploy accounts on Starknet under 2 seconds
                    </h3>

                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-[#000000]/50 border border-[#EAE5DC]/20">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/8b4hz93k8K4"
                        title="Deploy accounts on Starknet under 2 seconds"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                    <p className="text-[#EAE5DC]/80 mt-6">
                      Learn how to quickly deploy Starknet accounts using Cavos
                      Wallet Service in under 2 seconds.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
