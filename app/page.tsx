'use client';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';

export default function Home() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletCounts, setWalletCounts] = useState([
    { "network": "sepolia", "count": 2 },
    { "network": "mainnet", "count": 3 }
  ]);
  const demoRef = useRef<HTMLDivElement>(null);

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
    demoRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`/api/demo`, {
        name,
        email,
        date
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen p-4 md:p-10 lg:p-20 text-white bg-[#000000]">
        <main className="container mx-auto px-4 py-4 md:py-8">
          <Header />

          {/* Hero Section */}
          <section className="relative overflow-hidden pt-20 md:pt-32">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex-1"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 md:mb-10 leading-tight font-bold">
                  <span className="text-[#EAE5DC]">SMART WALLETS</span><br />
                  FOR THE MODERN CRYPTO ERA
                </h1>
                <p className="text-lg md:text-xl mb-8 text-[#EAE5DC]/80 max-w-2xl">
                  Secure, intuitive and packed with features. Experience crypto management like never before.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={scrollToDemo}
                    className="bg-[#EAE5DC] text-[#000000] px-8 py-3 font-medium hover:bg-[#EAE5DC]/90 transition-colors duration-300 rounded-lg"
                  >
                    Book a Demo
                  </button>
                  <button className="border-2 border-[#EAE5DC] px-8 py-3 font-medium hover:bg-[#EAE5DC]/10 transition-colors duration-300 rounded-lg">
                    Learn More
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex-1 flex justify-center"
              >
                <div className="relative w-full max-w-md aspect-[1.8/1] bg-gradient-to-br from-[#EAE5DC]/10 to-[#EAE5DC]/5 rounded-2xl overflow-hidden border border-[#EAE5DC]/20 shadow-lg">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative w-full h-full">
                      <Image
                        src="/images/CavosLogo.png"
                        alt="Wallet Preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div className="absolute top-6 left-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                OUR <span className="text-[#EAE5DC]">SERVICES</span>
              </h2>
              <p className="text-lg md:text-xl text-[#EAE5DC]/80 max-w-3xl mx-auto">
                Explore our range of services tailored to meet the needs of both crypto enthusiasts and developers.
              </p>
            </motion.div>

            <div className="space-y-12 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-start gap-6"
              >
                <div className="text-4xl text-[#EAE5DC]">🔐</div>
                <div>
                  <h3 className="text-2xl font-bold text-[#EAE5DC] mb-2">Smart Wallets</h3>
                  <p className="text-[#EAE5DC]/80">
                    Deploy smart crypto account wallets with just one simple call. Enjoy the benefits of a non-custodial wallet with advanced security features and seamless user experience.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col md:flex-row items-start gap-6"
              >
                <div className="text-4xl text-[#EAE5DC]">🏄🏻‍♂️</div>
                <div>
                  <h3 className="text-2xl font-bold text-[#EAE5DC] mb-2">Onboarding</h3>
                  <p className="text-[#EAE5DC]/80">
                    Let your users onboard with ease. Our wallet service provides a seamless onboarding experience, allowing users to create and manage their wallets effortlessly.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col md:flex-row items-start gap-6"
              >
                <div className="text-4xl text-[#EAE5DC]">𐄳</div>
                <div>
                  <h3 className="text-2xl font-bold text-[#EAE5DC] mb-2">Network Support</h3>
                  <p className="text-[#EAE5DC]/80">
                    Deploy your wallets on any network, Sepolia or Mainnet. No matter your product stage or network of choice, we have you covered.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Wallet Stats Section */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-[#EAE5DC]/5 to-[#EAE5DC]/10 rounded-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="text-[#EAE5DC]">TRUSTED</span> BY EARLY ADOPTERS
              </h2>
              <p className="text-lg md:text-xl text-[#EAE5DC]/80 max-w-3xl mx-auto">
                Join our growing community of crypto enthusiasts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {walletCounts.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#000000] border border-[#EAE5DC]/20 rounded-xl p-8 text-center"
                >
                  <div className="text-5xl font-bold text-[#EAE5DC] mb-2">
                    {stat.count.toLocaleString()}+
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{stat.network} Wallets</h3>
                  {/* <p className="text-[#EAE5DC]/70">{stat.description}</p> */}
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
                    <Image
                      src={tech.logo}
                      alt={tech.name}
                      fill
                      className="object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
                    />
                  </div>
                  <p className="text-sm font-medium mt-2 text-[#EAE5DC]/80">{tech.name}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Demo Booking Section */}
          <section
            ref={demoRef}
            className="py-16 md:py-24 border-t border-[#EAE5DC]/10"
          >
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="flex-1"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  READY TO <span className="text-[#EAE5DC]">GET STARTED?</span>
                </h2>
                <p className="text-lg md:text-xl text-[#EAE5DC]/80 mb-8 max-w-xl">
                  Schedule a personalized demo and discover how our wallet can transform your crypto experience.
                </p>
                <div className="space-y-4">
                  {[
                    "✓ Non-custodial security",
                    "✓ One-click DeFi access",
                    "✓ Multi-chain support",
                    "✓ 24/7 customer support",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="text-[#EAE5DC]">{feature.split('✓')[0]}</div>
                      <p>{feature.split('✓')[1]}</p>
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
                <div className="bg-[#EAE5DC]/5 border border-[#EAE5DC]/10 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold mb-6 text-[#EAE5DC]">
                    Book a Demo
                  </h3>
                  <p className="text-lg text-[#EAE5DC]/80 mb-6">
                    Click the button below to schedule your demo at your convenience.
                  </p>
                  <a
                    href="https://cal.com/adrian-vrj/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#EAE5DC] text-[#000000] px-8 py-3 font-medium hover:bg-[#EAE5DC]/90 transition-colors duration-300 rounded-lg"
                  >
                    Schedule Demo
                  </a>
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
