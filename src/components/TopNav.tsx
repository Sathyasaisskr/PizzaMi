import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, ShoppingCart, Heart, Pizza } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface TopNavProps {
  isLight: boolean;
  setIsLight: (val: boolean) => void;
  cartItemCount: number;
  onCartClick: () => void;
  onFavoritesClick: () => void;
  onLogoClick: () => void;
}

function NavBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(239,68,68,0.6)] border border-[#080808]"
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function TopNav({ isLight, setIsLight, cartItemCount, onCartClick, onFavoritesClick, onLogoClick }: TopNavProps) {
  const { state } = useApp();
  const favoriteCount = state.favoriteStoreIds.size;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-center justify-between px-4 py-3 pointer-events-auto">

        {/* Left — logo (mobile only, hidden on lg where sidebar shows) */}
        <button
          onClick={onLogoClick}
          className="lg:hidden flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 hover:border-white/20 transition-colors"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(255,80,0,0.4)]">
            <Pizza className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-sm tracking-tight">MiSlice</span>
        </button>

        {/* Desktop spacer (sidebar takes left side) */}
        <div className="hidden lg:block" />

        {/* Right — actions */}
        <div className="flex items-center gap-2">

          {/* Favourites */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onFavoritesClick}
            className="relative flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/10 hover:border-red-500/40 rounded-2xl px-3.5 py-2.5 transition-all group"
            title="Favourites"
          >
            <Heart className={`w-4 h-4 transition-colors ${favoriteCount > 0 ? 'fill-red-500 text-red-500' : 'text-stone-400 group-hover:text-red-400'}`} />
            <AnimatePresence mode="wait">
              {favoriteCount > 0 && (
                <motion.span
                  key={favoriteCount}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-xs font-black text-red-400 overflow-hidden whitespace-nowrap"
                >
                  {favoriteCount}
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-xs font-bold text-stone-400 group-hover:text-white transition-colors hidden sm:inline">
              Favourites
            </span>
            <NavBadge count={0} />
          </motion.button>

          {/* Cart */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onCartClick}
            className={`relative flex items-center gap-2 backdrop-blur-xl border rounded-2xl px-3.5 py-2.5 transition-all group ${
              cartItemCount > 0
                ? 'bg-red-600/20 border-red-500/50 hover:bg-red-600/30'
                : 'bg-black/50 border-white/10 hover:border-orange-500/40'
            }`}
            title="Cart"
          >
            <ShoppingCart className={`w-4 h-4 transition-colors ${cartItemCount > 0 ? 'text-red-400' : 'text-stone-400 group-hover:text-orange-400'}`} />
            <AnimatePresence mode="wait">
              {cartItemCount > 0 && (
                <motion.span
                  key={cartItemCount}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="text-xs font-black text-red-300"
                >
                  {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
                </motion.span>
              )}
            </AnimatePresence>
            <span className={`text-xs font-bold transition-colors hidden sm:inline ${cartItemCount > 0 ? 'text-red-300' : 'text-stone-400 group-hover:text-white'}`}>
              Cart
            </span>
            <NavBadge count={cartItemCount} />
          </motion.button>

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsLight(!isLight)}
            className="w-10 h-10 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 hover:border-white/25 flex items-center justify-center text-stone-400 hover:text-white transition-all"
            title="Toggle theme"
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </motion.button>

        </div>
      </div>
    </div>
  );
}
