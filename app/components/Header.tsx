"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { userAtom } from "@/app/lib/atoms/user";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { romagothicbold } from "../lib/fonts";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  [key: string]: any;
}

function Header() {
  const [user, setUser] = useAtom(userAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/auth/signout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navItems = [
    { href: "/docs", label: "Documentation" },
    { href: "/pricing", label: "Pricing" },
    { href: "/search/tx", label: "Explorer" },
  ];

  const NavLink = ({ href, children, onClick, className = "" }: NavLinkProps) => (
    <Link href={href} onClick={onClick} passHref>
      <motion.a
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={`text-[#EAE5DC] hover:text-white transition-all duration-300 cursor-pointer relative group ${className}`}
      >
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#EAE5DC] transition-all duration-300 group-hover:w-full group-hover:bg-white" />
      </motion.a>
    </Link>
  );

  const Button = ({ onClick, children, variant = "primary", className = "", ...props }: ButtonProps) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent text-sm sm:text-base sm:px-5 sm:py-2.5";
    const variants = {
      primary: "bg-[#EAE5DC] text-black hover:bg-white hover:shadow-[0_4px_20px_rgba(234,229,220,0.3)] focus:ring-[#EAE5DC]",
      ghost: "text-[#EAE5DC] hover:text-white hover:bg-white/5 border border-[#EAE5DC]/30 hover:border-white/30",
    };

    return (
      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`${baseClasses} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <>
      <header 
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-[#000000] shadow-lg border-b border-[#EAE5DC]/10" 
            : "bg-[#000000]"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group" passHref>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Image
                    src="/images/CavosLogo.png"
                    alt="Cavos Logo"
                    width={32}
                    height={28}
                    className="w-8 h-auto sm:w-9"
                    priority
                  />
                </motion.a>
              </Link>
              <Link href="/" passHref>
                <motion.a className="xs:block">
                  <p className={`text-[#EAE5DC] text-lg sm:text-xl font-medium tracking-wider uppercase ${romagothicbold.className}`}>
                    Wallet Provider
                  </p>
                </motion.a>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <NavLink href={item.href}>
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Centered Dashboard Link */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="mx-8"
                >
                  <NavLink href="/dashboard">
                    Dashboard
                  </NavLink>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex items-center space-x-4 ml-4 lg:ml-6 pl-4 lg:pl-6 border-l border-[#EAE5DC]/20"
              >
                {user ? (
                  <Button 
                    onClick={handleLogout}
                    variant="ghost"
                    className="hover:shadow-[0_0_0_1px_white]"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    onClick={() => router.push("/login")}
                    className="hover:shadow-[0_4px_20px_rgba(234,229,220,0.4)]"
                  >
                    Sign In
                  </Button>
                )}
              </motion.div>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              onClick={toggleMenu}
              className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center focus:outline-none focus:ring-2 focus:ring-[#EAE5DC] focus:ring-offset-2 focus:ring-offset-transparent rounded-md group"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <motion.span
                animate={
                  isMenuOpen 
                    ? { rotate: 45, y: 6, width: "20px", backgroundColor: "#ffffff" } 
                    : { rotate: 0, y: -4, width: "20px", backgroundColor: "#EAE5DC" }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-[2px] block absolute rounded-full group-hover:bg-white"
              />
              <motion.span
                animate={
                  isMenuOpen 
                    ? { opacity: 0, width: "0px" } 
                    : { opacity: 1, width: "16px", backgroundColor: "#EAE5DC" }
                }
                transition={{ duration: 0.2 }}
                className="h-[2px] block absolute rounded-full group-hover:bg-white"
              />
              <motion.span
                animate={
                  isMenuOpen 
                    ? { rotate: -45, y: -6, width: "20px", backgroundColor: "#ffffff" } 
                    : { rotate: 0, y: 4, width: "12px", backgroundColor: "#EAE5DC" }
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-[2px] block absolute rounded-full group-hover:bg-white"
              />
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden fixed inset-0 bg-[#000000] z-40"
                onClick={closeMenu}
              />
              
              {/* Mobile Menu */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="md:hidden fixed right-0 top-0 h-full w-full sm:w-80 bg-[#000000] shadow-2xl border-l border-[#EAE5DC]/20 z-50 flex flex-col"
              >
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#EAE5DC]/10">
                  <div className="flex items-center space-x-3">
                    <motion.div whileHover={{ rotate: 5 }}>
                      <Image
                        src="/images/CavosLogo.png"
                        alt="Cavos Logo"
                        width={28}
                        height={25}
                        className="w-7 h-auto"
                      />
                    </motion.div>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="p-2 rounded-md text-[#EAE5DC] hover:text-white hover:bg-white/10 transition-colors duration-200"
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Menu Content */}
                <nav className="flex-1 flex flex-col justify-center items-center space-y-6 py-8">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Link href={item.href} passHref>
                        <motion.a
                          onClick={closeMenu}
                          className="text-[#EAE5DC] hover:text-white text-xl sm:text-2xl font-medium tracking-wide transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {item.label}
                        </motion.a>
                      </Link>
                    </motion.div>
                  ))}
                  {user && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      <Link href="/dashboard" passHref>
                        <motion.a
                          onClick={closeMenu}
                          className="text-[#EAE5DC] hover:text-white text-xl sm:text-2xl font-medium tracking-wide transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Dashboard
                        </motion.a>
                      </Link>
                    </motion.div>
                  )}
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-4 sm:p-5 border-t border-[#EAE5DC]/10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    {user ? (
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full text-lg py-3 justify-center hover:shadow-[0_0_0_1px_white]"
                      >
                        Sign Out
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          router.push("/login");
                          closeMenu();
                        }}
                        className="w-full text-lg py-3 justify-center hover:shadow-[0_4px_20px_rgba(234,229,220,0.4)]"
                      >
                        Sign In
                      </Button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16" />
    </>
  );
}

export default Header;
