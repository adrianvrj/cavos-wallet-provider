'use client';
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { userAtom } from '../lib/atoms/user';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// --- Login Form Component ---
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useSetAtom(userAtom);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    setLoading(false);
    if (res.ok && result.user) {
      setUser({
        uid: result.user.id,
        email: result.user.email ?? '',
        ...result.user,
      });
      onSuccess();
    } else if (result.error) {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
      <input
        type="email"
        required
        placeholder="Email"
        className="px-4 py-3 rounded-lg bg-[#000000] border border-[#EAE5DC]/20 text-white"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        required
        placeholder="Password"
        className="px-4 py-3 rounded-lg bg-[#000000] border border-[#EAE5DC]/20 text-white"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="bg-[#EAE5DC] text-[#000000] px-6 py-3 rounded-lg font-medium hover:bg-[#EAE5DC]/90 transition-colors duration-300"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

// --- Sign Up Form Component ---
function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useSetAtom(userAtom);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();
    setLoading(false);
    if (res.ok && result.user) {
      setUser({
        uid: result.user.id,
        email: result.user.email ?? '',
        ...result.user,
      });
      onSuccess();
    } else if (res.ok) {
      // If confirmation required, user is null, but we still want to show the confirm step
      onSuccess();
    } else if (result.error) {
      alert(result.error);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
      <input
        type="email"
        required
        placeholder="Email"
        className="px-4 py-3 rounded-lg bg-[#000000] border border-[#EAE5DC]/20 text-white"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        required
        placeholder="Password"
        className="px-4 py-3 rounded-lg bg-[#000000] border border-[#EAE5DC]/20 text-white"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="bg-[#EAE5DC] text-[#000000] px-6 py-3 rounded-lg font-medium hover:bg-[#EAE5DC]/90 transition-colors duration-300"
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Sign Up'}
      </button>
    </form>
  );
}

// --- Main Page ---
export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'login' | 'success' | 'confirm'>('login');

  const handleLoginSuccess = () => {
    setStep('success');
  };

  const handleSignUpSuccess = () => {
    setStep('confirm');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-[#000000] text-white">
        <div className="flex flex-1 w-full max-w-6xl mx-auto my-auto h-full min-h-[600px]">
          {/* Left section */}
          <div className="hidden md:flex flex-col justify-center items-start flex-1 px-12 py-16 rounded-l-3xl">
            <h1 className="text-5xl font-bold mb-6 text-[#EAE5DC]">Welcome to Cavos</h1>
            <p className="text-lg text-[#EAE5DC]/80 mb-4 max-w-md">
              Manage your wallets and organizations securely and easily.
            </p>
            <ul className="text-[#EAE5DC]/70 space-y-2 text-base mt-4">
              <li>✓ Unlimited Sepolia accounts</li>
              <li>✓ Mainnet support</li>
              <li>✓ Organization management</li>
              <li>✓ Secure authentication</li>
            </ul>
          </div>
          {/* Right section: Login/Sign Up */}
          <div className="flex flex-col justify-center items-center flex-1 px-8 py-16 bg-[#000000] rounded-r-3xl border-l border-[#EAE5DC]/10">
            <div className="w-full max-w-md">
              <h2 className="text-3xl font-bold mb-6 text-[#EAE5DC]">
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </h2>
              <div className="flex gap-4 mb-6">
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${mode === 'signin' ? 'bg-[#EAE5DC] text-[#000000]' : 'bg-[#000000] text-[#EAE5DC] border border-[#EAE5DC]/20'}`}
                  onClick={() => { setMode('signin'); setStep('login'); }}
                  disabled={mode === 'signin'}
                >
                  Sign In
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-medium ${mode === 'signup' ? 'bg-[#EAE5DC] text-[#000000]' : 'bg-[#000000] text-[#EAE5DC] border border-[#EAE5DC]/20'}`}
                  onClick={() => { setMode('signup'); setStep('login'); }}
                  disabled={mode === 'signup'}
                >
                  Sign Up
                </button>
              </div>
              {step === 'login' && (
                mode === 'signin'
                  ? <LoginForm onSuccess={handleLoginSuccess} />
                  : <SignUpForm onSuccess={handleSignUpSuccess} />
              )}
              {step === 'success' && (
                <div className="text-center text-[#EAE5DC] mt-8">
                  <div className="text-2xl font-semibold mb-2">Login successful!</div>
                  <div className="text-[#EAE5DC]/80">Welcome back to Cavos Wallet Provider.</div>
                </div>
              )}
              {step === 'confirm' && (
                <div className="text-center text-[#EAE5DC] mt-8">
                  <div className="text-2xl font-semibold mb-2">Check your email</div>
                  <div className="text-[#EAE5DC]/80">
                    Please confirm your email address to complete your registration.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
