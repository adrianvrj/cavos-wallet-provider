"use client"

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import { romagothicbold } from './lib/fonts';

export default function Home() {
  const [walletCounts, setWalletCounts] = useState([
    { network: 'sepolia', count: 2 },
    { network: 'mainnet', count: 3 }
  ]);
  const demoRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch wallet counts from your API
    const fetchWalletCounts = async () => {
      try {
        const response = await axios.get('/api/v1/external/wallets/count');
        setWalletCounts(response.data.data);
      } catch (error) {
        console.error('Error fetching wallet counts:', error);
      }
    };

    fetchWalletCounts();
  }, []);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDocumentation = () => {
    router.push('/docs');
  };

  const handleScheduleDemo = () => {
    window.open('https://cal.com/adrian-vrj/30min', '_blank', 'noopener,noreferrer');
  };

  const handleViewAPIDocs = () => {
    router.push('/docs');
  };

  return (
    <>
      <div className="min-h-screen text-white bg-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(234, 229, 220, 0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <main className="container mx-auto px-4 py-4 md:py-8 relative z-10">
          <Header />

          {/* Hero Section - Inspired by the image */}
          <section className="relative py-20 md:py-32 text-center">
            {/* Year indicator */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-6xl md:text-8xl font-bold text-[#EAE5DC]/10 -rotate-90 origin-center">
              20<br />25
            </div>

            {/* Main Hero Content */}
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="text-sm uppercase tracking-wider text-[#EAE5DC]/60 mb-4">
                  DEPLOY & EXECUTE
                </div>
                <div className="text-sm uppercase tracking-wider text-[#EAE5DC]/60 mb-8">
                  WITH ONE API CALL
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-none"
              >
                <span className={`text-[#EAE5DC]/20 block ${romagothicbold.className}`}>IN THE</span>
                <span className={`text-[#EAE5DC] relative ${romagothicbold.className}`}>
                  API
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="max-w-3xl mx-auto mb-12"
              >
                <div className="text-6xl md:text-8xl text-[#EAE5DC]/10 mb-4">"</div>
                <p className="text-lg md:text-xl text-[#EAE5DC]/80 leading-relaxed">
                  DEPLOY SMART CRYPTO ACCOUNTS AND EXECUTE SMART CONTRACT CALLS ON STARKNET 
                  WITH A SINGLE API ENDPOINT. FROM TESTNET TO MAINNET, WE'VE GOT YOU COVERED.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <button
                  onClick={scrollToDemo}
                  className="bg-[#EAE5DC] text-black px-8 py-4 font-medium hover:bg-[#EAE5DC]/90 transition-all duration-300 rounded-lg text-lg"
                >
                  Get API Access
                </button>
                <button 
                  onClick={handleViewDocumentation}
                  className="border-2 border-[#EAE5DC] px-8 py-4 font-medium hover:bg-[#EAE5DC]/10 transition-all duration-300 rounded-lg text-lg"
                >
                  View Documentation
                </button>
              </motion.div>
            </div>

            {/* Explore indicator */}
            <div className="absolute right-0 bottom-0 transform rotate-90 origin-bottom-right">
              <div className="text-sm uppercase tracking-wider text-[#EAE5DC]/40 flex items-center space-x-2">
                <span>EXPLORE</span>
                <div className="w-12 h-px bg-[#EAE5DC]/40"></div>
              </div>
            </div>
          </section>

          {/* API Features Section */}
          <section className="py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                TWO <span className="text-[#EAE5DC]">POWERFUL</span> ENDPOINTS
              </h2>
              <p className="text-lg md:text-xl text-[#EAE5DC]/80 max-w-3xl mx-auto">
                Everything you need to integrate Starknet smart accounts into your application.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-[#EAE5DC]/10 to-[#EAE5DC]/5 border border-[#EAE5DC]/20 rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-[#EAE5DC] mb-4">Deploy Smart Accounts</h3>
                <p className="text-[#EAE5DC]/80 mb-6">
                  Deploy smart crypto account wallets on Starknet with a single API call. 
                  Support for both Sepolia testnet and Mainnet environments.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                  <span className="text-green-400">POST</span> <span className="text-[#EAE5DC]">/api/v1/external/deploy</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-[#EAE5DC]/10 to-[#EAE5DC]/5 border border-[#EAE5DC]/20 rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-[#EAE5DC] mb-4">Execute Smart Contracts</h3>
                <p className="text-[#EAE5DC]/80 mb-6">
                  Execute smart contract calls on Starknet blockchain with one simple endpoint. 
                  Full support for Sepolia and Mainnet networks.
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                  <span className="text-blue-400">POST</span> <span className="text-[#EAE5DC]">/api/v1/external/execute</span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Network Support Section */}
          <section className="py-16 md:py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="text-[#EAE5DC]">MULTI-NETWORK</span> SUPPORT
              </h2>
              <p className="text-lg md:text-xl text-[#EAE5DC]/80 max-w-3xl mx-auto">
                From development to production, deploy on any Starknet network
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {walletCounts.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 border border-[#EAE5DC]/20 rounded-xl p-8 text-center"
                >
                  <div className="text-5xl font-bold text-[#EAE5DC] mb-2">
                    {stat.count.toLocaleString()}+
                  </div>
                  <h3 className="text-xl font-semibold mb-2 capitalize">{stat.network} Accounts</h3>
                  <p className="text-[#EAE5DC]/70">
                    {stat.network === 'sepolia' ? 'Development & Testing' : 'Production Ready'}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="py-16 md:py-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                BUILT WITH <span className="text-[#EAE5DC]">MODERN TECH</span>
              </h2>
              <p className="text-lg md:text-xl text-[#EAE5DC]/80 max-w-3xl mx-auto">
                Leveraging cutting-edge technologies for maximum performance and security
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-12 max-w-5xl mx-auto">
              {[
                { name: "Starknet", logo: "/images/starknet-logo.svg" },
                { name: "Argent", logo: "/images/ArgentLogo.svg" },
                { name: "AVNU", logo: "/images/AVNULogo.svg" },
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="relative w-40 h-40 transition-all duration-300">
                    <img
                      src={tech.logo}
                      alt={tech.name}
                      className="w-full h-full object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2 text-[#EAE5DC]/80">{tech.name}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Demo/API Access Section */}
          <section
            ref={demoRef}
            className="py-16 md:py-24 border-t border-[#EAE5DC]/10"
          >
            <div className="flex flex-col lg:flex-row gap-12 items-center max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="flex-1"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  START <span className="text-[#EAE5DC]">BUILDING</span> TODAY
                </h2>
                <p className="text-lg md:text-xl text-[#EAE5DC]/80 mb-8 max-w-xl">
                  Get instant API access and start deploying smart accounts and executing contracts on Starknet.
                </p>
                <div className="space-y-4">
                  {[
                    "RESTful API endpoints",
                    "Testnet & Mainnet support", 
                    "Account abstraction ready",
                    "Comprehensive documentation",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#EAE5DC] rounded-full"></div>
                      <p className="text-[#EAE5DC]/80">{feature}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="flex-1 w-full max-w-md"
              >
                <div className="bg-gradient-to-br from-[#EAE5DC]/10 to-[#EAE5DC]/5 border border-[#EAE5DC]/20 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold mb-6 text-[#EAE5DC]">
                    Get API Access
                  </h3>
                  <p className="text-lg text-[#EAE5DC]/80 mb-6">
                    Schedule a demo to get your API keys and start integrating smart accounts.
                  </p>
                  <button
                    onClick={handleScheduleDemo}
                    className="inline-block bg-[#EAE5DC] text-black px-8 py-4 font-medium hover:bg-[#EAE5DC]/90 transition-colors duration-300 rounded-lg text-lg w-full"
                  >
                    Schedule Demo
                  </button>
                  <div className="mt-4 pt-4 border-t border-[#EAE5DC]/20">
                    <button 
                      onClick={handleViewAPIDocs}
                      className="text-[#EAE5DC]/80 hover:text-[#EAE5DC] text-sm cursor-pointer"
                    >
                      View API Documentation →
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}