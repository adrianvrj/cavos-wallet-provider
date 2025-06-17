'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSetAtom } from 'jotai';
import { userAtom } from '../lib/atoms/user';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

// --- Login Form Component ---
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useSetAtom(userAtom);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (res.ok && result.user) {
        setUser({
          uid: result.user.id,
          email: result.user.email ?? '',
          ...result.user,
        });
        onSuccess();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-[#EAE5DC]/80">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-lg bg-[#0A0A0A] border border-[#EAE5DC]/20 text-white focus:border-[#EAE5DC]/50 focus:ring-1 focus:ring-[#EAE5DC]/30 transition-all duration-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="text-sm font-medium text-[#EAE5DC]/80">
            Password
          </label>
          <button
            type="button"
            className="text-xs text-[#EAE5DC]/60 hover:text-[#EAE5DC] transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-lg bg-[#0A0A0A] border border-[#EAE5DC]/20 text-white focus:border-[#EAE5DC]/50 focus:ring-1 focus:ring-[#EAE5DC]/30 transition-all duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 px-3 py-2 rounded-lg bg-red-900/30 border border-red-900/50"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#EAE5DC] text-[#000000] px-6 py-3 rounded-lg font-medium hover:bg-[#EAE5DC]/90 hover:shadow-[0_4px_20px_rgba(234,229,220,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </motion.button>
    </form>
  );
}

// --- Sign Up Form Component ---
function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useSetAtom(userAtom);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (res.ok && result.user) {
        setUser({
          uid: result.user.id,
          email: result.user.email ?? '',
          ...result.user,
        });
        onSuccess();
      } else if (res.ok) {
        onSuccess();
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="w-full flex flex-col gap-5">
      <div className="space-y-1">
        <label htmlFor="signup-email" className="text-sm font-medium text-[#EAE5DC]/80">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-lg bg-[#0A0A0A] border border-[#EAE5DC]/20 text-white focus:border-[#EAE5DC]/50 focus:ring-1 focus:ring-[#EAE5DC]/30 transition-all duration-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="signup-password" className="text-sm font-medium text-[#EAE5DC]/80">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          required
          placeholder="••••••••"
          minLength={8}
          className="w-full px-4 py-3 rounded-lg bg-[#0A0A0A] border border-[#EAE5DC]/20 text-white focus:border-[#EAE5DC]/50 focus:ring-1 focus:ring-[#EAE5DC]/30 transition-all duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-[#EAE5DC]/50 mt-1">Minimum 8 characters</p>
      </div>

      <div className="space-y-1">
        <label htmlFor="confirm-password" className="text-sm font-medium text-[#EAE5DC]/80">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-lg bg-[#0A0A0A] border border-[#EAE5DC]/20 text-white focus:border-[#EAE5DC]/50 focus:ring-1 focus:ring-[#EAE5DC]/30 transition-all duration-200"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 px-3 py-2 rounded-lg bg-red-900/30 border border-red-900/50"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="bg-[#EAE5DC] text-[#000000] px-6 py-3 rounded-lg font-medium hover:bg-[#EAE5DC]/90 hover:shadow-[0_4px_20px_rgba(234,229,220,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </motion.button>
    </form>
  );
}

// --- Success Messages ---
function SuccessMessage({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-6 rounded-xl bg-[#0A0A0A] border border-[#EAE5DC]/10"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/20 rounded-full mb-4 border border-green-800/50">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-[#EAE5DC] mb-2">{title}</h3>
      <p className="text-[#EAE5DC]/70">{description}</p>
    </motion.div>
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
          <div className="hidden md:flex flex-col justify-center items-start flex-1 px-12 py-16 rounded-l-3xl bg-gradient-to-br from-[#000000] to-[#0A0A0A]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-md"
            >
              <h1 className="text-5xl font-bold mb-6 text-[#EAE5DC] leading-tight">
                Welcome to <span className="text-[#EAE5DC]">Cavos</span>
              </h1>
              <p className="text-lg text-[#EAE5DC]/80 mb-8">
                Manage your wallets and organizations securely and easily with our premium features.
              </p>
              <ul className="space-y-3">
                {['Unlimited Sepolia accounts', 'Mainnet support', 'Organization management', 'Secure authentication'].map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center text-[#EAE5DC]/70 hover:text-[#EAE5DC] transition-colors duration-200"
                  >
                    <svg className="w-5 h-5 mr-3 text-[#EAE5DC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right section: Login/Sign Up */}
          <div className="flex flex-col justify-center items-center flex-1 px-8 py-16 bg-[#0A0A0A] rounded-r-3xl border-l border-[#EAE5DC]/10">
            <div className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <svg className="w-12 h-12 text-[#EAE5DC]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              <div className="flex gap-4 mb-8">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    mode === 'signin'
                      ? 'bg-[#EAE5DC] text-[#000000] shadow-md'
                      : 'bg-[#0A0A0A] text-[#EAE5DC] border border-[#EAE5DC]/20 hover:border-[#EAE5DC]/40'
                  }`}
                  onClick={() => { setMode('signin'); setStep('login'); }}
                  disabled={mode === 'signin'}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    mode === 'signup'
                      ? 'bg-[#EAE5DC] text-[#000000] shadow-md'
                      : 'bg-[#0A0A0A] text-[#EAE5DC] border border-[#EAE5DC]/20 hover:border-[#EAE5DC]/40'
                  }`}
                  onClick={() => { setMode('signup'); setStep('login'); }}
                  disabled={mode === 'signup'}
                >
                  Sign Up
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {step === 'login' && (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mode === 'signin' ? (
                      <LoginForm onSuccess={handleLoginSuccess} />
                    ) : (
                      <SignUpForm onSuccess={handleSignUpSuccess} />
                    )}
                  </motion.div>
                )}

                {step === 'success' && (
                  <SuccessMessage
                    title="Login successful!"
                    description="Welcome back to Cavos Wallet Provider."
                  />
                )}

                {step === 'confirm' && (
                  <SuccessMessage
                    title="Check your email"
                    description="We've sent a confirmation link to your email address. Please verify to complete your registration."
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
