'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { userAtom } from '../lib/atoms/user';
import Header from '../components/Header';
import Footer from '../components/Footer';

function generateSecret(prefix: string) {
  const array = new Uint8Array(30 - prefix.length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return (
    prefix +
    Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 30 - prefix.length)
  );
}

// Componente Information
function InformationSection({ org }: { org: any }) {
  return (
    <div className="bg-[#000000] rounded-2xl p-8 border border-[#EAE5DC]/10 shadow-lg">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-[#EAE5DC]/10 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-[#EAE5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#EAE5DC]">Organization Information</h3>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[#EAE5DC]/70 uppercase tracking-wide">Organization Name</label>
          <div className="bg-[#000000] border border-[#EAE5DC]/20 rounded-lg px-4 py-3">
            <span className="text-white font-medium">{org.name}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[#EAE5DC]/70 uppercase tracking-wide">Email Address</label>
          <div className="bg-[#000000] border border-[#EAE5DC]/20 rounded-lg px-4 py-3">
            <span className="text-white font-medium">{org.email}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-[#EAE5DC]/70 uppercase tracking-wide">Current Plan</label>
          <div className="bg-[#000000] border border-[#EAE5DC]/20 rounded-lg px-4 py-3">
            <span className={`font-medium ${org.plan_id ? 'text-green-400' : 'text-yellow-400'}`}>
              {org.plan_id ?? 'Free Plan'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente Keys
function KeysSection({ org }: { org: any }) {
  const [showSecret, setShowSecret] = useState(false);
  const [showHashSecret, setShowHashSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const maskSecret = (secret: string) => {
    return secret.slice(0, 8) + '•'.repeat(secret.length - 8);
  };

  return (
    <div className="bg-[#000000] rounded-2xl p-8 border border-[#EAE5DC]/10 shadow-lg">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-[#EAE5DC]/10 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-[#EAE5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2m8 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0H9m6 4v1" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#EAE5DC]">API Keys & Secrets</h3>
      </div>

      <div className="space-y-6">
        {/* API Secret */}
        <div className="bg-[#000000] border border-[#EAE5DC]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-[#EAE5DC] mb-1">API Secret</h4>
              <p className="text-sm text-[#EAE5DC]/60">Used for authenticating API requests</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="p-2 hover:bg-[#EAE5DC]/10 rounded-lg transition-colors"
                title={showSecret ? "Hide secret" : "Show secret"}
              >
                <svg className="w-4 h-4 text-[#EAE5DC]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showSecret ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
              <button
                onClick={() => copyToClipboard(org.secret, 'secret')}
                className="p-2 hover:bg-[#EAE5DC]/10 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4 text-[#EAE5DC]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="font-mono text-sm bg-[#0A0A08] border border-[#EAE5DC]/10 rounded px-3 py-2 text-[#EAE5DC]">
            {showSecret ? org.secret : maskSecret(org.secret)}
          </div>
          {copied === 'secret' && (
            <div className="text-green-400 text-xs mt-2">✓ Copied to clipboard</div>
          )}
        </div>

        {/* Hash Secret */}
        <div className="bg-[#000000] border border-[#EAE5DC]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-[#EAE5DC] mb-1">Hash Secret</h4>
              <p className="text-sm text-[#EAE5DC]/60">Used for webhook signature verification</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHashSecret(!showHashSecret)}
                className="p-2 hover:bg-[#EAE5DC]/10 rounded-lg transition-colors"
                title={showHashSecret ? "Hide secret" : "Show secret"}
              >
                <svg className="w-4 h-4 text-[#EAE5DC]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showHashSecret ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
              <button
                onClick={() => copyToClipboard(org.hash_secret, 'hash_secret')}
                className="p-2 hover:bg-[#EAE5DC]/10 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4 text-[#EAE5DC]/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="font-mono text-sm bg-[#0A0A08] border border-[#EAE5DC]/10 rounded px-3 py-2 text-[#EAE5DC]">
            {showHashSecret ? org.hash_secret : maskSecret(org.hash_secret)}
          </div>
          {copied === 'hash_secret' && (
            <div className="text-green-400 text-xs mt-2">✓ Copied to clipboard</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user] = useAtom(userAtom);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Org form state
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/org?uid=${user.uid}`);
        const result = await res.json();
        if (res.ok && result.org) setOrg(result.org);
      } catch (err) {
        // Optionally handle error
      }
      setLoading(false);
    };
    fetchOrg();
  }, [user]);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const secret = generateSecret('cavos-');
    const hash_secret = generateSecret('hs-');
    try {
      const res = await fetch('/api/v1/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          email: orgEmail,
          secret,
          hash_secret,
          plan_id: null,
          uid: user?.uid,
        }),
      });
      const result = await res.json();
      if (res.ok && result.org) {
        setOrg(result.org);
      } else if (result.error) {
        alert(result.error);
      }
    } catch (err) {
      alert('Error creating organization');
    }
    setCreating(false);
  };

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-[#000000] text-white">
          <Header />
          <div className="text-center">
            <div className="w-16 h-16 bg-[#EAE5DC]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#EAE5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-[#EAE5DC]/70">Please log in to access your dashboard.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000] text-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#EAE5DC]/20 border-t-[#EAE5DC] rounded-full mx-auto mb-4"></div>
          <div>Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="mt-14 min-h-screen bg-[#000000] text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {!org ? (
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-[#EAE5DC] mb-4">Welcome to Your Dashboard</h1>
                <p className="text-[#EAE5DC]/70 text-lg">Create your organization to get started</p>
              </div>

              <div className="bg-[#000000] border border-[#EAE5DC]/10 rounded-2xl p-10 shadow-lg">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-[#EAE5DC]/10 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-[#EAE5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-[#EAE5DC]">Create Organization</h2>
                </div>

                <form onSubmit={handleCreateOrg} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#EAE5DC]/70 mb-2">Organization name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your organization name"
                      className="w-full px-4 py-3 rounded-lg bg-[#000000] border border-[#EAE5DC]/20 text-white placeholder-[#EAE5DC]/40 focus:border-[#EAE5DC]/40 focus:outline-none transition-colors"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#EAE5DC]/70 mb-2">Organization email</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your organization email"
                      className="w-full px-4 py-3 rounded-lg bg-[#000000] border border-[#EAE5DC]/20 text-white placeholder-[#EAE5DC]/40 focus:border-[#EAE5DC]/40 focus:outline-none transition-colors"
                      value={orgEmail}
                      onChange={e => setOrgEmail(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#EAE5DC] text-[#000000] px-6 py-3 rounded-lg font-medium hover:bg-[#EAE5DC]/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={creating}
                  >
                    {creating ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin w-4 h-4 border-2 border-[#000000]/20 border-t-[#000000] rounded-full mr-2"></div>
                        Creating Organization...
                      </span>
                    ) : (
                      'Create Organization'
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-[#EAE5DC] mb-2">Dashboard</h1>
                <p className="text-[#EAE5DC]/70 text-lg">Manage your organization and API keys</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <InformationSection org={org} />
                <KeysSection org={org} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
