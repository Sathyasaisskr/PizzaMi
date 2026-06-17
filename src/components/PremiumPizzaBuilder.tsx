import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'motion/react';
import {
  ShoppingCart, Heart, Sparkles, RotateCcw, ChevronRight,
  Star, Clock, ExternalLink, Zap, Award, TrendingDown, Check, Plus, Minus,
} from 'lucide-react';
import { PizzaConfig, Size, Crust, Sauce, CartItem } from '../types';
import { Pizza3DBuilder } from './Pizza3DBuilder';
import { MARKETPLACE_STORES } from '../data/marketplace';

// ── Static data ───────────────────────────────────────────────────────────────

const SIZES: { value: Size; label: string; inch: string; base: number; ring: string; glow: string }[] = [
  { value: 'Small', label: 'S', inch: '8"', base: 9.99, ring: 'ring-sky-400', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.5)]' },
  { value: 'Medium', label: 'M', inch: '10"', base: 11.99, ring: 'ring-violet-400', glow: 'shadow-[0_0_20px_rgba(167,139,250,0.5)]' },
  { value: 'Large', label: 'L', inch: '12"', base: 14.99, ring: 'ring-orange-400', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.5)]' },
  { value: 'Extra Large', label: 'XL', inch: '14"', base: 17.99, ring: 'ring-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]' },
];

const CRUSTS: { value: Crust; emoji: string; desc: string }[] = [
  { value: 'Hand Tossed', emoji: '👋', desc: 'Classic & Airy' },
  { value: 'Crunchy Thin Crust', emoji: '✂️', desc: 'Light & Crispy' },
  { value: 'Handmade Pan', emoji: '🍳', desc: 'Thick & Chewy' },
  { value: 'Parmesan Stuffed Crust', emoji: '🧀', desc: 'Extra Cheesy' },
  { value: 'Brooklyn Style', emoji: '🗽', desc: 'NY Foldable' },
  { value: 'New York Style', emoji: '🍕', desc: 'Authentic NY' },
  { value: 'Gluten Free Crust', emoji: '🌾', desc: 'GF Friendly' },
];

const SAUCES: { value: Sauce; color: string; label: string; short: string }[] = [
  { value: 'Robust Inspired Tomato Sauce', color: 'bg-red-600', label: 'Robust Tomato', short: 'Tomato' },
  { value: 'Hearty Marinara', color: 'bg-red-800', label: 'Hearty Marinara', short: 'Marinara' },
  { value: 'BBQ Sauce', color: 'bg-amber-700', label: 'BBQ Sauce', short: 'BBQ' },
  { value: 'Garlic Parmesan White Sauce', color: 'bg-amber-200', label: 'Garlic Parmesan', short: 'White' },
  { value: 'Alfredo Sauce', color: 'bg-yellow-100', label: 'Alfredo', short: 'Alfredo' },
  { value: 'Buffalo Sauce', color: 'bg-orange-500', label: 'Buffalo Hot', short: 'Buffalo' },
  { value: 'Ranch Sauce', color: 'bg-stone-200', label: 'Ranch', short: 'Ranch' },
  { value: 'No Sauce', color: 'bg-stone-800', label: 'No Sauce', short: 'None' },
];

const TOPPINGS: { label: string; emoji: string; category: 'meat' | 'veggie' | 'cheese'; color: string }[] = [
  { label: 'Pepperoni', emoji: '🍕', category: 'meat', color: 'border-red-500/50 bg-red-500/10 text-red-300' },
  { label: 'Italian Sausage', emoji: '🌭', category: 'meat', color: 'border-orange-500/50 bg-orange-500/10 text-orange-300' },
  { label: 'Beef', emoji: '🥩', category: 'meat', color: 'border-amber-600/50 bg-amber-600/10 text-amber-300' },
  { label: 'Ham', emoji: '🍖', category: 'meat', color: 'border-pink-500/50 bg-pink-500/10 text-pink-300' },
  { label: 'Bacon', emoji: '🥓', category: 'meat', color: 'border-red-400/50 bg-red-400/10 text-red-200' },
  { label: 'Grilled Chicken', emoji: '🍗', category: 'meat', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300' },
  { label: 'Premium Chicken', emoji: '🐔', category: 'meat', color: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-200' },
  { label: 'Philly Steak', emoji: '🥩', category: 'meat', color: 'border-amber-700/50 bg-amber-700/10 text-amber-400' },
  { label: 'Mushrooms', emoji: '🍄', category: 'veggie', color: 'border-stone-500/50 bg-stone-500/10 text-stone-300' },
  { label: 'Onions', emoji: '🧅', category: 'veggie', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
  { label: 'Green Peppers', emoji: '🫑', category: 'veggie', color: 'border-green-500/50 bg-green-500/10 text-green-300' },
  { label: 'Black Olives', emoji: '🫒', category: 'veggie', color: 'border-stone-600/50 bg-stone-600/10 text-stone-400' },
  { label: 'Spinach', emoji: '🥬', category: 'veggie', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
  { label: 'Tomatoes', emoji: '🍅', category: 'veggie', color: 'border-red-400/50 bg-red-400/10 text-red-200' },
  { label: 'Banana Peppers', emoji: '🌶️', category: 'veggie', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300' },
  { label: 'Jalapenos', emoji: '🌶️', category: 'veggie', color: 'border-green-600/50 bg-green-600/10 text-green-400' },
  { label: 'Pineapple', emoji: '🍍', category: 'veggie', color: 'border-yellow-400/50 bg-yellow-400/10 text-yellow-200' },
  { label: 'Roasted Red Peppers', emoji: '🌶️', category: 'veggie', color: 'border-red-500/50 bg-red-500/10 text-red-300' },
  { label: 'Mozzarella', emoji: '🧀', category: 'cheese', color: 'border-yellow-300/50 bg-yellow-300/10 text-yellow-200' },
  { label: 'Extra Cheese', emoji: '🧀', category: 'cheese', color: 'border-amber-400/50 bg-amber-400/10 text-amber-200' },
  { label: 'Cheddar Blend', emoji: '🧀', category: 'cheese', color: 'border-orange-400/50 bg-orange-400/10 text-orange-200' },
  { label: 'Feta', emoji: '🧀', category: 'cheese', color: 'border-stone-300/50 bg-stone-300/10 text-stone-200' },
];

const AI_SUGGESTIONS = [
  { label: '🔥 Most Popular', config: { meats: ['Pepperoni'], veggies: [], cheese: ['Mozzarella', 'Extra Cheese'] } },
  { label: '🥩 Meat Lover', config: { meats: ['Pepperoni', 'Italian Sausage', 'Beef', 'Bacon'], veggies: [], cheese: ['Mozzarella'] } },
  { label: '🌱 Veggie Delight', config: { meats: [], veggies: ['Mushrooms', 'Onions', 'Green Peppers', 'Spinach'], cheese: ['Mozzarella', 'Feta'] } },
  { label: '🔥 Spicy Fire', config: { meats: ['Pepperoni', 'Italian Sausage'], veggies: ['Jalapenos', 'Banana Peppers'], cheese: ['Mozzarella'] } },
];

function computeStorePrice(store: typeof MARKETPLACE_STORES[0], config: PizzaConfig): number {
  const base = store.menu.find(m => m.category === 'pizza')?.price ?? 13.99;
  const sizeMult = config.size === 'Small' ? 0.75 : config.size === 'Medium' ? 0.9 : config.size === 'Extra Large' ? 1.25 : 1;
  const toppings = (config.meats?.length || 0) * 1.5 + (config.veggies?.length || 0) * 0.8;
  return parseFloat((base * sizeMult + toppings).toFixed(2));
}

// ── Animated price counter ─────────────────────────────────────────────────────
function AnimatedPrice({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (Math.abs(value - prev.current) < 0.01) return;
    const start = prev.current;
    const end = value;
    const dur = 400;
    const startTime = performance.now();
    const frame = (now: number) => {
      const t = Math.min((now - startTime) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(parseFloat((start + (end - start) * eased).toFixed(2)));
      if (t < 1) requestAnimationFrame(frame);
      else prev.current = end;
    };
    requestAnimationFrame(frame);
  }, [value]);

  return <span className={className}>${display.toFixed(2)}</span>;
}

// ── Topping Bubble ─────────────────────────────────────────────────────────────
function ToppingBubble({ topping, selected, onToggle }: {
  topping: typeof TOPPINGS[0];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      layout
      whileHover={{ y: -3, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`relative flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-bold transition-all duration-200 ${
        selected
          ? `${topping.color} ring-1 ring-current shadow-lg scale-105`
          : 'border-white/10 bg-white/4 text-stone-400 hover:border-white/20 hover:text-stone-200'
      }`}
    >
      <span className="text-sm">{topping.emoji}</span>
      <span className="whitespace-nowrap">{topping.label}</span>
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-3.5 h-3.5 rounded-full bg-current flex items-center justify-center ml-0.5"
        >
          <Check className="w-2 h-2 text-black" />
        </motion.span>
      )}
      {selected && (
        <span className="text-[10px] text-stone-500 ml-0.5">+$1.50</span>
      )}
    </motion.button>
  );
}

// ── Store Price Row ────────────────────────────────────────────────────────────
function StorePriceRow({ store, price, rank, onOrder }: {
  store: typeof MARKETPLACE_STORES[0];
  price: number;
  rank: number;
  onOrder: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 py-2.5 px-3 rounded-2xl border transition-all ${
        rank === 0
          ? 'bg-green-500/8 border-green-500/25 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
          : 'bg-white/4 border-white/8 hover:border-white/15'
      }`}
    >
      {/* Rank */}
      <span className={`text-[10px] font-black w-5 text-center shrink-0 ${rank === 0 ? 'text-green-400' : 'text-stone-600'}`}>
        #{rank + 1}
      </span>

      {/* Logo */}
      <div className={`w-8 h-8 ${store.logoColor} rounded-xl flex items-center justify-center text-sm shrink-0 overflow-hidden`}>
        {store.id === 'shamz'
          ? <img src="/shamz-pizza-store.png" className="w-full h-full object-cover" alt="" />
          : store.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{store.name}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-yellow-400">★{store.rating}</span>
          <span className="text-stone-700">·</span>
          <span className="text-[9px] text-stone-500 flex items-center gap-0.5">
            <Clock className="w-2 h-2" />{store.deliveryTime}m
          </span>
          {store.deliveryFee === 0 && <span className="text-[9px] text-green-400 font-bold">Free</span>}
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <AnimatedPrice value={price} className={`text-sm font-black ${rank === 0 ? 'text-green-400' : 'text-white'}`} />
        {rank === 0 && <p className="text-[8px] text-green-500 font-bold">LOWEST</p>}
      </div>

      {/* Order CTA */}
      <button
        onClick={onOrder}
        className={`text-[9px] font-black px-2 py-1.5 rounded-lg border shrink-0 transition-all hover:scale-105 ${
          rank === 0
            ? 'bg-green-600 border-green-500 text-white'
            : 'bg-white/5 border-white/10 text-stone-300 hover:border-white/25'
        }`}
      >
        Order
      </button>
    </motion.div>
  );
}

// ── Main Builder ───────────────────────────────────────────────────────────────

interface PremiumPizzaBuilderProps {
  onConfigChange: (config: PizzaConfig) => void;
  currentConfig: PizzaConfig;
  onSaveFavorite: (config: PizzaConfig) => void;
  onAddToCart?: (item: Omit<CartItem, 'id'>, redirect: boolean) => void;
  defaultOpen?: boolean;
  userPreferences?: { isVegetarian: boolean; allowedMeats: string[] } | null;
}

const DEFAULT: PizzaConfig = { size: 'Large', crust: 'Hand Tossed', sauce: 'Robust Inspired Tomato Sauce', cheese: ['Mozzarella'], meats: [], veggies: [], extras: [], quantity: 1 };

export function PremiumPizzaBuilder({ onConfigChange, currentConfig, onSaveFavorite, onAddToCart }: PremiumPizzaBuilderProps) {
  const config = { ...DEFAULT, ...currentConfig, size: currentConfig.size || 'Large', crust: currentConfig.crust || 'Hand Tossed', sauce: currentConfig.sauce || 'Robust Inspired Tomato Sauce', cheese: currentConfig.cheese?.length ? currentConfig.cheese : ['Mozzarella'] };

  const [qty, setQty] = useState(config.quantity || 1);
  const [addedPulse, setAddedPulse] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'meat' | 'veggie' | 'cheese'>('meat');

  const sizeData = SIZES.find(s => s.value === config.size) || SIZES[2];
  const basePrice = sizeData.base;
  const toppingPrice = (config.meats.length + config.veggies.length) * 1.5 + config.cheese.length * 0.5;
  const totalPerPizza = basePrice + toppingPrice;
  const grandTotal = totalPerPizza * qty;

  const allSelected = [...config.meats, ...config.veggies, ...config.cheese];

  const storePrices = MARKETPLACE_STORES
    .filter(s => s.isOpen)
    .map(s => ({ store: s, price: computeStorePrice(s, config) }))
    .sort((a, b) => a.price - b.price)
    .slice(0, 6);

  const cheapestStorePrice = storePrices[0]?.price || grandTotal;

  const update = (partial: Partial<PizzaConfig>) => {
    const next = { ...config, ...partial, quantity: qty };
    onConfigChange(next);
  };

  const toggleTopping = (t: typeof TOPPINGS[0]) => {
    if (t.category === 'meat') {
      const cur = config.meats;
      update({ meats: cur.includes(t.label) ? cur.filter(x => x !== t.label) : [...cur, t.label] });
    } else if (t.category === 'veggie') {
      const cur = config.veggies;
      update({ veggies: cur.includes(t.label) ? cur.filter(x => x !== t.label) : [...cur, t.label] });
    } else {
      const cur = config.cheese;
      update({ cheese: cur.includes(t.label) ? cur.filter(x => x !== t.label) : [...cur, t.label] });
    }
  };

  const isSelected = (t: typeof TOPPINGS[0]) => {
    if (t.category === 'meat') return config.meats.includes(t.label);
    if (t.category === 'veggie') return config.veggies.includes(t.label);
    return config.cheese.includes(t.label);
  };

  const applyAI = (idx: number) => {
    const s = AI_SUGGESTIONS[idx].config;
    update({ meats: s.meats, veggies: s.veggies, cheese: s.cheese });
  };

  const addToCart = () => {
    if (!onAddToCart) return;
    onAddToCart({
      store_id: 'custom',
      store_name: 'Custom Build',
      item_name: `${config.size} ${config.crust} Pizza`,
      config: { ...config, quantity: qty },
      quantity: qty,
      price_per_item: totalPerPizza,
      total_price: grandTotal,
      delivery_type: 'store-delivery' as any,
    }, false);
    setAddedPulse(true);
    setTimeout(() => setAddedPulse(false), 1200);
  };

  const filteredToppings = TOPPINGS.filter(t => t.category === activeCategory);

  return (
    <div className="w-full">
      {/* AI Quick-Pick row */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-stone-600 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Quick Pick
        </span>
        {AI_SUGGESTIONS.map((s, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => applyAI(i)}
            className="shrink-0 text-[10px] font-bold text-stone-300 bg-white/5 border border-white/10 hover:border-orange-500/30 hover:text-orange-300 px-3 py-1.5 rounded-xl transition-all"
          >
            {s.label}
          </motion.button>
        ))}
      </div>

      {/* 3-col desktop / stacked mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] gap-6">

        {/* ── LEFT: Pizza Preview ── */}
        <div className="lg:sticky lg:top-24 h-fit space-y-4">
          {/* Pizza visual */}
          <div className="bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-square max-w-[220px] mx-auto">
              <motion.div
                key={allSelected.join(',')}
                animate={{ rotate: [0, 3, -2, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Pizza3DBuilder config={config} />
              </motion.div>
              {/* Glow underneath */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-36 h-8 bg-orange-500/20 blur-2xl rounded-full" />
            </div>

            {/* Pizza name */}
            <div className="mt-4 text-center">
              <p className="text-sm font-black text-white leading-tight">
                {config.size} {config.crust}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5">{config.sauce}</p>
              {allSelected.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {allSelected.slice(0, 5).map(t => (
                    <span key={t} className="text-[9px] bg-white/8 border border-white/10 px-1.5 py-0.5 rounded-md text-stone-400">{t}</span>
                  ))}
                  {allSelected.length > 5 && (
                    <span className="text-[9px] bg-white/8 border border-white/10 px-1.5 py-0.5 rounded-md text-stone-500">+{allSelected.length - 5} more</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Price summary card */}
          <div className="bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-stone-400">
                <span>Base ({config.size})</span>
                <span className="font-bold text-white">${basePrice.toFixed(2)}</span>
              </div>
              {toppingPrice > 0 && (
                <div className="flex justify-between text-stone-400">
                  <span>Toppings ({config.meats.length + config.veggies.length + config.cheese.length})</span>
                  <span className="font-bold text-white">+${toppingPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-2.5 flex justify-between">
                <span className="font-black text-white">Per Pizza</span>
                <AnimatedPrice value={totalPerPizza} className="font-black text-orange-400 text-base" />
              </div>

              {/* Qty */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-stone-400">Quantity</span>
                <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl px-3 py-1.5">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-stone-400 hover:text-white transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-white font-black text-sm w-4 text-center">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(10, q + 1))} className="text-stone-400 hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-2.5 flex justify-between items-center">
                <span className="font-black text-white text-base">Total</span>
                <AnimatedPrice value={grandTotal} className="font-black text-2xl text-white" />
              </div>

              {cheapestStorePrice < grandTotal && (
                <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-bold bg-green-500/8 border border-green-500/20 rounded-xl px-3 py-1.5">
                  <TrendingDown className="w-3 h-3" />
                  Save ${(grandTotal - cheapestStorePrice).toFixed(2)} ordering from a store
                </div>
              )}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={addToCart}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all ${
                  addedPulse
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-[0_0_20px_rgba(255,80,0,0.35)] border border-orange-400/30'
                }`}
              >
                {addedPulse ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart · <AnimatedPrice value={grandTotal} /></>}
              </motion.button>
              <button
                onClick={() => onSaveFavorite(config)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-bold text-xs border border-white/10 bg-white/5 hover:border-red-500/30 hover:text-red-400 text-stone-400 transition-all"
              >
                <Heart className="w-3.5 h-3.5" /> Save as Favourite
              </button>
            </div>
          </div>
        </div>

        {/* ── CENTER: Builder Controls ── */}
        <div className="space-y-6">

          {/* Size Bubbles */}
          <div className="bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">Pizza Size</p>
            <div className="grid grid-cols-4 gap-3">
              {SIZES.map(s => (
                <motion.button
                  key={s.value}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => update({ size: s.value })}
                  className={`relative flex flex-col items-center gap-1 py-4 px-2 rounded-2xl border-2 transition-all duration-200 ${
                    config.size === s.value
                      ? `border-orange-400/70 bg-orange-500/12 ${s.glow}`
                      : 'border-white/8 bg-white/4 hover:border-white/20'
                  }`}
                >
                  {config.size === s.value && (
                    <motion.div
                      layoutId="size-selected"
                      className="absolute inset-0 rounded-2xl bg-orange-500/8"
                    />
                  )}
                  <span className="text-2xl font-black text-white relative z-10">{s.label}</span>
                  <span className="text-[10px] text-stone-500 relative z-10">{s.inch}</span>
                  <span className={`text-[10px] font-black relative z-10 ${config.size === s.value ? 'text-orange-400' : 'text-stone-400'}`}>${s.base}</span>
                  {config.size === s.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center z-20"
                    >
                      <Check className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Crust Cards */}
          <div className="bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">Crust Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CRUSTS.map(c => (
                <motion.button
                  key={c.value}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => update({ crust: c.value })}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-2xl border transition-all text-left ${
                    config.crust === c.value
                      ? 'border-violet-400/50 bg-violet-500/12 shadow-[0_0_15px_rgba(167,139,250,0.2)]'
                      : 'border-white/8 bg-white/4 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">{c.emoji}</span>
                  <div>
                    <p className={`text-[11px] font-black truncate ${config.crust === c.value ? 'text-violet-300' : 'text-white'}`}>{c.value.replace(' Crust', '').replace(' Style', '')}</p>
                    <p className="text-[9px] text-stone-500">{c.desc}</p>
                  </div>
                  {config.crust === c.value && (
                    <Check className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sauce Swatches */}
          <div className="bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">Sauce</p>
            <div className="flex flex-wrap gap-2.5">
              {SAUCES.map(s => (
                <motion.button
                  key={s.value}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => update({ sauce: s.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all ${
                    config.sauce === s.value
                      ? 'border-white/40 bg-white/12 text-white shadow-lg'
                      : 'border-white/8 bg-white/4 text-stone-400 hover:border-white/20 hover:text-stone-200'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${s.color} shadow-sm border border-white/20 shrink-0`} />
                  <span className="text-[11px] font-bold">{s.short}</span>
                  {config.sauce === s.value && <Check className="w-3 h-3 text-white" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          <div className="bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Category tabs */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Toppings</p>
              <div className="flex gap-1 bg-white/5 border border-white/8 p-1 rounded-xl">
                {(['meat', 'veggie', 'cheese'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all capitalize ${
                      activeCategory === cat
                        ? 'bg-white/15 text-white'
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    {cat === 'meat' ? '🥩 Meats' : cat === 'veggie' ? '🥬 Veggies' : '🧀 Cheese'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {filteredToppings.map(t => (
                  <ToppingBubble
                    key={t.label}
                    topping={t}
                    selected={isSelected(t)}
                    onToggle={() => toggleTopping(t)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {allSelected.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
                <span className="text-[10px] text-stone-500">{allSelected.length} toppings · +${toppingPrice.toFixed(2)}</span>
                <button
                  onClick={() => update({ meats: [], veggies: [], cheese: ['Mozzarella'], extras: [] })}
                  className="text-[10px] font-bold text-stone-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset toppings
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT: Live Price Comparison ── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-gradient-to-br from-white/6 to-white/2 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black text-white">Live Prices</p>
                <p className="text-[9px] text-stone-500 mt-0.5">Updates as you build</p>
              </div>
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-1 text-[9px] font-bold text-green-400"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Live
              </motion.div>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {storePrices.map((s, i) => (
                  <StorePriceRow
                    key={s.store.id}
                    store={s.store}
                    price={s.price}
                    rank={i}
                    onOrder={() => {
                      if (onAddToCart) {
                        onAddToCart({
                          store_id: s.store.id,
                          store_name: s.store.name,
                          item_name: `${config.size} Pizza from ${s.store.name}`,
                          config: { ...config, quantity: qty },
                          quantity: qty,
                          price_per_item: s.price,
                          total_price: s.price * qty,
                          delivery_type: 'store-delivery' as any,
                        }, true);
                      }
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Savings summary */}
            <div className="mt-4 pt-3 border-t border-white/8">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-stone-500">Most expensive</span>
                <AnimatedPrice value={storePrices[storePrices.length - 1]?.price || 0} className="text-[10px] font-bold text-stone-400 line-through" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-stone-500">Cheapest</span>
                <AnimatedPrice value={storePrices[0]?.price || 0} className="text-[10px] font-black text-green-400" />
              </div>
              <div className="mt-2 bg-green-500/8 border border-green-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <Zap className="w-3 h-3 text-green-400 shrink-0" />
                <p className="text-[9px] text-green-300 font-bold">
                  Save up to ${(((storePrices[storePrices.length - 1]?.price || 0) - (storePrices[0]?.price || 0)) * qty).toFixed(2)} by choosing the cheapest option
                </p>
              </div>
            </div>

            {/* AI Trending hint */}
            <div className="mt-3 p-3 bg-violet-500/8 border border-violet-500/20 rounded-2xl">
              <p className="text-[9px] font-black text-violet-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Insight
              </p>
              <p className="text-[10px] text-stone-400 leading-relaxed">
                {config.meats.includes('Pepperoni')
                  ? 'Customers who added Pepperoni also love Extra Cheese 🧀'
                  : config.veggies.length > 2
                  ? 'Great veggie combo! Try adding Feta for the full Italian experience 🧀'
                  : allSelected.length === 0
                  ? 'Start adding toppings to see personalised suggestions 🍕'
                  : `${config.size} pizzas with ${allSelected.length} toppings are trending right now 🔥`}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
