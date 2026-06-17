import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Mic, X, Clock, TrendingUp, Star, Zap, ArrowRight, Sparkles, Bot } from 'lucide-react';
import { MARKETPLACE_STORES } from '../data/marketplace';

// ── Types ────────────────────────────────────────────────────────────────────

interface SmartSearchBarProps {
  onSearch: (query: string, parsed?: ParsedQuery) => void;
  onLocationChange?: (loc: string) => void;
  location?: string;
}

export interface ParsedQuery {
  partySize?: number;
  budget?: number;
  maxDeliveryTime?: number;
  toppings?: string[];
  crust?: string;
  size?: string;
  dietary?: string[];
  sortBy?: 'price' | 'rating' | 'speed';
  rawQuery: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const ROTATING_PLACEHOLDERS = [
  '🍕 Find the cheapest Pepperoni Pizza',
  '🍕 Large pizza under $20',
  '🍕 Best pizza near me',
  '🍕 Vegan pizza open now',
  '🍕 Pizza for 10 people',
  '🍕 Fastest delivery right now',
  '🍕 BBQ Chicken with thin crust',
  '🍕 Cheapest pizza with free delivery',
];

const TRENDING = [
  { label: 'Pepperoni Pizza', icon: '🔥', count: '2.3k orders' },
  { label: 'BBQ Chicken', icon: '⚡', count: '1.8k orders' },
  { label: 'Shamz Pizza', icon: '🌟', count: '1.4k orders' },
  { label: 'Free Delivery', icon: '🚗', count: '890 searches' },
  { label: 'Vegan pizza', icon: '🌱', count: '620 orders' },
  ...MARKETPLACE_STORES.filter(s => s.trendScore > 80).slice(0, 2).map(s => ({
    label: s.name,
    icon: s.emoji,
    count: `${s.reviewCount.toLocaleString()} reviews`,
  })),
];

const SUGGESTION_MAP: Record<string, string[]> = {
  pep: ['Pepperoni Pizza', 'Pepperoni Pizza Deals', 'Pepperoni Pizza under $15', 'Pepperoni + Cheese Combo'],
  piz: ['Pizza for 2', 'Pizza Deals Near Me', 'Pizza under $12', 'Pizza with Free Delivery'],
  veg: ['Veggie Supreme', 'Vegan Pizza Options', 'Veggie + Extra Cheese', 'Vegetarian Special'],
  bbb: ['BBQ Chicken Pizza', 'BBQ Beef Pizza', 'BBQ + Jalapeño Pizza'],
  bbq: ['BBQ Chicken Pizza', 'BBQ Beef Pizza', 'BBQ + Jalapeño Pizza'],
  che: ['Cheese Pizza', 'Cheese + Pepperoni', 'Cheesy Garlic Bread Deal'],
  mea: ['Meat Lovers', 'Meat Feast Pizza', 'Meat + Mushroom Combo'],
  chi: ['Chicken Pizza', 'Chicken + Bacon Pizza', 'Chicken BBQ Special'],
  lar: ['Large Pizza Deals', 'Large + Sides Combo', 'Large under $20'],
  thi: ['Thin Crust Pepperoni', 'Thin Crust Margherita', 'Thin + Crispy Combo'],
};

const AI_PATTERNS: { pattern: RegExp; extract: (m: RegExpMatchArray) => Partial<ParsedQuery> }[] = [
  { pattern: /(\d+)\s*people/i, extract: m => ({ partySize: parseInt(m[1]) }) },
  { pattern: /under\s*\$?(\d+)/i, extract: m => ({ budget: parseInt(m[1]) }) },
  { pattern: /\$(\d+)\s*budget/i, extract: m => ({ budget: parseInt(m[1]) }) },
  { pattern: /(\d+)\s*min/i, extract: m => ({ maxDeliveryTime: parseInt(m[1]) }) },
  { pattern: /vegan|vegetarian/i, extract: () => ({ dietary: ['vegan'] }) },
  { pattern: /thin\s*crust/i, extract: () => ({ crust: 'Thin Crust' }) },
  { pattern: /large/i, extract: () => ({ size: 'Large' }) },
  { pattern: /pepperoni/i, extract: () => ({ toppings: ['Pepperoni'] }) },
  { pattern: /fastest|quick|asap/i, extract: () => ({ sortBy: 'speed' as const }) },
  { pattern: /cheapest|cheap|deal/i, extract: () => ({ sortBy: 'price' as const }) },
  { pattern: /best|rated|top/i, extract: () => ({ sortBy: 'rating' as const }) },
];

function parseQuery(raw: string): ParsedQuery {
  const q: ParsedQuery = { rawQuery: raw };
  for (const { pattern, extract } of AI_PATTERNS) {
    const m = raw.match(pattern);
    if (m) Object.assign(q, extract(m));
  }
  return q;
}

function getAIInsight(q: ParsedQuery): string | null {
  if (q.partySize && q.budget) return `Finding ${q.partySize} pizzas under $${q.budget} total ($${(q.budget / q.partySize).toFixed(0)}/person)`;
  if (q.partySize) return `Looking for enough pizza for ${q.partySize} people`;
  if (q.budget) return `Filtering stores with total under $${q.budget}`;
  if (q.maxDeliveryTime) return `Showing stores delivering in under ${q.maxDeliveryTime} mins`;
  if (q.dietary?.includes('vegan')) return `Filtering for vegan-friendly options`;
  if (q.sortBy === 'speed') return `Ranked by fastest estimated delivery`;
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SmartSearchBar({ onSearch, onLocationChange, location = 'Detroit, MI' }: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('miSliceRecentSearches') || '[]'); } catch { return []; }
  });
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [micActive, setMicActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Rotating placeholder
  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % ROTATING_PLACEHOLDERS.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Live suggestions
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setAiInsight(null); return; }
    const key = query.toLowerCase().slice(0, 3);
    setSuggestions(SUGGESTION_MAP[key] || []);
    const parsed = parseQuery(query);
    setAiInsight(getAIInsight(parsed));
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    const parsed = parseQuery(q);
    // Save to recent
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('miSliceRecentSearches', JSON.stringify(updated));
    setExpanded(false);
    onSearch(q, parsed);
  }, [onSearch, recentSearches]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(query); };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('miSliceRecentSearches');
  };

  const hasDropdown = expanded && (query.length === 0 || suggestions.length > 0 || aiInsight);

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto z-30">
      {/* Glow */}
      <motion.div
        animate={{ opacity: expanded ? 1 : 0.4, scale: expanded ? 1.05 : 1 }}
        className="absolute inset-0 bg-gradient-to-r from-orange-500/25 via-red-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none"
      />

      <form onSubmit={handleSubmit}>
        {/* Search pill */}
        <motion.div
          layout
          animate={{ borderRadius: hasDropdown ? '20px 20px 0 0' : '9999px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="flex items-center bg-black/50 backdrop-blur-2xl border border-white/20 relative z-10 transition-shadow"
          style={{ boxShadow: expanded ? '0 0 40px rgba(255,80,0,0.2), 0 20px 60px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)' }}
          onClick={() => { setExpanded(true); inputRef.current?.focus(); }}
        >
          {/* Location pill */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onLocationChange?.(location); }}
            className="flex items-center gap-1.5 px-4 py-2 border-r border-white/10 text-stone-300 hover:text-white transition-colors shrink-0 group hidden sm:flex"
          >
            <MapPin className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold whitespace-nowrap">{location}</span>
          </button>

          {/* Input */}
          <div className="flex-1 flex items-center px-4 py-1">
            <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setExpanded(true)}
                onKeyDown={e => { if (e.key === 'Escape') setExpanded(false); }}
                className="w-full bg-transparent text-white font-medium focus:outline-none py-3.5 pr-6 text-base"
                placeholder=""
              />
              {/* Animated placeholder */}
              {!query && (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIdx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: placeholderVisible ? 1 : 0, y: placeholderVisible ? 0 : -8 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-y-0 left-0 flex items-center text-stone-500 font-medium text-base pointer-events-none select-none"
                  >
                    {ROTATING_PLACEHOLDERS[placeholderIdx]}
                  </motion.span>
                </AnimatePresence>
              )}
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mic */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMicActive(v => !v); }}
            className="p-2.5 mx-1 text-stone-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <motion.div animate={{ scale: micActive ? [1, 1.2, 1] : 1 }} transition={{ repeat: micActive ? Infinity : 0, duration: 0.8 }}>
              <Mic className={`w-5 h-5 ${micActive ? 'text-red-400' : ''}`} />
            </motion.div>
          </button>

          {/* Search button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black py-3.5 px-7 rounded-full shadow-[0_0_20px_rgba(255,50,0,0.4)] transition-all mr-1.5 text-sm"
          >
            Search
          </button>
        </motion.div>
      </form>

      {/* Dropdown panel */}
      <AnimatePresence>
        {hasDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-0 right-0 bg-black/70 backdrop-blur-3xl border border-white/15 border-t-0 rounded-b-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-20"
          >
            {/* AI insight banner */}
            <AnimatePresence>
              {aiInsight && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-violet-600/20 to-blue-600/10 border-b border-white/8">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <p className="text-violet-300 text-xs font-bold">{aiInsight}</p>
                    <button
                      type="button"
                      onClick={() => doSearch(query)}
                      className="ml-auto flex items-center gap-1 text-[10px] font-black text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full hover:bg-violet-500/20 transition-colors shrink-0"
                    >
                      Apply <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Suggestions when typing */}
            {query.length > 0 && suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    type="button"
                    onClick={() => { setQuery(s); doSearch(s); }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/8 text-left transition-colors group"
                  >
                    <Search className="w-4 h-4 text-stone-600 group-hover:text-stone-400 transition-colors shrink-0" />
                    <span className="text-sm text-stone-300 group-hover:text-white transition-colors">
                      {s.startsWith(query) ? (
                        <><strong className="text-white">{query}</strong>{s.slice(query.length)}</>
                      ) : s}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-700 group-hover:text-stone-400 ml-auto transition-colors" />
                  </motion.button>
                ))}
              </div>
            )}

            {/* Empty state — trending + recent */}
            {query.length === 0 && (
              <div className="py-3">
                {/* Recent */}
                {recentSearches.length > 0 && (
                  <div className="mb-1">
                    <div className="flex items-center justify-between px-5 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Recent Searches</p>
                      <button type="button" onClick={clearRecent} className="text-[10px] font-bold text-stone-600 hover:text-red-400 transition-colors">Clear</button>
                    </div>
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setQuery(s); doSearch(s); }}
                        className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-white/6 text-left transition-colors group"
                      >
                        <Clock className="w-4 h-4 text-stone-600 group-hover:text-stone-400 transition-colors shrink-0" />
                        <span className="text-sm text-stone-400 group-hover:text-white transition-colors">{s}</span>
                      </button>
                    ))}
                    <div className="mx-5 my-2 border-t border-white/6" />
                  </div>
                )}

                {/* Trending */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-5 py-2">Trending Now</p>
                  {TRENDING.map((t, i) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => { setQuery(t.label); doSearch(t.label); }}
                      className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-white/6 text-left transition-colors group"
                    >
                      <span className="text-lg shrink-0">{t.icon}</span>
                      <span className="text-sm text-stone-300 group-hover:text-white transition-colors flex-1">{t.label}</span>
                      <span className="text-[10px] font-bold text-stone-600 group-hover:text-stone-400">{t.count}</span>
                    </button>
                  ))}
                </div>

                {/* AI prompt hint */}
                <div className="mx-4 mt-3 mb-1 p-3 bg-gradient-to-r from-violet-600/10 to-transparent border border-violet-500/15 rounded-xl flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                  <p className="text-xs text-stone-400">
                    Try <span className="text-violet-300 font-bold">"pizza for 6 people under $50"</span> or <span className="text-violet-300 font-bold">"fastest vegan pizza"</span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
