import type React from 'react';
import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import './globals.css';
import { satoshi } from './lib/fonts';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

const spaceMono = Space_Mono({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-space-mono',
});

export const metadata: Metadata = {
	title: 'Cavos Wallet Service',
	description: 'Wallet Deployment Service for Starknet',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${satoshi.className} bg-[#000000] text-white`}>
				{children}
			</body>
		</html>
	);
}
