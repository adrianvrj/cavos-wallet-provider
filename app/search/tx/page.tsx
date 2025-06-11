'use client';
import { useState } from 'react';
import axios from 'axios';
import { Search, CheckCircle, DollarSign, Clock, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function SearchTxPage() {
    const [txHash, setTxHash] = useState('');
    const [network, setNetwork] = useState<'mainnet' | 'sepolia'>('mainnet');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'transactions' | 'timeline'>('transactions');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        if (!txHash.trim()) {
            setError('Please enter your transaction code.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/external/tx?txHash=${txHash.trim()}&network=${network}`);
            setResult(res.data.transfers);
            setActiveTab('transactions');
        } catch (err: any) {
            setError('Could not find that transaction. Please check the code and try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 8)}...${address.slice(-6)}`;
    };

    const formatAmount = (amount: string) => {
        if (!amount) return '';
        const num = parseFloat(amount);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4
        });
    };

    const formatTimestamp = (timestamp: number) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <>
            <Header />
            <div className="min-h-screen p-4 md:p-8 mt-20 text-white bg-[#000000] flex flex-col items-center">
                <div className="w-full max-w-2xl mt-12">
                    <h1 className="text-4xl font-bold mb-6 text-center text-[#EAE5DC]">
                        Transaction Explorer
                    </h1>
                    <div className="bg-[#000000] rounded-xl p-6 mb-8 border border-[#EAE5DC]/20">
                        <p className="text-[#EAE5DC] text-lg mb-4 text-center">
                            Enter your transaction ID below to see all the details
                        </p>
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Example: 0x123abc... or TXID123..."
                                    className="w-full px-6 py-4 text-lg rounded-xl bg-[#000000] border-2 border-[#EAE5DC]/30 text-white focus:outline-none focus:border-[#EAE5DC] transition-colors"
                                    value={txHash}
                                    onChange={e => setTxHash(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-4 items-center">
                                <label className="text-[#EAE5DC]/80 font-medium">Network:</label>
                                <select
                                    className="px-4 py-2 rounded-lg bg-[#1A1A16] border border-[#EAE5DC]/20 text-white focus:outline-none"
                                    value={network}
                                    onChange={e => setNetwork(e.target.value as 'mainnet' | 'sepolia')}
                                >
                                    <option value="mainnet">Mainnet (real money)</option>
                                    <option value="sepolia">Sepolia (test network)</option>
                                </select>
                                <span className="text-xs text-[#EAE5DC]/60">
                                    {network === 'mainnet'
                                        ? 'Mainnet is the real blockchain network.'
                                        : 'Sepolia is a test network, not real money.'}
                                </span>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[#EAE5DC] text-[#000000] px-8 py-4 text-lg font-bold rounded-xl hover:bg-[#EAE5DC]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                <Search size={20} />
                                {loading ? 'Searching...' : 'Find My Transaction'}
                            </button>
                        </form>
                        {error && (
                            <div className="bg-red-900/50 border-2 border-red-500 rounded-xl p-4 mt-4 text-center">
                                <div className="text-red-300 text-lg font-semibold flex items-center justify-center gap-2">
                                    <AlertCircle size={20} />
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {result && (
                    <div className="w-full max-w-4xl space-y-8">
                        {/* Main Summary */}
                        <div className="bg-[#000000] rounded-xl p-8 border-2 border-[#EAE5DC]/20">
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    {(!result.tokenTransfers?.length && !result.events?.length) ? (
                                        <AlertCircle size={32} className="text-red-400" />
                                    ) : (
                                        <CheckCircle size={32} className="text-green-400" />
                                    )}
                                    <h2 className="text-3xl font-bold text-[#EAE5DC]">
                                        {(!result.tokenTransfers?.length && !result.events?.length)
                                            ? 'Transaction not found!'
                                            : 'Transaction Found!'}
                                    </h2>
                                </div>
                                <div className="text-[#EAE5DC]/70 text-lg mb-6">
                                    {(!result.tokenTransfers?.length && !result.events?.length)
                                        ? "We couldn't find any information for this transaction."
                                        : "Here's what happened in this transaction"}
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-[#EAE5DC]/20">
                            <button
                                className={`px-6 py-3 font-medium text-lg flex items-center gap-2 ${activeTab === 'transactions' ? 'text-[#EAE5DC] border-b-2 border-[#EAE5DC]' : 'text-[#EAE5DC]/50'}`}
                                onClick={() => setActiveTab('transactions')}
                            >
                                <DollarSign size={20} />
                                Transfers
                            </button>
                            <button
                                className={`px-6 py-3 font-medium text-lg flex items-center gap-2 ${activeTab === 'timeline' ? 'text-[#EAE5DC] border-b-2 border-[#EAE5DC]' : 'text-[#EAE5DC]/50'}`}
                                onClick={() => setActiveTab('timeline')}
                            >
                                <Clock size={20} />
                                Timeline
                            </button>
                        </div>

                        {/* Transactions Tab */}
                        {activeTab === 'transactions' && (
                            <div className="bg-[#000000] rounded-xl p-8 border-2 border-[#EAE5DC]/20">
                                {result.tokenTransfers && result.tokenTransfers.length > 0 ? (
                                    <>
                                        <div className="flex items-center justify-center gap-3 mb-6">
                                            <DollarSign size={28} className="text-[#EAE5DC]" />
                                            <h3 className="text-2xl font-bold text-[#EAE5DC]">
                                                Value Transferred
                                            </h3>
                                        </div>
                                        <div className="text-[#EAE5DC]/70 text-center mb-6">
                                            These are the amounts that were sent in this transaction
                                        </div>
                                        <div className="space-y-6">
                                            {result.tokenTransfers.map((tx: any, idx: number) => (
                                                <div key={idx} className="bg-[#000000] rounded-xl p-6 border border-[#EAE5DC]/30">
                                                    <div className="text-center mb-4">
                                                        <div className="text-[#EAE5DC] text-lg mb-2">
                                                            <span className="font-bold text-2xl text-[#EAE5DC]">{formatAmount(tx.amount)}</span> {tx.token || 'tokens'}
                                                        </div>
                                                        <div className="text-[#EAE5DC]/50 text-sm">
                                                            {tx.tokenName || 'Digital asset'}
                                                        </div>
                                                        {tx.timestamp && (
                                                            <div className="text-[#EAE5DC]/50 text-xs mt-2">
                                                                {formatTimestamp(tx.timestamp)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                                        <div className="bg-[#EAE5DC]/5 rounded-lg p-4 text-center">
                                                            <div className="text-[#EAE5DC]/70 text-sm mb-2">Sender</div>
                                                            <div className="font-mono text-[#EAE5DC] text-sm bg-[#000000] px-3 py-2 rounded">
                                                                {formatAddress(tx.from)}
                                                            </div>
                                                        </div>

                                                        <div className="text-center">
                                                            <ArrowRight size={32} className="text-[#EAE5DC]/70 mx-auto mb-1" />
                                                            <div className="text-[#EAE5DC]/70 text-xs">TRANSFERRED TO</div>
                                                        </div>

                                                        <div className="bg-[#EAE5DC]/5 rounded-lg p-4 text-center">
                                                            <div className="text-[#EAE5DC]/70 text-sm mb-2">Receiver</div>
                                                            <div className="font-mono text-[#EAE5DC] text-sm bg-[#000000] px-3 py-2 rounded">
                                                                {formatAddress(tx.to)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText size={48} className="text-[#EAE5DC]/50 mx-auto mb-4" />
                                        <div className="text-[#EAE5DC] text-xl font-semibold mb-2">
                                            No Transactions Found
                                        </div>
                                        <div className="text-[#EAE5DC]/70">
                                            This transaction doesn't contain any direct token transfers.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timeline Tab */}
                        {activeTab === 'timeline' && (
                            <div className="bg-[#000000] rounded-xl p-8 border-2 border-[#EAE5DC]/20">
                                {result.events && result.events.length > 0 ? (
                                    <>
                                        <div className="flex items-center justify-center gap-3 mb-6">
                                            <Clock size={28} className="text-[#EAE5DC]" />
                                            <h3 className="text-2xl font-bold text-[#EAE5DC]">
                                                Transaction Steps
                                            </h3>
                                        </div>
                                        <div className="text-[#EAE5DC]/70 text-center mb-6">
                                            Here's what happened, step by step from first to last:
                                        </div>

                                        <div className="space-y-4">
                                            {[...result.events].reverse().map((event: any, idx: number) => (
                                                <div key={idx} className="bg-[#000000] rounded-xl p-6 border border-[#EAE5DC]/30">
                                                    <div className="flex items-start gap-4">
                                                        <div className="bg-[#EAE5DC] text-[#000000] rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg flex-shrink-0 mt-1">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="mb-3">
                                                                <div className="text-[#EAE5DC] text-xl font-semibold mb-1">
                                                                    {event.name}
                                                                </div>
                                                                {event.description && (
                                                                    <div className="text-[#EAE5DC]/70 text-sm">
                                                                        {event.description}
                                                                    </div>
                                                                )}
                                                                {event.timestamp && (
                                                                    <div className="text-[#EAE5DC]/50 text-xs mt-2 flex items-center gap-1">
                                                                        <Clock size={12} />
                                                                        {formatTimestamp(event.timestamp)}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {(event.from || event.to || event.amount) && (
                                                                <div className="bg-[#EAE5DC]/5 rounded-lg p-4 space-y-2">
                                                                    {event.amount && (
                                                                        <div className="text-[#EAE5DC] text-lg flex items-center gap-2">
                                                                            <DollarSign size={16} className="text-[#EAE5DC]/70" />
                                                                            <span className="text-[#EAE5DC]/70">Amount: </span>
                                                                            <span className="font-bold">{formatAmount(event.amount)}</span>
                                                                        </div>
                                                                    )}
                                                                    {event.from && (
                                                                        <div className="text-[#EAE5DC] text-sm">
                                                                            <span className="text-[#EAE5DC]/70">From: </span>
                                                                            <span className="font-mono bg-[#000000] px-2 py-1 rounded">
                                                                                {formatAddress(event.from)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {event.to && (
                                                                        <div className="text-[#EAE5DC] text-sm">
                                                                            <span className="text-[#EAE5DC]/70">To: </span>
                                                                            <span className="font-mono bg-[#000000] px-2 py-1 rounded">
                                                                                {formatAddress(event.to)}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Clock size={48} className="text-[#EAE5DC]/50 mx-auto mb-4" />
                                        <div className="text-[#EAE5DC] text-xl font-semibold mb-2">
                                            No Timeline Events
                                        </div>
                                        <div className="text-[#EAE5DC]/70">
                                            This transaction doesn't have any recorded events in its timeline.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Help Section */}
                        <div className="bg-[#000000] rounded-xl p-6 border-2 border-[#EAE5DC]/20">
                            <h3 className="text-xl font-bold text-[#EAE5DC] mb-4 text-center">Need Help Understanding?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[#EAE5DC]/70">
                                <div className="p-4 bg-[#EAE5DC]/5 rounded-lg">
                                    <div className="font-bold text-[#EAE5DC] mb-2">Transactions Tab</div>
                                    <p className="text-sm">Shows all the money or tokens that were directly transferred between accounts in this transaction.</p>
                                </div>
                                <div className="p-4 bg-[#EAE5DC]/5 rounded-lg">
                                    <div className="font-bold text-[#EAE5DC] mb-2">Timeline Tab</div>
                                    <p className="text-sm">Shows all the steps in chronological order (first to last) that happened to complete this transaction.</p>
                                </div>
                            </div>
                        </div>

                        {/* Final Summary */}
                        <div className="bg-[#000000] rounded-xl p-6 border-2 border-[#EAE5DC]/20 text-center">
                            <div className="text-[#EAE5DC]/70 text-lg flex items-center justify-center gap-2">
                                <CheckCircle size={20} className="text-green-400" />
                                <span><strong>Analysis complete</strong> • Your transaction was processed successfully</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
