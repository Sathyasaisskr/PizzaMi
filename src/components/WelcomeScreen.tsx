import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pizza, User, Store, ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onCustomerSignIn: (name: string) => void;
  onStoreOwnerSignIn: () => void;
}

export function WelcomeScreen({ onCustomerSignIn, onStoreOwnerSignIn }: WelcomeScreenProps) {
  const [step, setStep] = useState<'choose' | 'customer'>('choose');
  const [name, setName] = useState('');

  const continueAsCustomer = (guest = false) => {
    onCustomerSignIn(guest ? 'Guest' : (name.trim() || 'Guest'));
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-5 py-12 bg-[#080808] overflow-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-orange-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-24 w-[32rem] h-[32rem] rounded-full bg-red-600/12 blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,80,0,0.45)] mb-5">
            <Pizza className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-2 glass-soft text-stone-300 text-[10px] font-black px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3 h-3 text-orange-300" /> Michigan's Pizza Price Comparison
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Welcome to MiSlice</h1>
          <p className="text-stone-400 text-sm mt-2">Choose how you'd like to continue.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'choose' ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              {/* Customer */}
              <button
                onClick={() => setStep('customer')}
                className="w-full liquid-glass rounded-3xl p-6 flex items-center gap-4 text-left group hover:border-white/25 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6 text-orange-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white">Sign in as Customer</p>
                  <p className="text-xs text-stone-400 mt-0.5">Compare prices, order pizza, track delivery & earn rewards.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>

              {/* Store owner */}
              <button
                onClick={onStoreOwnerSignIn}
                className="w-full glass rounded-3xl p-6 flex items-center gap-4 text-left group hover:border-white/25 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl glass-soft flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-white">Sign in as Store Owner</p>
                  <p className="text-xs text-stone-400 mt-0.5">Manage your store, menu, prices, deals & live orders.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-stone-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="glass rounded-3xl p-7"
            >
              <button
                onClick={() => setStep('choose')}
                className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-white transition-colors mb-5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(255,80,0,0.4)]">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Customer Sign In</h2>
                  <p className="text-stone-500 text-xs">Tell us your name to personalize MiSlice.</p>
                </div>
              </div>

              <form onSubmit={e => { e.preventDefault(); continueAsCustomer(); }} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 block mb-2">Your Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Alex"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-stone-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-black bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white transition-all shadow-[0_10px_30px_-8px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => continueAsCustomer(true)}
                  className="w-full text-xs font-bold text-stone-500 hover:text-stone-300 transition-colors pt-1"
                >
                  Continue as guest
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-stone-700 text-[10px] font-bold mt-8">MiSlice © 2026 · Michigan</p>
      </div>
    </div>
  );
}
