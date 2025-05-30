'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { userAtom } from '@/app/lib/atoms/user';
import { useRouter } from 'next/navigation';

function Header() {
    const [user, setUser] = useAtom(userAtom);
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/auth/signout', { method: 'POST' });
        setUser(null);
        router.push('/login');
    };

    return (
        <>
            <header className="w-full fixed top-0 left-0 z-50 bg-[#11110E]/50 backdrop-blur-sm py-2">
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
                            <p className='text-[#FFFFE3] ml-4'>WALLET PROVIDER</p>
                        </motion.div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {/* <Link href="/pricing">
                                <motion.span
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-[#FFFFE3] hover:text-white transition-colors duration-300 cursor-pointer text-sm md:text-base"
                                >
                                    Pricing
                                </motion.span>
                            </Link> */}
                            {user ? (
                                <>
                                    <Link href="/dashboard">
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="text-[#FFFFE3] hover:text-white transition-colors duration-300 cursor-pointer text-sm md:text-base"
                                        >
                                            Dashboard
                                        </motion.span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-4 bg-[#FFFFE3] text-[#11110E] px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#FFFFE3]/90 transition-colors duration-300 cursor-pointer text-sm md:text-base"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link href="/login">
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="ml-4 bg-[#FFFFE3] text-[#11110E] px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#FFFFE3]/90 transition-colors duration-300 cursor-pointer text-sm md:text-base"
                                    >
                                        Login
                                    </motion.span>
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </header>
        </>
    );
}

export default Header;
