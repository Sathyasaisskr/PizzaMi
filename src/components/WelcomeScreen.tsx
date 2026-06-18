import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pizza, User, Store, ArrowRight, ChevronLeft, Loader2,
  Mail, Lock, Eye, EyeOff, KeyRound, Phone, Zap,
} from 'lucide-react';
import { signUpCustomer, signUpStoreOwner, signIn, signInWithGoogle, resetPassword, AuthError } from '../lib/auth';
import { MinionsBackground } from './MinionsBackground';

type Step = 'choose' | 'customer' | 'store_owner';
type Mode = 'login' | 'signup';

// Saved demo logins — shown for easy access until production-ready.
const DEMO = {
  customer: { email: 'demo.customer@mislice.app', password: 'Demo1234', fullName: 'Demo Customer' },
  store_owner: { email: 'demo.store@mislice.app', password: 'Demo1234', fullName: 'Demo Owner', storeName: 'Demo Pizza Co' },
};

export function WelcomeScreen() {
  const [step, setStep] = useState<Step>('choose');
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const reset = () => { setError(''); setNotice(''); };
  const goChoose = () => { setStep('choose'); setMode('login'); reset(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset(); setLoading(true);
    try {
      if (step === 'customer') {
        if (mode === 'signup') await signUpCustomer({ email, password, fullName, phone });
        else await signIn(email, password);
      } else if (step === 'store_owner') {
        if (mode === 'signup') await signUpStoreOwner({ email, password, fullName, storeName, phone });
        else await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const onGoogle = async () => {
    reset(); setLoading(true);
    try { await signInWithGoogle(); }
    catch (err) { setError(err instanceof AuthError ? err.message : 'Google sign-in failed.'); }
    finally { setLoading(false); }
  };

  const onForgot = async () => {
    reset();
    if (!email.trim()) { setError('Enter your email above, then tap reset.'); return; }
    try { await resetPassword(email); setNotice('Password reset email sent — check your inbox.'); }
    catch (err) { setError(err instanceof AuthError ? err.message : 'Could not send reset email.'); }
  };

  const useDemo = async (role: 'customer' | 'store_owner') => {
    reset(); setLoading(true);
    const d = DEMO[role];
    try {
      try { await signIn(d.email, d.password); }
      catch {
        if (role === 'customer') await signUpCustomer({ email: d.email, password: d.password, fullName: d.fullName });
        else await signUpStoreOwner({ email: d.email, password: d.password, fullName: DEMO.store_owner.fullName, storeName: DEMO.store_owner.storeName });
      }
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Could not open the demo account.');
      setLoading(false);
    }
  };

  const isOwner = step === 'store_owner';

  return (
    <div className="clay-page relative min-h-screen w-full flex items-center justify-center px-4 py-16 overflow-hidden">
      <MinionsBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="clay w-20 h-20 rounded-[28px] flex items-center justify-center mb-6">
            <Pizza className="w-9 h-9 text-amber-500" />
          </motion.div>
          <h1 className="text-4xl font-black text-stone-800 tracking-tight">Welcome to MiSlice</h1>
          <p className="text-stone-400 text-sm mt-3 font-medium">Compare pizza prices across Michigan.</p>
        </div>

        {/* Card */}
        <div className="clay rounded-[2.5rem] p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {step === 'choose' ? (
              <motion.div key="choose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <p className="text-center text-stone-500 text-sm font-medium mb-2">How would you like to continue?</p>

                <button onClick={() => { setStep('customer'); reset(); }}
                  className="clay-btn w-full bg-white p-5 flex items-center gap-4 text-left group">
                  <div className="clay-soft w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-stone-800">Customer</p>
                    <p className="text-xs text-stone-400 mt-0.5">Order pizza, compare prices, track delivery.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                <button onClick={() => { setStep('store_owner'); reset(); }}
                  className="clay-btn w-full bg-white p-5 flex items-center gap-4 text-left group">
                  <div className="clay-soft w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
                    <Store className="w-7 h-7 text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-stone-800">Store Owner</p>
                    <p className="text-xs text-stone-400 mt-0.5">Manage your menu, prices, deals & orders.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0" />
                </button>

                {/* Saved demo logins */}
                <div className="pt-5 mt-3 border-t border-stone-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" /> Quick access · saved logins
                  </p>
                  {error && <div className="mb-3 p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-2xl">{error}</div>}
                  <div className="space-y-2.5">
                    <button onClick={() => useDemo('customer')} disabled={loading}
                      className="clay-inset w-full flex items-center gap-3 px-4 py-3 text-left disabled:opacity-60">
                      <span className="text-lg">👤</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-700 truncate">{DEMO.customer.email}</p>
                        <p className="text-[10px] text-stone-400">Demo customer · tap to enter</p>
                      </div>
                      {loading ? <Loader2 className="w-4 h-4 text-amber-500 animate-spin" /> : <ArrowRight className="w-4 h-4 text-stone-300" />}
                    </button>
                    <button onClick={() => useDemo('store_owner')} disabled={loading}
                      className="clay-inset w-full flex items-center gap-3 px-4 py-3 text-left disabled:opacity-60">
                      <span className="text-lg">🏪</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-700 truncate">{DEMO.store_owner.email}</p>
                        <p className="text-[10px] text-stone-400">Demo store owner · tap to enter</p>
                      </div>
                      {loading ? <Loader2 className="w-4 h-4 text-amber-500 animate-spin" /> : <ArrowRight className="w-4 h-4 text-stone-300" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-3 text-center">Password for both: <span className="font-bold text-stone-600">Demo1234</span></p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <button onClick={goChoose} className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-stone-700 transition-colors mb-6">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className={`clay-soft w-12 h-12 rounded-2xl flex items-center justify-center ${isOwner ? 'text-sky-500' : 'text-amber-500'}`}>
                    {isOwner ? <Store className="w-6 h-6" /> : <User className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-stone-800">{isOwner ? 'Store Owner' : 'Customer'}</h2>
                    <p className="text-stone-400 text-xs">{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
                  </div>
                </div>

                {/* Mode toggle */}
                <div className="clay-inset flex gap-1 p-1.5 mb-6">
                  {(['login', 'signup'] as Mode[]).map(m => (
                    <button key={m} type="button" onClick={() => { setMode(m); reset(); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${mode === m ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                      {m === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                  ))}
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-2xl">{error}</div>}
                {notice && <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-2xl">{notice}</div>}

                <form onSubmit={submit} className="space-y-3.5">
                  {mode === 'signup' && <Field icon={User} placeholder="Full name" value={fullName} onChange={setFullName} required />}
                  {mode === 'signup' && isOwner && <Field icon={Store} placeholder="Store name" value={storeName} onChange={setStoreName} required />}
                  <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} required />
                  {mode === 'signup' && <Field icon={Phone} placeholder="Phone (optional)" value={phone} onChange={setPhone} />}
                  <Field icon={Lock} type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={setPassword} required minLength={6}
                    trailing={<button type="button" onClick={() => setShowPw(s => !s)} className="text-stone-400 hover:text-stone-700">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />

                  <button type="submit" disabled={loading}
                    className="clay-accent w-full py-4 mt-1 text-stone-900 font-black flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  {mode === 'login' && (
                    <button type="button" onClick={onForgot} className="w-full text-[11px] font-bold text-stone-400 hover:text-stone-700 transition-colors pt-1 flex items-center justify-center gap-1">
                      <KeyRound className="w-3 h-3" /> Forgot password?
                    </button>
                  )}
                </form>

                {!isOwner && (
                  <>
                    <div className="flex items-center gap-3 my-5">
                      <div className="h-px flex-1 bg-stone-100" />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">or</span>
                      <div className="h-px flex-1 bg-stone-100" />
                    </div>
                    <button type="button" onClick={onGoogle} disabled={loading}
                      className="clay-btn w-full bg-white py-3.5 text-sm font-bold text-stone-700 flex items-center justify-center gap-3 disabled:opacity-60">
                      <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                      Continue with Google
                    </button>
                  </>
                )}

                <button type="button" onClick={() => useDemo(isOwner ? 'store_owner' : 'customer')} disabled={loading}
                  className="w-full mt-4 text-[11px] font-bold text-stone-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-1.5">
                  <Zap className="w-3 h-3" /> Use demo {isOwner ? 'store' : 'customer'} account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-stone-300 text-[10px] font-bold mt-8">MiSlice © 2026 · Michigan</p>
      </div>
    </div>
  );
}

// Claymorphism input with soft inset + amber focus
function Field({ icon: Icon, value, onChange, trailing, ...rest }: {
  icon: React.ElementType; value: string; onChange: (v: string) => void; trailing?: React.ReactNode;
  type?: string; placeholder?: string; required?: boolean; minLength?: number;
}) {
  return (
    <div className="clay-inset flex items-center gap-2.5 px-4 transition-all focus-within:ring-2 focus-within:ring-amber-300/60">
      <Icon className="w-4 h-4 text-stone-400 shrink-0" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent py-3.5 text-stone-800 text-sm placeholder-stone-400 outline-none"
        {...rest}
      />
      {trailing}
    </div>
  );
}
