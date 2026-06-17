import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Pizza, Tag, Store, Settings, LogOut,
  Plus, Trash2, Edit2, Check, X, Upload, Image, FileText,
  ExternalLink, DollarSign, Clock, ShoppingBag, TrendingUp,
  Globe, Phone, MapPin, Camera, ToggleLeft, ToggleRight,
  Menu as MenuIcon, Percent, Zap, Coffee, Salad, IceCream,
  Star, Eye, Save, RotateCcw, Truck, BarChart3, Package,
  Bell, ChevronRight, RefreshCcw, Users, Award, AlertCircle,
  QrCode, Link2, CheckCircle, XCircle, Loader2, ArrowUpRight,
  Bike, Car, ChefHat, Timer, TrendingDown, Activity,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreTab = 'overview' | 'orders' | 'menu' | 'deals' | 'delivery' | 'analytics' | 'profile' | 'settings';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Pizza' | 'Toppings' | 'Sides' | 'Drinks' | 'Desserts' | 'Specials';
  photo?: string;
  tags: string[];
  available: boolean;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  discountType: 'percent' | 'fixed' | 'bogo' | 'free_delivery';
  discountValue: number;
  code: string;
  expiresAt: string;
  active: boolean;
}

interface StoreProfile {
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  logo?: string;
  hours: { day: string; open: string; close: string; closed: boolean }[];
  menuPdf?: string;
  menuPdfName?: string;
  acceptingOrders: boolean;
}

interface LiveOrder {
  id: string;
  customerName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryType: 'delivery' | 'pickup';
  deliveryPartner?: string;
  placedAt: string;
  address?: string;
  notes?: string;
}

interface DeliveryIntegration {
  id: string;
  name: string;
  logo: string;
  color: string;
  connected: boolean;
  commission: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  dashboardUrl: string;
  setupUrl: string;
  description: string;
  features: string[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_HOURS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  .map(day => ({ day, open: '11:00', close: '22:00', closed: false }));

const DEFAULT_MENU: MenuItem[] = [
  { id: '1', name: 'Margherita', description: 'Classic tomato, mozzarella, fresh basil', price: 12.99, category: 'Pizza', tags: ['Vegetarian'], available: true },
  { id: '2', name: 'Pepperoni Special', description: 'Double pepperoni, mozzarella, tomato sauce', price: 14.99, category: 'Pizza', tags: ['Bestseller'], available: true },
  { id: '3', name: 'BBQ Chicken', description: 'Grilled chicken, BBQ sauce, red onion, cilantro', price: 15.99, category: 'Pizza', tags: ['Popular'], available: true },
  { id: '4', name: 'Garlic Bread', description: 'Toasted with garlic butter and herbs', price: 4.99, category: 'Sides', tags: [], available: true },
  { id: '5', name: 'Caesar Salad', description: 'Romaine, parmesan, croutons, caesar dressing', price: 7.99, category: 'Sides', tags: ['Vegetarian'], available: true },
  { id: '6', name: 'Pepperoni', description: 'Extra pepperoni topping', price: 1.99, category: 'Toppings', tags: [], available: true },
  { id: '7', name: 'Mozzarella', description: 'Fresh mozzarella cheese', price: 1.49, category: 'Toppings', tags: ['Vegetarian'], available: true },
  { id: '8', name: 'Coca-Cola', description: '375ml can', price: 2.99, category: 'Drinks', tags: [], available: true },
  { id: '9', name: 'Tiramisu', description: 'Homemade Italian classic', price: 6.99, category: 'Desserts', tags: [], available: true },
];

const DEFAULT_DEALS: Deal[] = [
  { id: '1', title: 'Tuesday 2-for-1', description: 'Buy any large pizza, get a medium free every Tuesday.', discountType: 'bogo', discountValue: 0, code: 'TUE2FOR1', expiresAt: '2026-12-31', active: true },
  { id: '2', title: 'Lunch Special', description: 'Any slice + drink for $6.99 Mon–Fri 11am–2pm.', discountType: 'fixed', discountValue: 3, code: 'LUNCH699', expiresAt: '2026-12-31', active: true },
];

const SIMULATED_ORDERS: LiveOrder[] = [
  { id: 'ord-001', customerName: 'Alex M.', items: [{ name: 'Pepperoni Special', qty: 2, price: 14.99 }, { name: 'Coca-Cola', qty: 2, price: 2.99 }], total: 35.96, status: 'new', deliveryType: 'delivery', deliveryPartner: 'DoorDash', placedAt: new Date(Date.now() - 3 * 60000).toISOString(), address: '482 Michigan Ave, Detroit', notes: 'Extra napkins please' },
  { id: 'ord-002', customerName: 'Jordan K.', items: [{ name: 'Margherita', qty: 1, price: 12.99 }, { name: 'Caesar Salad', qty: 1, price: 7.99 }], total: 20.98, status: 'preparing', deliveryType: 'pickup', placedAt: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'ord-003', customerName: 'Sam R.', items: [{ name: 'BBQ Chicken', qty: 1, price: 15.99 }, { name: 'Garlic Bread', qty: 2, price: 4.99 }], total: 25.97, status: 'ready', deliveryType: 'delivery', deliveryPartner: 'Uber Eats', placedAt: new Date(Date.now() - 22 * 60000).toISOString(), address: '104 Woodward Ave, Detroit' },
  { id: 'ord-004', customerName: 'Taylor P.', items: [{ name: 'Pepperoni Special', qty: 3, price: 14.99 }], total: 44.97, status: 'out_for_delivery', deliveryType: 'delivery', deliveryPartner: 'Grubhub', placedAt: new Date(Date.now() - 38 * 60000).toISOString(), address: '215 W. Congress St, Detroit' },
  { id: 'ord-005', customerName: 'Morgan L.', items: [{ name: 'Tiramisu', qty: 2, price: 6.99 }, { name: 'Margherita', qty: 1, price: 12.99 }], total: 26.97, status: 'delivered', deliveryType: 'delivery', deliveryPartner: 'DoorDash', placedAt: new Date(Date.now() - 65 * 60000).toISOString(), address: '700 Brush St, Detroit' },
];

const DELIVERY_INTEGRATIONS: DeliveryIntegration[] = [
  {
    id: 'doordash', name: 'DoorDash', logo: '🔴', color: 'text-red-400 bg-red-500/10 border-red-500/20',
    connected: true, commission: 30, ordersThisMonth: 142, revenueThisMonth: 2847.50,
    dashboardUrl: 'https://restaurant.doordash.com', setupUrl: 'https://get.doordash.com/en-us/products/merchant',
    description: 'America\'s largest delivery platform. Reach millions of customers with DoorDash integration.',
    features: ['Order Management', 'Menu Sync', 'Real-time tracking', 'Commission reports', 'DashPass customers'],
  },
  {
    id: 'ubereats', name: 'Uber Eats', logo: '⬛', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    connected: true, commission: 30, ordersThisMonth: 98, revenueThisMonth: 1923.10,
    dashboardUrl: 'https://restaurants.ubereats.com', setupUrl: 'https://merchants.ubereats.com',
    description: 'Global reach with Uber\'s delivery network. Access Uber One subscribers and high-value customers.',
    features: ['Real-time order stream', 'Menu management', 'Promotions', 'Customer analytics', 'Uber One deals'],
  },
  {
    id: 'grubhub', name: 'Grubhub', logo: '🟠', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    connected: false, commission: 15, ordersThisMonth: 0, revenueThisMonth: 0,
    dashboardUrl: 'https://restaurant.grubhub.com', setupUrl: 'https://restaurant.grubhub.com/sign-up',
    description: 'Lower commission rates with Grubhub\'s pay-per-order model. No monthly fees.',
    features: ['Pay-per-order model', 'Lower commission', 'Email marketing', 'Menu optimization', 'Loyalty program'],
  },
  {
    id: 'slice', name: 'Slice', logo: '🍕', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    connected: false, commission: 10, ordersThisMonth: 0, revenueThisMonth: 0,
    dashboardUrl: 'https://slicelife.com/restaurants', setupUrl: 'https://slicelife.com/partners',
    description: 'Built specifically for independent pizza shops. Lowest commissions of any major platform.',
    features: ['Pizza-specific tools', '10% commission only', 'Customer data ownership', 'Built-in loyalty', 'Free website'],
  },
  {
    id: 'direct', name: 'In-House Delivery', logo: '🚗', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    connected: true, commission: 0, ordersThisMonth: 34, revenueThisMonth: 952.80,
    dashboardUrl: '#', setupUrl: '#',
    description: 'Your own delivery fleet. Keep 100% of the order value with zero commission fees.',
    features: ['Zero commission', 'Full customer data', 'Custom delivery zones', 'Direct customer contact', 'MiSlice integration'],
  },
];

const CATEGORY_ICONS: Record<string, React.FC<any>> = {
  Pizza, Toppings: Star, Sides: Salad, Drinks: Coffee, Desserts: IceCream, Specials: Zap,
};

const CATEGORY_COLORS: Record<string, string> = {
  Pizza: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Toppings: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  Sides: 'text-green-400 bg-green-500/10 border-green-500/20',
  Drinks: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  Desserts: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  Specials: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const ORDER_STATUS_STYLES: Record<LiveOrder['status'], { label: string; color: string; icon: React.FC<any> }> = {
  new: { label: 'New Order', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', icon: Bell },
  preparing: { label: 'Preparing', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25', icon: ChefHat },
  ready: { label: 'Ready', color: 'text-green-400 bg-green-500/10 border-green-500/25', icon: CheckCircle },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-400 bg-orange-500/10 border-orange-500/25', icon: Bike },
  delivered: { label: 'Delivered', color: 'text-stone-400 bg-stone-500/10 border-stone-500/25', icon: Check },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10 border-red-500/25', icon: XCircle },
};

const ORDER_NEXT_STATUS: Partial<Record<LiveOrder['status'], LiveOrder['status']>> = {
  new: 'preparing',
  preparing: 'ready',
  ready: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function save(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }

function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
  });
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-white mb-0.5">{value}</p>
      <p className="text-xs font-bold text-stone-500">{label}</p>
      {sub && <p className="text-[10px] text-stone-600 mt-1">{sub}</p>}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${on ? 'bg-red-600' : 'bg-stone-700'}`}>
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${on ? 'left-7' : 'left-1'}`} />
    </button>
  );
}

function PhotoUpload({ value, onChange, label = 'Upload Photo', small = false }: { value?: string; onChange: (b64: string) => void; label?: string; small?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
    onChange(await fileToBase64(f));
  };
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className={`relative group rounded-xl overflow-hidden border border-white/10 ${small ? 'w-16 h-16' : 'w-full h-40'}`}>
          <img src={value} alt="upload" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => ref.current?.click()} className="text-white bg-white/20 p-1.5 rounded-lg"><Camera className="w-4 h-4" /></button>
            <button type="button" onClick={() => onChange('')} className="text-red-400 bg-white/20 p-1.5 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className={`border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center text-stone-500 hover:border-red-500/50 hover:text-stone-300 transition-colors ${small ? 'w-16 h-16 gap-0.5' : 'w-full h-40 gap-2'}`}>
          <Image className={small ? 'w-5 h-5' : 'w-7 h-7'} />
          {!small && <span className="text-xs font-bold">{label}</span>}
        </button>
      )}
    </div>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-stone-600 focus:outline-none focus:border-red-500/50 [color-scheme:dark]";
const LABEL = "text-[10px] font-black uppercase tracking-widest text-stone-500 block mb-2";
const SECTION = "bg-[#111] border border-white/8 rounded-2xl p-6";

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function StoreOwnerDashboard({ storeName, onLogout }: { storeName: string; onLogout: () => void }) {
  const [tab, setTab] = useState<StoreTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [menu, setMenu] = useState<MenuItem[]>(() => load(`menu_${storeName}`, DEFAULT_MENU));
  const [deals, setDeals] = useState<Deal[]>(() => load(`deals_${storeName}`, DEFAULT_DEALS));
  const [profile, setProfile] = useState<StoreProfile>(() => load(`profile_${storeName}`, {
    name: storeName, tagline: 'Best pizza in town', description: '', address: '', phone: '', website: '',
    hours: DEFAULT_HOURS, acceptingOrders: true,
  }));
  const [orders, setOrders] = useState<LiveOrder[]>(() => load(`orders_${storeName}`, SIMULATED_ORDERS));
  const [integrations, setIntegrations] = useState<DeliveryIntegration[]>(() => load(`integrations_${storeName}`, DELIVERY_INTEGRATIONS));

  useEffect(() => save(`menu_${storeName}`, menu), [menu, storeName]);
  useEffect(() => save(`deals_${storeName}`, deals), [deals, storeName]);
  useEffect(() => save(`profile_${storeName}`, profile), [profile, storeName]);
  useEffect(() => save(`orders_${storeName}`, orders), [orders, storeName]);
  useEffect(() => save(`integrations_${storeName}`, integrations), [integrations, storeName]);

  const [toast, setToast] = useState('');
  const showToast = useCallback((m: string) => { setToast(m); setTimeout(() => setToast(''), 2500); }, []);

  const newOrderCount = orders.filter(o => o.status === 'new').length;

  const navItems: { id: StoreTab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders', icon: Package, badge: newOrderCount },
    { id: 'menu', label: 'Menu Manager', icon: MenuIcon },
    { id: 'deals', label: 'Deals & Coupons', icon: Tag },
    { id: 'delivery', label: 'Delivery Partners', icon: Truck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Store Profile', icon: Store },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const updateOrderStatus = (id: string, status: LiveOrder['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    showToast(`Order updated to "${ORDER_STATUS_STYLES[status].label}"`);
  };

  const resetMenuToDefaults = () => {
    setMenu(DEFAULT_MENU);
    showToast('Menu reset to defaults.');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex font-sans">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
          {toast}
        </div>
      )}

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0d0d0d] border-r border-white/8 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            {profile.logo ? (
              <img src={profile.logo} alt="logo" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
            ) : (
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                {storeName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-black text-sm truncate">{profile.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${profile.acceptingOrders ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-[10px] font-bold ${profile.acceptingOrders ? 'text-green-400' : 'text-red-400'}`}>
                  {profile.acceptingOrders ? 'Open for Orders' : 'Store Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative ${active ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'text-stone-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto text-[9px] font-black bg-yellow-500 text-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/8 space-y-1">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-stone-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <p className="text-center text-stone-700 text-[10px] font-bold py-1">MiSlice Partner Portal v2</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/8 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-stone-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-white">{navItems.find(n => n.id === tab)?.label}</h1>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">{profile.name} · Partner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {newOrderCount > 0 && (
              <button onClick={() => setTab('orders')} className="flex items-center gap-2 text-xs font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-3 py-1.5 rounded-xl animate-pulse">
                <Bell className="w-3.5 h-3.5" /> {newOrderCount} new order{newOrderCount !== 1 ? 's' : ''}
              </button>
            )}
            <div className={`flex items-center gap-2 text-xs font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl ${profile.acceptingOrders ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${profile.acceptingOrders ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {profile.acceptingOrders ? 'Open' : 'Closed'}
            </div>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Visit Site
              </a>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
          {tab === 'overview' && <OverviewTab menu={menu} deals={deals} profile={profile} setProfile={setProfile} orders={orders} integrations={integrations} onNavigate={setTab} />}
          {tab === 'orders' && <OrdersTab orders={orders} onUpdateStatus={updateOrderStatus} showToast={showToast} />}
          {tab === 'menu' && <MenuTab menu={menu} setMenu={setMenu} profile={profile} setProfile={setProfile} showToast={showToast} />}
          {tab === 'deals' && <DealsTab deals={deals} setDeals={setDeals} showToast={showToast} />}
          {tab === 'delivery' && <DeliveryTab integrations={integrations} setIntegrations={setIntegrations} showToast={showToast} />}
          {tab === 'analytics' && <AnalyticsTab menu={menu} orders={orders} integrations={integrations} />}
          {tab === 'profile' && <ProfileTab profile={profile} setProfile={setProfile} showToast={showToast} />}
          {tab === 'settings' && <SettingsTab profile={profile} setProfile={setProfile} showToast={showToast} onLogout={onLogout} onResetMenu={resetMenuToDefaults} />}
        </main>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ menu, deals, profile, setProfile, orders, integrations, onNavigate }: {
  menu: MenuItem[]; deals: Deal[]; profile: StoreProfile; setProfile: React.Dispatch<React.SetStateAction<StoreProfile>>;
  orders: LiveOrder[]; integrations: DeliveryIntegration[]; onNavigate: (tab: StoreTab) => void;
}) {
  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const connectedPartners = integrations.filter(i => i.connected);
  const totalRevenue = integrations.reduce((sum, i) => sum + i.revenueThisMonth, 0);
  const totalOrders = integrations.reduce((sum, i) => sum + i.ordersThisMonth, 0) + orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      {profile.logo && (
        <div className="relative rounded-2xl overflow-hidden border border-white/8 h-48 sm:h-56">
          <img src={profile.logo} alt={profile.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-black text-white drop-shadow-lg">{profile.name}</h2>
            <p className="text-stone-300 text-sm font-medium mt-0.5">{profile.tagline}</p>
            {profile.address && <p className="text-stone-400 text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.address}</p>}
          </div>
          <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border backdrop-blur ${profile.acceptingOrders ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-red-500/20 border-red-500/30 text-red-300'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${profile.acceptingOrders ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {profile.acceptingOrders ? 'Open' : 'Closed'}
          </div>
        </div>
      )}

      {/* Quick order toggle */}
      <div className={`flex items-center justify-between p-5 rounded-2xl border ${profile.acceptingOrders ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div>
          <p className="font-black text-white">Accepting Orders</p>
          <p className="text-sm text-stone-400 mt-0.5">{profile.acceptingOrders ? 'Your store is live and receiving orders.' : 'Your store is hidden from customers.'}</p>
        </div>
        <Toggle on={profile.acceptingOrders} onChange={() => setProfile(p => ({ ...p, acceptingOrders: !p.acceptingOrders }))} />
      </div>

      {/* Active orders alert */}
      {activeOrders.length > 0 && (
        <button onClick={() => onNavigate('orders')} className="w-full flex items-center justify-between p-4 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl hover:bg-yellow-500/12 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/15 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-left">
              <p className="text-yellow-300 font-black text-sm">{activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''} in progress</p>
              <p className="text-yellow-600 text-xs">{orders.filter(o => o.status === 'new').length} awaiting acceptance</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Pizza} label="Menu Items" value={`${menu.filter(i => i.available).length}/${menu.length}`} sub="available" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
        <StatCard icon={Tag} label="Active Deals" value={deals.filter(d => d.active).length.toString()} sub={`${deals.length} total`} color="bg-purple-500/10 text-purple-400 border-purple-500/20" />
        <StatCard icon={DollarSign} label="Revenue (Month)" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} sub={`${totalOrders} orders`} color="bg-green-500/10 text-green-400 border-green-500/20" />
        <StatCard icon={Truck} label="Partners" value={`${connectedPartners.length}/${integrations.length}`} sub="connected" color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
      </div>

      {/* Partner revenue breakdown */}
      {connectedPartners.length > 0 && (
        <div className={SECTION}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white text-sm">Revenue by Partner</h3>
            <button onClick={() => onNavigate('delivery')} className="text-[10px] font-bold text-stone-500 hover:text-white flex items-center gap-1">Manage <ChevronRight className="w-3 h-3" /></button>
          </div>
          <div className="space-y-3">
            {connectedPartners.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-lg shrink-0">{p.logo}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    <span className="text-xs font-black text-green-400">${p.revenueThisMonth.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${totalRevenue ? (p.revenueThisMonth / totalRevenue) * 100 : 0}%` }} />
                  </div>
                  <p className="text-[9px] text-stone-600 mt-0.5">{p.ordersThisMonth} orders · {p.commission}% commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu snapshot */}
      <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="font-black text-white text-sm">Menu Snapshot</h3>
          <button onClick={() => onNavigate('menu')} className="text-[10px] font-bold text-stone-500 hover:text-white flex items-center gap-1">Edit <ChevronRight className="w-3 h-3" /></button>
        </div>
        <div className="divide-y divide-white/5">
          {menu.slice(0, 5).map(item => (
            <div key={item.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.photo
                  ? <img src={item.photo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  : <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs ${CATEGORY_COLORS[item.category]}`}>{item.category[0]}</div>}
                <div>
                  <p className={`text-sm font-bold ${item.available ? 'text-white' : 'text-stone-500 line-through'}`}>{item.name}</p>
                  <p className="text-[10px] text-stone-500">{item.category}</p>
                </div>
              </div>
              <p className="text-green-400 font-black text-sm">${item.price.toFixed(2)}</p>
            </div>
          ))}
          {menu.length > 5 && <div className="px-5 py-3 text-xs text-stone-500 font-bold">+ {menu.length - 5} more items</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab({ orders, onUpdateStatus, showToast }: {
  orders: LiveOrder[];
  onUpdateStatus: (id: string, status: LiveOrder['status']) => void;
  showToast: (m: string) => void;
}) {
  const [filter, setFilter] = useState<LiveOrder['status'] | 'all'>('all');
  const statuses: (LiveOrder['status'] | 'all')[] = ['all', 'new', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts: Record<string, number> = {};
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  return (
    <div className="space-y-5">
      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {statuses.map(s => {
          const style = s === 'all' ? null : ORDER_STATUS_STYLES[s];
          const count = s === 'all' ? orders.length : (counts[s] || 0);
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter === s ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-stone-400 border-white/10 hover:border-white/20 hover:text-white'}`}
            >
              {s === 'all' ? 'All' : style?.label} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Order cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#111] rounded-2xl border border-white/8">
          <Package className="w-8 h-8 mx-auto text-stone-600 mb-3" />
          <p className="text-stone-500 font-bold">No orders to show.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const statusInfo = ORDER_STATUS_STYLES[order.status];
            const StatusIcon = statusInfo.icon;
            const nextStatus = ORDER_NEXT_STATUS[order.status];
            return (
              <div key={order.id} className={`bg-[#111] border rounded-2xl p-5 transition-all ${order.status === 'new' ? 'border-yellow-500/25 shadow-[0_0_20px_rgba(234,179,8,0.08)]' : 'border-white/8'}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-white">{order.customerName}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {statusInfo.label}
                      </span>
                      <span className="text-[9px] font-bold text-stone-500 bg-white/5 border border-white/8 px-1.5 py-0.5 rounded">
                        {order.deliveryType === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                      </span>
                      {order.deliveryPartner && (
                        <span className="text-[9px] font-bold text-stone-400 bg-white/5 border border-white/8 px-1.5 py-0.5 rounded">
                          via {order.deliveryPartner}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-600 font-bold">#{order.id} · {timeAgo(order.placedAt)}</p>
                    {order.address && <p className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{order.address}</p>}
                    {order.notes && <p className="text-[10px] text-stone-500 mt-0.5 italic">"{order.notes}"</p>}
                  </div>
                  <p className="font-black text-white text-lg shrink-0">${order.total.toFixed(2)}</p>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-stone-400">
                      <span>{item.qty}× {item.name}</span>
                      <span className="font-bold">${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap border-t border-white/8 pt-4">
                  {nextStatus && (
                    <button
                      onClick={() => onUpdateStatus(order.id, nextStatus)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      {nextStatus === 'preparing' && 'Accept & Start Preparing'}
                      {nextStatus === 'ready' && 'Mark Ready'}
                      {nextStatus === 'out_for_delivery' && 'Send for Delivery'}
                      {nextStatus === 'delivered' && 'Mark Delivered'}
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'cancelled')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-400 hover:text-red-400 bg-white/5 border border-white/10 hover:border-red-500/30 transition-colors"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 px-3 py-2">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Menu Tab ─────────────────────────────────────────────────────────────────

const CATEGORIES = ['Pizza', 'Toppings', 'Sides', 'Drinks', 'Desserts', 'Specials'] as const;

function MenuTab({ menu, setMenu, profile, setProfile, showToast }: {
  menu: MenuItem[]; setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  profile: StoreProfile; setProfile: React.Dispatch<React.SetStateAction<StoreProfile>>;
  showToast: (m: string) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<Partial<MenuItem>>({ category: 'Pizza', available: true, tags: [] });
  const [tagInput, setTagInput] = useState('');
  const pdfRef = useRef<HTMLInputElement>(null);

  const filtered = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

  const startEdit = (item: MenuItem) => { setEditingId(item.id); setForm({ ...item }); setShowAddForm(true); };
  const resetForm = () => { setForm({ category: 'Pizza', available: true, tags: [] }); setTagInput(''); setEditingId(null); setShowAddForm(false); };

  const saveItem = () => {
    if (!form.name?.trim() || !form.price) { showToast('Name and price are required.'); return; }
    const item: MenuItem = {
      id: editingId || Date.now().toString(),
      name: form.name!, description: form.description || '', price: Number(form.price),
      category: form.category as MenuItem['category'], photo: form.photo, tags: form.tags || [], available: form.available ?? true,
    };
    if (editingId) { setMenu(prev => prev.map(i => i.id === editingId ? item : i)); showToast('Item updated!'); }
    else { setMenu(prev => [...prev, item]); showToast('Item added!'); }
    resetForm();
  };

  const addTag = () => { if (tagInput.trim()) { setForm(p => ({ ...p, tags: [...(p.tags || []), tagInput.trim()] })); setTagInput(''); } };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 5 * 1024 * 1024) { showToast('PDF must be under 5MB'); return; }
    const b64 = await fileToBase64(f);
    setProfile(p => ({ ...p, menuPdf: b64, menuPdfName: f.name }));
    showToast('Menu PDF uploaded!');
  };

  return (
    <div className="space-y-5">
      {/* PDF strip */}
      <div className="bg-[#111] border border-white/8 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/20"><FileText className="w-5 h-5" /></div>
          <div><p className="text-white font-bold text-sm">Menu PDF</p><p className="text-stone-500 text-xs">{profile.menuPdfName || 'No PDF uploaded'}</p></div>
        </div>
        <div className="flex items-center gap-3">
          {profile.menuPdf && <a href={profile.menuPdf} download={profile.menuPdfName || 'menu.pdf'} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl"><Eye className="w-3.5 h-3.5" /> Preview</a>}
          <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
          <button onClick={() => pdfRef.current?.click()} className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" /> {profile.menuPdf ? 'Replace PDF' : 'Upload PDF'}
          </button>
          {profile.menuPdf && <button onClick={() => setProfile(p => ({ ...p, menuPdf: undefined, menuPdfName: undefined }))} className="text-stone-500 hover:text-red-400 p-2"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      {/* Category filter + add button */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${activeCategory === cat ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-stone-400 border-white/10 hover:border-white/20 hover:text-white'}`}>
            {cat} {cat !== 'All' && <span className="opacity-60">({menu.filter(i => i.category === cat).length})</span>}
          </button>
        ))}
        <button onClick={() => { resetForm(); setShowAddForm(true); }} className="ml-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      {/* Add/Edit form */}
      {showAddForm && (
        <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-black">{editingId ? 'Edit Item' : 'New Menu Item'}</h3>
            <button onClick={resetForm} className="text-stone-500 hover:text-white p-1"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-1 row-span-2">
              <label className={LABEL}>Item Photo</label>
              <PhotoUpload value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} label="Upload Item Photo" />
            </div>
            <div><label className={LABEL}>Item Name *</label><input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Pepperoni Pizza" className={INPUT} /></div>
            <div>
              <label className={LABEL}>Price *</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">$</span>
                <input type="number" step="0.01" min="0" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) }))} placeholder="0.00" className={INPUT + " pl-7"} /></div>
            </div>
          </div>
          <div><label className={LABEL}>Description</label><textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description..." rows={2} className={INPUT + " resize-none"} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))} className={INPUT}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Tags</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Vegetarian..." className={INPUT} />
                <button type="button" onClick={addTag} className="px-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20"><Plus className="w-4 h-4" /></button>
              </div>
              {(form.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(form.tags || []).map(t => (
                    <span key={t} className="text-[10px] font-bold bg-white/10 text-stone-300 border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
                      {t}<button onClick={() => setForm(p => ({ ...p, tags: (p.tags || []).filter(x => x !== t) }))}><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <div className="flex items-center gap-3">
              <Toggle on={form.available ?? true} onChange={() => setForm(p => ({ ...p, available: !p.available }))} />
              <span className="text-sm font-bold text-stone-300">Available to order</span>
            </div>
            <div className="flex gap-3">
              <button onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-400 hover:text-white bg-white/5 border border-white/10">Cancel</button>
              <button onClick={saveItem} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2">
                <Save className="w-4 h-4" /> {editingId ? 'Save Changes' : 'Add to Menu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#111] rounded-2xl border border-white/8">
          <Pizza className="w-8 h-8 mx-auto text-stone-600 mb-3" />
          <p className="text-stone-500 font-bold">No items in this category.</p>
          <button onClick={() => { resetForm(); setShowAddForm(true); }} className="mt-3 text-red-500 text-sm font-bold hover:underline">Add the first item</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const CatIcon = CATEGORY_ICONS[item.category] || Pizza;
            return (
              <div key={item.id} className={`bg-[#111] border rounded-2xl overflow-hidden transition-all ${item.available ? 'border-white/8' : 'border-white/4 opacity-60'}`}>
                <div className="flex items-center gap-4 p-4">
                  {item.photo
                    ? <img src={item.photo} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                    : <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${CATEGORY_COLORS[item.category]}`}><CatIcon className="w-6 h-6" /></div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white text-sm">{item.name}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[item.category]}`}>{item.category}</span>
                      {item.tags.map(t => <span key={t} className="text-[9px] font-bold bg-white/8 text-stone-400 border border-white/10 px-1.5 py-0.5 rounded">{t}</span>)}
                    </div>
                    {item.description && <p className="text-stone-500 text-xs mt-0.5 truncate">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-green-400 font-black">${item.price.toFixed(2)}</p>
                    <Toggle on={item.available} onChange={() => setMenu(prev => prev.map(i => i.id === item.id ? { ...i, available: !i.available } : i))} />
                    <button onClick={() => startEdit(item)} className="text-stone-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { setMenu(prev => prev.filter(i => i.id !== item.id)); showToast('Item removed.'); }} className="text-stone-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Deals Tab ────────────────────────────────────────────────────────────────

function DealsTab({ deals, setDeals, showToast }: { deals: Deal[]; setDeals: React.Dispatch<React.SetStateAction<Deal[]>>; showToast: (m: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Deal>>({ discountType: 'percent', discountValue: 10, active: true, expiresAt: '' });

  const resetForm = () => { setForm({ discountType: 'percent', discountValue: 10, active: true, expiresAt: '' }); setEditId(null); setShowForm(false); };

  const saveDeal = () => {
    if (!form.title?.trim()) { showToast('Title is required'); return; }
    const deal: Deal = {
      id: editId || Date.now().toString(), title: form.title!, description: form.description || '',
      discountType: form.discountType as Deal['discountType'], discountValue: Number(form.discountValue || 0),
      code: form.code || form.title!.toUpperCase().replace(/\s+/g, '').slice(0, 10),
      expiresAt: form.expiresAt || '', active: form.active ?? true,
    };
    if (editId) { setDeals(prev => prev.map(d => d.id === editId ? deal : d)); showToast('Deal updated!'); }
    else { setDeals(prev => [...prev, deal]); showToast('Deal created!'); }
    resetForm();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-stone-400 text-sm">{deals.filter(d => d.active).length} active · {deals.length} total</p>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Deal
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-black">{editId ? 'Edit Deal' : 'New Deal'}</h3>
            <button onClick={resetForm} className="text-stone-500 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={LABEL}>Deal Title *</label><input value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Tuesday 2-for-1" className={INPUT} /></div>
            <div><label className={LABEL}>Coupon Code</label><input value={form.code || ''} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="AUTO-GENERATED" className={INPUT + " font-mono"} /></div>
          </div>
          <div><label className={LABEL}>Description</label><textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Describe the deal..." className={INPUT + " resize-none"} /></div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Discount Type</label>
              <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as any }))} className={INPUT}>
                <option value="percent">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
                <option value="bogo">Buy 1 Get 1 Free</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>
            {(form.discountType === 'percent' || form.discountType === 'fixed') && (
              <div><label className={LABEL}>{form.discountType === 'percent' ? 'Percentage' : 'Amount ($)'}</label>
                <input type="number" min="0" value={form.discountValue || ''} onChange={e => setForm(p => ({ ...p, discountValue: parseFloat(e.target.value) }))} className={INPUT} /></div>
            )}
            <div><label className={LABEL}>Expiry Date</label><input type="date" value={form.expiresAt || ''} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className={INPUT} /></div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/8">
            <div className="flex items-center gap-3">
              <Toggle on={form.active ?? true} onChange={() => setForm(p => ({ ...p, active: !p.active }))} />
              <span className="text-sm font-bold text-stone-300">Active immediately</span>
            </div>
            <div className="flex gap-3">
              <button onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-bold text-stone-400 bg-white/5 border border-white/10">Cancel</button>
              <button onClick={saveDeal} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-2">
                <Save className="w-4 h-4" /> {editId ? 'Save' : 'Create Deal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deals.length === 0 ? (
        <div className="text-center py-16 bg-[#111] rounded-2xl border border-white/8"><Tag className="w-8 h-8 mx-auto text-stone-600 mb-3" /><p className="text-stone-500 font-bold">No deals yet.</p></div>
      ) : (
        <div className="space-y-3">
          {deals.map(deal => (
            <div key={deal.id} className={`bg-[#111] border rounded-2xl p-5 transition-all ${deal.active ? 'border-white/8' : 'border-white/4 opacity-50'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-black text-white">{deal.title}</p>
                    {deal.active ? <span className="text-[9px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded">ACTIVE</span>
                      : <span className="text-[9px] font-black text-stone-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">PAUSED</span>}
                    <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded">
                      {deal.discountType === 'bogo' ? 'BOGO' : deal.discountType === 'free_delivery' ? 'FREE DEL' : deal.discountType === 'percent' ? `${deal.discountValue}%` : `$${deal.discountValue}`} OFF
                    </span>
                  </div>
                  {deal.description && <p className="text-stone-400 text-sm mb-2">{deal.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-mono font-bold">
                    <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg">{deal.code}</span>
                    {deal.expiresAt && <span>Expires {deal.expiresAt}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Toggle on={deal.active} onChange={() => setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, active: !d.active } : d))} />
                  <button onClick={() => { setForm({ ...deal }); setEditId(deal.id); setShowForm(true); }} className="text-stone-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { setDeals(prev => prev.filter(d => d.id !== deal.id)); showToast('Deal removed.'); }} className="text-stone-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Delivery Partners Tab ─────────────────────────────────────────────────────

function DeliveryTab({ integrations, setIntegrations, showToast }: {
  integrations: DeliveryIntegration[];
  setIntegrations: React.Dispatch<React.SetStateAction<DeliveryIntegration[]>>;
  showToast: (m: string) => void;
}) {
  const [connecting, setConnecting] = useState<string | null>(null);

  const toggleConnection = async (id: string) => {
    const partner = integrations.find(i => i.id === id);
    if (!partner) return;
    if (partner.connected) {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false, ordersThisMonth: 0, revenueThisMonth: 0 } : i));
      showToast(`Disconnected from ${partner.name}`);
    } else {
      setConnecting(id);
      await new Promise(r => setTimeout(r, 1500));
      setConnecting(null);
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true } : i));
      showToast(`Connected to ${partner.name}! 🎉`);
    }
  };

  const connected = integrations.filter(i => i.connected);
  const disconnected = integrations.filter(i => !i.connected);
  const totalRevenue = connected.reduce((s, i) => s + i.revenueThisMonth, 0);
  const totalOrders = connected.reduce((s, i) => s + i.ordersThisMonth, 0);
  const avgCommission = connected.length ? (connected.reduce((s, i) => s + i.commission, 0) / connected.length).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Link2} label="Partners Connected" value={`${connected.length}/${integrations.length}`} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
        <StatCard icon={DollarSign} label="Combined Revenue" value={`$${totalRevenue.toFixed(0)}`} sub="this month" color="bg-green-500/10 text-green-400 border-green-500/20" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders.toString()} sub={`avg ${avgCommission}% commission`} color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
      </div>

      {/* Connected partners */}
      {connected.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Connected ({connected.length})
          </h3>
          <div className="space-y-4">
            {connected.map(partner => (
              <DeliveryPartnerCard key={partner.id} partner={partner} connecting={connecting === partner.id} onToggle={() => toggleConnection(partner.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Not connected */}
      {disconnected.length > 0 && (
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Available to Connect ({disconnected.length})
          </h3>
          <div className="space-y-4">
            {disconnected.map(partner => (
              <DeliveryPartnerCard key={partner.id} partner={partner} connecting={connecting === partner.id} onToggle={() => toggleConnection(partner.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-stone-400 leading-relaxed">
          Connecting a delivery partner shows your store on that platform and routes orders through MiSlice's dashboard. Commission rates are set by each platform. MiSlice charges no additional fees on partner orders.
        </p>
      </div>
    </div>
  );
}

function DeliveryPartnerCard({ partner, connecting, onToggle }: {
  partner: DeliveryIntegration; connecting: boolean; onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-[#111] border rounded-2xl overflow-hidden transition-all ${partner.connected ? 'border-green-500/20' : 'border-white/8'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl border text-2xl flex items-center justify-center ${partner.color}`}>
              {partner.logo}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-black text-white">{partner.name}</p>
                {partner.connected
                  ? <span className="text-[9px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full">CONNECTED</span>
                  : <span className="text-[9px] font-black text-stone-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full">NOT CONNECTED</span>}
              </div>
              <p className="text-xs text-stone-500">{partner.commission}% commission · {partner.description.slice(0, 60)}…</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {partner.connected && (
              <a href={partner.dashboardUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs font-bold text-stone-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors">
                <ExternalLink className="w-3 h-3" /> Dashboard
              </a>
            )}
            <button
              onClick={onToggle}
              disabled={connecting}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                connecting ? 'bg-white/10 text-stone-400 cursor-wait'
                  : partner.connected ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                  : 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.25)]'
              }`}
            >
              {connecting ? <><Loader2 className="w-3 h-3 animate-spin" /> Connecting…</>
                : partner.connected ? <><XCircle className="w-3 h-3" /> Disconnect</>
                : <><CheckCircle className="w-3 h-3" /> Connect</>}
            </button>
            <button onClick={() => setExpanded(e => !e)} className="text-stone-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats row for connected */}
        {partner.connected && (
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/8">
            <div className="text-center">
              <p className="text-lg font-black text-white">{partner.ordersThisMonth}</p>
              <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">Orders / Month</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-green-400">${partner.revenueThisMonth.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">Revenue / Month</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-orange-400">{partner.commission}%</p>
              <p className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">Commission Rate</p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded feature list */}
      {expanded && (
        <div className="border-t border-white/8 px-5 pb-5 pt-4 bg-white/2">
          <p className="text-xs font-black text-stone-400 mb-3">{partner.description}</p>
          <div className="grid grid-cols-2 gap-2">
            {partner.features.map(f => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-stone-400">
                <Check className="w-3 h-3 text-green-400 shrink-0" /> {f}
              </div>
            ))}
          </div>
          {!partner.connected && (
            <a href={partner.setupUrl} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300">
              <ArrowUpRight className="w-3.5 h-3.5" /> Learn more about {partner.name} for restaurants
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ menu, orders, integrations }: { menu: MenuItem[]; orders: LiveOrder[]; integrations: DeliveryIntegration[] }) {
  const totalRevenue = integrations.filter(i => i.connected).reduce((s, i) => s + i.revenueThisMonth, 0);
  const totalOrders = integrations.reduce((s, i) => s + i.ordersThisMonth, 0);
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const WEEKLY = [
    { day: 'Mon', orders: 18, revenue: 312 },
    { day: 'Tue', orders: 24, revenue: 436 },
    { day: 'Wed', orders: 21, revenue: 378 },
    { day: 'Thu', orders: 29, revenue: 524 },
    { day: 'Fri', orders: 42, revenue: 756 },
    { day: 'Sat', orders: 56, revenue: 1008 },
    { day: 'Sun', orders: 38, revenue: 684 },
  ];
  const maxRevenue = Math.max(...WEEKLY.map(w => w.revenue));

  const topItems = [...menu].sort((a, b) => b.price - a.price).slice(0, 5);

  const deliveryBreakdown = integrations.filter(i => i.connected).map(i => ({
    name: i.name,
    logo: i.logo,
    orders: i.ordersThisMonth,
    revenue: i.revenueThisMonth,
    pct: totalOrders > 0 ? Math.round((i.ordersThisMonth / totalOrders) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Revenue (Month)" value={`$${totalRevenue.toFixed(0)}`} sub="vs $3,420 last month" color="bg-green-500/10 text-green-400 border-green-500/20" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders.toString()} sub={`${delivered} today`} color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
        <StatCard icon={TrendingUp} label="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} sub="+$1.20 vs last month" color="bg-orange-500/10 text-orange-400 border-orange-500/20" />
        <StatCard icon={Star} label="Avg Rating" value="4.7★" sub="Based on 89 reviews" color="bg-yellow-500/10 text-yellow-400 border-yellow-500/20" />
      </div>

      {/* Weekly revenue bar chart */}
      <div className={SECTION}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-white text-sm">Weekly Revenue</h3>
            <p className="text-xs text-stone-500 mt-0.5">Last 7 days</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/8 border border-green-500/20 px-3 py-1.5 rounded-xl">
            <TrendingUp className="w-3 h-3" /> +18% vs last week
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY.map((w, i) => (
            <div key={w.day} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: '120px' }}>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-red-600 to-orange-500 transition-all group-hover:from-red-500 group-hover:to-orange-400 cursor-default"
                  style={{ height: `${(w.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                  title={`$${w.revenue}`}
                />
              </div>
              <span className="text-[9px] font-bold text-stone-500">{w.day}</span>
              <span className="text-[8px] font-black text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">${w.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top menu items */}
        <div className={SECTION}>
          <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-yellow-400" /> Top Items by Price</h3>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-stone-400 text-black' : 'bg-stone-700 text-stone-300'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{item.name}</span>
                    <span className="text-xs font-black text-green-400 ml-2">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${(item.price / topItems[0].price) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery partner breakdown */}
        <div className={SECTION}>
          <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-blue-400" /> Orders by Platform</h3>
          {deliveryBreakdown.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-8">No delivery partners connected yet.</p>
          ) : (
            <div className="space-y-3">
              {deliveryBreakdown.map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{p.logo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className="text-xs font-bold text-stone-400">{p.orders} orders · <span className="text-green-400">${p.revenue.toFixed(0)}</span></span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)' }} />
                    </div>
                    <p className="text-[9px] text-stone-600 mt-0.5">{p.pct}% of all orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Peak hours (simulated) */}
      <div className={SECTION}>
        <h3 className="font-black text-white text-sm mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400" /> Peak Hours (Today)</h3>
        <div className="flex items-end gap-1.5 h-20">
          {['11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm'].map((h, i) => {
            const heights = [15,55,70,40,20,25,45,80,100,85,60,30];
            return (
              <div key={h} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full rounded-t" style={{ height: `${heights[i] * 0.64}px`, background: heights[i] > 70 ? 'linear-gradient(180deg,#f97316,#dc2626)' : 'rgba(255,255,255,0.08)' }} />
                <span className="text-[8px] text-stone-600 hidden sm:block">{h}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-stone-600 mt-2">Peak: 7pm – 9pm · Slowest: 3pm – 4pm</p>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ profile, setProfile, showToast }: {
  profile: StoreProfile; setProfile: React.Dispatch<React.SetStateAction<StoreProfile>>; showToast: (m: string) => void;
}) {
  const [local, setLocal] = useState({ ...profile });
  const hasChanges = JSON.stringify(local) !== JSON.stringify(profile);

  // Sync if profile changes externally
  useEffect(() => { setLocal({ ...profile }); }, [profile]);

  const save = () => { setProfile(local); showToast('Profile saved!'); };
  const reset = () => setLocal({ ...profile });

  const updateHour = (i: number, field: string, value: string | boolean) =>
    setLocal(p => { const hours = [...p.hours]; hours[i] = { ...hours[i], [field]: value }; return { ...p, hours }; });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Logo */}
      <div className={SECTION}>
        <h3 className="text-white font-black mb-4 text-sm uppercase tracking-widest">Store Logo / Banner</h3>
        <div className="flex items-center gap-5">
          <PhotoUpload value={local.logo} onChange={v => setLocal(p => ({ ...p, logo: v }))} label="Upload Logo" />
          <div>
            <p className="text-white font-bold">{local.name}</p>
            <p className="text-stone-400 text-sm">{local.tagline}</p>
            <p className="text-stone-500 text-xs mt-1">Shown on your store listing page and overview banner</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className={SECTION + " space-y-4"}>
        <h3 className="text-white font-black text-sm uppercase tracking-widest">Basic Info</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={LABEL}>Store Name</label><input value={local.name} onChange={e => setLocal(p => ({ ...p, name: e.target.value }))} className={INPUT} /></div>
          <div><label className={LABEL}>Tagline</label><input value={local.tagline} onChange={e => setLocal(p => ({ ...p, tagline: e.target.value }))} placeholder="Best pizza in town" className={INPUT} /></div>
        </div>
        <div><label className={LABEL}>Description</label><textarea value={local.description} onChange={e => setLocal(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Tell customers what makes your store special..." className={INPUT + " resize-none"} /></div>
      </div>

      {/* Contact */}
      <div className={SECTION + " space-y-4"}>
        <h3 className="text-white font-black text-sm uppercase tracking-widest">Contact & Website</h3>
        <div>
          <label className={LABEL + " flex items-center gap-1.5"}><Globe className="w-3 h-3" /> Website URL</label>
          <input value={local.website} onChange={e => setLocal(p => ({ ...p, website: e.target.value }))} placeholder="https://yourstore.com" type="url" className={INPUT} />
          {local.website && <a href={local.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-400 hover:text-blue-300 font-bold"><ExternalLink className="w-3.5 h-3.5" /> Open website</a>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={LABEL + " flex items-center gap-1.5"}><Phone className="w-3 h-3" /> Phone</label><input value={local.phone} onChange={e => setLocal(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" type="tel" className={INPUT} /></div>
          <div><label className={LABEL + " flex items-center gap-1.5"}><MapPin className="w-3 h-3" /> Address</label><input value={local.address} onChange={e => setLocal(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St, City, State" className={INPUT} /></div>
        </div>
      </div>

      {/* Hours */}
      <div className={SECTION + " space-y-3"}>
        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">Opening Hours</h3>
        {local.hours.map((h, i) => (
          <div key={h.day} className="flex items-center gap-3">
            <span className="w-10 text-xs font-black text-stone-400">{h.day}</span>
            <Toggle on={!h.closed} onChange={() => updateHour(i, 'closed', !h.closed)} />
            {h.closed ? <span className="text-xs font-bold text-stone-600">Closed</span> : (
              <div className="flex items-center gap-2 flex-1">
                <input type="time" value={h.open} onChange={e => updateHour(i, 'open', e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-red-500/50 [color-scheme:dark]" />
                <span className="text-stone-600 text-xs">to</span>
                <input type="time" value={h.close} onChange={e => updateHour(i, 'close', e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-red-500/50 [color-scheme:dark]" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save bar */}
      {hasChanges && (
        <div className="sticky bottom-4 flex gap-3 bg-stone-900/90 backdrop-blur border border-white/10 rounded-2xl p-3 shadow-2xl">
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-400 hover:text-white bg-white/5 border border-white/10"><RotateCcw className="w-4 h-4" /> Discard</button>
          <button onClick={save} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white"><Save className="w-4 h-4" /> Save Profile</button>
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ profile, setProfile, showToast, onLogout, onResetMenu }: {
  profile: StoreProfile; setProfile: React.Dispatch<React.SetStateAction<StoreProfile>>;
  showToast: (m: string) => void; onLogout: () => void; onResetMenu: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [notifications, setNotifications] = useState({ newOrders: true, dealExpiry: true, weeklyReport: false });

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Store status */}
      <div className={SECTION}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white">Accept Orders</p>
            <p className="text-stone-500 text-sm mt-0.5">Toggle to temporarily pause new orders.</p>
          </div>
          <Toggle on={profile.acceptingOrders} onChange={() => { setProfile(p => ({ ...p, acceptingOrders: !p.acceptingOrders })); showToast(profile.acceptingOrders ? 'Store paused.' : 'Store is now open!'); }} />
        </div>
      </div>

      {/* Notifications */}
      <div className={SECTION + " space-y-4"}>
        <h3 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h3>
        {[
          { key: 'newOrders' as const, label: 'New Order Alerts', desc: 'Get notified when a new order comes in' },
          { key: 'dealExpiry' as const, label: 'Deal Expiry Reminders', desc: 'Remind me 3 days before a deal expires' },
          { key: 'weeklyReport' as const, label: 'Weekly Revenue Report', desc: 'Summary email every Monday morning' },
        ].map(n => (
          <div key={n.key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-bold text-white">{n.label}</p>
              <p className="text-xs text-stone-500">{n.desc}</p>
            </div>
            <Toggle on={notifications[n.key]} onChange={() => { setNotifications(p => ({ ...p, [n.key]: !p[n.key] })); showToast(`${n.label} ${!notifications[n.key] ? 'enabled' : 'disabled'}.`); }} />
          </div>
        ))}
      </div>

      {/* Website */}
      <div className={SECTION}>
        <p className="font-bold text-white mb-1">Your Website</p>
        <p className="text-stone-500 text-sm mb-4">Customers are redirected here when clicking "Order Online".</p>
        {profile.website
          ? <a href={profile.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl text-sm font-bold"><ExternalLink className="w-4 h-4" /> {profile.website}</a>
          : <p className="text-stone-600 text-sm italic">No website set. Add one in Store Profile.</p>}
      </div>

      {/* Danger zone */}
      <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-5 space-y-4">
        <p className="font-black text-red-400 text-sm uppercase tracking-widest">Danger Zone</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-sm">Reset Menu to Defaults</p>
            <p className="text-stone-500 text-xs">All custom menu items will be replaced with demo data.</p>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 text-xs font-bold text-stone-400 bg-white/5 border border-white/10 rounded-xl">Cancel</button>
              <button onClick={() => { onResetMenu(); setConfirmReset(false); }} className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-xl">Confirm Reset</button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="px-4 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20">Reset</button>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-red-500/10 pt-4">
          <div>
            <p className="font-bold text-white text-sm">Sign Out</p>
            <p className="text-stone-500 text-xs">Return to customer view of MiSlice.</p>
          </div>
          <button onClick={onLogout} className="px-4 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
