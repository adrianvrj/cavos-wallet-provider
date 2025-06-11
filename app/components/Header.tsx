"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { userAtom } from "@/app/lib/atoms/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Header() {
  const [user, setUser] = useAtom(userAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/auth/signout", { method: "POST" });
    setUser(null);
    router.push("/login");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="w-full fixed top-0 left-0 z-50 bg-[#000000]/50 backdrop-blur-sm py-2">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <Link href="/">
                <Image
                  src="/images/CavosLogo.png"
                  alt="Cavos Logo"
                  width={40}
                  height={36}
                  className="cursor-pointer"
                />
              </Link>
              <p className="text-[#EAE5DC] ml-4 text-sm md:text-base">
                WALLET PROVIDER
              </p>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/docs">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[#EAE5DC] hover:text-white transition-colors duration-300 cursor-pointer text-sm md:text-base"
                >
                  Docs
                </motion.span>
              </Link>

              <Link href="/search/tx">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[#EAE5DC] hover:text-white transition-colors duration-300 cursor-pointer text-sm md:text-base"
                >
                  Explorer
                </motion.span>
              </Link>

              {user ? (
                <>
                  <Link href="/dashboard">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[#EAE5DC] hover:text-white transition-colors duration-300 cursor-pointer text-sm md:text-base"
                    >
                      Dashboard
                    </motion.span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-4 bg-[#EAE5DC] text-[#000000] px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#EAE5DC]/90 transition-colors duration-300 cursor-pointer text-sm md:text-base"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-4 bg-[#EAE5DC] text-[#000000] px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#EAE5DC]/90 transition-colors duration-300 cursor-pointer text-sm md:text-base"
                  >
                    Login
                  </motion.span>
                </Link>
              )}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={
                  isMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }
                }
                className="w-6 h-0.5 bg-[#EAE5DC] block transition-all duration-300"
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-6 h-0.5 bg-[#EAE5DC] block transition-all duration-300"
              />
              <motion.span
                animate={
                  isMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }
                }
                className="w-6 h-0.5 bg-[#EAE5DC] block transition-all duration-300"
              />
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-4 bg-[#000000]/90 backdrop-blur-sm rounded-lg overflow-hidden"
              >
                <div className="px-4 py-4 space-y-4">
                  <Link href="/docs" onClick={closeMenu}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-[#EAE5DC] hover:text-white transition-colors duration-300 cursor-pointer text-base py-2 border-b border-[#EAE5DC]/20 last:border-b-0"
                    >
                      Docs
                    </motion.div>
                  </Link>

                  <Link href="/search/tx">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[#EAE5DC] hover:text-white transition-colors duration-300 cursor-pointer text-sm md:text-base"
                    >
                      Explorer
                    </motion.span>
                  </Link>

                  {user ? (
                    <>
                      <Link href="/dashboard" onClick={closeMenu}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="text-[#EAE5DC] hover:text-white transition-colors duration-300 cursor-pointer text-base py-2 border-b border-[#EAE5DC]/20"
                        >
                          Dashboard
                        </motion.div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-[#EAE5DC] text-[#000000] px-5 py-3 rounded-lg font-semibold shadow hover:bg-[#EAE5DC]/90 transition-colors duration-300 cursor-pointer text-base"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/login" onClick={closeMenu}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-[#EAE5DC] text-[#000000] px-5 py-3 rounded-lg font-semibold shadow hover:bg-[#EAE5DC]/90 transition-colors duration-300 cursor-pointer text-base text-center"
                      >
                        Login
                      </motion.div>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}

export default Header;
